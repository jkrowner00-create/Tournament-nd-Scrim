import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { WalletModal } from '../components/WalletModal';
import { ReceiptModal } from '../components/ReceiptModal';
import type { Transaction } from '../types';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Ticket,
  Clock,
  History,
  ShieldCheck,
  Send,
  FileText,
} from 'lucide-react';

export const WalletView: React.FC = () => {
  const { userProfile, transactions, currentUser } = useAppContext();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'deposit' | 'withdraw' | 'paymentId' | 'share'>('deposit');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  const openModal = (tab: 'deposit' | 'withdraw' | 'paymentId' | 'share') => {
    setInitialTab(tab);
    setWalletModalOpen(true);
  };

  const totalBalance = userProfile?.balance || 0;
  const winningCash = userProfile?.winningCash || 0;
  const bonusCash = userProfile?.bonusCash || 0;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    if (filterType === 'deposit')
      return t.type.includes('deposit') || t.type.includes('payment_id');
    if (filterType === 'withdraw') return t.type.includes('withdraw');
    if (filterType === 'transfer')
      return t.type.includes('transfer');
    if (filterType === 'match')
      return t.type.includes('tournament') || t.type.includes('scrim');
    return true;
  });

  return (
    <div className="min-w-0 max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Wallet Master Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="tournament-card-animated relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[var(--surface-color)] via-[var(--card-bg)] to-[var(--bg-main)] shadow-2xl overflow-hidden mb-6"
      >
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1">
              <Wallet size={14} className="text-[var(--primary-color)]" /> Esports Championship Wallet
            </div>
            <div className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight flex items-baseline gap-1 tabular-nums">
              <span className="text-2xl md:text-3xl text-[var(--primary-color)] font-normal">₹</span>
              <span>{totalBalance.toLocaleString()}</span>
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[var(--success-color)]" /> 100% Secure Instant Payouts & Automated Ledger
            </div>
          </div>

          {/* Sub Balances (Winning & Bonus) */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-[var(--surface-color)]/80 border border-[var(--success-color)]/30 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--success-color)] uppercase tracking-wider">
                <ArrowUpRight size={14} /> Winning Cash
              </div>
              <div className="text-lg md:text-xl font-black text-[var(--text-primary)] mt-0.5 tabular-nums">
                ₹{winningCash.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">Available for Withdrawal</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface-color)]/80 border border-[var(--warning-color)]/30 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--warning-color)] uppercase tracking-wider">
                <Gift size={14} /> Bonus Cash
              </div>
              <div className="text-lg md:text-xl font-black text-[var(--text-primary)] mt-0.5 tabular-nums">
                ₹{bonusCash.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">For Match Entry Discount</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-[var(--border-color)]/60">
          <button
            onClick={() => openModal('deposit')}
            className="min-h-[46px] py-2.5 px-2.5 rounded-2xl btn-accent text-xs md:text-sm font-extrabold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer group"
          >
            <ArrowDownLeft size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Deposit Cash</span>
          </button>

          <button
            onClick={() => openModal('withdraw')}
            className="min-h-[46px] py-2.5 px-2.5 rounded-2xl btn-theme-soft text-xs md:text-sm font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer group"
          >
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <span>Withdraw Cash</span>
          </button>

          <button
            onClick={() => openModal('share')}
            className="min-h-[46px] py-2.5 px-2.5 rounded-2xl btn-theme-soft text-xs md:text-sm font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer group"
          >
            <Send size={15} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Share Coins</span>
          </button>

          <button
            onClick={() => openModal('paymentId')}
            className="min-h-[46px] py-2.5 px-2.5 rounded-2xl btn-theme-outline text-xs md:text-sm font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer group"
          >
            <Ticket size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Redeem ID</span>
          </button>
        </div>
      </motion.div>

      {/* Passbook / History Section */}
      <div className="rounded-3xl p-6 bg-[var(--surface-color)] border border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[var(--primary-color)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Transaction Passbook
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'deposit', label: 'Deposits' },
              { id: 'withdraw', label: 'Withdrawals' },
              { id: 'transfer', label: 'Transfers' },
              { id: 'match', label: 'Matches' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3.5 min-h-[34px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                  filterType === f.id ? 'btn-accent' : 'btn-theme-outline'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {!currentUser ? (
          <div className="text-center py-12 text-[var(--text-muted)] text-sm">
            Please log in to view your personalized wallet passbook and ledger history.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)] text-sm">
            No transactions found under this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx, idx) => {
              const isPositive = (tx.amount || 0) > 0;
              const dateStr = new Date(tx.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={tx.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.25), ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--glow-color-1)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isPositive
                          ? 'bg-[var(--success-color)]/15 text-[var(--success-color)] border border-[var(--success-color)]/35'
                          : 'bg-[var(--danger-color)]/15 text-[var(--danger-color)] border border-[var(--danger-color)]/35'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {tx.description || tx.type}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> {dateStr}
                        {tx.status && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                              tx.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right tabular-nums">
                      <div
                        className={`text-sm md:text-base font-black ${
                          isPositive ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'
                        }`}
                      >
                        {isPositive ? '+' : ''}₹{Math.abs(tx.amount || 0)}
                      </div>
                      {tx.balanceAfter !== undefined && (
                        <div className="text-[10px] text-[var(--text-muted)]">
                          Bal: ₹{tx.balanceAfter}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedReceiptTx(tx)}
                      className="w-10 h-10 rounded-xl btn-theme-outline flex items-center justify-center cursor-pointer"
                      title="View Digital Receipt"
                    >
                      <FileText size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceiptTx && (
        <ReceiptModal
          transaction={selectedReceiptTx}
          onClose={() => setSelectedReceiptTx(null)}
        />
      )}

      {/* Wallet Modal */}
      {walletModalOpen && (
        <WalletModal
          initialTab={initialTab}
          onClose={() => setWalletModalOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletView;
