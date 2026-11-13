import React, { useState, useEffect } from 'react';
import type { BillInvoice } from '../types';
import {
  generateBillInvoiceCanvasAsync,
  formatWhatsAppBillText,
  downloadDataUrl,
} from '../services/gfxGenerator';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  QrCode,
  Image as ImageIcon,
} from 'lucide-react';

interface BillInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillInvoice | null;
  onApprove?: (invoiceId: string, note?: string) => Promise<void>;
  onReject?: (invoiceId: string, note?: string) => Promise<void>;
  platformName?: string;
}

export const BillInvoiceModal: React.FC<BillInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onApprove,
  onReject,
  platformName = 'SS BATTLE APP',
}) => {
  if (!isOpen || !invoice) return null;

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [adminNote, setAdminNote] = useState<string>('');
  const [showConfirmActions, setShowConfirmActions] = useState<boolean>(invoice.status === 'pending');

  const isPaid = invoice.status === 'completed';
  const isPending = invoice.status === 'pending';

  useEffect(() => {
    let isMounted = true;
    generateBillInvoiceCanvasAsync({
      invoiceNumber: invoice.invoiceNumber,
      billName: invoice.billName,
      appName: invoice.appName,
      accountNumber: invoice.accountNumber,
      accountName: invoice.accountName,
      amount: invoice.amount,
      billLogo: invoice.billLogo,
      qrCodeUrl: invoice.qrCodeUrl,
      recipientName: invoice.recipientName,
      recipientPhone: invoice.recipientPhone,
      note: invoice.note,
      status: invoice.status,
      dateStr: new Date(invoice.createdAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      platformName,
      confirmationId: invoice.transactionRef || invoice.invoiceNumber,
    }).then(dataUrl => {
      if (isMounted) setPreviewDataUrl(dataUrl);
    });

    return () => {
      isMounted = false;
    };
  }, [invoice, platformName]);

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const filename = `${invoice.invoiceNumber || 'INVOICE'}_${invoice.appName || 'BILL'}.png`.toLowerCase();
    downloadDataUrl(previewDataUrl, filename);
  };

  const handleCopyWhatsApp = () => {
    const text = formatWhatsAppBillText({
      invoiceNumber: invoice.invoiceNumber,
      billName: invoice.billName,
      appName: invoice.appName,
      accountNumber: invoice.accountNumber,
      accountName: invoice.accountName,
      amount: invoice.amount,
      recipientName: invoice.recipientName,
      recipientPhone: invoice.recipientPhone,
      note: invoice.note,
      status: invoice.status,
      platformName,
    });
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    try {
      await onApprove(invoice.id, adminNote);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    try {
      await onReject(invoice.id, adminNote);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-card-enter">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-main)]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${
              isPaid
                ? 'bg-[var(--success-color)]/15 border-[var(--success-color)]/35 text-[var(--success-color)]'
                : 'bg-[var(--warning-color)]/15 border-[var(--warning-color)]/35 text-[var(--warning-color)]'
            }`}>
              <Receipt size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-wide uppercase">
                  {invoice.billName || 'Official Payment Invoice'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  isPaid
                    ? 'bg-[var(--success-color)]/20 text-[var(--success-color)] border border-[var(--success-color)]/30'
                    : 'bg-[var(--warning-color)]/20 text-[var(--warning-color)] border border-[var(--warning-color)]/30'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Invoice #{invoice.invoiceNumber} • {invoice.appName} • Amount: ₹{invoice.amount}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full btn-theme-outline flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Canvas GFX Image Preview */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-color)]">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3 flex items-center gap-2 w-full justify-between">
              <span className="flex items-center gap-1.5 text-amber-400">
                <FileText size={14} /> Official Esports Bill Graphic
              </span>
              <span className="text-[10px] text-gray-400">800 × 1100 px</span>
            </div>

            {previewDataUrl ? (
              <div className="relative group max-w-[280px] sm:max-w-[360px] w-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]">
                <img
                  src={previewDataUrl}
                  alt="Bill Invoice"
                  className="w-full h-auto object-contain block mx-auto"
                />
              </div>
            ) : (
              <div className="w-full h-72 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                Rendering Official Bill Receipt...
              </div>
            )}

            {/* Action buttons (Download PNG, Copy WhatsApp, Copy Shareable Web Link) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full mt-4">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!previewDataUrl}
                className="min-h-[42px] py-2.5 px-3 rounded-xl btn-theme-success font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} strokeWidth={2.5} /> Download PNG
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="min-h-[42px] py-2.5 px-3 rounded-xl btn-theme-outline font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCopied ? <Check size={14} className="text-[var(--success-color)]" /> : <Copy size={14} />}
                {isCopied ? 'Copied Text!' : 'WhatsApp Text'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const shareUrl = `${window.location.origin}/?invoice=${invoice.id}`;
                  navigator.clipboard.writeText(shareUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2200);
                }}
                className="min-h-[42px] py-2.5 px-3 rounded-xl btn-accent font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                title="Copy direct shareable web link to open this invoice in any browser"
              >
                <Share2 size={14} strokeWidth={2.5} /> Copy Web Link
              </button>
            </div>
          </div>

          {/* Right Column: Invoice Details & Verification System */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2.5">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Beneficiary Receiving Details
                </span>

                <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--border-color)]/50">
                  <span className="text-[var(--text-muted)]">Bill Name</span>
                  <span className="font-bold text-white">{invoice.billName}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--border-color)]/50">
                  <span className="text-[var(--text-muted)]">Payment App</span>
                  <span className="font-bold text-cyan-300">{invoice.appName}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--border-color)]/50">
                  <span className="text-[var(--text-muted)]">Account Number</span>
                  <span className="font-mono font-black text-amber-400 text-sm">{invoice.accountNumber}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--border-color)]/50">
                  <span className="text-[var(--text-muted)]">Account Name</span>
                  <span className="font-bold text-white">{invoice.accountName}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--border-color)]/50">
                  <span className="text-[var(--text-muted)]">Amount Due</span>
                  <span className="font-black text-green-400 text-base">₹{Number(invoice.amount).toLocaleString()}</span>
                </div>

                {invoice.recipientName && (
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-[var(--text-muted)]">Assigned Player</span>
                    <span className="font-bold text-white">{invoice.recipientName}</span>
                  </div>
                )}
              </div>

              {/* Optional Logos / QR Status */}
              {(invoice.billLogo || invoice.qrCodeUrl) && (
                <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-around gap-3">
                  {invoice.billLogo && (
                    <div className="text-center">
                      <span className="text-[9px] text-[var(--text-muted)] block uppercase mb-1">Bill Logo</span>
                      <img src={invoice.billLogo} alt="Logo" className="w-10 h-10 object-contain rounded-lg mx-auto border border-slate-700" />
                    </div>
                  )}
                  {invoice.qrCodeUrl && (
                    <div className="text-center">
                      <span className="text-[9px] text-[var(--text-muted)] block uppercase mb-1">QR Code</span>
                      <img src={invoice.qrCodeUrl} alt="QR" className="w-12 h-12 object-contain rounded-lg mx-auto bg-white p-0.5 border border-slate-700" />
                    </div>
                  )}
                </div>
              )}

              {/* Verification Audit Status */}
              <div className={`p-3.5 rounded-2xl border ${
                isPaid
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  {isPaid ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
                  <span className="text-xs font-black uppercase">
                    {isPaid ? 'Payment Confirmed & Verified' : 'Awaiting Payment Verification'}
                  </span>
                </div>
                <p className="text-[11px] mt-1 text-[var(--text-muted)]">
                  {isPaid
                    ? `Approved by ${invoice.processedBy || 'Admin'}. Linked player balance was credited automatically.`
                    : 'Use the verification buttons below to approve and credit the player balance or reject this invoice.'}
                </p>
              </div>

              {/* Verification Actions (Same verification system as deposit function) */}
              {isPending && onApprove && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
                      Confirmation Note / Txn ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="e.g. Paid via Easypaisa / Confirmed"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="min-h-[42px] py-2.5 px-3 rounded-xl btn-theme-success font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Check size={14} strokeWidth={3} /> Approve (Confirm)
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="min-h-[42px] py-2.5 px-3 rounded-xl btn-theme-danger font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-center text-[10px] text-[var(--text-muted)]">
              SS BATTLE APP Official Invoicing & Receipt Dispatch
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
