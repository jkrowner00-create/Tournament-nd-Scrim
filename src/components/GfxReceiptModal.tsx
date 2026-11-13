import React, { useState, useEffect } from 'react';
import type { WithdrawalReceiptDetails } from '../types';
import {
  generateWithdrawalReceiptCanvas,
  downloadDataUrl,
} from '../services/gfxGenerator';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Receipt,
  Smartphone,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export interface GfxReceiptModalData {
  withdrawalId?: string;
  amount: number | string;
  sentByName: string; // "Name he sent by"
  appName: string; // "app name"
  sentWithNumber: string; // "the number he sent with"
  recipientName: string;
  recipientAccount: string;
  transactionRef: string;
  note?: string;
  isPending?: boolean;
}

interface GfxReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: GfxReceiptModalData;
  onApproveAndSave?: (receiptDetails: WithdrawalReceiptDetails) => Promise<void>;
  platformName?: string;
}

export const GfxReceiptModal: React.FC<GfxReceiptModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onApproveAndSave,
  platformName = 'SS BATTLE APP',
}) => {
  if (!isOpen) return null;

  // Form Fields as explicitly requested:
  // 1. Amount
  // 2. Name he sent by
  // 3. App name
  // 4. The number he sent with
  const [amount, setAmount] = useState(initialData.amount);
  const [sentByName, setSentByName] = useState(initialData.sentByName || 'Shamroz Khan (SS BATTLE)');
  const [appName, setAppName] = useState(initialData.appName || 'Easypaisa');
  const [sentWithNumber, setSentWithNumber] = useState(initialData.sentWithNumber || '03128017777');
  const [recipientName, setRecipientName] = useState(initialData.recipientName || 'Player');
  const [recipientAccount, setRecipientAccount] = useState(initialData.recipientAccount || '—');
  const [transactionRef, setTransactionRef] = useState(
    initialData.transactionRef || `SSB-WD-${Date.now().toString().slice(-7)}`
  );
  const [note, setNote] = useState(initialData.note || 'Tournament Payout Approved');

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Popular quick app options in Pakistan / Region
  const popularApps = ['Easypaisa', 'JazzCash', 'SadaPay', 'NayaPay', 'Bank Transfer', 'SS BATTLE APP'];

  // Re-generate Canvas Data URL on any input change
  useEffect(() => {
    const dataUrl = generateWithdrawalReceiptCanvas({
      amount,
      sentByName,
      appName,
      sentWithNumber,
      recipientName,
      recipientAccount,
      transactionRef,
      dateStr: new Date().toLocaleString(),
      note,
      platformName,
    });
    setPreviewDataUrl(dataUrl);
  }, [
    amount,
    sentByName,
    appName,
    sentWithNumber,
    recipientName,
    recipientAccount,
    transactionRef,
    note,
    platformName,
  ]);

  // Download high-resolution PNG image
  const handleDownloadImage = () => {
    if (!previewDataUrl) return;
    const filename = `GFX-Receipt-${transactionRef || 'payout'}.png`;
    downloadDataUrl(previewDataUrl, filename);
  };

  // Copy formatted WhatsApp announcement text
  const handleCopyWhatsAppText = () => {
    const text = `🟢 *${platformName.toUpperCase()} • OFFICIAL WITHDRAWAL RECEIPT* 🟢
━━━━━━━━━━━━━━━━━━━━━━
💰 *Amount Sent:* Rs. ${Number(String(amount).replace(/[^0-9.]/g, '') || amount).toLocaleString('en-IN')}
👤 *Sent By (Admin):* ${sentByName}
📱 *App Used:* ${appName}
📞 *Sender Number:* ${sentWithNumber}
───────────────
🎯 *Beneficiary Player:* ${recipientName}
💳 *Receiving Account:* ${recipientAccount}
🆔 *Transaction Ref:* ${transactionRef}
⏱ *Date & Time:* ${new Date().toLocaleString()}
✅ *Status:* SUCCESSFUL & VERIFIED
━━━━━━━━━━━━━━━━━━━━━━
_Thank you for competing on ${platformName}! Keep grinding & claiming cash prizes._`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Approve & Save with GFX Receipt Details
  const handleSaveAndApprove = async () => {
    if (!onApproveAndSave) return;
    try {
      setIsSaving(true);
      const details: WithdrawalReceiptDetails = {
        sentByName: sentByName.trim(),
        appName: appName.trim(),
        sentWithNumber: sentWithNumber.trim(),
        transactionRef: transactionRef.trim(),
        generatedAt: Date.now(),
        receiptNote: note.trim(),
      };
      await onApproveAndSave(details);
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative animate-card-enter w-full max-w-4xl bg-[var(--surface-color)] rounded-3xl border border-[var(--border-color)] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-main)]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[color-mix(in_srgb,var(--success-color)_18%,var(--card-bg))] text-[var(--success-color)] border border-[color-mix(in_srgb,var(--success-color)_40%,transparent)] flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2 flex-wrap">
                <span>Withdrawal Payout GFX Receipt</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[color-mix(in_srgb,var(--success-color)_18%,var(--card-bg))] text-[var(--success-color)] border border-[color-mix(in_srgb,var(--success-color)_40%,transparent)]">
                  HD Voucher
                </span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Admin payout details: Amount, Sent By Name, App Name, and Sender Number.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl btn-theme-outline flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - 2 Columns on desktop */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-3.5 rounded-2xl bg-[color-mix(in_srgb,var(--success-color)_10%,var(--bg-main))] border border-[color-mix(in_srgb,var(--success-color)_30%,transparent)] text-[var(--success-color)] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>
                Customize the 4 admin dispatch fields below. The GFX voucher updates live on the right.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Amount */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[var(--glow-color-1)] uppercase tracking-wide mb-1">
                  1. Amount Sent (Rs. / ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[var(--glow-color-1)] font-bold text-sm">Rs.</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm font-black text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>
              </div>

              {/* 2. Name he sent by */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                  2. Name Sent By (Admin / Account) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[var(--text-muted)]">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={sentByName}
                    onChange={e => setSentByName(e.target.value)}
                    placeholder="e.g. Shamroz Khan"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>
              </div>

              {/* 3. App Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                  3. App Name Used To Send *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[var(--text-muted)]">
                    <Smartphone size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={e => setAppName(e.target.value)}
                    placeholder="e.g. Easypaisa"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>
                {/* Quick App Presets */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {popularApps.map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setAppName(app)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        appName === app
                          ? 'btn-accent'
                          : 'btn-theme-outline'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Number he sent with */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                  4. Number Sent With (Sender Phone / Account Number) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[var(--text-muted)]">
                    <CreditCard size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    value={sentWithNumber}
                    onChange={e => setSentWithNumber(e.target.value)}
                    placeholder="e.g. 03128017777"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-color-1)]"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Information (Beneficiary) */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-3">
              <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Beneficiary Player Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                    Player Name / In-Game Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                    Receiving Account Number
                  </label>
                  <input
                    type="text"
                    value={recipientAccount}
                    onChange={e => setRecipientAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                    Transaction Ref ID
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                    Admin Verification Note
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex-1 min-w-[160px] py-2.5 px-4 min-h-[40px] rounded-xl btn-accent font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={15} /> Download GFX Image
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className="py-2.5 px-4 min-h-[40px] rounded-xl btn-theme-outline font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                {isCopied ? <Check size={15} className="text-[var(--success-color)]" /> : <Copy size={15} />}
                {isCopied ? 'Copied for WhatsApp!' : 'Copy WhatsApp Receipt'}
              </button>

              {initialData.isPending && onApproveAndSave && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveAndApprove}
                  className="w-full py-3 px-4 min-h-[42px] rounded-xl btn-theme-success font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={16} strokeWidth={3} />
                  {isSaving ? 'Processing Payout...' : 'Approve & Mark Paid with GFX'}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live GFX Visual Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
              <FileText size={14} /> Live GFX Voucher Preview
            </div>

            <div className="w-full rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-2xl bg-black flex items-center justify-center p-1">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="GFX Withdrawal Receipt"
                  className="w-full h-auto object-contain rounded-xl max-h-[500px]"
                />
              ) : (
                <div className="py-20 text-center text-xs text-[var(--text-muted)]">
                  Rendering GFX Canvas...
                </div>
              )}
            </div>

            <div className="mt-2 text-center text-[10px] text-[var(--text-muted)]">
              High-DPI 800x1000px PNG graphic. Ready for direct WhatsApp or Discord upload.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
