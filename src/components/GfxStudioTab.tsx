import React, { useState, useEffect } from 'react';
import type { Tournament, WithdrawalRequest } from '../types';
import {
  generateWithdrawalReceiptCanvas,
  generateMatchCredentialsCanvas,
  downloadDataUrl,
} from '../services/gfxGenerator';
import {
  Palette,
  Download,
  Copy,
  Check,
  Smartphone,
  Trophy,
  KeyRound,
  FileText,
  Calendar,
  Share2,
  Users,
} from 'lucide-react';

interface GfxStudioTabProps {
  tournaments: Tournament[];
  allWithdrawals: WithdrawalRequest[];
  platformName?: string;
  adminName?: string;
  supportNumber?: string;
}

export const GfxStudioTab: React.FC<GfxStudioTabProps> = ({
  tournaments,
  allWithdrawals,
  platformName = 'SS BATTLE APP',
  adminName = 'Shamroz Khan (SS BATTLE)',
  supportNumber = '03128017777',
}) => {
  const [activeStudioTool, setActiveStudioTool] = useState<
    'withdrawalReceipt' | 'matchCredentials' | 'tournamentWinners'
  >('withdrawalReceipt');

  // --- 1. Withdrawal Receipt State ---
  const [wdAmount, setWdAmount] = useState<number | string>(500);
  const [wdSentByName, setWdSentByName] = useState<string>(adminName);
  const [wdAppName, setWdAppName] = useState<string>('Easypaisa');
  const [wdSentWithNumber, setWdSentWithNumber] = useState<string>(supportNumber);
  const [wdRecipientName, setWdRecipientName] = useState<string>('Abdul Hadi (FINAL^KING)');
  const [wdRecipientAccount, setWdRecipientAccount] = useState<string>('03273648918');
  const [wdTxnRef, setWdTxnRef] = useState<string>(`SSB-WD-${Date.now().toString().slice(-7)}`);
  const [wdNote, setWdNote] = useState<string>('Official Tournament Prize Payout');
  const [wdPreviewUrl, setWdPreviewUrl] = useState<string>('');
  const [wdCopied, setWdCopied] = useState<boolean>(false);

  // --- 2. Match Credentials State ---
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(
    tournaments[0]?.id || 'custom'
  );
  const [matchTitle, setMatchTitle] = useState<string>(
    tournaments[0]?.name || 'BR PER KILL FREE TOURNAMENT'
  );
  const [matchGame, setMatchGame] = useState<string>('Battle Royale');
  const [matchMap, setMatchMap] = useState<string>(tournaments[0]?.dropMap || 'Erangel');
  const [matchMode, setMatchMode] = useState<string>(tournaments[0]?.mode || 'Solo');
  const [matchRoomId, setMatchRoomId] = useState<string>(
    tournaments[0]?.roomId || '166770374'
  );
  const [matchRoomPass, setMatchRoomPass] = useState<string>(
    tournaments[0]?.roomPassword || '00'
  );
  const [matchTimeStr, setMatchTimeStr] = useState<string>('08:00 PM Tonight');
  const [matchPreviewUrl, setMatchPreviewUrl] = useState<string>('');
  const [matchCopied, setMatchCopied] = useState<boolean>(false);

  // Quick withdrawal request picker
  const handleSelectExistingWithdrawal = (wdId: string) => {
    const target = allWithdrawals.find(w => w.id === wdId);
    if (!target) return;
    setWdAmount(target.amount);
    setWdRecipientName(target.userName);
    setWdRecipientAccount(target.methodDetails?.accountInfo || '—');
    setWdAppName(target.methodDetails?.methodName || 'Easypaisa');
  };

  // Quick tournament picker
  const handleSelectExistingTournament = (tId: string) => {
    setSelectedTourneyId(tId);
    const target = tournaments.find(t => t.id === tId);
    if (!target) return;
    setMatchTitle(target.name);
    setMatchMap(target.dropMap || 'Erangel');
    setMatchMode(target.mode || 'Solo');
    if (target.roomId) setMatchRoomId(target.roomId);
    if (target.roomPassword) setMatchRoomPass(target.roomPassword);
    if (target.startTime) {
      setMatchTimeStr(new Date(target.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Re-render Withdrawal Receipt Preview
  useEffect(() => {
    const url = generateWithdrawalReceiptCanvas({
      amount: wdAmount,
      sentByName: wdSentByName,
      appName: wdAppName,
      sentWithNumber: wdSentWithNumber,
      recipientName: wdRecipientName,
      recipientAccount: wdRecipientAccount,
      transactionRef: wdTxnRef,
      dateStr: new Date().toLocaleString(),
      note: wdNote,
      platformName,
    });
    setWdPreviewUrl(url);
  }, [
    wdAmount,
    wdSentByName,
    wdAppName,
    wdSentWithNumber,
    wdRecipientName,
    wdRecipientAccount,
    wdTxnRef,
    wdNote,
    platformName,
  ]);

  // Re-render Match Credentials Preview
  useEffect(() => {
    const url = generateMatchCredentialsCanvas({
      tournamentTitle: matchTitle,
      gameName: matchGame,
      mapName: matchMap,
      mode: matchMode,
      roomId: matchRoomId,
      roomPassword: matchRoomPass,
      matchTimeStr,
      platformName,
    });
    setMatchPreviewUrl(url);
  }, [
    matchTitle,
    matchGame,
    matchMap,
    matchMode,
    matchRoomId,
    matchRoomPass,
    matchTimeStr,
    platformName,
  ]);

  // Actions
  const handleDownloadWdReceipt = () => {
    if (!wdPreviewUrl) return;
    downloadDataUrl(wdPreviewUrl, `Receipt-${wdTxnRef || 'payout'}.png`);
  };

  const handleCopyWdText = () => {
    const text = `🟢 *${platformName.toUpperCase()} • OFFICIAL WITHDRAWAL RECEIPT* 🟢
━━━━━━━━━━━━━━━━━━━━━━
💰 *Amount Sent:* Rs. ${Number(String(wdAmount).replace(/[^0-9.]/g, '') || wdAmount).toLocaleString('en-IN')}
👤 *Sent By (Admin):* ${wdSentByName}
📱 *App Used:* ${wdAppName}
📞 *Sender Number:* ${wdSentWithNumber}
───────────────
🎯 *Beneficiary Player:* ${wdRecipientName}
💳 *Receiving Account:* ${wdRecipientAccount}
🆔 *Transaction Ref:* ${wdTxnRef}
⏱ *Date & Time:* ${new Date().toLocaleString()}
✅ *Status:* SUCCESSFUL & VERIFIED
━━━━━━━━━━━━━━━━━━━━━━
_Thank you for competing on ${platformName}! Keep grinding & claiming cash prizes._`;

    navigator.clipboard.writeText(text);
    setWdCopied(true);
    setTimeout(() => setWdCopied(false), 2500);
  };

  const handleDownloadMatchCredentials = () => {
    if (!matchPreviewUrl) return;
    downloadDataUrl(matchPreviewUrl, `Match-Pass-${matchTitle.slice(0, 15)}.png`);
  };

  const handleCopyMatchText = () => {
    const text = `⚡ *${platformName.toUpperCase()} • OFFICIAL MATCH CREDENTIALS* ⚡
━━━━━━━━━━━━━━━━━━━━━━
🎮 *Match:* ${matchTitle}
🗺 *Map:* ${matchMap} | *Mode:* ${matchMode}
⏱ *Time:* ${matchTimeStr}
───────────────
🔑 *Room ID:* ${matchRoomId}
🔒 *Password:* ${matchRoomPass}
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *IMPORTANT RULES:*
• Join at least 5 minutes before scheduled match start time.
• Strictly No hacks, panels, or emulator teaming. Replay is reviewed.
• Do NOT leak credentials outside registered tournament players.`;

    navigator.clipboard.writeText(text);
    setMatchCopied(true);
    setTimeout(() => setMatchCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[color-mix(in_srgb,var(--glow-color-1)_10%,var(--surface-color))] via-[var(--surface-color)] to-[var(--card-bg)] border border-[var(--border-color)] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--glow-color-1)_15%,var(--card-bg))] text-[var(--glow-color-1)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
            <Palette size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2 flex-wrap">
              <span>Esports GFX Studio & Post Generator</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[color-mix(in_srgb,var(--glow-color-1)_15%,var(--card-bg))] text-[var(--glow-color-1)] border border-[var(--border-color)]">
                PRO GFX
              </span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Export ultra-crisp HD graphics for withdrawal receipts, match room credentials, and winner posters.
            </p>
          </div>
        </div>

        {/* Studio Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
          <button
            onClick={() => setActiveStudioTool('withdrawalReceipt')}
            className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
              activeStudioTool === 'withdrawalReceipt'
                ? 'btn-accent'
                : 'btn-theme-outline border-transparent'
            }`}
          >
            <Smartphone size={14} /> Withdrawal Receipt
          </button>
          <button
            onClick={() => setActiveStudioTool('matchCredentials')}
            className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
              activeStudioTool === 'matchCredentials'
                ? 'btn-accent'
                : 'btn-theme-outline border-transparent'
            }`}
          >
            <KeyRound size={14} /> Room ID & Pass
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. WITHDRAWAL GFX RECEIPT GENERATOR                      */}
      {/* ======================================================== */}
      {activeStudioTool === 'withdrawalReceipt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {allWithdrawals.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                  Load From Player Withdrawal Requests ({allWithdrawals.length} available)
                </label>
                <select
                  onChange={e => handleSelectExistingWithdrawal(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                >
                  <option value="">-- Choose request to autofill --</option>
                  {allWithdrawals.map(w => (
                    <option key={w.id} value={w.id}>
                      Rs. {w.amount} - {w.userName} ({w.methodDetails?.methodName}: {w.methodDetails?.accountInfo})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-5 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] space-y-4 shadow-xl">
              <div className="text-xs font-black text-[var(--glow-color-1)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
                Admin Dispatch Parameters (Requested Form)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Amount */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--glow-color-1)] uppercase mb-1">
                    1. Amount Sent (Rs. / ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-[var(--glow-color-1)] font-bold text-sm">Rs.</span>
                    <input
                      type="number"
                      value={wdAmount}
                      onChange={e => setWdAmount(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm font-black text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                    />
                  </div>
                </div>

                {/* 2. Name he sent by */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] uppercase mb-1">
                    2. Name Sent By (Admin / Organization) *
                  </label>
                  <input
                    type="text"
                    value={wdSentByName}
                    onChange={e => setWdSentByName(e.target.value)}
                    placeholder="e.g. Shamroz Khan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>

                {/* 3. App Name */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] uppercase mb-1">
                    3. App Name (Used To Send) *
                  </label>
                  <input
                    type="text"
                    value={wdAppName}
                    onChange={e => setWdAppName(e.target.value)}
                    placeholder="e.g. Easypaisa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['Easypaisa', 'JazzCash', 'SadaPay', 'Bank Transfer', 'SS BATTLE'].map(app => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setWdAppName(app)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          wdAppName === app ? 'btn-accent' : 'btn-theme-outline'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Number he sent with */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-primary)] uppercase mb-1">
                    4. Number Sent With (Sender Phone / Account Number) *
                  </label>
                  <input
                    type="text"
                    value={wdSentWithNumber}
                    onChange={e => setWdSentWithNumber(e.target.value)}
                    placeholder="e.g. 03128017777"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>

                {/* Recipient Details */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Beneficiary Player Name
                  </label>
                  <input
                    type="text"
                    value={wdRecipientName}
                    onChange={e => setWdRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Beneficiary Account Number
                  </label>
                  <input
                    type="text"
                    value={wdRecipientAccount}
                    onChange={e => setWdRecipientAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={handleDownloadWdReceipt}
                  className="flex-1 min-w-[170px] py-3 px-4 min-h-[42px] rounded-xl btn-accent font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download GFX Voucher (PNG)
                </button>
                <button
                  type="button"
                  onClick={handleCopyWdText}
                  className="py-3 px-4 min-h-[42px] rounded-xl btn-theme-outline font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  {wdCopied ? <Check size={16} className="text-[var(--success-color)]" /> : <Copy size={16} />}
                  {wdCopied ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Receipt'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
              <FileText size={14} /> Live GFX Voucher Preview (800x1000px)
            </div>

            <div className="w-full rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-2xl bg-black flex items-center justify-center p-1">
              {wdPreviewUrl ? (
                <img
                  src={wdPreviewUrl}
                  alt="GFX Withdrawal Receipt"
                  className="w-full h-auto object-contain rounded-xl max-h-[550px]"
                />
              ) : (
                <div className="py-24 text-center text-xs text-[var(--text-muted)]">
                  Rendering Canvas...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MATCH ROOM ID & PASSWORD CREDENTIALS GFX              */}
      {/* ======================================================== */}
      {activeStudioTool === 'matchCredentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            {tournaments.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                  Select Existing Tournament To Pre-fill
                </label>
                <select
                  value={selectedTourneyId}
                  onChange={e => handleSelectExistingTournament(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                >
                  <option value="custom">-- Custom Match --</option>
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Room: {t.roomId || 'Not set'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-5 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] space-y-4 shadow-xl">
              <div className="text-xs font-black text-[var(--glow-color-1)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
                Match Credentials & Schedule Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-primary)] uppercase mb-1">
                    Match / Tournament Title
                  </label>
                  <input
                    type="text"
                    value={matchTitle}
                    onChange={e => setMatchTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--glow-color-1)] uppercase mb-1">
                    Room ID *
                  </label>
                  <input
                    type="text"
                    value={matchRoomId}
                    onChange={e => setMatchRoomId(e.target.value)}
                    placeholder="e.g. 166770374"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm font-mono font-black text-[var(--glow-color-1)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--success-color)] uppercase mb-1">
                    Room Password *
                  </label>
                  <input
                    type="text"
                    value={matchRoomPass}
                    onChange={e => setMatchRoomPass(e.target.value)}
                    placeholder="e.g. 00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[color-mix(in_srgb,var(--success-color)_45%,transparent)] text-sm font-mono font-black text-[var(--success-color)] focus:outline-none focus:border-[var(--success-color)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Map Name
                  </label>
                  <input
                    type="text"
                    value={matchMap}
                    onChange={e => setMatchMap(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Scheduled Start Time
                  </label>
                  <input
                    type="text"
                    value={matchTimeStr}
                    onChange={e => setMatchTimeStr(e.target.value)}
                    placeholder="e.g. 08:00 PM Tonight"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={handleDownloadMatchCredentials}
                  className="flex-1 min-w-[170px] py-3 px-4 min-h-[42px] rounded-xl btn-accent font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download Match Card (PNG)
                </button>
                <button
                  type="button"
                  onClick={handleCopyMatchText}
                  className="py-3 px-4 min-h-[42px] rounded-xl btn-theme-outline font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  {matchCopied ? <Check size={16} className="text-[var(--glow-color-1)]" /> : <Copy size={16} />}
                  {matchCopied ? 'Copied WhatsApp Broadcast!' : 'Copy WhatsApp Broadcast'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
              <FileText size={14} /> Live Match Briefing Card (800x900px)
            </div>

            <div className="w-full rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-2xl bg-black flex items-center justify-center p-1">
              {matchPreviewUrl ? (
                <img
                  src={matchPreviewUrl}
                  alt="GFX Match Card"
                  className="w-full h-auto object-contain rounded-xl max-h-[550px]"
                />
              ) : (
                <div className="py-24 text-center text-xs text-[var(--text-muted)]">
                  Rendering Canvas...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
