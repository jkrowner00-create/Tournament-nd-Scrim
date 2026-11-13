/**
 * Automatic Tournament Prize & Winnings Distribution Service
 *
 * This service automatically calculates and distributes prize pool winnings,
 * kill bounties, and rank rewards directly into participant wallets in real-time,
 * updates their lifetime stats (earnings, matches, wins), records auditable
 * wallet transactions, and sends real-time in-app notifications.
 */

import {
  db,
  ref,
  get,
  set,
  update,
  push,
  serverTimestamp,
} from './firebase';
import type { Tournament, UserProfile } from '../types';

export interface MatchResultItem {
  uid?: string;
  position: number;
  name: string;
  gameName?: string;
  kills?: number;
  winnings: number;
}

export interface DistributionDetail {
  uid: string;
  name: string;
  gameName?: string;
  position: number;
  kills: number;
  winnings: number;
  status: 'credited' | 'skipped_duplicate' | 'user_not_found' | 'zero_winnings';
  previousBalance?: number;
  newBalance?: number;
  message?: string;
}

export interface DistributionResult {
  success: boolean;
  tournamentId: string;
  tournamentName: string;
  totalDistributed: number;
  recipientsCount: number;
  skippedCount: number;
  details: DistributionDetail[];
  timestamp: number;
  error?: string;
}

/**
 * Automatically distribute winnings to all participants of a finalized tournament.
 *
 * @param tournamentId - The unique ID of the tournament.
 * @param options - Optional override flags (e.g. force re-distribution).
 */
export async function distributeTournamentWinnings(
  tournamentId: string,
  options: { force?: boolean; editReason?: string; adminEmail?: string; previousResults?: MatchResultItem[] } = {}
): Promise<DistributionResult> {
  const result: DistributionResult = {
    success: false,
    tournamentId,
    tournamentName: '',
    totalDistributed: 0,
    recipientsCount: 0,
    skippedCount: 0,
    details: [],
    timestamp: Date.now(),
  };

  if (!tournamentId) {
    result.error = 'Tournament ID is required.';
    return result;
  }

  try {
    // 1. Fetch tournament document
    const tournamentRef = ref(db, `tournaments/${tournamentId}`);
    const tSnap = await get(tournamentRef);

    if (!tSnap.exists()) {
      result.error = `Tournament ${tournamentId} does not exist.`;
      return result;
    }

    const tournament: Tournament = tSnap.val();
    result.tournamentName = tournament.name || 'Tournament';

    const isAlreadyDistributed = !!tournament.winningsDistributed;
    if (isAlreadyDistributed && !options.force) {
      result.error = `Winnings for "${tournament.name}" have already been distributed on ${new Date(
        tournament.distributedAt || 0
      ).toLocaleString()}.`;
      return result;
    }

    const resultsList: MatchResultItem[] = tournament.results || [];

    if (!Array.isArray(resultsList) || resultsList.length === 0) {
      result.error = `No finalized results found for tournament "${tournament.name}". Please enter match results first.`;
      return result;
    }

    // 3. Cache all registered players, scrim slots, and users for smart UID resolution
    const registeredPlayers = tournament.registeredPlayers || {};
    const usersSnap = await get(ref(db, 'users'));
    const allUsersMap: Record<string, UserProfile & { key: string }> = {};

    if (usersSnap.exists()) {
      usersSnap.forEach(child => {
        allUsersMap[child.key] = { ...child.val(), key: child.key };
      });
    }

    const updates: Record<string, any> = {};
    const now = Date.now();

    // Helper to resolve player or team to a user account UID
    const resolveTargetUid = (row: MatchResultItem): string | null => {
      // Direct UID
      if (row.uid && !row.uid.startsWith('custom_') && allUsersMap[row.uid]) {
        return row.uid;
      }

      const name = (row.name || '').trim().toLowerCase();
      const gameName = (row.gameName || '').trim().toLowerCase();

      // Check registeredPlayers
      if (gameName || name) {
        for (const [regUid, regData] of Object.entries(registeredPlayers)) {
          const regGame = (regData.gameName || '').trim().toLowerCase();
          const regTeam = (regData.teamName || '').trim().toLowerCase();
          if (
            (gameName && regGame === gameName) ||
            (name && regGame === name) ||
            (name && regTeam === name)
          ) {
            return regUid;
          }
        }
      }

      // Check Scrim Slots (direct team booking)
      if (tournament.scrimSlots) {
        for (const slot of Object.values(tournament.scrimSlots)) {
          if (!slot) continue;
          const sTeam = (slot.teamName || '').trim().toLowerCase();
          const sTag = (slot.teamTag || '').trim().toLowerCase();
          const sCaptain = (slot.captainName || '').trim().toLowerCase();
          const sPlayers = (slot.players || []).map(p => (p || '').trim().toLowerCase());

          if (
            (name && (sTeam === name || sTag === name || sCaptain === name || sPlayers.includes(name))) ||
            (gameName && (sCaptain === gameName || sPlayers.includes(gameName)))
          ) {
            if (slot.captainUid && allUsersMap[slot.captainUid]) {
              return slot.captainUid;
            }
          }
        }
      }

      // Check Scrim Groups
      if (tournament.scrimGroups) {
        for (const grp of Object.values(tournament.scrimGroups)) {
          if (!grp.slots) continue;
          for (const slot of Object.values(grp.slots)) {
            if (!slot) continue;
            const sTeam = (slot.teamName || '').trim().toLowerCase();
            const sTag = (slot.teamTag || '').trim().toLowerCase();
            const sCaptain = (slot.captainName || '').trim().toLowerCase();
            const sPlayers = (slot.players || []).map(p => (p || '').trim().toLowerCase());

            if (
              (name && (sTeam === name || sTag === name || sCaptain === name || sPlayers.includes(name))) ||
              (gameName && (sCaptain === gameName || sPlayers.includes(gameName)))
            ) {
              if (slot.captainUid && allUsersMap[slot.captainUid]) {
                return slot.captainUid;
              }
            }
          }
        }
      }

      // Fallback: match from all users by gameName, displayName, or mobile
      if (gameName || name) {
        const needle = gameName || name;
        for (const [uKey, uData] of Object.entries(allUsersMap)) {
          const uGame = (uData.gameName || '').trim().toLowerCase();
          const uDisplay = (uData.displayName || '').trim().toLowerCase();
          const uMobile = (uData.mobile || '').trim().toLowerCase();
          if (uGame === needle || uDisplay === needle || uMobile === needle) {
            return uKey;
          }
        }
      }

      return null;
    };

    // If editing previously distributed results, build previous prize lookup to calculate delta adjustments
    const isEditingExisting = isAlreadyDistributed && options.force && Array.isArray(options.previousResults) && options.previousResults.length > 0;
    const oldPrizesByUid: Record<string, number> = {};

    if (isEditingExisting && options.previousResults) {
      for (const oldRow of options.previousResults) {
        const oldUid = resolveTargetUid(oldRow);
        if (oldUid) {
          oldPrizesByUid[oldUid] = (oldPrizesByUid[oldUid] || 0) + (Number(oldRow.winnings) || 0);
        }
      }

      // Record revision history audit log
      const historyKey = push(ref(db, `tournaments/${tournamentId}/resultsEditHistory`)).key!;
      const oldPrizeTotal = options.previousResults.reduce((s, r) => s + (Number(r.winnings) || 0), 0);
      const newPrizeTotal = resultsList.reduce((s, r) => s + (Number(r.winnings) || 0), 0);

      updates[`tournaments/${tournamentId}/resultsEditHistory/${historyKey}`] = {
        id: historyKey,
        editedAt: now,
        editedBy: options.adminEmail || 'admin',
        reason: options.editReason || 'Match standings correction',
        previousPrizeTotal: oldPrizeTotal,
        newPrizeTotal,
        previousResults: options.previousResults,
        newResults: resultsList,
        summary: `Admin revised prize pool distribution from ₹${oldPrizeTotal} to ₹${newPrizeTotal}.`,
      };
    }

    // 4. Process each participant in the results table and deliver winning money
    for (const row of resultsList) {
      const position = Number(row.position) || 0;
      const kills = Number(row.kills) || 0;
      const rawWinnings = Number(row.winnings) || 0;
      const name = (row.name || '').trim();
      const gameName = (row.gameName || '').trim();

      const targetUid = resolveTargetUid(row);

      // Check if user was resolved
      if (!targetUid) {
        result.skippedCount++;
        result.details.push({
          uid: row.uid || 'unresolved',
          name,
          gameName,
          position,
          kills,
          winnings: rawWinnings,
          status: 'user_not_found',
          message: 'Guest/External player or account not linked to app user UID.',
        });
        continue;
      }

      const user = allUsersMap[targetUid];
      const prevBal = Number(user?.balance || 0);
      const prevWin = Number(user?.winningCash || 0);
      const prevEarnings = Number(user?.totalEarnings || 0);
      const prevMatches = Number(user?.totalMatches || 0);
      const prevWon = Number(user?.wonMatches || 0);

      if (isEditingExisting) {
        // Delta adjustment for revisions
        const oldWinning = oldPrizesByUid[targetUid] || 0;
        const delta = rawWinnings - oldWinning;

        if (delta !== 0) {
          const newBal = prevBal + delta;
          const newWin = Math.max(0, prevWin + delta);
          const newEarnings = Math.max(0, prevEarnings + delta);

          updates[`users/${targetUid}/balance`] = newBal;
          updates[`users/${targetUid}/winningCash`] = newWin;
          updates[`users/${targetUid}/totalEarnings`] = newEarnings;

          const txKey = push(ref(db, `transactions/${targetUid}`)).key!;
          updates[`transactions/${targetUid}/${txKey}`] = {
            type: delta > 0 ? 'admin_winning_add' : 'admin_winning_deduct',
            amount: Math.abs(delta),
            timestamp: now,
            description: `Prize Revision (${delta > 0 ? '+' : ''}₹${delta}): ${tournament.name} (Rank #${position}). Reason: ${options.editReason || 'Standings correction'}`,
            status: 'completed',
            balanceAfter: newBal,
            tournamentId,
          };

          const notifKey = push(ref(db, 'notifications')).key!;
          updates[`notifications/${notifKey}`] = {
            title: '📝 Tournament Prize Revised',
            message: `Results for "${tournament.name}" were revised. Prize adjustment of ${delta > 0 ? '+' : ''}₹${delta} winning money delivered to your wallet. Reason: ${options.editReason || 'Correction'}.`,
            target: targetUid,
            timestamp: now,
            sentBy: 'system_payout',
            tournamentId,
          };

          allUsersMap[targetUid].balance = newBal;
          allUsersMap[targetUid].winningCash = newWin;
          allUsersMap[targetUid].totalEarnings = newEarnings;

          result.totalDistributed += rawWinnings;
          result.recipientsCount++;
          result.details.push({
            uid: targetUid,
            name: user?.displayName || name,
            gameName: user?.gameName || gameName,
            position,
            kills,
            winnings: rawWinnings,
            status: 'credited',
            previousBalance: prevBal,
            newBalance: newBal,
            message: `Revised: Delta ${delta > 0 ? '+' : ''}₹${delta} delivered to winning money!`,
          });
        }
      } else {
        // First-time result publishing: deliver winning money
        if (rawWinnings <= 0) {
          result.skippedCount++;
          updates[`users/${targetUid}/totalMatches`] = prevMatches + 1;
          if (position === 1) {
            updates[`users/${targetUid}/wonMatches`] = prevWon + 1;
          }

          result.details.push({
            uid: targetUid,
            name: user?.displayName || name,
            gameName: user?.gameName || gameName,
            position,
            kills,
            winnings: 0,
            status: 'zero_winnings',
            previousBalance: prevBal,
            newBalance: prevBal,
            message: 'No monetary prize assigned for this rank.',
          });
          continue;
        }

        const newBal = prevBal + rawWinnings;
        const newWin = prevWin + rawWinnings; // Delivered directly as winning money
        const newEarnings = prevEarnings + rawWinnings;

        updates[`users/${targetUid}/balance`] = newBal;
        updates[`users/${targetUid}/winningCash`] = newWin; // Delivers winning money
        updates[`users/${targetUid}/totalEarnings`] = newEarnings;
        updates[`users/${targetUid}/totalMatches`] = prevMatches + 1;
        if (position === 1) {
          updates[`users/${targetUid}/wonMatches`] = prevWon + 1;
        }

        // Create transaction record
        const txKey = push(ref(db, `transactions/${targetUid}`)).key!;
        updates[`transactions/${targetUid}/${txKey}`] = {
          type: 'tournament_winnings',
          amount: rawWinnings,
          timestamp: now,
          description: `Winning Money: ${tournament.name} (Rank #${position}${kills > 0 ? `, ${kills} Kills` : ''})`,
          status: 'completed',
          balanceAfter: newBal,
          tournamentId,
          position,
          kills,
        };

        // Create in-app prize alert
        const notifKey = push(ref(db, 'notifications')).key!;
        updates[`notifications/${notifKey}`] = {
          title: '🏆 Tournament Prize Delivered!',
          message: `Congratulations ${user?.displayName || name}! ₹${rawWinnings} winning money delivered directly into your wallet for Rank #${position} in "${tournament.name}".`,
          target: targetUid,
          timestamp: now,
          sentBy: 'system_payout',
          tournamentId,
        };

        allUsersMap[targetUid].balance = newBal;
        allUsersMap[targetUid].winningCash = newWin;
        allUsersMap[targetUid].totalEarnings = newEarnings;

        result.totalDistributed += rawWinnings;
        result.recipientsCount++;
        result.details.push({
          uid: targetUid,
          name: user?.displayName || name,
          gameName: user?.gameName || gameName,
          position,
          kills,
          winnings: rawWinnings,
          status: 'credited',
          previousBalance: prevBal,
          newBalance: newBal,
          message: `Successfully delivered ₹${rawWinnings} winning money to wallet!`,
        });
      }
    }

    // 5. Update tournament metadata to mark payout as completed
    updates[`tournaments/${tournamentId}/status`] = 'result';
    updates[`tournaments/${tournamentId}/winningsDistributed`] = true;
    updates[`tournaments/${tournamentId}/distributedAt`] = now;
    updates[`tournaments/${tournamentId}/totalDistributed`] = result.totalDistributed;
    updates[`tournaments/${tournamentId}/payoutRecipientsCount`] = result.recipientsCount;
    updates[`tournaments/${tournamentId}/updatedAt`] = now;

    // 6. Commit all atomic updates to Firebase Database
    await update(ref(db), updates);

    result.success = true;
    return result;
  } catch (err: any) {
    console.error('[Winnings Distribution Error]', err);
    result.error = err.message || 'Failed to distribute winnings.';
    return result;
  }
}

/**
 * Finalizes tournament match results and automatically triggers the prize payout.
 *
 * @param tournamentId - The tournament ID.
 * @param results - Array of player placement results.
 * @param editReason - Optional revision reason if editing existing results.
 * @param adminEmail - Email of the admin making changes.
 */
export async function finalizeTournamentAndDistributeWinnings(
  tournamentId: string,
  results: MatchResultItem[],
  editReason?: string,
  adminEmail?: string
): Promise<DistributionResult> {
  const tRef = ref(db, `tournaments/${tournamentId}`);

  // Fetch current tournament state
  const tSnap = await get(tRef);
  if (!tSnap.exists()) {
    throw new Error(`Tournament ${tournamentId} not found.`);
  }

  const tourney: Tournament = tSnap.val();
  const prizePool = Number(tourney.prizePool || 0);
  const totalDistributed = results.reduce((sum, r) => sum + (Number(r.winnings) || 0), 0);

  // Validate prize pool
  if (prizePool > 0 && totalDistributed > prizePool) {
    throw new Error(
      `Validation Error: Total distributed prize (₹${totalDistributed}) exceeds the Tournament Prize Pool (₹${prizePool}) by ₹${totalDistributed - prizePool}.`
    );
  }

  const previousResults = tourney.results || [];
  const hadExistingResults = Array.isArray(previousResults) && previousResults.length > 0;

  // Save new results
  await update(tRef, {
    results,
    status: 'result',
    updatedAt: serverTimestamp(),
  });

  // Distribute prize money (with delta handling if editing existing results)
  return await distributeTournamentWinnings(tournamentId, {
    force: true,
    editReason,
    adminEmail,
    previousResults: hadExistingResults ? previousResults : undefined,
  });
}

/**
 * Automatically inspects and distributes winnings for all finalized tournaments
 * that have results but have not yet been distributed.
 */
export async function autoDistributeAllFinalizedTournaments(): Promise<{
  processedTournaments: number;
  totalDistributedAmount: number;
  results: DistributionResult[];
}> {
  const tourneysSnap = await get(ref(db, 'tournaments'));
  const summary = {
    processedTournaments: 0,
    totalDistributedAmount: 0,
    results: [] as DistributionResult[],
  };

  if (!tourneysSnap.exists()) return summary;

  const tournamentList: { id: string; data: Tournament }[] = [];
  tourneysSnap.forEach(child => {
    tournamentList.push({ id: child.key!, data: child.val() });
  });

  for (const item of tournamentList) {
    const t = item.data;
    const isFinalized = t.status === 'result' || t.status === 'completed';
    const hasResults = Array.isArray(t.results) && t.results.length > 0;
    const notDistributed = !t.winningsDistributed;

    if (isFinalized && hasResults && notDistributed) {
      const res = await distributeTournamentWinnings(item.id);
      summary.results.push(res);
      if (res.success) {
        summary.processedTournaments++;
        summary.totalDistributedAmount += res.totalDistributed;
      }
    }
  }

  return summary;
}
