export type TournamentMode = 'Solo' | 'Duo' | 'Squad' | 'Scrim';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'result' | 'cancelled';
export type TransactionType =
  | 'deposit_approved'
  | 'payment_id_redeem'
  | 'tournament_join'
  | 'scrim_slot_booking'
  | 'tournament_winnings'
  | 'referral_bonus'
  | 'signup_bonus'
  | 'withdraw_request'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'withdrawal_refund'
  | 'join_failed_refund'
  | 'coin_transfer_sent'
  | 'coin_transfer_received'
  | 'admin_deposit'
  | 'admin_deduction'
  | 'admin_winning_add'
  | 'admin_winning_deduct'
  | 'admin_bonus_add'
  | 'admin_bonus_deduct';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  mobile?: string;
  phoneNumber?: string;
  gameName?: string;
  gameUid?: string;
  photoURL?: string | null;
  balance: number;
  winningCash: number;
  bonusCash: number;
  totalMatches: number;
  wonMatches: number;
  totalEarnings: number;
  referralEarnings: number;
  referralCode: string;
  referredBy?: string | null;
  referredAt?: number;
  referralRewardClaimed?: boolean;
  hasDeposited?: boolean;
  hasJoinedTournament?: boolean;
  joinedTournaments?: Record<string, boolean>;
  isAdmin?: boolean;
  status: 'active' | 'blocked';
  winStreak?: number;
  bestStreak?: number;
  mvpBadges?: string[];
  createdAt: number;
}

export interface GameGfxTheme {
  presetId?: string;
  themeColor: string; // e.g. '#FF5722', '#F59E0B', '#06B6D4'
  secondaryColor?: string;
  fontStyle?: 'military' | 'cyber' | 'inferno' | 'royal' | 'glacier' | 'crimson' | 'standard';
  tagline?: string; // e.g. "SURVIVAL BATTLE ROYALE", "TACTICAL HARDCORE"
  bgGradient?: string;
  glowColor?: string;
  overlayPattern?: 'hexagons' | 'grid' | 'sparks' | 'hazard' | 'lines' | 'none';
  badgeStyle?: 'stencil' | 'neon' | 'gold_shield' | 'flame' | 'clean';
}

export interface Game {
  id: string;
  name: string;
  imageUrl: string;
  bannerUrl?: string;
  order?: number;
  gfxTheme?: GameGfxTheme;
  createdAt?: number;
  updatedAt?: number;
}

export interface Promotion {
  id: string;
  imageUrl: string;
  link?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface ScrimSlot {
  slotNumber: number;
  teamName: string;
  teamTag: string;
  logoUrl?: string;
  captainName: string;
  captainMobile?: string;
  captainUid?: string;
  players?: string[];
  dropSpot?: string;
  joinedAt?: number;
}

export interface ScrimGroup {
  groupName: string; // e.g. "Group A", "Group B", "Group C"
  slots: Record<string, ScrimSlot>;
}

export interface TournamentResult {
  uid?: string;
  position: number;
  name: string;
  gameName?: string;
  kills: number;
  winnings: number;
}

export interface ResultsEditHistoryItem {
  id: string;
  editedAt: number;
  editedBy: string;
  reason: string;
  previousResults: TournamentResult[];
  newResults: TournamentResult[];
  previousPrizeTotal?: number;
  newPrizeTotal?: number;
  summary?: string;
}

export interface Tournament {
  id: string;
  gameId: string;
  name: string;
  bannerUrl?: string | null;
  mode: TournamentMode;
  startTime: number;
  status: TournamentStatus;
  entryFee: number;
  prizePool: number;
  perKillPrize: number;
  maxPlayers: number;
  tags?: string[];
  description?: string;
  roomId?: string | null;
  roomPassword?: string | null;
  showIdPass?: boolean;
  createdAt?: number;
  updatedAt?: number;
  registeredPlayers?: Record<string, { joinedAt: number; gameName?: string; teamName?: string }>;
  results?: TournamentResult[];
  resultsEditHistory?: ResultsEditHistoryItem[];
  winningsDistributed?: boolean;
  distributedAt?: number;
  totalDistributed?: number;
  payoutRecipientsCount?: number;
  // Scrim-specific fields
  isScrim?: boolean;
  slotCount?: 12 | 13 | 14 | 15 | 20 | 25;
  dropMap?: string; // "Erangel" | "Miramar" | "Sanhok" | "Bermuda" | "Kalahari" | etc.
  liveStreamUrl?: string; // YouTube, Twitch, Facebook Gaming URL
  scrimTotalMatches?: number; // Total matches count (e.g. 3, 4, 5)
  scrimMapsSchedule?: string; // Match by match map details (e.g. "Match 1: Erangel • Match 2: Miramar • Match 3: Sanhok")
  scrimCustomRules?: string; // Manual rules, ping limits, scoring system
  scrimSlots?: Record<string, ScrimSlot>; // slot index -> ScrimSlot
  scrimGroups?: Record<string, ScrimGroup>; // for >15 slots: Group A, Group B, Group C
}

export interface DepositInvoiceDetails {
  depositId: string; // Unique deposit ID e.g. "DEP-2026-9812"
  invoiceNumber: string; // Official invoice number e.g. "INV-9812"
  methodName: string; // e.g. "Easypaisa", "JazzCash"
  receivingAccount: string;
  accountHolder: string;
  amount: number;
  methodLogo?: string;
  billName?: string;
  qrCodeUrl?: string;
  generatedAt: number;
}

export interface DepositRequest {
  id: string;
  depositId?: string; // Unique deposit tracking ID e.g. DEP-2026-9812
  invoiceNumber?: string; // Official invoice number
  userId: string;
  userName: string;
  userEmail?: string;
  amount: number;
  screenshotUrl: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: number;
  processedAt?: number;
  invoiceDetails?: DepositInvoiceDetails;
}


export interface WithdrawalReceiptDetails {
  sentByName: string; // Name he sent by (e.g. Shamroz Khan, Admin)
  appName: string; // App name used to send (Easypaisa, JazzCash, SadaPay, etc.)
  sentWithNumber: string; // The number he sent with (e.g. 03128017777)
  transactionRef?: string;
  generatedAt?: number;
  receiptNote?: string;
}

export interface AdminSecurityConfig {
  isConfigured: boolean;
  username: string;
  passwordHash: string;
  pin: string;
  adminName: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface BillInvoice {
  id: string;
  invoiceNumber: string;
  billName: string; // e.g. "Official Tournament Entry Bill", "VIP Scrim Slot Invoice"
  appName: string; // "app name" (e.g. Easypaisa, JazzCash, SadaPay, etc.)
  accountNumber: string; // "there account number"
  accountName: string; // "there name"
  amount: number;
  billLogo?: string; // "the bill logo (optional)"
  qrCodeUrl?: string; // "there qr code for the Payment (optional)"
  recipientUserId?: string; // optional linked registered player ID
  recipientName?: string; // optional customer or player name
  recipientPhone?: string; // optional customer phone
  note?: string; // optional instructions
  status: 'pending' | 'completed' | 'rejected'; // verification system identical to deposit function
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
  confirmationNote?: string;
  paymentProofUrl?: string;
  transactionRef?: string;
}


export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  amount: number;
  methodDetails: {
    methodName: string;
    accountInfo: string;
  };
  status: 'pending' | 'completed' | 'rejected' | 'converted_to_deposit';
  requestTimestamp: number;
  processedAt?: number;
  processedBy?: string;
  adminNote?: string;
  rejectReason?: string;
  receiptDetails?: WithdrawalReceiptDetails;
}

export const OFFICIAL_MAPS = [
  'Bermuda',
  'Purgatory',
  'Nextera',
  'Kalahari',
  'Solara',
  'Bermuda',
] as const;

export const UNIQUE_OFFICIAL_MAPS = [
  'Bermuda',
  'Purgatory',
  'Nextera',
  'Kalahari',
  'Solara',
] as const;

export type OfficialMapName = (typeof OFFICIAL_MAPS)[number];

export interface PaymentMethod {
  id: string;
  name: string;
  logoUrl: string;
  type?: string;
  accountName?: string;
  accountNumber?: string;
  accountDetails: string;
  qrCodeUrl?: string;
  enabled: boolean;
}

export interface PaymentId {
  id: string;
  amount: number;
  status: 'available' | 'used';
  createdAt: number;
  usedBy?: string;
  usedAt?: number;
}

export interface Transaction {
  id?: string;
  type: string;
  amount: number;
  timestamp: number;
  description: string;
  status?: string;
  balanceAfter?: number;
  adminUid?: string;
  tournamentId?: string;
  withdrawalId?: string;
}

export interface AppSettings {
  appName: string;
  logoUrl: string;
  minWithdraw: number;
  minDeposit?: number; // Minimum deposit amount required (e.g. 50 PKR)
  referralBonus: number; // Referrer earnings
  referralRefereeBonus?: number; // Welcome bonus for referee/friend
  referralMinDeposit?: number; // Min deposit required if applicable (e.g. 0 for instant)
  referralEnabled?: boolean; // Referral system toggle
  referralTermsText?: string; // Referral instructions & terms
  supportContact: string; // WhatsApp number
  upiDetails: string; // JazzCash / EasyPaisa / UPI account
  jazzCashName: string;
  jazzCashNumber?: string;
  easyPaisaName?: string;
  easyPaisaNumber?: string;
  policyPrivacy: string;
  policyTerms: string;
  policyRefund: string;
  policyFairPlay: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  currentTheme: ThemeId;
  userThemeOverrideEnabled?: boolean;
  lastUpdated?: number;
}

export interface SupportMessage {
  id?: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
  senderName: string;
}

export interface SupportChatMeta {
  userId: string;
  userName: string;
  userMobile: string;
  lastMessage: string;
  lastUpdated: number;
  unreadByAdmin: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  target: 'all' | TournamentMode | string;
  matchType?: TournamentMode | 'all';
  timestamp: number;
  sentBy: string;
}

export type ThemeId =
  | 'normal'
  | 'independence'
  | 'war'
  | 'islamic'
  | 'blackday'
  | 'monster'
  | 'ramadan'
  | 'cyberpunk'
  | 'sakura'
  | 'sunset'
  | 'arctic'
  | 'matrix'
  | 'desert'
  | 'royal'
  | 'minimal';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  previewColors: [string, string, string]; // bg, accent, border
  isDark: boolean;
}

export const THEMES_LIST: ThemeDefinition[] = [
  {
    id: 'normal',
    name: 'Normal Day (Black & Gold)',
    description: 'Classic championship gold accents on rich obsidian black glassmorphism.',
    previewColors: ['#000000', '#FFD700', '#996515'],
    isDark: true,
  },
  {
    id: 'independence',
    name: 'Independence Day (Green & White)',
    description: 'Crisp daylight frosted white surface with vibrant Pakistan green glow.',
    previewColors: ['#F8F9FA', '#22C55E', '#DEE2E6'],
    isDark: false,
  },
  {
    id: 'war',
    name: 'War Day (Tactical Night Vision)',
    description: 'Dark military tactical olive camo with lime phosphor night-vision glow.',
    previewColors: ['#0A0F09', '#32CD32', '#1B2319'],
    isDark: true,
  },
  {
    id: 'islamic',
    name: 'Islamic Day (Emerald & Light Gold)',
    description: 'Deep royal emerald teal paired with soft luminous golden highlights.',
    previewColors: ['#002923', '#A2D5C6', '#013D32'],
    isDark: true,
  },
  {
    id: 'blackday',
    name: 'Black Day (Crimson & Dark Onyx)',
    description: 'Intense crimson red neon accents on deep obsidian darkness.',
    previewColors: ['#000000', '#FF073A', '#660000'],
    isDark: true,
  },
  {
    id: 'monster',
    name: 'Monster (Crimson Blood & Beast)',
    description: 'Aggressive beast blood-red gradients on sharp obsidian panels.',
    previewColors: ['#070202', '#FF1E27', '#7F1D1D'],
    isDark: true,
  },
  {
    id: 'ramadan',
    name: 'Ramadan (Midnight Blue & Silver)',
    description: 'Serene midnight blue heavens with pure silver moonlight radiance.',
    previewColors: ['#001F3F', '#FFFFFF', '#002B54'],
    isDark: true,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon (Violet & Electric Cyan)',
    description: 'High-octane neon cyber arena with electric cyan and magenta lasers.',
    previewColors: ['#0B0813', '#00F0FF', '#7928CA'],
    isDark: true,
  },
  {
    id: 'sakura',
    name: 'Sakura Blossom (Slate & Soft Rose)',
    description: 'Refined charcoal slate with elegant cherry blossom pink accents.',
    previewColors: ['#0F1117', '#FB7185', '#334155'],
    isDark: true,
  },
  {
    id: 'sunset',
    name: 'Sunset Vapor (Indigo & Warm Coral)',
    description: 'Tropical dusk sky with radiant coral and warm sunset amber.',
    previewColors: ['#0C0E1A', '#FF6B6B', '#3B2D54'],
    isDark: true,
  },
  {
    id: 'arctic',
    name: 'Arctic Frost (Glacial Navy & Ice Blue)',
    description: 'Ultra-cool glacial navy glass with crystal ice blue frost.',
    previewColors: ['#07111E', '#38BDF8', '#1E3A5F'],
    isDark: true,
  },
  {
    id: 'matrix',
    name: 'Matrix Terminal (Pure Pitch & Lime)',
    description: 'Tactical hacker console with phosphor matrix green illumination.',
    previewColors: ['#030704', '#00FF66', '#0E3A1C'],
    isDark: true,
  },
  {
    id: 'desert',
    name: 'Desert Mirage (Sand & Burnt Sienna)',
    description: 'Warm arid dunes with rich terracotta and burnished bronze accents.',
    previewColors: ['#120D08', '#F59E0B', '#5A381E'],
    isDark: true,
  },
  {
    id: 'royal',
    name: 'Royal Velvet (Amethyst & Crown Gold)',
    description: 'Majestic imperial amethyst velvet framed with regal crown gold.',
    previewColors: ['#140824', '#FBBF24', '#4C1D95'],
    isDark: true,
  },
  {
    id: 'minimal',
    name: 'Clean Minimalist (Monochrome Studio)',
    description: 'Ultra-clean dark studio slate with pure monochromatic steel precision.',
    previewColors: ['#121417', '#E2E8F0', '#2D3748'],
    isDark: true,
  },
];
