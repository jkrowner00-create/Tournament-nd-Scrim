import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { THEMES_LIST, UNIQUE_OFFICIAL_MAPS, OFFICIAL_MAPS, type ThemeId, type Tournament, type Game, type Promotion, type PaymentMethod, type TournamentMode, type AppSettings } from '../types';
import { uploadToImgBB } from '../services/imgbb';
import {
  ShieldAlert,
  Users,
  Trophy,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  Bell,
  CreditCard,
  Gamepad2,
  Image,
  MessageSquare,
  Ticket,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ExternalLink,
  Search,
  RefreshCw,
  Flame,
  Zap,
  Swords,
  Award,
  Eye,
  KeyRound,
  Tv,
  MapPin,
  Camera,
  Coins,
  Send,
  Lock,
  AlertCircle,
  AlertTriangle,
  Banknote,
  CheckCheck,
  Save,
  RotateCcw,
  Calendar,
  Filter,
  Copy,
  Share2,
  Unlock,
  ShieldCheck,
  Download,
  Key,
  Smartphone,
  Receipt,
  Palette,
} from 'lucide-react';
import { AdminSecurityGate } from '../components/AdminSecurityGate';
import { GfxReceiptModal, type GfxReceiptModalData } from '../components/GfxReceiptModal';
import { GfxStudioTab } from '../components/GfxStudioTab';
import { BillInvoicesTab } from '../components/BillInvoicesTab';
import { BillInvoiceModal } from '../components/BillInvoiceModal';
import { GameGfxModal } from '../components/GameGfxModal';
import type { BillInvoice } from '../types';
import {
  generateDepositReceiptCanvas,
  generateScrimScheduleCanvas,
  generateMatchCredentialsCanvas,
  downloadDataUrl,
} from '../services/gfxGenerator';

export const AdminView: React.FC = () => {
  const {
    userProfile,
    currentUser,
    settings,
    updateAdminSettings,
    allUsersList,
    allDepositRequests,
    allWithdrawals,
    allBillInvoices,
    createBillInvoice,
    processBillInvoice,
    deleteBillInvoice,
    processDepositRequest,
    processWithdrawalRequest,
    convertPendingWithdrawalToDeposit,
    tournaments,
    addOrUpdateTournament,
    deleteTournament,
    postMatchResults,
    games,
    addOrUpdateGame,
    deleteGame,
    promotions,
    addOrUpdatePromotion,
    deletePromotion,
    paymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    paymentIds,
    generatePaymentId,
    deletePaymentId,
    sendBroadcastNotification,
    deleteNotification,
    notifications,
    updateUserBalanceByAdmin,
    toggleUserStatusByAdmin,
    deleteUserByAdmin,
    allSupportThreads,
    sendAdminChatMessage,
    seedDemoData,
    adminSecurity,
    isAdminSessionUnlocked,
    setupAdminSecurity,
    loginAdminSecurity,
    lockAdminSession,
    updateAdminSecurity,
    showToast,
    navigate,
  } = useAppContext();

  // Navigation tab inside admin panel
  const [adminTab, setAdminTab] = useState<
    | 'overview'
    | 'tournaments'
    | 'results'
    | 'payouts'
    | 'deposits'
    | 'invoices'
    | 'withdrawals'
    | 'users'
    | 'games'
    | 'promotions'
    | 'payments'
    | 'settings'
    | 'notifications'
    | 'support'
    | 'gfx'
  >('overview');

  // Selected Bill Invoice for Modal preview & verification
  const [selectedBillInvoice, setSelectedBillInvoice] = useState<BillInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  // Selected Game for GFX Creation Studio Modal
  const [editingGfxGame, setEditingGfxGame] = useState<Partial<Game> | null>(null);

  // Dedicated draft state for Settings & Referral configuration to prevent syncing errors & keystroke lag
  const [settingsDraft, setSettingsDraft] = useState<AppSettings>(settings);
  React.useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  const hasUnsavedSettings = JSON.stringify(settingsDraft) !== JSON.stringify(settings);

  const handleSaveSettings = async () => {
    try {
      await updateAdminSettings(settingsDraft);
      showToast('Settings & Referral configuration saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'danger');
    }
  };

  const handleDiscardSettings = () => {
    setSettingsDraft(settings);
    showToast('Unsaved changes discarded.', 'info');
  };

  // Payouts Tab State (Searchable & Date-Filterable)
  const [payoutSearchQuery, setPayoutSearchQuery] = useState('');
  const [payoutDateFilter, setPayoutDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [payoutDateFrom, setPayoutDateFrom] = useState('');
  const [payoutDateTo, setPayoutDateTo] = useState('');
  const [selectedPayoutTourney, setSelectedPayoutTourney] = useState<Tournament | null>(null);
  const [payoutCopiedId, setPayoutCopiedId] = useState<string | null>(null);

  // Screenshot preview modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // GFX Withdrawal Receipt Modal State
  const [gfxModalOpen, setGfxModalOpen] = useState(false);
  const [gfxModalData, setGfxModalData] = useState<GfxReceiptModalData | null>(null);

  // Tournament Form Modal
  const [tournamentModalOpen, setTournamentModalOpen] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [tourneyForm, setTourneyForm] = useState<{
    name: string;
    gameId: string;
    bannerUrl: string;
    mode: TournamentMode;
    startTime: string;
    entryFee: number;
    prizePool: number;
    perKillPrize: number;
    maxPlayers: number;
    isScrim: boolean;
    slotCount: 12 | 13 | 14 | 15 | 20 | 25;
    dropMap: string;
    liveStreamUrl: string;
    scrimTotalMatches: number;
    scrimMapsSchedule: string;
    scrimCustomRules: string;
    roomId: string;
    roomPassword: string;
    showIdPass: boolean;
  }>({
    name: '',
    gameId: games[0]?.id || 'game_bgmi',
    bannerUrl: '',
    mode: 'Solo',
    startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    entryFee: 50,
    prizePool: 4000,
    perKillPrize: 25,
    maxPlayers: 100,
    isScrim: false,
    slotCount: 12,
    dropMap: 'Bermuda',
    liveStreamUrl: '',
    scrimTotalMatches: 3,
    scrimMapsSchedule: 'Match 1: Bermuda (07:00 PM) • Match 2: Purgatory (07:45 PM) • Match 3: Nextera (08:30 PM)',
    scrimCustomRules: 'Official Free Fire Competitive 12-point scale: #1 Booyah: 12pts, #2: 9pts, #3: 8pts, #4: 7pts, #5: 6pts. Kill: 1pt. Emulators strictly forbidden.',
    roomId: '',
    roomPassword: '',
    showIdPass: false,
  });

  // Results Entry Modal
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [resultsTourneyId, setResultsTourneyId] = useState<string>('');
  const [resultsList, setResultsList] = useState<
    Array<{ position: number; name: string; kills: number; winnings: number; uid?: string }>
  >([
    { position: 1, name: '', kills: 0, winnings: 2000 },
    { position: 2, name: '', kills: 0, winnings: 1200 },
    { position: 3, name: '', kills: 0, winnings: 800 },
  ]);

  // Visual feedback: Subtle highlight animation when row winnings are modified
  const [highlightedWinningsRows, setHighlightedWinningsRows] = useState<Record<number, boolean>>({});
  const highlightTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const triggerWinningsHighlight = (indices: number[]) => {
    setHighlightedWinningsRows(prev => {
      const next = { ...prev };
      indices.forEach(idx => {
        next[idx] = true;
      });
      return next;
    });

    indices.forEach(idx => {
      if (highlightTimersRef.current[idx]) {
        clearTimeout(highlightTimersRef.current[idx]);
      }
      highlightTimersRef.current[idx] = setTimeout(() => {
        setHighlightedWinningsRows(prev => {
          if (!prev[idx]) return prev;
          const next = { ...prev };
          delete next[idx];
          return next;
        });
        delete highlightTimersRef.current[idx];
      }, 1400);
    });
  };

  useEffect(() => {
    return () => {
      Object.values(highlightTimersRef.current).forEach(clearTimeout);
    };
  }, []);


  // User Balance Modifier Modal
  const [balanceModalUser, setBalanceModalUser] = useState<any | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number>(100);
  const [balanceType, setBalanceType] = useState<'balance' | 'winningCash' | 'bonusCash'>('balance');
  const [balanceReason, setBalanceReason] = useState<string>('Tournament reward');

  // Withdrawal Reject Note
  const [rejectModalReqId, setRejectModalReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Invalid Account Number or Details');

  // Payment ID Generator Form
  const [newIdCode, setNewIdCode] = useState<string>('');
  const [newIdAmount, setNewIdAmount] = useState<number>(100);

  // Broadcast Notification Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifMatchType, setNotifMatchType] = useState<TournamentMode | 'all'>('all');

  // Dedicated Deposit Payment Method Modal State (Account Name, Account Number, QR Code, Name)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<string | null>(null);
  const [paymentMethodForm, setPaymentMethodForm] = useState<{
    accountName: string;
    accountNumber: string;
    qrCodeUrl: string;
    name: string;
    enabled: boolean;
  }>({
    accountName: '',
    accountNumber: '',
    qrCodeUrl: '',
    name: 'Easypaisa',
    enabled: true,
  });

  // Support thread active chat
  const [activeChatUid, setActiveChatUid] = useState<string | null>(null);
  const [adminChatText, setAdminChatText] = useState('');

  // Search filter in users
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // ImgBB Upload helper for admin
  const [isUploading, setIsUploading] = useState(false);
  const uploadImgRef = useRef<HTMLInputElement>(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<'appLogo' | 'tourneyBanner' | 'paymentQr' | null>(null);

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      showToast('Uploading image...', 'info');
      try {
        const url = await uploadToImgBB(file);
        if (currentUploadTarget === 'appLogo') {
          setSettingsDraft(prev => ({ ...prev, logoUrl: url }));
          showToast('App Logo uploaded (click Save Changes to persist)!', 'success');
        } else if (currentUploadTarget === 'tourneyBanner') {
          setTourneyForm(prev => ({ ...prev, bannerUrl: url }));
          showToast('Tournament banner uploaded!', 'success');
        } else if (currentUploadTarget === 'paymentQr') {
          setPaymentMethodForm(prev => ({ ...prev, qrCodeUrl: url }));
          showToast('Payment QR Code uploaded!', 'success');
        }
      } catch (uploadErr: any) {
        // Fallback to local Data URL so admin image upload NEVER fails
        const reader = new FileReader();
        reader.onload = ev => {
          const b64 = ev.target?.result as string;
          if (b64) {
            if (currentUploadTarget === 'appLogo') {
              setSettingsDraft(prev => ({ ...prev, logoUrl: b64 }));
              showToast('App Logo loaded!', 'success');
            } else if (currentUploadTarget === 'tourneyBanner') {
              setTourneyForm(prev => ({ ...prev, bannerUrl: b64 }));
              showToast('Tournament banner loaded from local storage!', 'success');
            } else if (currentUploadTarget === 'paymentQr') {
              setPaymentMethodForm(prev => ({ ...prev, qrCodeUrl: b64 }));
              showToast('Payment QR Code loaded!', 'success');
            }
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'danger');
    } finally {
      setIsUploading(false);
      setCurrentUploadTarget(null);
    }
  };

  const openTournamentModal = (t?: Tournament) => {
    if (t) {
      setEditingTournamentId(t.id);
      setTourneyForm({
        name: t.name,
        gameId: t.gameId,
        bannerUrl: t.bannerUrl || '',
        mode: t.mode,
        startTime: new Date(t.startTime).toISOString().slice(0, 16),
        entryFee: t.entryFee,
        prizePool: t.prizePool,
        perKillPrize: t.perKillPrize || 0,
        maxPlayers: t.maxPlayers || 100,
        isScrim: !!t.isScrim,
        slotCount: (t.slotCount as any) || 12,
        dropMap: t.dropMap || 'Bermuda',
        liveStreamUrl: t.liveStreamUrl || '',
        scrimTotalMatches: t.scrimTotalMatches || 3,
        scrimMapsSchedule: t.scrimMapsSchedule || 'Match 1: Bermuda (07:00 PM) • Match 2: Purgatory (07:45 PM) • Match 3: Nextera (08:30 PM)',
        scrimCustomRules: t.scrimCustomRules || 'Official Free Fire Competitive 12-point scale: #1 Booyah: 12pts, #2: 9pts, #3: 8pts, #4: 7pts, #5: 6pts. Kill: 1pt. Emulators strictly forbidden.',
        roomId: t.roomId || '',
        roomPassword: t.roomPassword || '',
        showIdPass: !!t.showIdPass,
      });
    } else {
      setEditingTournamentId(null);
      setTourneyForm({
        name: '',
        gameId: games[0]?.id || 'game_freefire',
        bannerUrl: '',
        mode: 'Solo',
        startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        entryFee: 50,
        prizePool: 4000,
        perKillPrize: 25,
        maxPlayers: 100,
        isScrim: false,
        slotCount: 12,
        dropMap: 'Bermuda',
        liveStreamUrl: '',
        scrimTotalMatches: 3,
        scrimMapsSchedule: 'Match 1: Bermuda (07:00 PM) • Match 2: Purgatory (07:45 PM) • Match 3: Nextera (08:30 PM)',
        scrimCustomRules: 'Official Free Fire Competitive 12-point scale: #1 Booyah: 12pts, #2: 9pts, #3: 8pts, #4: 7pts, #5: 6pts. Kill: 1pt. Emulators strictly forbidden.',
        roomId: '',
        roomPassword: '',
        showIdPass: false,
      });
    }
    setTournamentModalOpen(true);
  };

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existingTourney = editingTournamentId ? tournaments.find(t => t.id === editingTournamentId) : null;
      const currentStatus = existingTourney?.status || 'upcoming';
      const computedMaxPlayers = tourneyForm.isScrim ? Number(tourneyForm.slotCount) * 4 : Number(tourneyForm.maxPlayers);

      const payload: Partial<Tournament> = {
        name: tourneyForm.name.trim(),
        gameId: tourneyForm.gameId,
        bannerUrl: tourneyForm.bannerUrl || null,
        mode: tourneyForm.mode,
        startTime: new Date(tourneyForm.startTime).getTime(),
        entryFee: Number(tourneyForm.entryFee),
        prizePool: Number(tourneyForm.prizePool),
        perKillPrize: Number(tourneyForm.perKillPrize),
        maxPlayers: computedMaxPlayers,
        isScrim: tourneyForm.isScrim,
        slotCount: tourneyForm.slotCount,
        dropMap: tourneyForm.dropMap || 'Bermuda',
        liveStreamUrl: tourneyForm.liveStreamUrl,
        scrimTotalMatches: tourneyForm.isScrim ? Number(tourneyForm.scrimTotalMatches || 3) : undefined,
        scrimMapsSchedule: tourneyForm.isScrim ? tourneyForm.scrimMapsSchedule : undefined,
        scrimCustomRules: tourneyForm.isScrim ? tourneyForm.scrimCustomRules : undefined,
        roomId: tourneyForm.roomId || null,
        roomPassword: tourneyForm.roomPassword || null,
        showIdPass: tourneyForm.showIdPass,
        status: currentStatus,
      };

      // If slotCount > 15, prepare groups
      if (tourneyForm.isScrim && tourneyForm.slotCount > 15) {
        payload.scrimGroups = existingTourney?.scrimGroups || {
          groupA: { groupName: 'Group A', slots: {} },
          groupB: { groupName: 'Group B', slots: {} },
        };
      }

      await addOrUpdateTournament(payload, editingTournamentId || undefined);
      showToast('Tournament / Scrim saved successfully!', 'success');
      setTournamentModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save tournament', 'danger');
    }
  };

  // Deposit Payment Method modal management handlers
  const openCreatePaymentModal = () => {
    setEditingPaymentMethodId(null);
    setPaymentMethodForm({
      accountName: '',
      accountNumber: '',
      qrCodeUrl: '',
      name: 'Easypaisa',
      enabled: true,
    });
    setPaymentModalOpen(true);
  };

  const openEditPaymentModal = (m: PaymentMethod) => {
    setEditingPaymentMethodId(m.id);
    const parsedName = m.accountName || m.accountDetails?.split('(')[1]?.replace(')', '').trim() || '';
    const parsedNumber = m.accountNumber || m.accountDetails?.split('(')[0]?.trim() || '';
    setPaymentMethodForm({
      accountName: parsedName,
      accountNumber: parsedNumber,
      qrCodeUrl: m.qrCodeUrl || '',
      name: m.name,
      enabled: m.enabled !== false,
    });
    setPaymentModalOpen(true);
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethodForm.accountName.trim() || !paymentMethodForm.accountNumber.trim()) {
      showToast('Please provide both Account Name and Account Number.', 'warning');
      return;
    }
    try {
      const payload: Partial<PaymentMethod> = {
        name: paymentMethodForm.name.trim() || 'Payment Method',
        accountName: paymentMethodForm.accountName.trim(),
        accountNumber: paymentMethodForm.accountNumber.trim(),
        accountDetails: `${paymentMethodForm.accountNumber.trim()} (${paymentMethodForm.accountName.trim()})`,
        qrCodeUrl: paymentMethodForm.qrCodeUrl.trim() || undefined,
        enabled: paymentMethodForm.enabled,
      };
      await addPaymentMethod(payload, editingPaymentMethodId || undefined);
      showToast(editingPaymentMethodId ? 'Payment method updated!' : 'Payment method added!', 'success');
      setPaymentModalOpen(false);
      setEditingPaymentMethodId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save payment method.', 'danger');
    }
  };

  const handlePublishResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultsTourneyId) return;

    const tourney = tournaments.find(t => t.id === resultsTourneyId);
    const tourneyPrizePool = Number(tourney?.prizePool || 0);
    const totalDistributed = resultsList.reduce((sum, r) => sum + (Number(r.winnings) || 0), 0);

    // Validation 1: Prevent saving if distributed exceeds tournament prize pool
    if (tourneyPrizePool > 0 && totalDistributed > tourneyPrizePool) {
      showToast(
        `⛔ Validation Error: Cannot save results. Total distributed prize (₹${totalDistributed}) exceeds the Tournament Prize Pool (₹${tourneyPrizePool}) by ₹${totalDistributed - tourneyPrizePool}. Please adjust player winnings before saving.`,
        'danger'
      );
      return;
    }

    // Validation 2: Warn admin if distributed prize is lower than tournament prize pool
    if (tourneyPrizePool > 0 && totalDistributed < tourneyPrizePool) {
      const undistributed = tourneyPrizePool - totalDistributed;
      const confirmed = window.confirm(
        `⚠️ Prize Pool Warning:\n\n` +
        `Tournament Prize Pool: ₹${tourneyPrizePool.toLocaleString()}\n` +
        `Total Distributed:    ₹${totalDistributed.toLocaleString()}\n` +
        `Undistributed Amount: ₹${undistributed.toLocaleString()}\n\n` +
        `The total distributed winnings in rows (₹${totalDistributed.toLocaleString()}) is lower than the tournament's configured prize pool (₹${tourneyPrizePool.toLocaleString()}).\n\n` +
        `Do you want to proceed and distribute ₹${totalDistributed.toLocaleString()} to participants?`
      );
      if (!confirmed) {
        showToast(
          `Publish cancelled. You can adjust row prizes to match the ₹${tourneyPrizePool.toLocaleString()} prize pool.`,
          'warning'
        );
        return;
      }
    }

    try {
      await postMatchResults(resultsTourneyId, resultsList);
      setResultsModalOpen(false);
      setResultsTourneyId('');
    } catch (err: any) {
      showToast(err.message || 'Failed to post results', 'danger');
    }
  };

  // Pending counts
  const pendingDeposits = allDepositRequests.filter(d => d.status === 'pending');
  const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'pending');
  const pendingInvoices = (allBillInvoices || []).filter(i => i.status === 'pending');
  const completedPayouts = tournaments.filter(
    t => t.winningsDistributed === true || ((t.status === 'result' || t.status === 'completed') && (t.results || []).length > 0)
  );

  // Admin Security System Gate (One-time signup, other times secure login session)
  if (!isAdminSessionUnlocked) {
    return (
      <AdminSecurityGate
        adminSecurity={adminSecurity}
        setupAdminSecurity={setupAdminSecurity}
        loginAdminSecurity={loginAdminSecurity}
        onBackToHome={() => navigate('home')}
      />
    );
  }

  return (
    <div className="min-w-0 max-w-6xl mx-auto px-4 py-6 pb-28 relative">
      {/* Floating Unsaved Changes Warning & Action Bar */}
      {hasUnsavedSettings && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 animate-card-enter p-4 rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--glow-color-1)] backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2.5 text-[var(--glow-color-1)] text-xs font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
            <span>You have unsaved changes in Settings / Referral Program</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDiscardSettings}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl btn-theme-outline text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Discard</span>
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
            >
              <Save size={13} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input for ImgBB uploads */}
      <input
        ref={uploadImgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAdminFileUpload}
      />

      {/* Admin Header */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-[color-mix(in_srgb,var(--danger-color)_14%,var(--surface-color))] via-[var(--surface-color)] to-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--danger-color)_15%,var(--card-bg))] border border-[color-mix(in_srgb,var(--danger-color)_40%,transparent)] flex items-center justify-center text-[var(--danger-color)]">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                  Esports Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[var(--danger-color)] text-white">
                  Admin
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Full platform governance: Scrim slots, deposits, payouts, 15 themes, user ledger & broadcast
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setGfxModalData({
                  amount: 500,
                  sentByName: adminSecurity?.adminName || settings.jazzCashName || 'Shamroz Khan',
                  appName: 'Easypaisa',
                  sentWithNumber: settings.supportContact || settings.upiDetails || '03128017777',
                  recipientName: 'Player',
                  recipientAccount: '—',
                  transactionRef: `SSB-WD-${Date.now().toString().slice(-7)}`,
                  isPending: false,
                });
                setGfxModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl btn-theme-soft text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Receipt size={14} /> GFX Receipt
            </button>
            <button
              onClick={lockAdminSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl btn-theme-danger text-xs font-bold uppercase tracking-wider cursor-pointer"
              title="Lock Admin Console Session"
            >
              <Lock size={14} /> Lock Session
            </button>
          </div>
        </div>
      </div>

      {/* Admin Horizontal Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Trophy },
          { id: 'tournaments', label: 'Tournaments & Scrims', icon: Swords },
          { id: 'results', label: 'Match Results', icon: Trophy },
          { id: 'payouts', label: `Payouts (${completedPayouts.length})`, icon: Banknote },
          { id: 'gfx', label: 'GFX Studio & Receipts', icon: Palette },
          {
            id: 'deposits',
            label: `Deposits ${pendingDeposits.length > 0 ? `(${pendingDeposits.length})` : ''}`,
            icon: ArrowDownLeft,
          },
          {
            id: 'invoices',
            label: `Bill Invoices ${pendingInvoices.length > 0 ? `(${pendingInvoices.length})` : ''}`,
            icon: Receipt,
          },
          {
            id: 'withdrawals',
            label: `Withdrawals ${pendingWithdrawals.length > 0 ? `(${pendingWithdrawals.length})` : ''}`,
            icon: ArrowUpRight,
          },
          { id: 'users', label: 'Users & Balances', icon: Users },
          { id: 'payments', label: 'Payment Channels & IDs', icon: CreditCard },
          { id: 'games', label: 'Games', icon: Gamepad2 },
          { id: 'promotions', label: 'Carousel Banners', icon: Image },
          { id: 'settings', label: `Settings ${hasUnsavedSettings ? '• (Unsaved)' : ''}`, icon: Settings },
          { id: 'notifications', label: 'Broadcast Alerts', icon: Bell },
          { id: 'support', label: 'Live Support Desk', icon: MessageSquare },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[38px] rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'btn-accent'
                  : 'btn-theme-outline'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
              <div className="text-xs uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>Total Players</span>
                <Users size={16} className="text-[var(--primary-color)]" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] mt-2">
                {allUsersList.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
              <div className="text-xs uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>Pending Deposits</span>
                <ArrowDownLeft size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-black text-green-400 mt-2">
                {pendingDeposits.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
              <div className="text-xs uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>Pending Payouts</span>
                <ArrowUpRight size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">
                {pendingWithdrawals.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
              <div className="text-xs uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>Tournaments</span>
                <Trophy size={16} className="text-[var(--primary-color)]" />
              </div>
              <div className="text-2xl font-black text-[var(--primary-color)] mt-2">
                {tournaments.length}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
              Administrator Fast-Track Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setAdminTab('tournaments');
                  openTournamentModal();
                }}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--primary-color)] text-left transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center mb-2">
                  <Plus size={20} />
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Host New Scrim / Match</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Set 12-15 slots, groups A/B/C, drop map & live stream
                </div>
              </button>

              <button
                onClick={() => setAdminTab('deposits')}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-green-500 text-left transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-2">
                  <ArrowDownLeft size={20} />
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Audit Deposit Receipts</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Verify ImgBB transaction screenshots and credit wallet balances
                </div>
              </button>

              <button
                onClick={() => setAdminTab('withdrawals')}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500 text-left transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                  <ArrowUpRight size={20} />
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Process Payouts</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Send JazzCash / EasyPaisa / Bank cash to winners
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOURNAMENTS & SCRIMS */}
      {adminTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Manage Matches & Scrims ({tournaments.length})
            </h2>
            <button
              onClick={() => openTournamentModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              <Plus size={16} /> Create Tournament / Scrim
            </button>
          </div>

          <div className="space-y-3">
            {tournaments.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80'}
                    alt={t.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-[var(--border-color)]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[var(--text-primary)] uppercase">
                        {t.name}
                      </span>
                      {t.isScrim ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[var(--primary-color)] text-[var(--bg-main)]">
                          Scrim ({t.slotCount || 12} Slots)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]">
                          {t.mode}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 flex flex-wrap items-center gap-3">
                      <span>Fee: <strong>₹{t.entryFee}</strong></span>
                      <span>Prize: <strong>₹{t.prizePool}</strong></span>
                      <span>Status: <strong className="uppercase text-[var(--primary-color)]">{t.status}</strong></span>
                      {t.roomId && (
                        <span className="text-amber-400">
                          ID: {t.roomId} | Pass: {t.roomPassword} ({t.showIdPass ? 'Visible' : 'Hidden'})
                        </span>
                      )}
                    </div>
                    {t.isScrim && t.scrimMapsSchedule && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Schedule:
                        </span>
                        {t.scrimMapsSchedule.split('•').map((part, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-color)] text-[10px] font-semibold text-[var(--text-primary)]"
                          >
                            {part.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                  {t.isScrim && (
                    <button
                      onClick={() => {
                        try {
                          const parsedMatches = (t.scrimMapsSchedule || '')
                            .split('•')
                            .map((p, idx) => {
                              const trimmed = p.trim();
                              const colonIdx = trimmed.indexOf(':');
                              const mapName = colonIdx !== -1 ? trimmed.slice(colonIdx + 1).trim() : trimmed;
                              return { matchNum: idx + 1, map: mapName || 'Erangel' };
                            })
                            .filter(m => m.map.length > 0);

                          const dataUrl = generateScrimScheduleCanvas({
                            scrimTitle: t.name,
                            dateStr: t.startTime ? new Date(t.startTime).toLocaleString() : 'LIVE MATCH',
                            totalSlots: t.slotCount || 12,
                            entryFee: t.entryFee,
                            prizePool: t.prizePool,
                            totalMatches: t.scrimTotalMatches || (parsedMatches.length > 0 ? parsedMatches.length : 1),
                            matches: parsedMatches.length > 0 ? parsedMatches : [{ matchNum: 1, map: t.dropMap || 'Erangel' }],
                            rules: t.scrimCustomRules || t.description || 'Standard Tournament Rules',
                            platformName: settings.appName || 'SS BATTLE APP',
                          });
                          if (dataUrl) {
                            downloadDataUrl(dataUrl, `scrim-schedule-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`);
                            showToast('Scrim Schedule GFX downloaded as PNG!', 'success');
                          }
                        } catch (e: any) {
                          showToast('Failed to generate scrim GFX: ' + e.message, 'danger');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg btn-theme-soft text-xs font-bold cursor-pointer flex items-center gap-1"
                      title="Download Scrim Schedule GFX as Image (PNG)"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Scrim GFX</span>
                    </button>
                  )}

                  {t.roomId && (
                    <button
                      onClick={() => {
                        try {
                          const dataUrl = generateMatchCredentialsCanvas({
                            tournamentTitle: t.name,
                            gameName: 'ESPORTS MATCH',
                            mapName: t.dropMap || 'Erangel',
                            mode: t.mode,
                            roomId: t.roomId || '',
                            roomPassword: t.roomPassword || '',
                            matchTimeStr: t.startTime ? new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LIVE',
                            prizePool: t.prizePool,
                            customRules: t.scrimCustomRules || t.description,
                            platformName: settings.appName || 'SS BATTLE APP',
                          });
                          if (dataUrl) {
                            downloadDataUrl(dataUrl, `room-pass-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`);
                            showToast('Room Pass GFX downloaded as PNG!', 'success');
                          }
                        } catch (e: any) {
                          showToast('Failed to generate room pass: ' + e.message, 'danger');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg btn-theme-outline text-xs font-bold cursor-pointer flex items-center gap-1"
                      title="Download Match Credentials / Room Pass GFX as Image (PNG)"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Pass GFX</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      addOrUpdateTournament(
                        { showIdPass: !t.showIdPass },
                        t.id
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      t.showIdPass
                        ? 'btn-theme-soft'
                        : 'btn-theme-outline'
                    }`}
                    title="Toggle Room ID & Pass visibility for players"
                  >
                    <KeyRound size={13} className="inline mr-1" />
                    {t.showIdPass ? 'ID Visible' : 'ID Hidden'}
                  </button>

                  <button
                    onClick={() => openTournamentModal(t)}
                    className="p-2 rounded-lg btn-theme-outline cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete tournament "${t.name}"?`)) {
                        deleteTournament(t.id);
                      }
                    }}
                    className="p-2 rounded-lg btn-theme-danger cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESULTS ENTRY & PRIZE DISTRIBUTOR */}
      {adminTab === 'results' && (
        <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
                Publish Match Results & Auto-Credit Winnings
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Select a completed match, enter winners and kills. The system will automatically credit verified prize money to the players' winning balances.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Select Tournament / Scrim
              </label>
              <select
                value={resultsTourneyId}
                onChange={e => setResultsTourneyId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)]"
              >
                <option value="">-- Choose Match --</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.mode}) - Status: {t.status}
                  </option>
                ))}
              </select>
            </div>

            {resultsTourneyId && (
              <form onSubmit={handlePublishResults} className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                {/* 1-Click Auto-Split Prize Pool Bar */}
                <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                      <Trophy size={14} /> 1-Click Auto-Split Prize Pool
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Total Match Pool: <strong className="text-white">₹{tournaments.find(t => t.id === resultsTourneyId)?.prizePool || 0}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const pool = tournaments.find(t => t.id === resultsTourneyId)?.prizePool || 0;
                        setResultsList([
                          { position: 1, name: resultsList[0]?.name || '', kills: resultsList[0]?.kills || 0, winnings: Math.round(pool * 0.50) },
                          { position: 2, name: resultsList[1]?.name || '', kills: resultsList[1]?.kills || 0, winnings: Math.round(pool * 0.30) },
                          { position: 3, name: resultsList[2]?.name || '', kills: resultsList[2]?.kills || 0, winnings: Math.round(pool * 0.20) },
                        ]);
                        triggerWinningsHighlight([0, 1, 2]);
                      }}
                      className="px-2.5 py-1.5 rounded-lg btn-theme-soft text-xs font-bold cursor-pointer"
                    >
                      Top 3 (50/30/20%)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const pool = tournaments.find(t => t.id === resultsTourneyId)?.prizePool || 0;
                        setResultsList([
                          { position: 1, name: resultsList[0]?.name || '', kills: resultsList[0]?.kills || 0, winnings: Math.round(pool * 0.40) },
                          { position: 2, name: resultsList[1]?.name || '', kills: resultsList[1]?.kills || 0, winnings: Math.round(pool * 0.25) },
                          { position: 3, name: resultsList[2]?.name || '', kills: resultsList[2]?.kills || 0, winnings: Math.round(pool * 0.15) },
                          { position: 4, name: resultsList[3]?.name || '', kills: resultsList[3]?.kills || 0, winnings: Math.round(pool * 0.10) },
                          { position: 5, name: resultsList[4]?.name || '', kills: resultsList[4]?.kills || 0, winnings: Math.round(pool * 0.10) },
                        ]);
                        triggerWinningsHighlight([0, 1, 2, 3, 4]);
                      }}
                      className="px-2.5 py-1.5 rounded-lg btn-theme-outline text-xs font-bold cursor-pointer"
                    >
                      Top 5 Split
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const pool = tournaments.find(t => t.id === resultsTourneyId)?.prizePool || 0;
                        setResultsList([
                          { position: 1, name: resultsList[0]?.name || '', kills: resultsList[0]?.kills || 0, winnings: pool },
                        ]);
                        triggerWinningsHighlight([0]);
                      }}
                      className="px-2.5 py-1.5 rounded-lg btn-theme-outline text-xs font-bold cursor-pointer"
                    >
                      Winner Takes All
                    </button>
                  </div>
                </div>

                {/* Real-time Prize Pool Auditor Card */}
                {(() => {
                  const currentTourney = tournaments.find(t => t.id === resultsTourneyId);
                  const prizePool = Number(currentTourney?.prizePool || 0);
                  const totalDistributed = resultsList.reduce((sum, r) => sum + (Number(r.winnings) || 0), 0);
                  const remaining = prizePool - totalDistributed;
                  const isOver = prizePool > 0 && totalDistributed > prizePool;
                  const isUnder = prizePool > 0 && totalDistributed < prizePool;

                  return (
                    <div className={`p-4 rounded-2xl border transition-all ${
                      isOver
                        ? 'bg-red-950/30 border-red-500/60 text-red-200'
                        : isUnder
                        ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                        : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    }`}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Tournament Prize Pool</span>
                          <span className="text-base font-black text-white">₹{prizePool.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Distributed</span>
                          <span className="text-base font-black text-amber-400">₹{totalDistributed.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Remaining Balance</span>
                          <span className={`text-base font-black ${isOver ? 'text-red-400' : isUnder ? 'text-amber-400' : 'text-emerald-400'}`}>
                            ₹{remaining.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isOver
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : isUnder
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isOver ? `Blocked (+₹${(totalDistributed - prizePool).toLocaleString()})` : isUnder ? `Under Pool (-₹${remaining.toLocaleString()})` : 'Exact Match (100%)'}
                          </span>
                        </div>
                      </div>

                      {isOver && (
                        <div className="mt-3 p-2.5 rounded-xl bg-red-900/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                          <AlertCircle size={15} className="flex-shrink-0" />
                          <span>
                            <strong>Validation Error:</strong> Total distributed prize (₹{totalDistributed}) exceeds tournament prize pool (₹{prizePool}) by <strong>₹{totalDistributed - prizePool}</strong>. Saving is blocked!
                          </span>
                        </div>
                      )}

                      {isUnder && (
                        <div className="mt-3 p-2.5 rounded-xl bg-amber-900/30 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
                          <AlertTriangle size={15} className="flex-shrink-0" />
                          <span>
                            <strong>Prize Pool Warning:</strong> Total distributed prize (₹{totalDistributed}) is lower than defined prize pool (₹{prizePool}). <strong>₹{remaining}</strong> remains undistributed. You will be prompted to confirm before distributing.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[var(--primary-color)]">
                    Player Standings & Rewards
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setResultsList(prev => [
                        ...prev,
                        {
                          position: prev.length + 1,
                          name: '',
                          kills: 0,
                          winnings: 0,
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-lg btn-theme-soft text-xs font-bold cursor-pointer"
                  >
                    + Add Standing Row
                  </button>
                </div>

                <div className="space-y-3">
                  {resultsList.map((res, index) => {
                    const isHighlighted = !!highlightedWinningsRows[index];
                    return (
                      <div
                        key={index}
                        className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl transition-all duration-300 relative ${
                          isHighlighted
                            ? 'row-winnings-highlight bg-amber-500/15 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                            : 'bg-[var(--bg-card)] border border-[var(--border-color)]'
                        }`}
                      >
                        <div className="col-span-2 sm:col-span-1 text-center font-black text-amber-400">
                          #{res.position}
                        </div>

                        <div className="col-span-10 sm:col-span-4">
                          <input
                            type="text"
                            value={res.name}
                            onChange={e => {
                              const updated = [...resultsList];
                              updated[index].name = e.target.value;
                              setResultsList(updated);
                            }}
                            placeholder="Player or Team Name"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <input
                            type="number"
                            value={res.kills}
                            onChange={e => {
                              const updated = [...resultsList];
                              updated[index].kills = Number(e.target.value);
                              setResultsList(updated);
                            }}
                            placeholder="Kills"
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-3">
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-xs text-[var(--primary-color)]">₹</span>
                            <input
                              type="number"
                              value={res.winnings}
                              onChange={e => {
                                const newWinnings = Number(e.target.value);
                                const oldWinnings = res.winnings;
                                const updated = [...resultsList];
                                updated[index].winnings = newWinnings;
                                setResultsList(updated);
                                if (newWinnings !== oldWinnings) {
                                  triggerWinningsHighlight([index]);
                                }
                              }}
                              placeholder="Prize"
                              className={`w-full pl-6 pr-8 py-2 rounded-lg bg-[var(--bg-main)] border text-xs text-[var(--text-primary)] font-bold transition-all ${
                                isHighlighted
                                  ? 'border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                                  : 'border-[var(--border-color)]'
                              }`}
                            />
                            {isHighlighted && (
                              <div
                                className="absolute right-2 top-2 flex items-center text-amber-400 animate-pulse pointer-events-none"
                                title="Winnings updated"
                              >
                                <Zap size={13} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1.5">
                          {isHighlighted && (
                            <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse hidden sm:inline-block">
                              Prize Updated
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setResultsList(resultsList.filter((_, i) => i !== index));
                            }}
                            className="p-1.5 rounded-lg btn-theme-danger cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 min-h-[44px] rounded-2xl btn-accent font-black text-sm uppercase tracking-wider cursor-pointer"
                >
                  Confirm & Publish Match Standings (Auto-Distribute ₹ Winnings)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB: PAYOUTS & PRIZE DISTRIBUTIONS */}
      {adminTab === 'payouts' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Banknote size={18} />
                </div>
                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wide">
                  Prize Payouts & Distributions ({completedPayouts.length})
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Searchable, date-filterable ledger of all finalized tournament winnings credited to player wallets.
              </p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          {(() => {
            const totalPaidAmount = completedPayouts.reduce((acc, t) => {
              if (t.totalDistributed) return acc + t.totalDistributed;
              const resTotal = (t.results || []).reduce((s, r) => s + (Number(r.winnings) || 0), 0);
              return acc + resTotal;
            }, 0);

            const totalWinningPlayers = completedPayouts.reduce((acc, t) => {
              if (t.payoutRecipientsCount) return acc + t.payoutRecipientsCount;
              return acc + (t.results || []).filter(r => (Number(r.winnings) || 0) > 0).length;
            }, 0);

            const avgPayout = completedPayouts.length > 0 ? Math.round(totalPaidAmount / completedPayouts.length) : 0;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                    <span>Total Distributed</span>
                    <Coins size={14} className="text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                    ₹{totalPaidAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">100% Credited to Wallets</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                    <span>Paid Tournaments</span>
                    <Trophy size={14} className="text-[var(--primary-color)]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                    {completedPayouts.length}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Completed & Finalized</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                    <span>Players Credited</span>
                    <Users size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                    {totalWinningPlayers}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Winning Cash Recipients</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center justify-between">
                    <span>Avg Payout / Match</span>
                    <Award size={14} className="text-sky-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
                    ₹{avgPayout.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Per Tournament</span>
                </div>
              </div>
            );
          })()}

          {/* Search Bar & Date Filter Controls */}
          <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by tournament name, game, mode, player IGN, or tournament ID..."
                  value={payoutSearchQuery}
                  onChange={e => setPayoutSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]"
                />
                {payoutSearchQuery && (
                  <button
                    onClick={() => setPayoutSearchQuery('')}
                    className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Date Filter Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] mr-1 shrink-0 flex items-center gap-1">
                  <Filter size={11} /> Date:
                </span>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: '30days', label: 'Last 30 Days' },
                  { id: 'custom', label: 'Custom Range' },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setPayoutDateFilter(filter.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                      payoutDateFilter === filter.id
                        ? 'btn-accent'
                        : 'btn-theme-outline'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {payoutDateFilter === 'custom' && (
              <div className="pt-2 border-t border-[var(--border-color)]/50 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">From:</span>
                  <input
                    type="date"
                    value={payoutDateFrom}
                    onChange={e => setPayoutDateFrom(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">To:</span>
                  <input
                    type="date"
                    value={payoutDateTo}
                    onChange={e => setPayoutDateTo(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                {(payoutDateFrom || payoutDateTo) && (
                  <button
                    onClick={() => {
                      setPayoutDateFrom('');
                      setPayoutDateTo('');
                    }}
                    className="text-xs text-red-400 hover:underline cursor-pointer font-bold"
                  >
                    Reset Dates
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Searchable, Date-Filtered Payouts Table */}
          {(() => {
            const now = Date.now();
            const startOfToday = new Date().setHours(0, 0, 0, 0);

            const filteredPayouts = completedPayouts.filter(t => {
              // 1. Text Search Query
              if (payoutSearchQuery.trim()) {
                const q = payoutSearchQuery.toLowerCase();
                const nameMatch = (t.name || '').toLowerCase().includes(q);
                const gameMatch = (games.find(g => g.id === t.gameId)?.name || '').toLowerCase().includes(q);
                const modeMatch = (t.mode || '').toLowerCase().includes(q);
                const idMatch = (t.id || '').toLowerCase().includes(q);
                const resultsMatch = (t.results || []).some(
                  r => (r.name || '').toLowerCase().includes(q) || (r.gameName || '').toLowerCase().includes(q)
                );
                if (!nameMatch && !gameMatch && !modeMatch && !idMatch && !resultsMatch) return false;
              }

              // 2. Date Filter
              const dateTimestamp = t.distributedAt || t.startTime || 0;
              if (payoutDateFilter === 'today') {
                if (dateTimestamp < startOfToday) return false;
              } else if (payoutDateFilter === '7days') {
                if (dateTimestamp < now - 7 * 86400000) return false;
              } else if (payoutDateFilter === '30days') {
                if (dateTimestamp < now - 30 * 86400000) return false;
              } else if (payoutDateFilter === 'custom') {
                if (payoutDateFrom) {
                  const fromTime = new Date(payoutDateFrom).setHours(0, 0, 0, 0);
                  if (dateTimestamp < fromTime) return false;
                }
                if (payoutDateTo) {
                  const toTime = new Date(payoutDateTo).setHours(23, 59, 59, 999);
                  if (dateTimestamp > toTime) return false;
                }
              }

              return true;
            });

            if (filteredPayouts.length === 0) {
              return (
                <div className="p-12 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] text-center">
                  <Banknote size={40} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">No matching payouts found</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Try adjusting your search keywords or resetting the date filter.
                  </p>
                  {(payoutSearchQuery || payoutDateFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setPayoutSearchQuery('');
                        setPayoutDateFilter('all');
                        setPayoutDateFrom('');
                        setPayoutDateTo('');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl btn-theme-soft text-xs font-bold cursor-pointer"
                    >
                      Clear Search & Date Filters
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 text-[var(--text-muted)] uppercase font-bold text-[10px]">
                      <th className="py-3 px-4">Tournament / Scrim</th>
                      <th className="py-3 px-3">Date Completed</th>
                      <th className="py-3 px-3">Prize Pool / Paid</th>
                      <th className="py-3 px-4">Top Winners & Placements</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/50">
                    {filteredPayouts.map(t => {
                      const gameObj = games.find(g => g.id === t.gameId);
                      const totalPaid = t.totalDistributed || (t.results || []).reduce((s, r) => s + (Number(r.winnings) || 0), 0);
                      const winningResults = (t.results || []).filter(r => (Number(r.winnings) || 0) > 0);
                      const topWinner = winningResults[0];

                      return (
                        <tr key={t.id} className="hover:bg-[var(--bg-card)]/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={t.bannerUrl || gameObj?.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400'}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-[var(--border-color)] shrink-0 bg-black"
                              />
                              <div>
                                <div className="font-bold text-[var(--text-primary)] line-clamp-1 max-w-[220px]">
                                  {t.name}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mt-0.5">
                                  <span className="font-semibold text-[var(--warning-color)]">
                                    {gameObj?.name || 'Esports'}
                                  </span>
                                  <span>•</span>
                                  <span>{t.mode}</span>
                                  {t.isScrim && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-400 font-bold">Scrim</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-[var(--text-muted)] whitespace-nowrap">
                            <div className="flex items-center gap-1 text-[var(--text-primary)] font-semibold">
                              <Calendar size={11} className="text-[var(--primary-color)]" />
                              <span>
                                {new Date(t.distributedAt || t.startTime).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="text-[10px]">
                              {new Date(t.distributedAt || t.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-black text-amber-400 text-sm">
                              ₹{totalPaid.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)]">
                              Pool: ₹{Number(t.prizePool || 0).toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {winningResults.length > 0 ? (
                              <div className="space-y-0.5">
                                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1 text-[11px]">
                                  <span className="text-amber-400">#1</span>
                                  <span className="truncate max-w-[150px]">{topWinner.name || topWinner.gameName}</span>
                                  <span className="text-emerald-400 font-black shrink-0">(+₹{topWinner.winnings})</span>
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)]">
                                  {winningResults.length} {winningResults.length === 1 ? 'winner' : 'winners'} rewarded • {winningResults.reduce((sum, r) => sum + (r.kills || 0), 0)} kills
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)]">No winners recorded</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCheck size={11} /> Credited
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedPayoutTourney(t)}
                                className="px-2.5 py-1.5 rounded-lg btn-theme-soft text-xs font-bold cursor-pointer flex items-center gap-1"
                                title="View full player distribution breakdown"
                              >
                                <Eye size={12} />
                                <span>Breakdown</span>
                              </button>

                              <button
                                onClick={() => {
                                  let announceText = `🏆 *${t.name.toUpperCase()} - OFFICIAL PAYOUT STANDINGS* 🏆\n\n`;
                                  announceText += `🎮 Game: ${gameObj?.name || 'Esports'} | Mode: ${t.mode}\n`;
                                  announceText += `💰 Total Prize Distributed: ₹${totalPaid.toLocaleString()}\n`;
                                  announceText += `📅 Concluded: ${new Date(t.distributedAt || t.startTime).toLocaleDateString()}\n\n`;
                                  announceText += `*OFFICIAL WINNERS (WALLETS CREDITED):*\n`;

                                  (t.results || []).forEach((r, idx) => {
                                    const medal = r.position === 1 ? '🥇 #1' : r.position === 2 ? '🥈 #2' : r.position === 3 ? '🥉 #3' : `#${r.position || idx + 1}`;
                                    announceText += `${medal} - ${r.name || r.gameName} | Kills: ${r.kills} | Prize: ₹${r.winnings}\n`;
                                  });

                                  announceText += `\nAll prizes credited automatically to players' in-app wallet balances.\nHosted on ${settings.appName || 'Gaming Tournament'}`;

                                  navigator.clipboard.writeText(announceText);
                                  setPayoutCopiedId(t.id);
                                  showToast('WhatsApp / Discord announcement copied to clipboard!', 'success');
                                  setTimeout(() => setPayoutCopiedId(null), 2500);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${
                                  payoutCopiedId === t.id
                                    ? 'btn-theme-success'
                                    : 'btn-theme-outline'
                                }`}
                                title="Copy result announcement for WhatsApp / Discord"
                              >
                                {payoutCopiedId === t.id ? (
                                  <>
                                    <Check size={12} />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copy Text</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* PAYOUT BREAKDOWN MODAL */}
      {selectedPayoutTourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="animate-card-enter w-full max-w-2xl my-8 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <div>
                <span className="text-[10px] font-black uppercase text-[var(--glow-color-1)] tracking-wider flex items-center gap-1">
                  <Banknote size={12} /> Finalized Prize Distribution
                </span>
                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wide mt-0.5">
                  {selectedPayoutTourney.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Completed on {new Date(selectedPayoutTourney.distributedAt || selectedPayoutTourney.startTime).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayoutTourney(null)}
                className="w-9 h-9 rounded-full btn-theme-outline flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Payout Summary Bar */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Prize Pool</span>
                <span className="text-sm font-black text-[var(--text-primary)]">
                  ₹{Number(selectedPayoutTourney.prizePool || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Total Paid Out</span>
                <span className="text-sm font-black text-amber-400">
                  ₹{(
                    selectedPayoutTourney.totalDistributed ||
                    (selectedPayoutTourney.results || []).reduce((s, r) => s + (Number(r.winnings) || 0), 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Recipients</span>
                <span className="text-sm font-black text-emerald-400">
                  {(selectedPayoutTourney.results || []).filter(r => (Number(r.winnings) || 0) > 0).length} Players
                </span>
              </div>
            </div>

            {/* Table of Winners */}
            <div className="overflow-y-auto flex-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] uppercase font-bold text-[10px]">
                    <th className="py-2.5 px-3 text-center w-12">Rank</th>
                    <th className="py-2.5 px-3">Player / Squad</th>
                    <th className="py-2.5 px-3 text-center">Kills</th>
                    <th className="py-2.5 px-3 text-right">Prize Cash</th>
                    <th className="py-2.5 px-3 text-center">Wallet Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/40">
                  {(selectedPayoutTourney.results || []).map((r, idx) => (
                    <tr key={r.uid || idx} className="hover:bg-white/5">
                      <td className="py-2.5 px-3 text-center font-black">
                        {r.position === 1 ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-500 text-black font-extrabold text-[10px]">#1</span>
                        ) : r.position === 2 ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-300 text-black font-extrabold text-[10px]">#2</span>
                        ) : r.position === 3 ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-700 text-white font-extrabold text-[10px]">#3</span>
                        ) : (
                          <span className="text-[var(--text-muted)]">#{r.position || idx + 1}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[var(--text-primary)]">{r.name}</div>
                        {r.gameName && <div className="text-[10px] text-[var(--text-muted)]">IGN: {r.gameName}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-sky-400">{r.kills || 0}</td>
                      <td className="py-2.5 px-3 text-right font-black text-amber-400">
                        {r.winnings > 0 ? `₹${r.winnings.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.winnings > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <CheckCheck size={11} /> Credited
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">Unplaced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--text-muted)]">
                All winning cash was added to players' balance and winning cash wallets.
              </span>
              <button
                onClick={() => setSelectedPayoutTourney(null)}
                className="px-5 py-2 min-h-[38px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEPOSIT REQUESTS */}
      {adminTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Deposit Receipts Auditor ({allDepositRequests.length})
            </h2>
          </div>

          {allDepositRequests.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              No deposit requests registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {allDepositRequests.map(req => {
                const isPending = req.status === 'pending';
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {req.screenshotUrl ? (
                        <button
                          onClick={() => setPreviewScreenshotUrl(req.screenshotUrl)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--border-color)] group cursor-pointer flex-shrink-0"
                          title="Click to view full receipt"
                        >
                          <img
                            src={req.screenshotUrl}
                            alt="Receipt"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye size={16} className="text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-[var(--text-muted)]">
                          No Pic
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-green-400">
                            +₹{req.amount}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              req.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : req.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-primary)] font-bold mt-0.5">
                          Player: {req.userName || req.userEmail}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          {req.depositId ? <span className="text-amber-400 font-bold mr-2">ID: {req.depositId}</span> : null}
                          {req.invoiceNumber ? <span className="text-cyan-300 font-bold mr-2">Ref: {req.invoiceNumber}</span> : null}
                          <span>Txn: {req.transactionId || 'None'} • {new Date(req.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      {/* 1-Click Download Deposit GFX Receipt */}
                      <button
                        type="button"
                        onClick={() => {
                          const dataUrl = generateDepositReceiptCanvas({
                            amount: req.amount,
                            playerName: req.userName || req.userEmail || 'Verified Player',
                            transactionId: req.transactionId || req.depositId || `DEP-${req.id.slice(-6)}`,
                            depositRef: req.depositId || `DEP-${req.id.slice(-6)}`,
                            status: req.status,
                            dateStr: new Date(req.timestamp).toLocaleString(),
                            platformName: settings.appName || 'SS BATTLE APP',
                          });
                          downloadDataUrl(dataUrl, `${req.depositId || req.id}_DEPOSIT_RECEIPT.png`);
                        }}
                        className="px-3 py-2 rounded-xl btn-theme-soft text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                        title="Download official deposit voucher as PNG image"
                      >
                        <Download size={13} /> GFX Receipt (PNG)
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => processDepositRequest(req.id, 'approve')}
                            className="px-4 py-2 rounded-xl btn-theme-success text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                          >
                            <Check size={14} strokeWidth={3} /> Approve (Credit ₹{req.amount})
                          </button>
                          <button
                            onClick={() => processDepositRequest(req.id, 'reject')}
                            className="px-3 py-2 rounded-xl btn-theme-danger text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: BILL INVOICES & PAYMENT RECEIPTS */}
      {adminTab === 'invoices' && (
        <BillInvoicesTab
          invoices={allBillInvoices || []}
          allUsersList={allUsersList || []}
          onCreateInvoice={createBillInvoice}
          onProcessInvoice={processBillInvoice}
          onDeleteInvoice={deleteBillInvoice}
          platformName={settings.appName || 'SS BATTLE APP'}
          defaultAdminName={adminSecurity?.adminName || settings.jazzCashName || 'Shamroz Khan (Admin)'}
          defaultAdminPhone={settings.supportContact || '03709892708'}
          onOpenInvoiceModal={inv => {
            setSelectedBillInvoice(inv);
            setIsInvoiceModalOpen(true);
          }}
        />
      )}

      {/* TAB 5: WITHDRAWAL REQUESTS */}
      {adminTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Withdrawal Payouts Auditor ({allWithdrawals.length})
            </h2>
          </div>

          {allWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              No withdrawal requests pending.
            </div>
          ) : (
            <div className="space-y-3">
              {allWithdrawals.map(req => {
                const isPending = req.status === 'pending';
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-amber-400">
                          ₹{req.amount}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            req.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : req.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-primary)] font-bold mt-0.5">
                        {req.userName} ({req.userEmail})
                      </div>
                      <div className="text-xs text-[var(--primary-color)] font-mono font-bold mt-1">
                        Channel: {req.methodDetails?.methodName} → {req.methodDetails?.accountInfo}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Requested: {new Date(req.requestTimestamp).toLocaleString()}
                        {req.rejectReason && ` • Rejected: "${req.rejectReason}"`}
                      </div>
                    </div>

                    {isPending ? (
                      <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => {
                            setGfxModalData({
                              withdrawalId: req.id,
                              amount: req.amount,
                              sentByName: adminSecurity?.adminName || settings.jazzCashName || 'Shamroz Khan (SS BATTLE)',
                              appName: req.methodDetails?.methodName || 'Easypaisa',
                              sentWithNumber: settings.supportContact || settings.upiDetails || '03128017777',
                              recipientName: req.userName,
                              recipientAccount: req.methodDetails?.accountInfo || '—',
                              transactionRef: `SSB-WD-${Date.now().toString().slice(-7)}`,
                              isPending: true,
                            });
                            setGfxModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                        >
                          <Receipt size={14} /> Approve with GFX Receipt
                        </button>
                        <button
                          onClick={() => processWithdrawalRequest(req.id, 'approve', 'Paid via Cash/Bank')}
                          className="px-3 py-2 rounded-xl btn-theme-success text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={14} strokeWidth={3} /> Quick Pay
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalReqId(req.id);
                          }}
                          className="px-3 py-2 rounded-xl btn-theme-danger text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                        >
                          <X size={14} /> Reject & Refund
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Convert this withdrawal of ₹${req.amount} directly into deposit balance for ${req.userName}?`)) {
                              await convertPendingWithdrawalToDeposit(req.id);
                            }
                          }}
                          className="px-3 py-2 rounded-xl btn-theme-outline text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                          title="Convert pending withdrawal directly to user deposit balance"
                        >
                          <RotateCcw size={14} /> Convert to Deposit
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => {
                            setGfxModalData({
                              withdrawalId: req.id,
                              amount: req.amount,
                              sentByName: req.receiptDetails?.sentByName || adminSecurity?.adminName || 'Shamroz Khan (SS BATTLE)',
                              appName: req.receiptDetails?.appName || req.methodDetails?.methodName || 'Easypaisa',
                              sentWithNumber: req.receiptDetails?.sentWithNumber || settings.supportContact || '03128017777',
                              recipientName: req.userName,
                              recipientAccount: req.methodDetails?.accountInfo || '—',
                              transactionRef: req.receiptDetails?.transactionRef || `SSB-WD-${req.id.slice(-6)}`,
                              note: req.receiptDetails?.receiptNote || 'Approved Withdrawal Payout',
                              isPending: false,
                            });
                            setGfxModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl btn-theme-soft text-xs font-bold cursor-pointer flex items-center gap-1.5"
                        >
                          <Receipt size={13} /> View / Download GFX
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: USERS & BALANCES */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Player Accounts & Ledger ({allUsersList.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search name, mobile, email..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]"
              />
            </div>
          </div>

          <div className="space-y-3">
            {allUsersList
              .filter(u => {
                const q = userSearchQuery.toLowerCase();
                return (
                  u.displayName?.toLowerCase().includes(q) ||
                  u.email?.toLowerCase().includes(q) ||
                  u.mobile?.toLowerCase().includes(q)
                );
              })
              .map(u => (
                <div
                  key={u.uid}
                  className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.photoURL ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${u.displayName}`
                      }
                      alt={u.displayName}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-[var(--border-color)]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {u.displayName}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                            u.status === 'blocked'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                        {u.isAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-amber-500/20 text-amber-400">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {u.email} • Mobile: {u.mobile || 'N/A'} • IGN: {u.gameName || 'N/A'}
                      </div>
                      <div className="text-xs text-[var(--text-primary)] font-bold mt-1 flex items-center gap-3">
                        <span>Total Bal: <strong className="text-[var(--primary-color)]">₹{u.balance || 0}</strong></span>
                        <span>Winning: <strong className="text-green-400">₹{u.winningCash || 0}</strong></span>
                        <span>Bonus: <strong className="text-amber-400">₹{u.bonusCash || 0}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => setBalanceModalUser(u)}
                      className="px-3 py-1.5 rounded-lg btn-theme-soft text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Coins size={13} /> Edit Balance
                    </button>

                    <button
                      onClick={() => toggleUserStatusByAdmin(u.uid)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        u.status === 'blocked'
                          ? 'btn-theme-success'
                          : 'btn-theme-outline'
                      }`}
                    >
                      {u.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete user ${u.displayName}?`)) {
                          deleteUserByAdmin(u.uid);
                        }
                      }}
                      className="p-1.5 rounded-lg btn-theme-danger cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 7: PAYMENT CHANNELS & PRE-PAID IDS */}
      {adminTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
              Active Deposit Channels ({paymentMethods.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {paymentMethods.map(m => {
                const accName = m.accountName || m.accountDetails?.split('(')[1]?.replace(')', '').trim() || 'Official';
                const accNumber = m.accountNumber || m.accountDetails?.split('(')[0]?.trim() || m.accountDetails;
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{m.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${m.enabled !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {m.enabled !== false ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditPaymentModal(m)}
                            className="p-1.5 rounded-lg btn-theme-soft cursor-pointer"
                            title="Edit Payment Method"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deletePaymentMethod(m.id)}
                            className="p-1.5 rounded-lg btn-theme-danger cursor-pointer"
                            title="Delete Payment Method"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">1. Account Name:</span>
                          <span className="font-bold text-[var(--text-primary)]">{accName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">2. Account Number:</span>
                          <span className="font-mono text-[var(--glow-color-1)] font-bold">{accNumber}</span>
                        </div>
                        {m.qrCodeUrl && (
                          <div className="pt-2">
                            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold mb-1">3. Payment QR Code:</span>
                            <img src={m.qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-white/20" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={openCreatePaymentModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              <Plus size={14} /> Add Payment Method
            </button>
          </div>

          {/* Pre-Paid Payment IDs */}
          <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
              Generate Pre-Paid Scratch / Voucher Payment IDs
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Create unique coupon codes that players can redeem instantly in their wallet without waiting for manual verification.
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Code (e.g. GOLD500)"
                value={newIdCode}
                onChange={e => setNewIdCode(e.target.value.toUpperCase())}
                className="px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono uppercase"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newIdAmount}
                onChange={e => setNewIdAmount(Number(e.target.value))}
                className="w-28 px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
              />
              <button
                onClick={() => {
                  if (!newIdCode.trim()) return;
                  generatePaymentId(newIdCode.trim(), newIdAmount);
                  setNewIdCode('');
                }}
                className="px-4 py-2.5 min-h-[38px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Generate ID
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {paymentIds.map(pid => (
                <div
                  key={pid.id}
                  className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-[var(--primary-color)]">
                      {pid.id}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      ₹{pid.amount} •{' '}
                      <span className={pid.status === 'used' ? 'text-red-400' : 'text-green-400'}>
                        {pid.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePaymentId(pid.id)}
                    className="text-red-400 p-1 hover:bg-red-500/10 rounded cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: GAMES & GFX THEMES STUDIO */}
      {adminTab === 'games' && (
        <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2">
                <Gamepad2 size={20} className="text-[var(--primary-color)]" />
                <span>Supported Esports Titles & GFX Themes ({games.length})</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Customize GFX creation themes (Inferno, Tactical Warzone, Cyberpunk Neon, Royal Gold), choose custom text styling, and generate 1200×520 official banners.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setEditingGfxGame({
                    name: 'New Esports Title',
                    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
                    order: games.length + 1,
                  });
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-2xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                <Palette size={15} /> GFX Studio: Create Title
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map(g => {
              const theme = g.gfxTheme;
              const themeColor = theme?.themeColor || 'var(--primary-color)';
              const fontStyle = theme?.fontStyle || 'standard';
              const tagline = theme?.tagline || 'OFFICIAL ESPORTS ARENA';

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between hover:border-white/20 transition-all group relative overflow-hidden"
                  style={{
                    boxShadow: theme?.themeColor ? `0 0 25px ${theme.themeColor}15` : undefined,
                  }}
                >
                  {/* Top Game Artwork & Badge */}
                  <div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-3 bg-slate-900 border border-white/10">
                      <img
                        src={g.imageUrl}
                        alt={g.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {theme?.themeColor && (
                        <div
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-black backdrop-blur-md shadow-md"
                          style={{ backgroundColor: theme.themeColor }}
                        >
                          {theme.presetId ? theme.presetId.replace('_', ' ') : 'Custom GFX'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-base font-black text-white uppercase tracking-wide truncate"
                          style={{
                            fontFamily: fontStyle === 'inferno' || fontStyle === 'crimson' ? 'Impact, sans-serif' : undefined,
                          }}
                        >
                          {g.name}
                        </div>
                        <div
                          className="text-[10px] font-bold uppercase tracking-wider truncate mt-0.5"
                          style={{ color: themeColor }}
                        >
                          {tagline}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-main)] px-2 py-0.5 rounded-lg border border-[var(--border-color)] flex-shrink-0">
                        #{g.order || 1}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] font-mono mt-1 flex items-center gap-2">
                      <span>ID: {g.id}</span>
                      {theme?.overlayPattern && (
                        <span>• Pattern: {theme.overlayPattern}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingGfxGame(g)}
                      className="flex-1 py-2 px-3 rounded-xl btn-theme-outline text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{ borderColor: `${themeColor}44` }}
                      title="Open Esports GFX Creation Studio to customize theme, colors & generate banner"
                    >
                      <Palette size={13} style={{ color: themeColor }} />
                      <span>GFX Theme & Banner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete game title "${g.name}"?`)) {
                          deleteGame(g.id);
                        }
                      }}
                      className="btn-theme-danger p-2 rounded-xl cursor-pointer"
                      title="Delete Game Title"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 9: CAROUSEL BANNERS */}
      {adminTab === 'promotions' && (
        <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Home Promotions Carousel ({promotions.length})
            </h2>
            <button
              onClick={() => {
                const img = prompt('Banner Image URL:');
                if (!img) return;
                addOrUpdatePromotion({ imageUrl: img });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-accent text-xs font-bold uppercase cursor-pointer"
            >
              <Plus size={14} /> Add Banner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promotions.map(p => (
              <div
                key={p.id}
                className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] group"
              >
                <div className="w-full h-36 bg-black/90 flex items-center justify-center p-1">
                  <img src={p.imageUrl} alt="Promotion" className="max-h-full max-w-full object-contain" />
                </div>
                <button
                  onClick={() => deletePromotion(p.id)}
                  className="absolute top-2 right-2 p-2 rounded-xl btn-theme-danger cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: 15 THEMES, REFERRAL CONFIG & APP SETTINGS */}
      {adminTab === 'settings' && (
        <div className="space-y-6">
          {/* Top Sticky/Action Bar for Settings */}
          <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2">
                <Settings size={18} className="text-[var(--primary-color)]" />
                <span>Platform Governance & Referral Config</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                {hasUnsavedSettings ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle size={13} className="animate-pulse" />
                    <span>Unsaved Changes Pending</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCheck size={13} />
                    <span>All Settings Synchronized</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDiscardSettings}
                disabled={!hasUnsavedSettings}
                className="flex-1 sm:flex-none px-4 py-2 min-h-[38px] rounded-xl btn-theme-outline text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Discard Changes</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className={`flex-1 sm:flex-none px-5 py-2 min-h-[38px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                  hasUnsavedSettings
                    ? 'ring-2 ring-[var(--glow-color-1)]'
                    : ''
                }`}
              >
                <Save size={14} />
                <span>Save All Settings</span>
              </button>
            </div>
          </div>

          {/* 15 Master Themes Picker */}
          <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xl">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide">
                Master Theme Switcher (15 Esports Themes)
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Choosing a theme here immediately updates the default theme for all visitors across the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {THEMES_LIST.map(theme => {
                const isSelected = settingsDraft.currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSettingsDraft(prev => ({ ...prev, currentTheme: theme.id }))}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--bg-card)] border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/30 shadow-lg'
                        : 'bg-[var(--bg-card)]/50 border-[var(--border-color)] hover:border-[var(--primary-color)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center -space-x-1">
                        {theme.previewColors.map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase text-[var(--primary-color)]">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      {theme.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-1">
                      {theme.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-[var(--text-primary)]">Admin-Exclusive Control:</span>
              <span>All players and visitors view the selected platform theme.</span>
            </div>
          </div>

          {/* Referral Program Money & Configuration Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[var(--surface-color)] to-[var(--bg-card)] border-2 border-amber-500/40 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <Coins size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-wide">
                    Referral Program Money & Bonus Configuration
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Configure referral bonus cash, referee welcome rewards, and qualifying thresholds.
                  </p>
                </div>
              </div>

              {/* Toggle Referral System */}
              <div className="flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-xs font-bold text-[var(--text-primary)]">Program Enabled:</span>
                <input
                  type="checkbox"
                  checked={settingsDraft.referralEnabled !== false}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, referralEnabled: e.target.checked }))}
                  className="w-5 h-5 rounded text-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                  Referrer Reward (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-amber-400">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={settingsDraft.referralBonus ?? 10}
                    onChange={e => setSettingsDraft(prev => ({ ...prev, referralBonus: Number(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                  Cash awarded to referrer when friend signs up / qualifies
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">
                  Referee Welcome Bonus (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-emerald-400">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={settingsDraft.referralRefereeBonus ?? 10}
                    onChange={e => setSettingsDraft(prev => ({ ...prev, referralRefereeBonus: Number(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                  Instant bonus cash credited to the invited friend
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-400 uppercase mb-1">
                  Min Deposit To Unlock (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-sky-400">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={settingsDraft.referralMinDeposit ?? 0}
                    onChange={e => setSettingsDraft(prev => ({ ...prev, referralMinDeposit: Number(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-sky-400"
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                  Set to 0 for instant reward upon entering invite code
                </span>
              </div>
            </div>

            {/* Custom Referral Program Terms & Instructions */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Referral Program Terms & Guidelines (Shown to Players)
              </label>
              <textarea
                rows={2}
                value={settingsDraft.referralTermsText || ''}
                onChange={e => setSettingsDraft(prev => ({ ...prev, referralTermsText: e.target.value }))}
                placeholder="Share your unique referral code with friends. When they register, both of you earn instant bonus cash directly in your wallet balance!"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* App Identity & Config */}
          <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xl">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
              App Branding & Governance
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={settingsDraft.appName}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, appName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  App Logo (ImgBB Upload or URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settingsDraft.logoUrl}
                    onChange={e => setSettingsDraft(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUploadTarget('appLogo');
                      uploadImgRef.current?.click();
                    }}
                    className="p-2.5 rounded-xl btn-theme-soft cursor-pointer"
                    title="Upload to ImgBB"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  WhatsApp Support Contact
                </label>
                <input
                  type="text"
                  value={settingsDraft.supportContact}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, supportContact: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Min Withdrawal Limit (₹)
                </label>
                <input
                  type="number"
                  value={settingsDraft.minWithdraw}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, minWithdraw: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Min Deposit Limit (₹)
                </label>
                <input
                  type="number"
                  value={settingsDraft.minDeposit ?? 50}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, minDeposit: Number(e.target.value) }))}
                  placeholder="50"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                  Minimum amount required when players generate a deposit invoice
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Default Payment Account / UPI Details
                </label>
                <input
                  type="text"
                  value={settingsDraft.upiDetails || ''}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, upiDetails: e.target.value }))}
                  placeholder="03001234567"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Account Holder Title / Bank Name
                </label>
                <input
                  type="text"
                  value={settingsDraft.jazzCashName || ''}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, jazzCashName: e.target.value }))}
                  placeholder="Gaming Official Cash"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-red-400">
                  Scheduled Maintenance Mode
                </span>
                <input
                  type="checkbox"
                  checked={settingsDraft.maintenanceMode}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="w-5 h-5 rounded text-red-600"
                />
              </div>
              <input
                type="text"
                placeholder="Maintenance notice to players..."
                value={settingsDraft.maintenanceNotice || ''}
                onChange={e => setSettingsDraft(prev => ({ ...prev, maintenanceNotice: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Legal Policies Configuration */}
          <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xl">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
              Platform Terms & Policies
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={4}
                  value={settingsDraft.policyTerms || ''}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, policyTerms: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Privacy Policy
                </label>
                <textarea
                  rows={4}
                  value={settingsDraft.policyPrivacy || ''}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, policyPrivacy: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Refund & Cancellation Policy
                </label>
                <textarea
                  rows={4}
                  value={settingsDraft.policyRefund || ''}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, policyRefund: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Fair Play & Anti-Cheat Policy
                </label>
                <textarea
                  rows={4}
                  value={settingsDraft.policyFairPlay || ''}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, policyFairPlay: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Bottom Save & Discard Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={handleDiscardSettings}
                disabled={!hasUnsavedSettings}
                className="px-4 py-2.5 min-h-[40px] rounded-xl btn-theme-outline text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Discard Changes</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 min-h-[40px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>Save All Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: BROADCAST NOTIFICATIONS (TARGETED MATCH TYPES) */}
      {adminTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Native In-App Broadcast Alerts
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Send alerts directly to the notification center of players. Target all players or a specific match mode.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Announcement Title (e.g. 🔥 Free Fire Scrims Room Details Out)"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <select
                  value={notifMatchType}
                  onChange={e => setNotifMatchType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-amber-400 font-bold"
                >
                  <option value="all">Audience: All Players & Modes</option>
                  <option value="Scrim">Audience: Scrim Squads Only</option>
                  <option value="Solo">Audience: Solo Matches Only</option>
                  <option value="Duo">Audience: Duo Matches Only</option>
                  <option value="Squad">Audience: Squad Matches Only</option>
                </select>
              </div>
            </div>

            <textarea
              placeholder="Full announcement body details..."
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
            />
            <button
              onClick={() => {
                if (!notifTitle.trim() || !notifMessage.trim()) return;
                sendBroadcastNotification(notifTitle, notifMessage, undefined, notifMatchType);
                setNotifTitle('');
                setNotifMessage('');
              }}
              className="w-full py-3 min-h-[42px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Send Broadcast ({notifMatchType === 'all' ? 'All Players' : `${notifMatchType} Targeted`})
            </button>
          </div>

          {/* Existing Notifications History */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">Sent Alerts ({notifications.length})</h3>
            {notifications.map(n => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{n.title}</span>
                    {n.matchType && n.matchType !== 'all' ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        {n.matchType} Target
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-gray-500/20 text-gray-400 border border-gray-500/40">
                        All Players
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">{n.message}</div>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="btn-theme-danger p-1.5 rounded-lg cursor-pointer"
                  title="Delete Announcement"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: LIVE SUPPORT CHAT DESK */}
      {adminTab === 'support' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Thread List */}
          <div className="p-4 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] mb-3">
              Player Inquiries ({allSupportThreads.length})
            </h3>
            {allSupportThreads.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] py-8 text-center">
                No support conversations active.
              </div>
            ) : (
              <div className="space-y-2">
                {allSupportThreads.map(th => (
                  <button
                    key={th.userId}
                    onClick={() => setActiveChatUid(th.userId)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeChatUid === th.userId
                        ? 'bg-[var(--bg-card)] border-[var(--primary-color)]'
                        : 'bg-[var(--bg-card)]/50 border-[var(--border-color)] hover:border-[var(--primary-color)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {th.userName}
                      </span>
                      {th.unreadByAdmin && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                      {th.lastMessage}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Chat Conversation */}
          <div className="md:col-span-2 p-4 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col h-[400px]">
            {activeChatUid ? (
              <>
                <div className="pb-3 border-b border-[var(--border-color)] mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[var(--primary-color)]">
                    Replying to {allSupportThreads.find(t => t.userId === activeChatUid)?.userName || 'Player'}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 p-2">
                  <div className="text-xs text-center text-[var(--text-muted)]">
                    Type a message below to assist this gladiator.
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                  <input
                    type="text"
                    placeholder="Type official admin reply..."
                    value={adminChatText}
                    onChange={e => setAdminChatText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && adminChatText.trim()) {
                        sendAdminChatMessage(activeChatUid, adminChatText.trim());
                        setAdminChatText('');
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                  <button
                    onClick={() => {
                      if (!adminChatText.trim()) return;
                      sendAdminChatMessage(activeChatUid, adminChatText.trim());
                      setAdminChatText('');
                    }}
                    className="p-2.5 rounded-xl btn-accent cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
                Select a player thread on the left to start live support messaging.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: GFX STUDIO & RECEIPTS */}
      {adminTab === 'gfx' && (
        <GfxStudioTab
          tournaments={tournaments}
          allWithdrawals={allWithdrawals}
          platformName={settings.appName || 'SS BATTLE APP'}
          adminName={adminSecurity?.adminName || settings.jazzCashName || 'Shamroz Khan (SS BATTLE)'}
          supportNumber={settings.supportContact || settings.upiDetails || '03128017777'}
        />
      )}

      {/* CREATE / EDIT TOURNAMENT MODAL */}
      {tournamentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
          <div className="animate-card-enter w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--secondary-bg)]">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-[var(--primary-color)]" />
                <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] uppercase tracking-wide">
                  {editingTournamentId ? 'Edit Match / Scrim' : 'Create Tournament or Scrim'}
                </h2>
              </div>
              <button
                onClick={() => setTournamentModalOpen(false)}
                className="w-9 h-9 rounded-full btn-theme-outline flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Tournament Card Banner Image & Upload */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                        <Image size={15} className="text-[var(--primary-color)]" />
                        Tournament Banner Image (ImgBB Upload or URL)
                      </label>
                      {tourneyForm.bannerUrl && (
                        <button
                          type="button"
                          onClick={() => setTourneyForm({ ...tourneyForm, bannerUrl: '' })}
                          className="text-[10px] text-red-400 hover:underline cursor-pointer"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    {/* Banner Preview */}
                    {tourneyForm.bannerUrl ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-black mb-3 border border-[var(--border-color)] group">
                        <img
                          src={tourneyForm.bannerUrl}
                          alt="Tournament Banner Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentUploadTarget('tourneyBanner');
                              uploadImgRef.current?.click();
                            }}
                            className="px-3 py-1.5 rounded-lg btn-accent text-xs font-bold cursor-pointer"
                          >
                            Change Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-20 rounded-xl border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-muted)] mb-3 bg-[var(--bg-main)]/50">
                        <Image size={24} className="mb-1 opacity-50" />
                        <span className="text-[11px]">No custom banner selected (default artwork will be used)</span>
                      </div>
                    )}

                    {/* Upload button & URL input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...) or choose file"
                        value={tourneyForm.bannerUrl}
                        onChange={e => setTourneyForm({ ...tourneyForm, bannerUrl: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUploadTarget('tourneyBanner');
                          uploadImgRef.current?.click();
                        }}
                        disabled={isUploading}
                        className="px-3.5 py-2 rounded-xl btn-theme-soft text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Camera size={14} />
                        <span>{isUploading && currentUploadTarget === 'tourneyBanner' ? 'Uploading...' : 'Upload Image'}</span>
                      </button>
                    </div>

                    {/* Quick Gaming Presets */}
                    <div className="mt-2.5 pt-2 border-t border-[var(--border-color)]/40 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Presets:</span>
                      {[
                        { label: 'Free Fire', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800' },
                        { label: 'Cyber Arena', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800' },
                        { label: 'Esports Battle', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800' },
                        { label: 'Championship', url: 'https://images.unsplash.com/photo-1552824722-ddab137b03a0?q=80&w=800' },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setTourneyForm({ ...tourneyForm, bannerUrl: preset.url })}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold btn-theme-outline cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Free Fire Pro Scrims Season 1"
                      value={tourneyForm.name}
                      onChange={e => setTourneyForm({ ...tourneyForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Game Title
                    </label>
                    <select
                      value={tourneyForm.gameId}
                      onChange={e => setTourneyForm({ ...tourneyForm, gameId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                    >
                      {games.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Mode
                    </label>
                    <select
                      value={tourneyForm.mode}
                      onChange={e => {
                        const m = e.target.value as TournamentMode;
                        setTourneyForm({
                          ...tourneyForm,
                          mode: m,
                          isScrim: m === 'Scrim' || tourneyForm.isScrim,
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                    >
                      <option value="Solo">Solo (Classic Survival)</option>
                      <option value="Duo">Duo</option>
                      <option value="Squad">Standard Squad</option>
                      <option value="Scrim">Scrim Squad (12-25 Slots)</option>
                    </select>
                  </div>

                  {/* Drop Map Selector for All Modes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-amber-400 uppercase mb-1 flex items-center gap-1.5">
                      <MapPin size={14} /> Drop Map (Match Map) *
                    </label>
                    <select
                      value={tourneyForm.dropMap}
                      onChange={e => setTourneyForm({ ...tourneyForm, dropMap: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white font-bold"
                    >
                      {UNIQUE_OFFICIAL_MAPS.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto py-0.5 scrollbar-none">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase shrink-0">Quick Map:</span>
                      {UNIQUE_OFFICIAL_MAPS.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTourneyForm({ ...tourneyForm, dropMap: m })}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                            tourneyForm.dropMap === m
                              ? 'btn-accent'
                              : 'btn-theme-outline'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrim Details & Match Sequence Schedule */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)] uppercase">
                          Enable Scrim Squad Slotlist Format
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          Registers full squads with Team Name, Tag, IGL, and Team Logo.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={tourneyForm.isScrim}
                        onChange={e => setTourneyForm({ ...tourneyForm, isScrim: e.target.checked })}
                        className="w-5 h-5 rounded text-[var(--primary-color)]"
                      />
                    </div>

                    {tourneyForm.isScrim && (
                      <div className="space-y-4 mt-3 pt-3 border-t border-[var(--border-color)]">
                        {/* Slot Count & Number of Matches Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
                              Slot Count
                            </label>
                            <select
                              value={tourneyForm.slotCount}
                              onChange={e =>
                                setTourneyForm({
                                  ...tourneyForm,
                                  slotCount: Number(e.target.value) as any,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                            >
                              <option value={12}>12 Slots</option>
                              <option value={13}>13 Slots</option>
                              <option value={14}>14 Slots</option>
                              <option value={15}>15 Slots</option>
                              <option value={20}>20 Slots (Group A & B)</option>
                              <option value={25}>25 Slots (Group A, B & C)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
                              Number of Matches (Free Fire Sequence 1-6) *
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => {
                                    const OFFICIAL_FF_SCHEDULE_LIST = [
                                      'Match 1: Bermuda (07:00 PM)',
                                      'Match 2: Purgatory (07:45 PM)',
                                      'Match 3: Nextera (08:30 PM)',
                                      'Match 4: Kalahari (09:15 PM)',
                                      'Match 5: Solara (10:00 PM)',
                                      'Match 6: Bermuda (10:45 PM)',
                                    ];
                                    const updated = OFFICIAL_FF_SCHEDULE_LIST.slice(0, num);
                                    setTourneyForm({
                                      ...tourneyForm,
                                      scrimTotalMatches: num,
                                      scrimMapsSchedule: updated.join(' • '),
                                    });
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                    tourneyForm.scrimTotalMatches === num
                                      ? 'btn-accent'
                                      : 'btn-theme-outline'
                                  }`}
                                >
                                  {num} {num === 1 ? 'Match' : 'Matches'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Per-Match Map Section: 1. Bermuda, 2. Purgatory, 3. Nextera, 4. Kalahari, 5. Solara, 6. Bermuda */}
                        <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                              <MapPin size={14} /> Official Scrim Maps Schedule ({tourneyForm.scrimTotalMatches || 3} Matches)
                            </label>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              Official FF Sequence: Bermuda → Purgatory → Nextera → Kalahari → Solara → Bermuda
                            </span>
                          </div>

                          {(() => {
                            const count = Math.max(1, Math.min(6, Number(tourneyForm.scrimTotalMatches) || 3));
                            const parts = (tourneyForm.scrimMapsSchedule || '')
                              .split('•')
                              .map(p => p.trim())
                              .filter(Boolean);

                            const matchRows: Array<{ matchNum: number; map: string }> = [];
                            const defaultSequence = [
                              'Bermuda (07:00 PM)',
                              'Purgatory (07:45 PM)',
                              'Nextera (08:30 PM)',
                              'Kalahari (09:15 PM)',
                              'Solara (10:00 PM)',
                              'Bermuda (10:45 PM)',
                            ];

                            for (let i = 1; i <= count; i++) {
                              const ex = parts[i - 1];
                              let mapStr = '';
                              if (ex) {
                                mapStr = ex.replace(/^Match\s*\d+\s*:\s*/i, '').trim();
                              } else {
                                mapStr = defaultSequence[i - 1] || 'Bermuda';
                              }
                              matchRows.push({ matchNum: i, map: mapStr });
                            }

                            const updateRow = (index: number, newMap: string) => {
                              matchRows[index].map = newMap;
                              const serialized = matchRows.map(m => `Match ${m.matchNum}: ${m.map}`).join(' • ');
                              setTourneyForm(prev => ({
                                ...prev,
                                scrimMapsSchedule: serialized,
                              }));
                            };

                            const quickMapChips = ['Bermuda', 'Purgatory', 'Nextera', 'Kalahari', 'Solara'];

                            return (
                              <div className="space-y-2.5">
                                {matchRows.map((row, idx) => (
                                  <div
                                    key={row.matchNum}
                                    className="p-2.5 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-[130px]">
                                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                                        #{row.matchNum}
                                      </span>
                                      <span className="text-xs font-bold text-white">
                                        {row.matchNum === 1 ? '1. Bermuda' : row.matchNum === 2 ? '2. Purgatory' : row.matchNum === 3 ? '3. Nextera' : row.matchNum === 4 ? '4. Kalahari' : row.matchNum === 5 ? '5. Solara' : '6. Bermuda'}
                                      </span>
                                    </div>

                                    <div className="flex-1 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                      <input
                                        type="text"
                                        value={row.map}
                                        onChange={e => updateRow(idx, e.target.value)}
                                        placeholder="e.g. Bermuda (07:00 PM)"
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white font-bold"
                                      />

                                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
                                        {quickMapChips.map(chip => (
                                          <button
                                            key={chip}
                                            type="button"
                                            onClick={() => {
                                              const timePart = row.map.includes('PM') || row.map.includes('AM')
                                                ? row.map.replace(/^[^(]+/, '').replace(/[()]/g, '').trim()
                                                : `${7 + idx}:00 PM`;
                                              updateRow(idx, `${chip} (${timePart})`);
                                            }}
                                            className="text-[9px] font-bold px-2 py-1 rounded-md btn-theme-outline whitespace-nowrap cursor-pointer"
                                          >
                                            {chip}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Scrim Custom Rules, Scoring & Protocols Section */}
                        <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <label className="block text-xs font-black text-[var(--glow-color-1)] uppercase tracking-wide">
                              Scrim Rules & Match Protocols
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setTourneyForm({
                                  ...tourneyForm,
                                  scrimCustomRules: 'Official Free Fire Competitive Scoring Scale: #1 Booyah: 12pts, #2: 9pts, #3: 8pts, #4: 7pts, #5: 6pts, #6: 5pts, #7: 4pts, #8: 3pts, #9: 2pts, #10: 1pt, #11-12: 0pts. 1 kill = 1 pt. Emulators strictly forbidden.',
                                })}
                                className="text-[9px] px-2 py-1 rounded-md btn-theme-soft font-bold cursor-pointer"
                              >
                                Free Fire Booyah (12-Pt)
                              </button>
                              <button
                                type="button"
                                onClick={() => setTourneyForm({
                                  ...tourneyForm,
                                  scrimCustomRules: 'Ping must be under 80ms. Emulators & 3rd-party panels strictly banned. Flare guns prohibited. IGL must submit finish screenshots within 10 min.',
                                })}
                                className="text-[9px] px-2 py-1 rounded-md btn-theme-danger font-bold cursor-pointer"
                              >
                                Fair Play & Ping
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={3}
                            placeholder="e.g. Official Free Fire Competitive 12-point scale. 1 kill = 1 pt. Emulators strictly forbidden."
                            value={tourneyForm.scrimCustomRules}
                            onChange={e => setTourneyForm({ ...tourneyForm, scrimCustomRules: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Entry Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={tourneyForm.entryFee}
                      onChange={e => setTourneyForm({ ...tourneyForm, entryFee: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Prize Pool (₹)
                    </label>
                    <input
                      type="number"
                      value={tourneyForm.prizePool}
                      onChange={e => setTourneyForm({ ...tourneyForm, prizePool: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold text-[var(--primary-color)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Per Kill Reward (₹)
                    </label>
                    <input
                      type="number"
                      value={tourneyForm.perKillPrize}
                      onChange={e => setTourneyForm({ ...tourneyForm, perKillPrize: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Match Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={tourneyForm.startTime}
                      onChange={e => setTourneyForm({ ...tourneyForm, startTime: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Live Stream URL (Optional, YouTube/Twitch)
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/live/..."
                      value={tourneyForm.liveStreamUrl}
                      onChange={e => setTourneyForm({ ...tourneyForm, liveStreamUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Room ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5493021"
                      value={tourneyForm.roomId}
                      onChange={e => setTourneyForm({ ...tourneyForm, roomId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Room Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 7788"
                      value={tourneyForm.roomPassword}
                      onChange={e => setTourneyForm({ ...tourneyForm, roomPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Release Room ID & Password</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Makes credentials visible to registered players</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tourneyForm.showIdPass}
                      onChange={e => setTourneyForm({ ...tourneyForm, showIdPass: e.target.checked })}
                      className="w-5 h-5 rounded text-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTournamentModalOpen(false)}
                  className="flex-1 py-3 min-h-[42px] rounded-xl btn-theme-outline text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Discard / Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 min-h-[42px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Tournament / Scrim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT DEPOSIT PAYMENT METHOD MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
          <div className="animate-card-enter w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--secondary-bg)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[color-mix(in_srgb,var(--glow-color-1)_15%,var(--card-bg))] border border-[var(--border-color)] flex items-center justify-center text-[var(--glow-color-1)]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                    {editingPaymentMethodId ? 'Edit Payment Method' : 'Add Deposit Payment Method'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    1. Account Name • 2. Account Number • 3. QR Code
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="w-9 h-9 rounded-full btn-theme-outline flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePaymentMethod} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* 1. Account Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    1. Account Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ali or SS BATTLE Official"
                    value={paymentMethodForm.accountName}
                    onChange={e => setPaymentMethodForm({ ...paymentMethodForm, accountName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white font-bold"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                    The title name displayed to players before transferring money.
                  </span>
                </div>

                {/* 2. Account Number */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    2. Account Number / IBAN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 03128017777 or PK36MEZN..."
                    value={paymentMethodForm.accountNumber}
                    onChange={e => setPaymentMethodForm({ ...paymentMethodForm, accountNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-amber-400 font-mono font-bold"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                    Phone number or bank account number for 1-click copy by players.
                  </span>
                </div>

                {/* 3. Payment QR Code */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                      3. Payment QR Code (Optional)
                    </label>
                    {paymentMethodForm.qrCodeUrl && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethodForm({ ...paymentMethodForm, qrCodeUrl: '' })}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remove QR
                      </button>
                    )}
                  </div>

                  {paymentMethodForm.qrCodeUrl && (
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={paymentMethodForm.qrCodeUrl}
                        alt="QR Code Preview"
                        className="w-20 h-20 rounded-xl bg-white p-1 border border-white/20 object-contain"
                      />
                      <div className="text-[11px] text-emerald-400 font-bold">
                        ✓ QR Code Ready
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste QR Code URL or click Upload"
                      value={paymentMethodForm.qrCodeUrl}
                      onChange={e => setPaymentMethodForm({ ...paymentMethodForm, qrCodeUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUploadTarget('paymentQr');
                        uploadImgRef.current?.click();
                      }}
                      disabled={isUploading}
                      className="px-3 py-2 rounded-xl btn-theme-soft text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Camera size={13} />
                      <span>{isUploading && currentUploadTarget === 'paymentQr' ? 'Uploading...' : 'Upload QR'}</span>
                    </button>
                  </div>
                </div>

                {/* 4. Payment Method / App Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    4. Payment Method / Channel Name *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {['Easypaisa', 'JazzCash', 'SadaPay', 'NayaPay', 'Bank Transfer', 'UPI'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPaymentMethodForm({ ...paymentMethodForm, name: opt })}
                        className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                          paymentMethodForm.name === opt
                            ? 'btn-accent'
                            : 'btn-theme-outline'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Easypaisa, JazzCash, SadaPay"
                    value={paymentMethodForm.name}
                    onChange={e => setPaymentMethodForm({ ...paymentMethodForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>

                {/* 5. Enabled Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] text-xs block">Channel Active</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Players can select this method for deposits</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentMethodForm.enabled}
                    onChange={e => setPaymentMethodForm({ ...paymentMethodForm, enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="flex-1 py-2.5 min-h-[40px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 min-h-[40px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{editingPaymentMethodId ? 'Update Method' : 'Save Method'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER BALANCE MODIFIER MODAL */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="animate-card-enter w-full max-w-sm rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] p-6 shadow-2xl">
            <h3 className="text-base font-black text-[var(--text-primary)] uppercase mb-1">
              Adjust Player Balance
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Target: <strong className="text-[var(--text-primary)]">{balanceModalUser.displayName}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Balance Type
                </label>
                <select
                  value={balanceType}
                  onChange={e => setBalanceType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                >
                  <option value="balance">Deposit Wallet Balance</option>
                  <option value="winningCash">Winning Cash (Withdrawable)</option>
                  <option value="bonusCash">Bonus Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Amount (Use negative to deduct, e.g. -50)
                </label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={e => setBalanceAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Reason for Ledger
                </label>
                <input
                  type="text"
                  value={balanceReason}
                  onChange={e => setBalanceReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="flex-1 py-2.5 min-h-[40px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateUserBalanceByAdmin(
                      balanceModalUser.uid,
                      balanceAmount,
                      balanceType,
                      balanceReason
                    );
                    setBalanceModalUser(null);
                  }}
                  className="flex-1 py-2.5 min-h-[40px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Apply Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAWAL REJECT MODAL */}
      {rejectModalReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="animate-card-enter w-full max-w-sm rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] p-6 shadow-2xl">
            <h3 className="text-base font-black text-[var(--danger-color)] uppercase mb-1">
              Reject Withdrawal & Refund
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Enter reason. The winning cash will be automatically refunded back to the player's wallet.
            </p>

            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] mb-4"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRejectModalReqId(null)}
                className="flex-1 py-2.5 min-h-[40px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await processWithdrawalRequest(rejectModalReqId, 'reject', rejectReason);
                  setRejectModalReqId(null);
                }}
                className="flex-1 py-2.5 min-h-[40px] rounded-xl btn-theme-danger text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREENSHOT FULL PREVIEW MODAL */}
      {previewScreenshotUrl && (
        <div
          onClick={() => setPreviewScreenshotUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-lg max-h-[85vh] rounded-2xl overflow-hidden border border-white/20">
            <img
              src={previewScreenshotUrl}
              alt="Deposit Screenshot"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* GFX WITHDRAWAL RECEIPT GENERATOR MODAL */}
      {gfxModalData && (
        <GfxReceiptModal
          isOpen={gfxModalOpen}
          onClose={() => {
            setGfxModalOpen(false);
            setGfxModalData(null);
          }}
          initialData={gfxModalData}
          platformName={settings.appName || 'SS BATTLE APP'}
          onApproveAndSave={async (receiptDetails) => {
            if (gfxModalData.withdrawalId) {
              await processWithdrawalRequest(
                gfxModalData.withdrawalId,
                'approve',
                'Paid with Official GFX Receipt',
                receiptDetails
              );
              showToast('Withdrawal marked as Paid & GFX Receipt recorded!', 'success');
            }
          }}
        />
      )}

      {/* BILL INVOICE PREVIEW & VERIFICATION MODAL */}
      <BillInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedBillInvoice(null);
        }}
        invoice={selectedBillInvoice}
        onApprove={async (id, note) => {
          await processBillInvoice(id, 'approve', note);
        }}
        onReject={async (id, note) => {
          await processBillInvoice(id, 'reject', note);
        }}
        platformName={settings.appName || 'SS BATTLE APP'}
      />

      {/* GAME GFX CREATION & THEME STUDIO MODAL */}
      {editingGfxGame && (
        <GameGfxModal
          game={editingGfxGame}
          platformName={settings.appName || 'SS BATTLE APP'}
          onSave={async (gameData) => {
            await addOrUpdateGame(gameData, gameData.id);
            setEditingGfxGame(null);
          }}
          onClose={() => setEditingGfxGame(null)}
        />
      )}
    </div>
  );
};

export default AdminView;
