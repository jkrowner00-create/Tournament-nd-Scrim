import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  auth,
  db,
  ref,
  get,
  set,
  update,
  push,
  onValue,
  off,
  remove,
  serverTimestamp,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  DEFAULT_APP_SETTINGS,
  DEFAULT_GAMES,
  DEFAULT_PROMOTIONS,
  DEFAULT_TOURNAMENTS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_PAYMENT_IDS,
  DEFAULT_USERS,
} from '../services/firebase';
import {
  distributeTournamentWinnings,
  finalizeTournamentAndDistributeWinnings,
  autoDistributeAllFinalizedTournaments,
  type DistributionResult,
} from '../services/winningsDistribution';
import type {
  UserProfile,
  Game,
  Promotion,
  Tournament,
  TournamentMode,
  ScrimSlot,
  DepositRequest,
  DepositInvoiceDetails,
  WithdrawalRequest,
  PaymentMethod,
  PaymentId,
  AppSettings,
  SupportMessage,
  SupportChatMeta,
  NotificationItem,
  Transaction,
  ThemeId,
  WithdrawalReceiptDetails,
  AdminSecurityConfig,
  BillInvoice,
} from '../types';

interface AppContextType {
  // Auth & Profile
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithMobile: (mobile: string, pass: string) => Promise<void>;
  registerWithMobile: (
    mobile: string,
    pass: string,
    name: string,
    gameName: string,
    gameUid: string,
    referralCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateInGameName: (name: string) => Promise<void>;
  updateProfileAvatar: (url: string) => Promise<void>;

  // App Settings & Theme
  settings: AppSettings;
  activeTheme: ThemeId;
  userThemeOverride: ThemeId | null;
  setPersonalTheme: (theme: ThemeId) => void;
  resetPersonalTheme: () => void;
  updateAdminSettings: (newSettings: Partial<AppSettings>) => Promise<void>;

  // Data Collections
  games: Game[];
  promotions: Promotion[];
  tournaments: Tournament[];
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  paymentIds: PaymentId[];
  notifications: NotificationItem[];
  unreadNotifCount: number;
  readNotifIds: string[];
  markNotificationAsRead: (id: string) => void;
  markNotificationsAsRead: () => void;

  // Navigation & Views
  currentView: string;
  navigate: (view: string) => void;
  selectedGameFilter: string | null;
  setSelectedGameFilter: (gameId: string | null) => void;

  // User Actions
  joinSoloTournament: (tournamentId: string, gameName: string, fee: number) => Promise<void>;
  registerScrimTeam: (
    tournamentId: string,
    slotNumber: number,
    groupKey: string | null,
    teamData: {
      teamName: string;
      teamTag: string;
      logoUrl: string;
      captainName: string;
      captainMobile: string;
      dropSpot: string;
      players: string[];
    },
    fee: number
  ) => Promise<void>;
  submitDepositRequest: (
    amount: number,
    screenshotUrl: string,
    txnId?: string,
    invoiceDetails?: DepositInvoiceDetails
  ) => Promise<void>;
  redeemPaymentId: (code: string) => Promise<number>;
  submitWithdrawalRequest: (amount: number, methodType: string, accountNumber: string) => Promise<void>;
  convertWinningToDeposit: (amount: number) => Promise<void>;
  convertPendingWithdrawalToDeposit: (withdrawalId: string) => Promise<void>;
  applyReferralCode: (code: string) => Promise<void>;

  // Live Support Chat
  chatMessages: SupportMessage[];
  sendUserChatMessage: (text: string) => Promise<void>;
  sendAdminChatMessage: (userId: string, text: string) => Promise<void>;
  activeSupportUserId: string | null;
  setActiveSupportUserId: (uid: string | null) => void;
  allSupportThreads: SupportChatMeta[];

  // Admin Actions
  addOrUpdateGame: (game: Partial<Game>, id?: string) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  addOrUpdatePromotion: (promo: Partial<Promotion>, id?: string) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  addOrUpdateTournament: (tournament: Partial<Tournament>, id?: string) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  postMatchResults: (tournamentId: string, results: any[], editReason?: string) => Promise<void>;
  distributeWinnings: (tournamentId: string, options?: { force?: boolean }) => Promise<DistributionResult>;
  autoDistributeAllWinnings: () => Promise<any>;
  processDepositRequest: (requestId: string, action: 'approve' | 'reject') => Promise<void>;
  processWithdrawalRequest: (
    requestId: string,
    action: 'approve' | 'reject',
    noteOrReason: string,
    receiptDetails?: WithdrawalReceiptDetails
  ) => Promise<void>;

  // Bill Invoices & Receipts Generator
  allBillInvoices: BillInvoice[];
  createBillInvoice: (invoiceData: Omit<BillInvoice, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  processBillInvoice: (
    invoiceId: string,
    action: 'approve' | 'reject',
    adminNote?: string,
    paymentProofUrl?: string
  ) => Promise<void>;
  deleteBillInvoice: (invoiceId: string) => Promise<void>;

  // Coin Sharing (P2P Transfer with 3.5% transaction fee)
  transferCoinsToPlayer: (
    recipientIdentifier: string,
    amount: number
  ) => Promise<{ success: boolean; netAmount: number; fee: number; recipientName: string }>;

  addPaymentMethod: (method: Partial<PaymentMethod>, id?: string) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  generatePaymentId: (idCode: string, amount: number) => Promise<void>;
  deletePaymentId: (idCode: string) => Promise<void>;
  sendBroadcastNotification: (
    title: string,
    message: string,
    target?: string,
    matchType?: TournamentMode | 'all'
  ) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updateUserBalanceByAdmin: (
    targetUid: string,
    amount: number,
    type: 'balance' | 'winningCash' | 'bonusCash',
    reason: string
  ) => Promise<void>;
  toggleUserStatusByAdmin: (targetUid: string) => Promise<void>;
  deleteUserByAdmin: (targetUid: string) => Promise<void>;
  allUsersList: UserProfile[];
  allDepositRequests: DepositRequest[];
  allWithdrawals: WithdrawalRequest[];
  seedDemoData: () => Promise<void>;

  // Admin Security System (One-time signup, other times login)
  adminSecurity: AdminSecurityConfig | null;
  isAdminSessionUnlocked: boolean;
  setupAdminSecurity: (config: { username: string; password: string; pin: string; adminName: string }) => Promise<void>;
  loginAdminSecurity: (credential: string, isPin?: boolean) => Promise<boolean>;
  lockAdminSession: () => void;
  updateAdminSecurity: (newConfig: Partial<AdminSecurityConfig>) => Promise<void>;

  // Toast & Audio
  toastMessage: { text: string; type: 'success' | 'warning' | 'danger' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'danger' | 'info') => void;
  playAudioBeep: (frequency?: number, duration?: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const cached = localStorage.getItem('esports_cached_settings');
    return cached ? JSON.parse(cached) : DEFAULT_APP_SETTINGS;
  });
  const [games, setGames] = useState<Game[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentIds, setPaymentIds] = useState<PaymentId[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('esports_read_notif_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);
  const [allDepositRequests, setAllDepositRequests] = useState<DepositRequest[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [allBillInvoices, setAllBillInvoices] = useState<BillInvoice[]>([]);

  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [allSupportThreads, setAllSupportThreads] = useState<SupportChatMeta[]>([]);
  const [activeSupportUserId, setActiveSupportUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'danger' | 'info';
  } | null>(null);

  // Admin Security System State (One-time signup, other times login)
  const [adminSecurity, setAdminSecurity] = useState<AdminSecurityConfig | null>(null);
  const [isAdminSessionUnlocked, setIsAdminSessionUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('esports_admin_session_auth') === 'unlocked';
    } catch {
      return false;
    }
  });

  // Sync initial view from URL hash
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin') return 'admin';
    if (hash === 'tournaments' || hash === 'scrims') return 'tournaments';
    if (hash === 'wallet') return 'wallet';
    if (hash === 'leaderboard') return 'leaderboard';
    if (hash === 'profile') return 'profile';
    return 'home';
  });

  const navigate = useCallback((view: string) => {
    setCurrentView(view);
    window.location.hash = view === 'home' ? '' : view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [selectedGameFilter, setSelectedGameFilter] = useState<string | null>(null);

  const showToast = useCallback(
    (text: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info') => {
      setToastMessage({ text, type });
      setTimeout(() => {
        setToastMessage(prev => (prev?.text === text ? null : prev));
      }, 4000);
    },
    []
  );

  const playAudioBeep = useCallback((frequency = 880, duration = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  }, []);

  // Compute Active Theme: STRICTLY the one selected by the admin panel!
  const activeTheme: ThemeId = settings.currentTheme || 'normal';
  const userThemeOverride: ThemeId | null = null;

  // Apply Theme to body attribute
  useEffect(() => {
    try {
      localStorage.removeItem('esports_user_theme_override');
    } catch {}
    document.body.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const setPersonalTheme = useCallback((_theme: ThemeId) => {
    // Platform theme is controlled exclusively by administrator in the admin panel
  }, []);

  const resetPersonalTheme = useCallback(() => {
    // No-op
  }, []);

  // 1. Settings Realtime Listener
  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, snapshot => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setSettings(prev => {
          const merged = { ...prev, ...val };
          localStorage.setItem('esports_cached_settings', JSON.stringify(merged));
          return merged;
        });
      }
    });
    return () => off(settingsRef, 'value', unsubscribe);
  }, []);

  // 2. Games Realtime Listener
  useEffect(() => {
    const gamesRef = ref(db, 'games');
    const unsubscribe = onValue(gamesRef, snapshot => {
      if (snapshot.exists()) {
        const list: Game[] = [];
        snapshot.forEach(child => {
          list.push({ id: child.key!, ...child.val() });
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setGames(list);
      } else {
        setGames([]);
      }
    });
    return () => off(gamesRef, 'value', unsubscribe);
  }, []);

  // 3. Promotions Realtime Listener
  useEffect(() => {
    const promosRef = ref(db, 'promotions');
    const unsubscribe = onValue(promosRef, snapshot => {
      if (snapshot.exists()) {
        const list: Promotion[] = [];
        snapshot.forEach(child => {
          list.push({ id: child.key!, ...child.val() });
        });
        setPromotions(list);
      } else {
        setPromotions([]);
      }
    });
    return () => off(promosRef, 'value', unsubscribe);
  }, []);

  // 4. Tournaments Realtime Listener
  useEffect(() => {
    const tourneysRef = ref(db, 'tournaments');
    const unsubscribe = onValue(tourneysRef, snapshot => {
      if (snapshot.exists()) {
        const list: Tournament[] = [];
        snapshot.forEach(child => {
          list.push({ id: child.key!, ...child.val() });
        });
        list.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
        setTournaments(list);
      } else {
        setTournaments([]);
      }
    });
    return () => off(tourneysRef, 'value', unsubscribe);
  }, []);

  // 5. Payment Methods & IDs Realtime Listener
  useEffect(() => {
    const methodsRef = ref(db, 'paymentMethods');
    const idsRef = ref(db, 'paymentIds');

    const unsubMethods = onValue(methodsRef, snap => {
      if (snap.exists()) {
        const list: PaymentMethod[] = [];
        snap.forEach(c => {
          list.push({ id: c.key!, ...c.val() });
        });
        setPaymentMethods(list);
      } else {
        setPaymentMethods([]);
      }
    });

    const unsubIds = onValue(idsRef, snap => {
      if (snap.exists()) {
        const list: PaymentId[] = [];
        snap.forEach(c => {
          list.push({ id: c.key!, ...c.val() });
        });
        setPaymentIds(list);
      } else {
        setPaymentIds([]);
      }
    });

    return () => {
      off(methodsRef, 'value', unsubMethods);
      off(idsRef, 'value', unsubIds);
    };
  }, []);

  // 5b. Realtime Users Listener (Loads 100% real registered users from live database for Leaderboard & Admin)
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubUsers = onValue(usersRef, snap => {
      if (snap.exists()) {
        const list: UserProfile[] = [];
        snap.forEach(c => {
          list.push({ uid: c.key!, ...c.val() });
        });
        setAllUsersList(list);
      } else {
        setAllUsersList([]);
      }
    });
    return () => off(usersRef, 'value', unsubUsers);
  }, []);

  // 5c. Admin Security Realtime Listener (Tracks one-time configuration status)
  useEffect(() => {
    const secRef = ref(db, 'adminSecurity');
    const unsub = onValue(secRef, snap => {
      if (snap.exists()) {
        setAdminSecurity(snap.val());
      } else {
        setAdminSecurity(null);
      }
    });
    return () => off(secRef, 'value', unsub);
  }, []);

  // 6. Notifications Realtime Listener (No OneSignal!)
  useEffect(() => {
    const notifsRef = ref(db, 'notifications');
    const unsubscribe = onValue(notifsRef, snap => {
      if (snap.exists()) {
        const list: NotificationItem[] = [];
        snap.forEach(c => {
          list.push({ id: c.key!, ...c.val() });
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setNotifications(list);

        const lastRead = parseInt(localStorage.getItem('esports_last_read_notif') || '0');
        let storedReadIds: string[] = [];
        try {
          storedReadIds = JSON.parse(localStorage.getItem('esports_read_notif_ids') || '[]');
        } catch {
          storedReadIds = [];
        }

        const unread = list.filter(
          n =>
            !storedReadIds.includes(n.id) &&
            (n.timestamp || 0) > lastRead &&
            (n.target === 'all' || (currentUser && n.target === currentUser.uid))
        ).length;
        setUnreadNotifCount(unread);
      } else {
        setNotifications([]);
        setUnreadNotifCount(0);
      }
    });
    return () => off(notifsRef, 'value', unsubscribe);
  }, [currentUser]);

  const markNotificationAsRead = useCallback((id: string) => {
    setReadNotifIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('esports_read_notif_ids', JSON.stringify(updated));
      return updated;
    });
    setUnreadNotifCount(prev => Math.max(0, prev - 1));
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    localStorage.setItem('esports_last_read_notif', Date.now().toString());
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('esports_read_notif_ids', JSON.stringify(allIds));
    setUnreadNotifCount(0);
  }, [notifications]);

  // 7. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      setIsLoading(true);

      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, snap => {
          if (snap.exists()) {
            setUserProfile(snap.val());
          }
        });

        // Transactions listener for this user
        const txRef = ref(db, `transactions/${user.uid}`);
        onValue(txRef, snap => {
          if (snap.exists()) {
            const list: Transaction[] = [];
            snap.forEach(c => {
              list.push({ id: c.key!, ...c.val() });
            });
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            setTransactions(list);
          } else {
            setTransactions([]);
          }
        });

        // Live Chat listener for this user
        const chatRef = ref(db, `supportChats/${user.uid}/messages`);
        onValue(chatRef, snap => {
          if (snap.exists()) {
            const msgs: SupportMessage[] = [];
            snap.forEach(c => {
              msgs.push({ id: c.key!, ...c.val() });
            });
            setChatMessages(msgs);
          } else {
            setChatMessages([]);
          }
        });
      } else {
        setUserProfile(null);
        setTransactions([]);
        setChatMessages([]);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 8. Admin Global Data Listeners (When viewing admin or user is admin)
  const isAdmin = userProfile?.isAdmin === true || currentUser?.email === 'admin@gaming.com' || currentView === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    // All Deposits
    const depositsRef = ref(db, 'depositRequests');
    const unsubDeposits = onValue(depositsRef, snap => {
      if (snap.exists()) {
        const list: DepositRequest[] = [];
        snap.forEach(c => {
          list.push({ id: c.key!, ...c.val() });
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAllDepositRequests(list);
      }
    });

    // All Withdrawals
    const withdrawalsRef = ref(db, 'withdrawals');
    const unsubWithdrawals = onValue(withdrawalsRef, snap => {
      if (snap.exists()) {
        const list: WithdrawalRequest[] = [];
        snap.forEach(c => {
          list.push({ id: c.key!, ...c.val() });
        });
        list.sort((a, b) => (b.requestTimestamp || 0) - (a.requestTimestamp || 0));
        setAllWithdrawals(list);
      }
    });

    // All Support Threads
    const supportChatsRef = ref(db, 'supportChats');
    const unsubSupport = onValue(supportChatsRef, snap => {
      if (snap.exists()) {
        const threads: SupportChatMeta[] = [];
        snap.forEach(c => {
          const val = c.val();
          if (val && val.meta) {
            threads.push(val.meta);
          }
        });
        threads.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        setAllSupportThreads(threads);
      }
    });

    // All Bill Invoices
    const billInvoicesRef = ref(db, 'billInvoices');
    const unsubInvoices = onValue(billInvoicesRef, snap => {
      if (snap.exists()) {
        const list: BillInvoice[] = [];
        snap.forEach(c => {
          list.push({ id: c.key!, ...c.val() });
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAllBillInvoices(list);
      } else {
        setAllBillInvoices([]);
      }
    });

    return () => {
      off(depositsRef, 'value', unsubDeposits);
      off(withdrawalsRef, 'value', unsubWithdrawals);
      off(supportChatsRef, 'value', unsubSupport);
      off(billInvoicesRef, 'value', unsubInvoices);
    };
  }, [isAdmin]);

  // Auth Operations
  const loginWithMobile = useCallback(
    async (mobile: string, pass: string) => {
      const cleanMobile = mobile.trim().replace(/\s/g, '');
      const dummyEmail = `${cleanMobile}@yourapp.com`;
      await signInWithEmailAndPassword(auth, dummyEmail, pass);
      showToast('Welcome back! Logged in successfully.', 'success');
      playAudioBeep(660);
    },
    [showToast, playAudioBeep]
  );

  const registerWithMobile = useCallback(
    async (
      mobile: string,
      pass: string,
      name: string,
      gameName: string,
      gameUid: string,
      referralCode?: string
    ) => {
      const cleanMobile = mobile.trim().replace(/\s/g, '');
      const dummyEmail = `${cleanMobile}@yourapp.com`;

      let referrerUid: string | null = null;
      if (referralCode) {
        const snap = await get(ref(db, 'users'));
        if (snap.exists()) {
          snap.forEach(c => {
            if (c.val()?.referralCode === referralCode.trim().toUpperCase()) {
              referrerUid = c.key;
            }
          });
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, dummyEmail, pass);
      const uid = cred.user.uid;
      const refCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const newProfile: UserProfile = {
        uid,
        email: dummyEmail,
        mobile: cleanMobile,
        displayName: name,
        gameName,
        gameUid,
        photoURL: null,
        balance: 0,
        winningCash: 0,
        bonusCash: 5, // Welcome bonus
        totalMatches: 0,
        wonMatches: 0,
        totalEarnings: 0,
        referralEarnings: 0,
        referralCode: refCode,
        referredBy: referrerUid,
        hasDeposited: false,
        hasJoinedTournament: false,
        status: 'active',
        createdAt: Date.now(),
      };

      await set(ref(db, `users/${uid}`), newProfile);

      // Record welcome transaction
      const txKey = push(ref(db, `transactions/${uid}`)).key;
      await set(ref(db, `transactions/${uid}/${txKey}`), {
        type: 'signup_bonus',
        amount: 5,
        timestamp: Date.now(),
        description: 'Welcome Bonus Credited',
        status: 'completed',
        balanceAfter: 5,
      });

      showToast(`Account created! Welcome, ${name}!`, 'success');
      playAudioBeep(880);
    },
    [showToast, playAudioBeep]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    showToast('Logged out.', 'info');
  }, [showToast]);

  const updateInGameName = useCallback(
    async (newName: string) => {
      if (!currentUser) return;
      await update(ref(db, `users/${currentUser.uid}`), {
        displayName: newName,
        gameName: newName,
      });
      showToast('In-game name updated!', 'success');
    },
    [currentUser, showToast]
  );

  const updateProfileAvatar = useCallback(
    async (url: string) => {
      if (!currentUser) return;
      await update(ref(db, `users/${currentUser.uid}`), {
        photoURL: url,
      });
      showToast('Avatar updated!', 'success');
    },
    [currentUser, showToast]
  );

  const updateAdminSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      await update(ref(db, 'settings'), {
        ...newSettings,
        lastUpdated: serverTimestamp(),
      });
      showToast('Settings saved successfully!', 'success');
    },
    [showToast]
  );

  // Tournament & Scrim Booking
  const joinSoloTournament = useCallback(
    async (tournamentId: string, gameName: string, fee: number) => {
      if (!currentUser || !userProfile) throw new Error('Please login to join.');
      if ((userProfile.balance || 0) < fee) throw new Error('Insufficient wallet balance. Please add funds.');

      // Check if user has already joined this tournament
      const tourneySnap = await get(ref(db, `tournaments/${tournamentId}`));
      if (!tourneySnap.exists()) throw new Error('Tournament does not exist.');
      const tData = tourneySnap.val() as Tournament;

      if (tData.registeredPlayers && tData.registeredPlayers[currentUser.uid]) {
        throw new Error('You have already joined this match! Each player can only join once.');
      }

      const newBalance = userProfile.balance - fee;
      const updates: Record<string, any> = {};

      updates[`users/${currentUser.uid}/balance`] = newBalance;
      updates[`users/${currentUser.uid}/totalMatches`] = (userProfile.totalMatches || 0) + 1;
      updates[`users/${currentUser.uid}/hasJoinedTournament`] = true;
      updates[`users/${currentUser.uid}/joinedTournaments/${tournamentId}`] = true;

      updates[`tournaments/${tournamentId}/registeredPlayers/${currentUser.uid}`] = {
        joinedAt: Date.now(),
        gameName,
      };

      const txKey = push(ref(db, `transactions/${currentUser.uid}`)).key;
      updates[`transactions/${currentUser.uid}/${txKey}`] = {
        type: 'tournament_join',
        amount: -fee,
        timestamp: Date.now(),
        description: `Joined Tournament Fee (₹${fee})`,
        status: 'completed',
        balanceAfter: newBalance,
        tournamentId,
      };

      await update(ref(db), updates);
      showToast(`Joined! ₹${fee} entry fee deducted. Good luck!`, 'success');
      playAudioBeep(520);
    },
    [currentUser, userProfile, showToast, playAudioBeep]
  );

  const registerScrimTeam = useCallback(
    async (
      tournamentId: string,
      slotNumber: number,
      groupKey: string | null,
      teamData: {
        teamName: string;
        teamTag: string;
        logoUrl: string;
        captainName: string;
        captainMobile: string;
        dropSpot: string;
        players: string[];
      },
      fee: number
    ) => {
      if (!currentUser || !userProfile) throw new Error('Please login to register.');
      if ((userProfile.balance || 0) < fee) throw new Error('Insufficient balance to reserve slot.');

      const tourneySnap = await get(ref(db, `tournaments/${tournamentId}`));
      if (!tourneySnap.exists()) throw new Error('Scrim match not found.');
      const tData = tourneySnap.val() as Tournament;

      // 1. Check if the specific slot is already occupied
      const existingSlot = groupKey
        ? tData.scrimGroups?.[groupKey]?.slots?.[slotNumber]
        : tData.scrimSlots?.[slotNumber];
      if (existingSlot) {
        throw new Error(`Slot #${slotNumber} is already booked by ${existingSlot.teamName}. Please pick another available slot.`);
      }

      // 2. Strict Rule: ONE TEAM / CAPTAIN CAN ONLY JOIN ONCE AT A TIME
      const checkAllSlots = (slotsMap?: Record<string, ScrimSlot>) => {
        if (!slotsMap) return;
        for (const [sKey, s] of Object.entries(slotsMap)) {
          if (!s) continue;
          if (s.captainUid === currentUser.uid) {
            throw new Error(`You have already registered Team "${s.teamName}" in Slot #${s.slotNumber || sKey}. One team can only join once per scrim.`);
          }
          if (s.teamName?.trim().toLowerCase() === teamData.teamName.trim().toLowerCase()) {
            throw new Error(`Team name "${teamData.teamName}" is already registered in Slot #${s.slotNumber || sKey}. One team can only join once.`);
          }
          if (s.teamTag && teamData.teamTag && s.teamTag.trim().toLowerCase() === teamData.teamTag.trim().toLowerCase()) {
            throw new Error(`Team tag "[${teamData.teamTag}]" is already registered in Slot #${s.slotNumber || sKey}. One team can only join once.`);
          }
        }
      };

      if (tData.scrimSlots) checkAllSlots(tData.scrimSlots);
      if (tData.scrimGroups) {
        for (const grp of Object.values(tData.scrimGroups)) {
          if (grp.slots) checkAllSlots(grp.slots);
        }
      }
      if (tData.registeredPlayers && tData.registeredPlayers[currentUser.uid]) {
        throw new Error('You are already registered in this match! One team can only join once.');
      }

      const newBalance = userProfile.balance - fee;
      const updates: Record<string, any> = {};

      const slotPayload = {
        slotNumber,
        ...teamData,
        captainUid: currentUser.uid,
        joinedAt: Date.now(),
      };

      if (groupKey) {
        updates[`tournaments/${tournamentId}/scrimGroups/${groupKey}/slots/${slotNumber}`] = slotPayload;
      } else {
        updates[`tournaments/${tournamentId}/scrimSlots/${slotNumber}`] = slotPayload;
      }

      updates[`users/${currentUser.uid}/balance`] = newBalance;
      updates[`users/${currentUser.uid}/totalMatches`] = (userProfile.totalMatches || 0) + 1;
      updates[`users/${currentUser.uid}/hasJoinedTournament`] = true;
      updates[`users/${currentUser.uid}/joinedTournaments/${tournamentId}`] = true;
      updates[`tournaments/${tournamentId}/registeredPlayers/${currentUser.uid}`] = {
        joinedAt: Date.now(),
        gameName: teamData.captainName,
        teamName: teamData.teamName,
      };

      const txKey = push(ref(db, `transactions/${currentUser.uid}`)).key;
      updates[`transactions/${currentUser.uid}/${txKey}`] = {
        type: 'scrim_slot_booking',
        amount: -fee,
        timestamp: Date.now(),
        description: `Scrim Slot #${slotNumber} Reserved for [${teamData.teamTag}]`,
        status: 'completed',
        balanceAfter: newBalance,
        tournamentId,
      };

      await update(ref(db), updates);
      showToast(`Slot #${slotNumber} registered for team ${teamData.teamName}!`, 'success');
      playAudioBeep(640);
    },
    [currentUser, userProfile, showToast, playAudioBeep]
  );

  // Player-to-Player (P2P) Coin Sharing System with 3.5% Transaction Fee
  const transferCoinsToPlayer = useCallback(
    async (recipientIdentifier: string, amount: number) => {
      if (!currentUser || !userProfile) throw new Error('Please login to share coins.');
      const cleanIdentifier = recipientIdentifier.trim().toLowerCase();
      if (!cleanIdentifier) throw new Error('Recipient Mobile Number, Game UID, or User ID is required.');
      if (amount <= 0 || isNaN(amount)) throw new Error('Transfer amount must be greater than zero.');

      // 3.5% transaction fee
      const fee = Math.round(amount * 0.035 * 100) / 100;
      const totalDeducted = Math.round((amount + fee) * 100) / 100;

      if ((userProfile.balance || 0) < totalDeducted) {
        throw new Error(
          `Insufficient balance. You need ₹${totalDeducted} (₹${amount} transfer + 3.5% platform fee of ₹${fee}), but current balance is ₹${userProfile.balance || 0}.`
        );
      }

      // Find recipient in all users
      const usersSnap = await get(ref(db, 'users'));
      if (!usersSnap.exists()) throw new Error('No users found in database.');
      const usersData = usersSnap.val() as Record<string, UserProfile>;

      let recipientUid: string | null = null;
      let recipientObj: UserProfile | null = null;

      for (const [uid, u] of Object.entries(usersData)) {
        if (!u) continue;
        const matchesMobile =
          (u.mobile && u.mobile.toLowerCase() === cleanIdentifier) ||
          (u.phoneNumber && u.phoneNumber.toLowerCase() === cleanIdentifier);
        const matchesUid = uid.toLowerCase() === cleanIdentifier;
        const matchesGameUid = u.gameUid && u.gameUid.toLowerCase() === cleanIdentifier;
        const matchesEmail = u.email && u.email.toLowerCase() === cleanIdentifier;
        const matchesGameName = u.gameName && u.gameName.toLowerCase() === cleanIdentifier;

        if (matchesMobile || matchesUid || matchesGameUid || matchesEmail || matchesGameName) {
          recipientUid = uid;
          recipientObj = u;
          break;
        }
      }

      if (!recipientUid || !recipientObj) {
        throw new Error('Recipient player not found! Please check their Mobile Number, Game UID, or User ID.');
      }

      if (recipientUid === currentUser.uid) {
        throw new Error('You cannot transfer coins to your own account.');
      }

      const senderNewBalance = Math.round(((userProfile.balance || 0) - totalDeducted) * 100) / 100;
      const recipientNewBalance = Math.round(((recipientObj.balance || 0) + amount) * 100) / 100;

      const updates: Record<string, any> = {};
      updates[`users/${currentUser.uid}/balance`] = senderNewBalance;
      updates[`users/${recipientUid}/balance`] = recipientNewBalance;

      const senderTxKey = push(ref(db, `transactions/${currentUser.uid}`)).key;
      const recipientTxKey = push(ref(db, `transactions/${recipientUid}`)).key;

      const recipientDisplayName =
        recipientObj.displayName || recipientObj.gameName || recipientObj.mobile || 'Player';
      const senderDisplayName =
        userProfile.displayName || userProfile.gameName || userProfile.mobile || 'Player';

      updates[`transactions/${currentUser.uid}/${senderTxKey}`] = {
        type: 'coin_transfer_sent',
        amount: -totalDeducted,
        timestamp: Date.now(),
        description: `Sent ₹${amount} Deposit Coins to ${recipientDisplayName} (3.5% Fee: ₹${fee})`,
        status: 'completed',
        balanceAfter: senderNewBalance,
      };

      updates[`transactions/${recipientUid}/${recipientTxKey}`] = {
        type: 'coin_transfer_received',
        amount: amount,
        timestamp: Date.now(),
        description: `Received ₹${amount} Deposit Coins from ${senderDisplayName}`,
        status: 'completed',
        balanceAfter: recipientNewBalance,
      };

      await update(ref(db), updates);
      showToast(
        `Successfully sent ₹${amount} coins to ${recipientDisplayName}! (Platform fee 3.5%: ₹${fee})`,
        'success'
      );
      playAudioBeep(680);

      return {
        success: true,
        netAmount: amount,
        fee,
        recipientName: recipientDisplayName,
      };
    },
    [currentUser, userProfile, showToast, playAudioBeep]
  );

  // Exact Deposit Workflow with Invoice & Deposit ID
  const submitDepositRequest = useCallback(
    async (
      amount: number,
      screenshotUrl: string,
      txnId?: string,
      invoiceDetails?: DepositInvoiceDetails
    ) => {
      if (!currentUser || !userProfile) throw new Error('Please login.');
      const newRef = push(ref(db, 'depositRequests'));
      const key = newRef.key!;
      const depositId = invoiceDetails?.depositId || `DEP-${Date.now().toString().slice(-6)}`;
      const invoiceNumber = invoiceDetails?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

      const billData: BillInvoice = {
        id: key,
        invoiceNumber,
        billName: invoiceDetails?.billName || 'Wallet Deposit Top-Up',
        appName: invoiceDetails?.methodName || 'Online Deposit',
        accountNumber: invoiceDetails?.receivingAccount || 'Direct Payment',
        accountName: invoiceDetails?.accountHolder || 'Admin Hub',
        amount,
        billLogo: invoiceDetails?.methodLogo || undefined,
        qrCodeUrl: invoiceDetails?.qrCodeUrl || undefined,
        recipientUserId: currentUser.uid,
        recipientName: userProfile.displayName || currentUser.email || 'Player',
        recipientPhone: userProfile.mobile || userProfile.phoneNumber || undefined,
        status: 'pending',
        createdAt: Date.now(),
        transactionRef: txnId || undefined,
        paymentProofUrl: screenshotUrl || undefined,
      };

      const updates: Record<string, any> = {};
      updates[`depositRequests/${key}`] = {
        userId: currentUser.uid,
        userName: userProfile.displayName || currentUser.email,
        userEmail: currentUser.email,
        amount,
        screenshotUrl,
        transactionId: txnId || null,
        status: 'pending',
        timestamp: Date.now(),
        depositId,
        invoiceNumber,
        invoiceDetails: invoiceDetails || null,
      };
      updates[`billInvoices/${key}`] = billData;

      await update(ref(db), updates);
      showToast(`Deposit invoice submitted! (Deposit ID: ${depositId})`, 'success');
    },
    [currentUser, userProfile, showToast]
  );

  // Exact Payment ID Redeem
  const redeemPaymentId = useCallback(
    async (code: string): Promise<number> => {
      if (!currentUser || !userProfile) throw new Error('Please login.');
      const cleanCode = code.trim().toUpperCase();
      const idRef = ref(db, `paymentIds/${cleanCode}`);
      const snap = await get(idRef);

      if (!snap.exists()) throw new Error('Invalid Payment ID.');
      const data: PaymentId = snap.val();
      if (data.status !== 'available') throw new Error('This Payment ID has already been redeemed.');

      const amount = data.amount;
      const newBalance = (userProfile.balance || 0) + amount;
      const updates: Record<string, any> = {};

      updates[`paymentIds/${cleanCode}/status`] = 'used';
      updates[`paymentIds/${cleanCode}/usedBy`] = currentUser.uid;
      updates[`paymentIds/${cleanCode}/usedAt`] = Date.now();

      updates[`users/${currentUser.uid}/balance`] = newBalance;
      updates[`users/${currentUser.uid}/hasDeposited`] = true;

      const txKey = push(ref(db, `transactions/${currentUser.uid}`)).key;
      updates[`transactions/${currentUser.uid}/${txKey}`] = {
        type: 'payment_id_redeem',
        amount,
        timestamp: Date.now(),
        description: `Redeemed Payment ID: ${cleanCode}`,
        status: 'completed',
        balanceAfter: newBalance,
      };

      await update(ref(db), updates);
      showToast(`Success! ₹${amount} added instantly to your wallet.`, 'success');
      playAudioBeep(1040);
      return amount;
    },
    [currentUser, userProfile, showToast, playAudioBeep]
  );

  // Exact Withdrawal Workflow: User can withdraw from Winning Cash and Bonus Cash (main balance is match entries only)
  const submitWithdrawalRequest = useCallback(
    async (amount: number, methodType: string, accountNumber: string) => {
      if (!currentUser || !userProfile) throw new Error('Please login.');
      const minW = settings.minWithdraw || 50;
      if (amount < minW) throw new Error(`Minimum withdrawal amount is ₹${minW}.`);

      const totalWithdrawable = (userProfile.winningCash || 0) + (userProfile.bonusCash || 0);
      if (amount > totalWithdrawable) {
        throw new Error(
          `Insufficient withdrawable balance (₹${totalWithdrawable}). You can only withdraw Winning Cash (₹${userProfile.winningCash || 0}) and Bonus Cash (₹${userProfile.bonusCash || 0}). Main deposit balance is reserved for tournament entries.`
        );
      }

      // Deduct from winningCash first, and remainder from bonusCash
      let remaining = amount;
      let newWinning = userProfile.winningCash || 0;
      let newBonus = userProfile.bonusCash || 0;
      if (newWinning >= remaining) {
        newWinning -= remaining;
        remaining = 0;
      } else {
        remaining -= newWinning;
        newWinning = 0;
        newBonus = Math.max(0, newBonus - remaining);
      }

      const updates: Record<string, any> = {};
      updates[`users/${currentUser.uid}/winningCash`] = newWinning;
      updates[`users/${currentUser.uid}/bonusCash`] = newBonus;

      const wrRef = push(ref(db, 'withdrawals'));
      const reqId = wrRef.key!;

      updates[`withdrawals/${reqId}`] = {
        userId: currentUser.uid,
        userName: userProfile.displayName || currentUser.email,
        userEmail: currentUser.email,
        amount,
        methodDetails: {
          methodName: methodType,
          accountInfo: accountNumber,
        },
        status: 'pending',
        requestTimestamp: Date.now(),
      };

      const txKey = push(ref(db, `transactions/${currentUser.uid}`)).key;
      updates[`transactions/${currentUser.uid}/${txKey}`] = {
        type: 'withdraw_request',
        amount: -amount,
        timestamp: Date.now(),
        description: `Withdrawal Request to ${methodType} (${accountNumber})`,
        status: 'pending',
        withdrawalId: reqId,
      };

      await update(ref(db), updates);
      showToast('Withdrawal request submitted! Payout will be sent within 24 hours.', 'success');
    },
    [currentUser, userProfile, settings, showToast]
  );

  // Convert Withdrawable Winnings / Bonus money into Main Deposit Balance
  const convertWinningToDeposit = useCallback(
    async (amount: number): Promise<void> => {
      if (!currentUser || !userProfile) throw new Error('Please login.');
      const parsedAmount = Math.round(Number(amount) * 100) / 100;
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid conversion amount.');
      }

      const totalWithdrawable = (userProfile.winningCash || 0) + (userProfile.bonusCash || 0);
      if (parsedAmount > totalWithdrawable) {
        throw new Error(`Insufficient withdrawable balance (Max: ₹${totalWithdrawable.toFixed(2)}).`);
      }

      // Deduct from winningCash first, then remainder from bonusCash
      let remaining = parsedAmount;
      let newWinning = userProfile.winningCash || 0;
      let newBonus = userProfile.bonusCash || 0;

      if (newWinning >= remaining) {
        newWinning -= remaining;
        remaining = 0;
      } else {
        remaining -= newWinning;
        newWinning = 0;
        newBonus = Math.max(0, newBonus - remaining);
      }

      const newDepositBalance = (userProfile.balance || 0) + parsedAmount;

      const updates: Record<string, any> = {};
      updates[`users/${currentUser.uid}/winningCash`] = newWinning;
      updates[`users/${currentUser.uid}/bonusCash`] = newBonus;
      updates[`users/${currentUser.uid}/balance`] = newDepositBalance;

      const txKey = push(ref(db, `transactions/${currentUser.uid}`)).key;
      updates[`transactions/${currentUser.uid}/${txKey}`] = {
        type: 'convert_winning_to_deposit',
        amount: parsedAmount,
        timestamp: Date.now(),
        description: `Converted ₹${parsedAmount} from Winnings to Main Deposit Balance`,
        status: 'completed',
        balanceAfter: newDepositBalance,
      };

      await update(ref(db), updates);
      showToast(`Instant conversion! ₹${parsedAmount} added to your Main Deposit Balance.`, 'success');
      playAudioBeep(880, 150);
    },
    [currentUser, userProfile, showToast, playAudioBeep]
  );

  // Convert an existing Pending Withdrawal Request into Main Deposit Balance
  const convertPendingWithdrawalToDeposit = useCallback(
    async (withdrawalId: string): Promise<void> => {
      if (!currentUser) throw new Error('Please login.');
      const snap = await get(ref(db, `withdrawals/${withdrawalId}`));
      if (!snap.exists()) throw new Error('Withdrawal request not found.');
      const req: WithdrawalRequest = snap.val();

      if (req.status !== 'pending') {
        throw new Error(`This withdrawal is already ${req.status}.`);
      }

      const targetUserId = req.userId;
      const uSnap = await get(ref(db, `users/${targetUserId}`));
      if (!uSnap.exists()) throw new Error('User account not found.');
      const u: UserProfile = uSnap.val();

      const newDepositBalance = (u.balance || 0) + req.amount;

      const updates: Record<string, any> = {};
      updates[`withdrawals/${withdrawalId}/status`] = 'converted_to_deposit';
      updates[`withdrawals/${withdrawalId}/processedAt`] = Date.now();
      updates[`withdrawals/${withdrawalId}/adminNote`] = 'Converted to Main Deposit Balance';
      updates[`users/${targetUserId}/balance`] = newDepositBalance;

      const txKey = push(ref(db, `transactions/${targetUserId}`)).key;
      updates[`transactions/${targetUserId}/${txKey}`] = {
        type: 'withdrawal_converted_to_deposit',
        amount: req.amount,
        timestamp: Date.now(),
        description: `Converted Pending Withdrawal (₹${req.amount}) to Deposit Balance`,
        status: 'completed',
        balanceAfter: newDepositBalance,
      };

      await update(ref(db), updates);
      showToast(`Converted pending withdrawal of ₹${req.amount} directly into Deposit Balance!`, 'success');
      playAudioBeep(880, 150);
    },
    [currentUser, showToast, playAudioBeep]
  );

  // Apply Late Referral Code
  const applyReferralCode = useCallback(
    async (code: string) => {
      if (!currentUser || !userProfile) throw new Error('Please login.');
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode === userProfile.referralCode) throw new Error('Cannot apply your own referral code.');

      const snap = await get(ref(db, 'users'));
      let refUid: string | null = null;
      if (snap.exists()) {
        snap.forEach(c => {
          if (c.val()?.referralCode === cleanCode) refUid = c.key;
        });
      }

      if (!refUid) throw new Error('Invalid referral code.');

      await update(ref(db, `users/${currentUser.uid}`), {
        referredBy: refUid,
        referredAt: Date.now(),
      });

      showToast('Referral code applied successfully!', 'success');
    },
    [currentUser, userProfile, showToast]
  );

  // Live Support Chat
  const sendUserChatMessage = useCallback(
    async (text: string) => {
      if (!currentUser || !userProfile) return;
      const msgRef = push(ref(db, `supportChats/${currentUser.uid}/messages`));
      await set(msgRef, {
        sender: 'user',
        text: text.trim(),
        timestamp: Date.now(),
        senderName: userProfile.displayName || currentUser.email,
      });

      await update(ref(db, `supportChats/${currentUser.uid}/meta`), {
        userId: currentUser.uid,
        userName: userProfile.displayName || 'Player',
        userMobile: userProfile.mobile || currentUser.email?.split('@')[0] || 'N/A',
        lastMessage: text.trim(),
        lastUpdated: Date.now(),
        unreadByAdmin: true,
      });
      playAudioBeep(700);
    },
    [currentUser, userProfile, playAudioBeep]
  );

  const sendAdminChatMessage = useCallback(
    async (targetUserId: string, text: string) => {
      const msgRef = push(ref(db, `supportChats/${targetUserId}/messages`));
      await set(msgRef, {
        sender: 'admin',
        text: text.trim(),
        timestamp: Date.now(),
        senderName: 'Admin Support',
      });

      await update(ref(db, `supportChats/${targetUserId}/meta`), {
        lastMessage: `Admin: ${text.trim()}`,
        lastUpdated: Date.now(),
        unreadByAdmin: false,
      });
      playAudioBeep(800);
    },
    [playAudioBeep]
  );

  // Admin CRUD & Actions
  const addOrUpdateGame = useCallback(
    async (game: Partial<Game>, id?: string) => {
      const targetId = id || push(ref(db, 'games')).key!;
      await update(ref(db, `games/${targetId}`), {
        ...game,
        updatedAt: Date.now(),
      });
      showToast('Game saved.', 'success');
    },
    [showToast]
  );

  const deleteGame = useCallback(
    async (id: string) => {
      await remove(ref(db, `games/${id}`));
      showToast('Game deleted.', 'info');
    },
    [showToast]
  );

  const addOrUpdatePromotion = useCallback(
    async (promo: Partial<Promotion>, id?: string) => {
      const targetId = id || push(ref(db, 'promotions')).key!;
      await update(ref(db, `promotions/${targetId}`), {
        ...promo,
        updatedAt: Date.now(),
      });
      showToast('Promotion saved.', 'success');
    },
    [showToast]
  );

  const deletePromotion = useCallback(
    async (id: string) => {
      await remove(ref(db, `promotions/${id}`));
      showToast('Promotion deleted.', 'info');
    },
    [showToast]
  );

  const addOrUpdateTournament = useCallback(
    async (tournament: Partial<Tournament>, id?: string) => {
      const targetId = id || push(ref(db, 'tournaments')).key!;
      await update(ref(db, `tournaments/${targetId}`), {
        ...tournament,
        updatedAt: Date.now(),
      });
      showToast('Tournament / Scrim updated.', 'success');
    },
    [showToast]
  );

  const deleteTournament = useCallback(
    async (id: string) => {
      await remove(ref(db, `tournaments/${id}`));
      showToast('Tournament deleted.', 'info');
    },
    [showToast]
  );

  const postMatchResults = useCallback(
    async (tournamentId: string, results: any[], editReason?: string) => {
      const res = await finalizeTournamentAndDistributeWinnings(
        tournamentId,
        results,
        editReason,
        currentUser?.email || 'admin'
      );
      if (res.success) {
        showToast(
          `Results saved! Credited ₹${res.totalDistributed} winning money across ${res.recipientsCount} player/team wallet(s).`,
          'success'
        );
      } else {
        showToast(`Results saved. ${res.error || ''}`, 'warning');
      }
    },
    [currentUser, showToast]
  );

  const distributeWinnings = useCallback(
    async (tournamentId: string, options?: { force?: boolean }) => {
      const res = await distributeTournamentWinnings(tournamentId, options);
      if (res.success) {
        showToast(
          `Prizes distributed! Paid ₹${res.totalDistributed} to ${res.recipientsCount} players.`,
          'success'
        );
      } else {
        showToast(res.error || 'Distribution failed.', 'warning');
      }
      return res;
    },
    [showToast]
  );

  const autoDistributeAllWinnings = useCallback(async () => {
    const summary = await autoDistributeAllFinalizedTournaments();
    if (summary.processedTournaments > 0) {
      showToast(
        `Auto-payout completed! Distributed ₹${summary.totalDistributedAmount} across ${summary.processedTournaments} match(es).`,
        'success'
      );
    } else {
      showToast('All finalized tournament winnings are already distributed.', 'info');
    }
    return summary;
  }, [showToast]);

  const processDepositRequest = useCallback(
    async (requestId: string, action: 'approve' | 'reject') => {
      const snap = await get(ref(db, `depositRequests/${requestId}`));
      if (!snap.exists()) throw new Error('Deposit request not found.');
      const req: DepositRequest = snap.val();

      const updates: Record<string, any> = {};
      updates[`depositRequests/${requestId}/status`] = action === 'approve' ? 'completed' : 'rejected';
      updates[`depositRequests/${requestId}/processedAt`] = Date.now();

      if (action === 'approve') {
        const uSnap = await get(ref(db, `users/${req.userId}`));
        if (uSnap.exists()) {
          const u = uSnap.val();
          const newBal = (u.balance || 0) + req.amount;
          updates[`users/${req.userId}/balance`] = newBal;
          updates[`users/${req.userId}/hasDeposited`] = true;

          const txKey = push(ref(db, `transactions/${req.userId}`)).key;
          updates[`transactions/${req.userId}/${txKey}`] = {
            type: 'deposit_approved',
            amount: req.amount,
            timestamp: Date.now(),
            description: `Deposit Approved (₹${req.amount})`,
            status: 'completed',
            balanceAfter: newBal,
          };
        }
      }

      await update(ref(db), updates);
      showToast(`Deposit ${action}ed!`, 'success');
    },
    [showToast]
  );

  const processWithdrawalRequest = useCallback(
    async (
      requestId: string,
      action: 'approve' | 'reject',
      noteOrReason: string,
      receiptDetails?: WithdrawalReceiptDetails
    ) => {
      const snap = await get(ref(db, `withdrawals/${requestId}`));
      if (!snap.exists()) throw new Error('Request not found.');
      const req: WithdrawalRequest = snap.val();

      const updates: Record<string, any> = {};
      updates[`withdrawals/${requestId}/status`] = action === 'approve' ? 'completed' : 'rejected';
      updates[`withdrawals/${requestId}/processedAt`] = Date.now();

      if (action === 'approve') {
        updates[`withdrawals/${requestId}/adminNote`] = noteOrReason || 'Approved';
        if (receiptDetails) {
          updates[`withdrawals/${requestId}/receiptDetails`] = receiptDetails;
        }
      } else {
        // Refund winning cash back to user
        updates[`withdrawals/${requestId}/rejectReason`] = noteOrReason || 'Rejected by Admin';
        const uSnap = await get(ref(db, `users/${req.userId}`));
        if (uSnap.exists()) {
          const u = uSnap.val();
          const newWinning = (u.winningCash || 0) + req.amount;
          updates[`users/${req.userId}/winningCash`] = newWinning;

          const txKey = push(ref(db, `transactions/${req.userId}`)).key;
          updates[`transactions/${req.userId}/${txKey}`] = {
            type: 'withdrawal_refund',
            amount: req.amount,
            timestamp: Date.now(),
            description: `Refund Rejected Withdrawal: ${noteOrReason}`,
            status: 'completed',
          };
        }
      }

      await update(ref(db), updates);
      showToast(`Withdrawal ${action}ed!`, 'success');
    },
    [showToast]
  );

  // Exact Bill Invoice Workflow (with identical verification system as deposit function)
  const createBillInvoice = useCallback(
    async (invoiceData: Omit<BillInvoice, 'id' | 'createdAt' | 'status'>): Promise<string> => {
      const newRef = push(ref(db, 'billInvoices'));
      const id = newRef.key!;
      const fullInvoice: BillInvoice = {
        ...invoiceData,
        id,
        status: 'pending',
        createdAt: Date.now(),
      };
      await set(newRef, fullInvoice);
      showToast(`Bill Invoice ${invoiceData.invoiceNumber} created successfully!`, 'success');
      return id;
    },
    [showToast]
  );

  const processBillInvoice = useCallback(
    async (
      invoiceId: string,
      action: 'approve' | 'reject',
      adminNote?: string,
      paymentProofUrl?: string
    ) => {
      const snap = await get(ref(db, `billInvoices/${invoiceId}`));
      if (!snap.exists()) throw new Error('Bill invoice not found.');
      const inv: BillInvoice = snap.val();

      const updates: Record<string, any> = {};
      updates[`billInvoices/${invoiceId}/status`] = action === 'approve' ? 'completed' : 'rejected';
      updates[`billInvoices/${invoiceId}/processedAt`] = Date.now();
      updates[`billInvoices/${invoiceId}/processedBy`] = adminSecurity?.adminName || 'Admin';
      if (adminNote) updates[`billInvoices/${invoiceId}/confirmationNote`] = adminNote;
      if (paymentProofUrl) updates[`billInvoices/${invoiceId}/paymentProofUrl`] = paymentProofUrl;

      // Same verification system as deposit function:
      // If approved and linked to a player, credit their wallet balance and log transaction!
      if (action === 'approve' && inv.recipientUserId) {
        const uSnap = await get(ref(db, `users/${inv.recipientUserId}`));
        if (uSnap.exists()) {
          const u = uSnap.val();
          const newBal = (u.balance || 0) + Number(inv.amount || 0);
          updates[`users/${inv.recipientUserId}/balance`] = newBal;
          updates[`users/${inv.recipientUserId}/hasDeposited`] = true;

          const txKey = push(ref(db, `transactions/${inv.recipientUserId}`)).key;
          updates[`transactions/${inv.recipientUserId}/${txKey}`] = {
            type: 'deposit_approved',
            amount: Number(inv.amount || 0),
            timestamp: Date.now(),
            description: `Bill Invoice Verified & Credited (${inv.billName || 'Invoice'} • ${inv.invoiceNumber})`,
            status: 'completed',
            balanceAfter: newBal,
          };
        }
      }

      await update(ref(db), updates);
      showToast(
        `Bill Invoice ${inv.invoiceNumber} ${action === 'approve' ? 'Approved & Confirmed (Verified)' : 'Rejected'}!`,
        'success'
      );
    },
    [adminSecurity, showToast]
  );

  const deleteBillInvoice = useCallback(
    async (invoiceId: string) => {
      await remove(ref(db, `billInvoices/${invoiceId}`));
      showToast('Bill invoice deleted.', 'info');
    },
    [showToast]
  );

  const addPaymentMethod = useCallback(
    async (method: Partial<PaymentMethod>, id?: string) => {
      const targetId = id || push(ref(db, 'paymentMethods')).key!;
      await update(ref(db, `paymentMethods/${targetId}`), method);
      showToast('Payment method saved.', 'success');
    },
    [showToast]
  );

  const deletePaymentMethod = useCallback(
    async (id: string) => {
      await remove(ref(db, `paymentMethods/${id}`));
      showToast('Payment method deleted.', 'info');
    },
    [showToast]
  );

  const generatePaymentId = useCallback(
    async (idCode: string, amount: number) => {
      const clean = idCode.trim().toUpperCase();
      await set(ref(db, `paymentIds/${clean}`), {
        amount,
        status: 'available',
        createdAt: Date.now(),
      });
      showToast(`Payment ID ${clean} generated for ₹${amount}.`, 'success');
    },
    [showToast]
  );

  const deletePaymentId = useCallback(
    async (idCode: string) => {
      await remove(ref(db, `paymentIds/${idCode}`));
      showToast('Payment ID deleted.', 'info');
    },
    [showToast]
  );

  const sendBroadcastNotification = useCallback(
    async (
      title: string,
      message: string,
      target = 'all',
      matchType: TournamentMode | 'all' = 'all'
    ) => {
      const notifRef = push(ref(db, 'notifications'));
      await set(notifRef, {
        title: title.trim(),
        message: message.trim(),
        target,
        matchType,
        timestamp: Date.now(),
        sentBy: currentUser?.uid || 'admin',
      });
      showToast(
        matchType !== 'all'
          ? `Announcement broadcasted for ${matchType} matches!`
          : 'Broadcast notification sent to all players!',
        'success'
      );
    },
    [currentUser, showToast]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      await remove(ref(db, `notifications/${id}`));
      showToast('Notification removed.', 'info');
    },
    [showToast]
  );

  const updateUserBalanceByAdmin = useCallback(
    async (targetUid: string, amount: number, type: 'balance' | 'winningCash' | 'bonusCash', reason: string) => {
      try {
        const uSnap = await get(ref(db, `users/${targetUid}`));
        const existing = uSnap.exists()
          ? uSnap.val()
          : (allUsersList.find(u => u.uid === targetUid) || {
              uid: targetUid,
              displayName: 'Player',
              email: `${targetUid}@esports.com`,
              balance: 0,
              winningCash: 0,
              bonusCash: 0,
              status: 'active',
            });

        const currentVal = Number(existing[type] || 0);
        const newVal = Math.max(0, currentVal + amount);
        const newBalance = Math.max(0, Number(existing.balance || 0) + amount);

        const updates: Record<string, any> = {};
        updates[`users/${targetUid}/${type}`] = newVal;
        if (type !== 'balance') {
          updates[`users/${targetUid}/balance`] = newBalance;
        }

        const txKey = push(ref(db, `transactions/${targetUid}`)).key;
        updates[`transactions/${targetUid}/${txKey}`] = {
          type: amount > 0 ? `admin_${type}_add` : `admin_${type}_deduct`,
          amount,
          timestamp: Date.now(),
          description: `Admin Update: ${reason}`,
          status: 'completed',
          balanceAfter: type === 'balance' ? newVal : newBalance,
        };

        await update(ref(db), updates);

        // Optimistic state sync
        setAllUsersList(prev =>
          prev.map(u => {
            if (u.uid !== targetUid) return u;
            return {
              ...u,
              [type]: newVal,
              balance: type === 'balance' ? newVal : newBalance,
            };
          })
        );

        showToast(`Balance updated for user (${amount > 0 ? '+' : ''}₹${amount})`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to update balance', 'danger');
      }
    },
    [allUsersList, showToast]
  );

  const toggleUserStatusByAdmin = useCallback(
    async (targetUid: string) => {
      try {
        const uSnap = await get(ref(db, `users/${targetUid}`));
        const current = uSnap.exists()
          ? uSnap.val().status || 'active'
          : (allUsersList.find(u => u.uid === targetUid)?.status || 'active');

        const next = current === 'active' ? 'blocked' : 'active';
        await update(ref(db, `users/${targetUid}`), { status: next });

        setAllUsersList(prev =>
          prev.map(u => (u.uid === targetUid ? { ...u, status: next } : u))
        );

        showToast(`User marked as ${next}.`, 'info');
      } catch (err: any) {
        showToast(err.message || 'Failed to change user status', 'danger');
      }
    },
    [allUsersList, showToast]
  );

  const deleteUserByAdmin = useCallback(
    async (targetUid: string) => {
      try {
        await remove(ref(db, `users/${targetUid}`));
        setAllUsersList(prev => prev.filter(u => u.uid !== targetUid));
        showToast('User record deleted from database.', 'warning');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete user', 'danger');
      }
    },
    [showToast]
  );

  const seedDemoData = useCallback(async () => {
    showToast('Live database is active. Demo seeding is permanently disabled to protect real data.', 'info');
  }, [showToast]);

  // Admin Security System (One-Time Signup & Subsequent Login Session)
  const setupAdminSecurity = useCallback(
    async (config: { username: string; password: string; pin: string; adminName: string }) => {
      const cleanUsername = config.username.trim().toLowerCase();
      const cleanPin = config.pin.trim();
      const data: AdminSecurityConfig = {
        isConfigured: true,
        username: cleanUsername,
        passwordHash: btoa(config.password),
        pin: cleanPin,
        adminName: config.adminName.trim() || 'Admin Master',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      await set(ref(db, 'adminSecurity'), data);
      setAdminSecurity(data);
      try {
        sessionStorage.setItem('esports_admin_session_auth', 'unlocked');
      } catch {}
      setIsAdminSessionUnlocked(true);
      showToast('Admin Security Master Key created! Session unlocked.', 'success');
    },
    [showToast]
  );

  const loginAdminSecurity = useCallback(
    async (credential: string, isPin = false) => {
      const secSnap = await get(ref(db, 'adminSecurity'));
      const sec: AdminSecurityConfig | null = secSnap.exists() ? secSnap.val() : adminSecurity;

      if (!sec || !sec.isConfigured) {
        showToast('Admin security not configured yet. Complete initial setup.', 'warning');
        return false;
      }

      const input = credential.trim();
      let matched = false;

      if (isPin) {
        matched = input === sec.pin;
      } else {
        matched = input === sec.passwordHash || btoa(input) === sec.passwordHash;
      }

      if (!matched) {
        showToast(isPin ? 'Incorrect 4-digit PIN.' : 'Invalid Admin Master Password.', 'danger');
        return false;
      }

      await update(ref(db, 'adminSecurity'), { lastLoginAt: Date.now() });
      try {
        sessionStorage.setItem('esports_admin_session_auth', 'unlocked');
      } catch {}
      setIsAdminSessionUnlocked(true);
      showToast(`Welcome back, ${sec.adminName || 'Admin'}! Session unlocked.`, 'success');
      return true;
    },
    [adminSecurity, showToast]
  );

  const lockAdminSession = useCallback(() => {
    try {
      sessionStorage.removeItem('esports_admin_session_auth');
    } catch {}
    setIsAdminSessionUnlocked(false);
    showToast('Admin Console session locked.', 'info');
  }, [showToast]);

  const updateAdminSecurity = useCallback(
    async (newConfig: Partial<AdminSecurityConfig>) => {
      const payload: Partial<AdminSecurityConfig> = { ...newConfig };
      if (newConfig.passwordHash && !newConfig.passwordHash.includes('=')) {
        payload.passwordHash = btoa(newConfig.passwordHash);
      }
      await update(ref(db, 'adminSecurity'), payload);
      showToast('Admin security credentials updated.', 'success');
    },
    [showToast]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isLoading,
        loginWithMobile,
        registerWithMobile,
        logout,
        updateInGameName,
        updateProfileAvatar,
        settings,
        activeTheme,
        userThemeOverride,
        setPersonalTheme,
        resetPersonalTheme,
        updateAdminSettings,
        games,
        promotions,
        tournaments,
        transactions,
        paymentMethods,
        paymentIds,
        notifications,
        unreadNotifCount,
        readNotifIds,
        markNotificationAsRead,
        markNotificationsAsRead,
        currentView,
        navigate,
        selectedGameFilter,
        setSelectedGameFilter,
        joinSoloTournament,
        registerScrimTeam,
        submitDepositRequest,
        redeemPaymentId,
        submitWithdrawalRequest,
        convertWinningToDeposit,
        convertPendingWithdrawalToDeposit,
        applyReferralCode,
        chatMessages,
        sendUserChatMessage,
        sendAdminChatMessage,
        activeSupportUserId,
        setActiveSupportUserId,
        allSupportThreads,
        addOrUpdateGame,
        deleteGame,
        addOrUpdatePromotion,
        deletePromotion,
        addOrUpdateTournament,
        deleteTournament,
        postMatchResults,
        distributeWinnings,
        autoDistributeAllWinnings,
        processDepositRequest,
        processWithdrawalRequest,
        transferCoinsToPlayer,
        allBillInvoices,
        createBillInvoice,
        processBillInvoice,
        deleteBillInvoice,
        addPaymentMethod,
        deletePaymentMethod,
        generatePaymentId,
        deletePaymentId,
        sendBroadcastNotification,
        deleteNotification,
        updateUserBalanceByAdmin,
        toggleUserStatusByAdmin,
        deleteUserByAdmin,
        allUsersList,
        allDepositRequests,
        allWithdrawals,
        seedDemoData,
        adminSecurity,
        isAdminSessionUnlocked,
        setupAdminSecurity,
        loginAdminSecurity,
        lockAdminSession,
        updateAdminSecurity,
        toastMessage,
        showToast,
        playAudioBeep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const useAppContext = useApp;
