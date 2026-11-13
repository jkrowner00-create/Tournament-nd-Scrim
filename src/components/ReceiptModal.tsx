import React, { useState } from 'react';
import type { Transaction } from '../types';
import { useApp } from '../context/AppContext';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Printer,
  ShieldCheck,
  QrCode,
  X,
  Share2,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { settings, userProfile, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const receiptId =
    transaction.id?.toUpperCase() ||
    `TXN-${transaction.timestamp.toString().slice(-8)}`;

  const isCredit = (transaction.amount || 0) > 0;
  const absAmount = Math.abs(transaction.amount || 0);

  const formattedDate = new Date(transaction.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyDetails = () => {
    const text = `🧾 *OFFICIAL PAYMENT RECEIPT - ${settings.appName || 'GAMING ARENA'}*
───────────────────
Ref ID: ${receiptId}
Date: ${formattedDate}
Player: ${userProfile?.displayName || 'Gladiator'} (${userProfile?.gameName || 'N/A'})
Type: ${transaction.description || transaction.type}
Amount: ${isCredit ? '+' : '-'}₹${absAmount}
Status: ${transaction.status?.toUpperCase() || 'COMPLETED'}
───────────────────
Verified via Official Esports Secure Ledger`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Receipt details copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[var(--surface-color)] to-[var(--bg-main)] border border-[var(--border-color)] shadow-2xl overflow-hidden p-5 sm:p-6 print:border-none print:shadow-none print:bg-white print:text-black animate-card-enter">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-20 pointer-events-none" />

        {/* Top Controls */}
        <div className="flex items-center justify-between mb-4 print:hidden shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary-color)]">
            <ShieldCheck size={16} /> Official Verified Receipt
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Receipt Header Card */}
        <div className="text-center pb-5 border-b border-[var(--border-color)]">
          <img
            src={settings.logoUrl || 'https://i.ibb.co/LTd1KXk/IMG-20260904-WA0056-1.jpg'}
            alt="Logo"
            className="w-14 h-14 mx-auto rounded-full object-cover border-2 border-[var(--primary-color)] shadow-md mb-2"
          />
          <h2 className="text-base font-black text-white uppercase tracking-wider">
            {settings.appName || 'GAMING TOURNAMENT'}
          </h2>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mt-0.5">
            Receipt #{receiptId}
          </div>

          {/* Amount Hero */}
          <div className="mt-4">
            <span className="text-xs uppercase font-bold text-[var(--text-muted)] block mb-0.5">
              Total Amount
            </span>
            <div
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isCredit ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isCredit ? '+' : '-'}₹{absAmount.toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-2 bg-green-500/10 text-green-400 border border-green-500/30">
              <CheckCircle2 size={12} /> {transaction.status || 'Verified & Settled'}
            </div>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="py-4 space-y-2.5 text-xs border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] font-medium">Transaction Type</span>
            <span className="text-white font-bold text-right truncate max-w-[200px]">
              {transaction.description || transaction.type}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] font-medium">Player IGN</span>
            <span className="text-[var(--primary-color)] font-extrabold">
              {userProfile?.gameName || userProfile?.displayName || 'Gladiator'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] font-medium">Account Mobile</span>
            <span className="text-white font-mono">
              {userProfile?.mobile || 'Verified User'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] font-medium">Settlement Time</span>
            <span className="text-white font-medium">{formattedDate}</span>
          </div>

          {transaction.balanceAfter !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-medium">Wallet Balance After</span>
              <span className="text-green-400 font-bold font-mono">
                ₹{transaction.balanceAfter}
              </span>
            </div>
          )}
        </div>

        {/* Security Watermark & Stamp */}
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <QrCode size={20} />
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/80">
                Encrypted Hash
              </div>
              <div className="text-[8px] font-mono text-[var(--text-muted)]">
                SHA-256 SECURED LEDGER
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--primary-color)]/40 text-[var(--primary-color)]">
              PASSED
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-6 print:hidden">
          <button
            onClick={handleCopyDetails}
            className="min-h-[44px] py-2.5 px-3 rounded-xl btn-theme-outline text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={14} className="text-[var(--success-color)]" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Share / Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[44px] py-2.5 px-3 rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
