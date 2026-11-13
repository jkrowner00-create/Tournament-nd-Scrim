import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  push,
  onValue,
  off,
  remove,
  serverTimestamp,
  Database,
} from 'firebase/database';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import type {
  UserProfile,
  Game,
  Promotion,
  Tournament,
  DepositRequest,
  WithdrawalRequest,
  PaymentMethod,
  PaymentId,
  AppSettings,
  SupportMessage,
  SupportChatMeta,
  NotificationItem,
  Transaction,
} from '../types';

export const firebaseConfig = {
  apiKey: 'AIzaSyCFwn_NBdDOLpEhAbwAjJpSn-pE1_E2-64',
  authDomain: 'ssbattleapp.firebaseapp.com',
  projectId: 'ssbattleapp',
  storageBucket: 'ssbattleapp.firebasestorage.app',
  messagingSenderId: '956310671836',
  appId: '1:956310671836:web:741ce171b03b531e29ff19',
  measurementId: 'G-ZRXRSSD996',
  databaseURL: 'https://ssbattleapp-default-rtdb.firebaseio.com',
};

// Initialize Firebase App
let app: FirebaseApp;
let db: Database;
let auth: Auth;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase init warning:', error);
  // Fallback instance
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
}

export { app, db, auth, ref, get, set, update, push, onValue, off, remove, serverTimestamp };
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
export type { User };

// Default app settings matching the live Firebase Realtime Database
export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: 'SS BATTLE APP',
  logoUrl: 'https://i.ibb.co/n5MmBPX/IMG-20260926-WA0035.jpg',
  minWithdraw: 100,
  minDeposit: 50,
  referralBonus: 0,
  referralRefereeBonus: 0,
  referralMinDeposit: 0,
  referralEnabled: true,
  referralTermsText: 'Share your referral code with friends and earn rewards when they join!',
  supportContact: '+92 3709892708',
  upiDetails: '',
  jazzCashName: '',
  policyPrivacy: "Don't show your id pass & otp with others",
  policyTerms: "Play fair & don't use therd party app for better gameplay",
  policyRefund: "Refund only with easypassa customer service if not from there then contact 03128017777 what's app",
  policyFairPlay: "Only fair players allowed , hackers will be permanently baned",
  maintenanceMode: false,
  maintenanceNotice:
    'System Update in Progress\n\nWe are currently fixing bugs and resolving errors. Please bear with us.\n\nThank you for your patience.',
  currentTheme: 'monster',
  userThemeOverrideEnabled: true,
};

// No fake sample or seed data - all records are loaded exclusively from the live database
export const DEFAULT_GAMES: Game[] = [];
export const DEFAULT_PROMOTIONS: Promotion[] = [];
export const DEFAULT_TOURNAMENTS: Tournament[] = [];
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [];
export const DEFAULT_PAYMENT_IDS: PaymentId[] = [];
export const DEFAULT_USERS: UserProfile[] = [];
