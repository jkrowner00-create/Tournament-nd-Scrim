/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { MaintenanceOverlay } from './components/MaintenanceOverlay';
import { LiveSupportModal } from './components/LiveSupportModal';
import { NotificationModal } from './components/NotificationModal';

import HomeView from './views/HomeView';
import TournamentsView from './views/TournamentsView';
import WalletView from './views/WalletView';
import LeaderboardView from './views/LeaderboardView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';
import NotFoundView from './views/NotFoundView';

import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

import { BillInvoiceModal } from './components/BillInvoiceModal';
import type { BillInvoice } from './types';
import { ref, get } from 'firebase/database';
import { db } from './services/firebase';

const AppContent: React.FC = () => {
  const { currentView, toastMessage, allBillInvoices, settings } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [urlInvoice, setUrlInvoice] = useState<BillInvoice | null>(null);

  // If path is /adminn, redirect to standalone admin panel
  React.useEffect(() => {
    if (window.location.pathname === '/adminn' || window.location.pathname === '/adminn/') {
      window.location.replace('/adminn/index.html');
    }
  }, []);

  // Listen to ?invoice= or ?bill= in URL params to auto-open the official bill invoice
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceId = params.get('invoice') || params.get('bill');
    if (!invoiceId) return;

    // Check in loaded bill invoices first
    const found = allBillInvoices.find(
      i => i.id === invoiceId || i.invoiceNumber === invoiceId
    );
    if (found) {
      setUrlInvoice(found);
      setShowSplash(false);
    } else {
      // Direct Firebase lookup
      get(ref(db, `billInvoices/${invoiceId}`)).then(snap => {
        if (snap.exists()) {
          setUrlInvoice({ id: snap.key!, ...snap.val() } as BillInvoice);
          setShowSplash(false);
        }
      });
    }
  }, [allBillInvoices]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--primary-color)] selection:text-black">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}

      {/* Maintenance Overlay if active */}
      <MaintenanceOverlay />

      {/* Esports Top Header */}
      <Header
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenNotifications={() => setIsNotifsOpen(true)}
      />

      {/* Main View Router */}
      <main className="pt-[68px] min-h-screen">
        {currentView === 'home' && <HomeView />}
        {currentView === 'tournaments' && <TournamentsView />}
        {currentView === 'wallet' && <WalletView />}
        {currentView === 'leaderboard' && <LeaderboardView />}
        {currentView === 'profile' && <ProfileView />}
        {(currentView === 'admin' || currentView === 'adminn') && <AdminView />}
        {![
          'home',
          'tournaments',
          'wallet',
          'leaderboard',
          'profile',
          'admin',
          'adminn',
        ].includes(currentView) && <NotFoundView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] pointer-events-none animate-bounce-in">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 text-xs sm:text-sm font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/40 shadow-amber-950/50'
                : toastMessage.type === 'danger'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-950/50'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/60 shadow-slate-950/50'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />}
            {toastMessage.type === 'danger' && <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />}
            {toastMessage.type === 'info' && <Info size={18} className="text-sky-400 flex-shrink-0" />}
            <span className="leading-snug">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Live Support Chat Modal */}
      {isSupportOpen && <LiveSupportModal onClose={() => setIsSupportOpen(false)} />}

      {/* In-App Notifications Modal */}
      {isNotifsOpen && <NotificationModal onClose={() => setIsNotifsOpen(false)} />}

      {/* Direct URL Shareable Bill Invoice Modal */}
      {urlInvoice && (
        <BillInvoiceModal
          isOpen={true}
          invoice={urlInvoice}
          onClose={() => setUrlInvoice(null)}
          platformName={settings.appName || 'SS BATTLE APP'}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
