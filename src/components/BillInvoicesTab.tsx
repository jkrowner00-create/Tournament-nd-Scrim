import React, { useState, useEffect } from 'react';
import type { BillInvoice, UserProfile } from '../types';
import { uploadToImgBB } from '../services/imgbb';
import {
  generateBillInvoiceCanvasAsync,
  formatWhatsAppBillText,
  downloadDataUrl,
} from '../services/gfxGenerator';
import {
  Receipt,
  FileText,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Download,
  Copy,
  Smartphone,
  CreditCard,
  QrCode,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Share2,
} from 'lucide-react';

interface BillInvoicesTabProps {
  invoices: BillInvoice[];
  allUsersList: UserProfile[];
  onCreateInvoice: (data: Omit<BillInvoice, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  onProcessInvoice: (id: string, action: 'approve' | 'reject', note?: string) => Promise<void>;
  onDeleteInvoice: (id: string) => Promise<void>;
  platformName?: string;
  defaultAdminName?: string;
  defaultAdminPhone?: string;
  onOpenInvoiceModal: (invoice: BillInvoice) => void;
}

export const BillInvoicesTab: React.FC<BillInvoicesTabProps> = ({
  invoices,
  allUsersList,
  onCreateInvoice,
  onProcessInvoice,
  onDeleteInvoice,
  platformName = 'SS BATTLE APP',
  defaultAdminName = 'Shamroz Khan (Admin)',
  defaultAdminPhone = '03709892708',
  onOpenInvoiceModal,
}) => {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State
  const [appName, setAppName] = useState<string>('Easypaisa');
  const [accountNumber, setAccountNumber] = useState<string>(defaultAdminPhone);
  const [accountName, setAccountName] = useState<string>(defaultAdminName);
  const [billName, setBillName] = useState<string>('Tournament Entry Pass Bill');
  const [amount, setAmount] = useState<number>(500);
  const [billLogoUrl, setBillLogoUrl] = useState<string>('https://i.ibb.co/n5MmBPX/IMG-20260926-WA0035.jpg');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedPlayerUid, setSelectedPlayerUid] = useState<string>('');
  const [manualCustomerName, setManualCustomerName] = useState<string>('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState<string>('');
  const [note, setNote] = useState<string>('Please transfer exact amount and submit screenshot with Txn ID to confirm.');

  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [isUploadingQr, setIsUploadingQr] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  const presetApps = ['Easypaisa', 'JazzCash', 'SadaPay', 'NayaPay', 'Bank Transfer', 'Google Pay', 'PhonePe', 'Paytm'];

  // Update recipient when selected player changes
  useEffect(() => {
    if (selectedPlayerUid) {
      const p = allUsersList.find(u => u.uid === selectedPlayerUid);
      if (p) {
        setManualCustomerName(p.displayName || p.email || '');
        setManualCustomerPhone(p.mobile || p.phoneNumber || '');
      }
    }
  }, [selectedPlayerUid, allUsersList]);

  // Live Canvas Preview update
  useEffect(() => {
    let isMounted = true;
    generateBillInvoiceCanvasAsync({
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      billName,
      appName,
      accountNumber,
      accountName,
      amount,
      billLogo: billLogoUrl,
      qrCodeUrl,
      recipientName: manualCustomerName,
      recipientPhone: manualCustomerPhone,
      note,
      status: 'pending',
      platformName,
    }).then(url => {
      if (isMounted) setLivePreviewUrl(url);
    });

    return () => {
      isMounted = false;
    };
  }, [billName, appName, accountNumber, accountName, amount, billLogoUrl, qrCodeUrl, manualCustomerName, manualCustomerPhone, note, platformName]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const url = await uploadToImgBB(file);
      setBillLogoUrl(url);
    } catch {
      // Ignored
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingQr(true);
    try {
      const url = await uploadToImgBB(file);
      setQrCodeUrl(url);
    } catch {
      // Ignored
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !accountNumber.trim() || !accountName.trim() || !billName.trim()) {
      alert('Please fill in all required bill fields.');
      return;
    }
    if (amount <= 0) {
      alert('Amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      await onCreateInvoice({
        invoiceNumber: invoiceNum,
        billName: billName.trim(),
        appName: appName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        amount: Number(amount),
        billLogo: billLogoUrl.trim() || undefined,
        qrCodeUrl: qrCodeUrl.trim() || undefined,
        recipientUserId: selectedPlayerUid || undefined,
        recipientName: manualCustomerName.trim() || undefined,
        recipientPhone: manualCustomerPhone.trim() || undefined,
        note: note.trim() || undefined,
      });

      setShowCreateForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleCopyInvoiceLink = (inv: BillInvoice) => {
    const link = `${window.location.origin}/?invoice=${inv.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLinkId(inv.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleCopyWhatsApp = (inv: BillInvoice) => {
    const text = formatWhatsAppBillText({
      invoiceNumber: inv.invoiceNumber,
      billName: inv.billName,
      appName: inv.appName,
      accountNumber: inv.accountNumber,
      accountName: inv.accountName,
      amount: inv.amount,
      recipientName: inv.recipientName,
      recipientPhone: inv.recipientPhone,
      note: inv.note,
      status: inv.status,
      platformName,
      invoiceUrl: `${window.location.origin}/?invoice=${inv.id}`,
    });
    navigator.clipboard.writeText(text);
    setCopiedInvoiceId(inv.id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber?.toLowerCase().includes(q);
      const matchApp = inv.appName?.toLowerCase().includes(q);
      const matchAcc = inv.accountNumber?.toLowerCase().includes(q);
      const matchName = inv.accountName?.toLowerCase().includes(q);
      const matchPlayer = inv.recipientName?.toLowerCase().includes(q);
      const matchBill = inv.billName?.toLowerCase().includes(q);
      return matchNum || matchApp || matchAcc || matchName || matchPlayer || matchBill;
    }
    return true;
  });

  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const completedCount = invoices.filter(i => i.status === 'completed').length;
  const totalVolume = invoices.filter(i => i.status === 'completed').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Quick Controls */}
      <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wide">
                Bill Receipts & Payment Invoices
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Generate branded esports bills with QR codes and verify payments using the instant deposit confirmation engine.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(prev => !prev)}
          className="px-5 py-2.5 min-h-[40px] rounded-2xl btn-accent font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          {showCreateForm ? <X size={16} /> : <Plus size={16} strokeWidth={3} />}
          {showCreateForm ? 'Close Generator' : 'Generate New Bill Receipt'}
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Total Invoices</span>
          <span className="text-xl font-black text-[var(--text-primary)] tabular-nums">{invoices.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Pending Verification</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[var(--glow-color-1)] tabular-nums">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[color-mix(in_srgb,var(--glow-color-1)_18%,var(--card-bg))] text-[var(--glow-color-1)] border border-[var(--border-color)] animate-pulse">
                Needs Action
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Confirmed Paid</span>
          <span className="text-xl font-black text-[var(--success-color)] tabular-nums">{completedCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Verified Volume</span>
          <span className="text-xl font-black text-[var(--success-color)] tabular-nums">₹{totalVolume.toLocaleString()}</span>
        </div>
      </div>

      {/* CREATE NEW BILL RECEIPT FORM */}
      {showCreateForm && (
        <div className="animate-card-enter p-6 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--glow-color-1)] uppercase tracking-wide flex items-center gap-2">
                <FileText size={18} /> Official Bill Receipt Generator
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Enter your payment app details, receiving number, name, optional logo and QR code.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-3 py-1.5 rounded-lg btn-theme-outline text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Bill Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Bill Name / Purpose *
                </label>
                <input
                  type="text"
                  value={billName}
                  onChange={e => setBillName(e.target.value)}
                  placeholder="e.g. Tournament Entry Pass Bill, VIP Slot Invoice"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                />
              </div>

              {/* App Name with Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase">
                    Payment App Name *
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)]">Quick Presets:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {presetApps.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAppName(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                        appName === p
                          ? 'btn-theme-soft ring-1 ring-[var(--glow-color-1)]'
                          : 'btn-theme-outline'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  placeholder="e.g. Easypaisa, JazzCash, SadaPay"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              {/* Receiving Account Number & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Your Account Number / Mobile *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="e.g. 03709892708"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Your Name (Account Holder) *
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="e.g. Shamroz Khan"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>

              {/* Amount Due */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Bill Amount Due (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-amber-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    required
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-black text-base"
                  />
                </div>
              </div>

              {/* Optional: Bill Logo & QR Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1 flex items-center justify-between">
                    <span>Bill Logo (Optional)</span>
                    {isUploadingLogo && <span className="text-amber-400 text-[10px]">Uploading...</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer mb-1.5"
                  />
                  <input
                    type="text"
                    value={billLogoUrl}
                    onChange={e => setBillLogoUrl(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1 flex items-center justify-between">
                    <span>Payment QR Code (Optional)</span>
                    {isUploadingQr && <span className="text-amber-400 text-[10px]">Uploading...</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="block w-full text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer mb-1.5"
                  />
                  <input
                    type="text"
                    value={qrCodeUrl}
                    onChange={e => setQrCodeUrl(e.target.value)}
                    placeholder="Or paste QR Code URL"
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Optional Linked Registered Player */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Link Registered Player (Optional)
                  </label>
                  <select
                    value={selectedPlayerUid}
                    onChange={e => setSelectedPlayerUid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  >
                    <option value="">-- None (Manual Customer) --</option>
                    {allUsersList.map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName || u.email} ({u.mobile || u.phoneNumber || 'No phone'}) - Bal: ₹{u.balance || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={manualCustomerName}
                    onChange={e => setManualCustomerName(e.target.value)}
                    placeholder="e.g. Player or Clan Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Payment Instructions / Note */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                  Payment Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Please transfer exact amount and submit screenshot with Txn ID to confirm."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 min-h-[42px] rounded-2xl btn-accent font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check size={16} strokeWidth={3} />
                  {isSubmitting ? 'Saving & Generating...' : 'Save & Issue Bill Invoice'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="py-3 px-5 min-h-[42px] rounded-2xl btn-theme-outline font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Live Canvas Preview (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-color)]">
              <span className="text-xs font-bold text-[var(--glow-color-1)] uppercase mb-2 flex items-center gap-1.5 self-start">
                <Receipt size={14} /> Live Bill Preview
              </span>

              {livePreviewUrl ? (
                <div className="max-w-[280px] sm:max-w-[320px] w-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]">
                  <img src={livePreviewUrl} alt="Preview" className="w-full h-auto block" />
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-xs text-[var(--text-muted)]">
                  Generating preview...
                </div>
              )}

              {livePreviewUrl && (
                <button
                  type="button"
                  onClick={() => downloadDataUrl(livePreviewUrl, `${billName.replace(/\s+/g, '_')}_INVOICE.png`)}
                  className="mt-3 w-full py-2.5 px-3 rounded-xl btn-theme-soft text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> Download Sample PNG
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {(['all', 'pending', 'completed', 'rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 min-h-[34px] rounded-xl text-xs font-bold capitalize cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'btn-accent'
                  : 'btn-theme-outline'
              }`}
            >
              {st === 'all' ? `All Invoices (${invoices.length})` : `${st} (${invoices.filter(i => i.status === st).length})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, app, name, account..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* INVOICES LIST & AUDITOR TABLE */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
          <Receipt size={32} className="mx-auto text-[var(--text-muted)] mb-2 opacity-50" />
          <p className="text-sm font-bold text-[var(--text-primary)]">No bill invoices found.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Click "Generate New Bill Receipt" to create an invoice with your account number and QR code.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map(inv => {
            const isPending = inv.status === 'pending';
            const isCompleted = inv.status === 'completed';

            return (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-center gap-3.5">
                  {/* Thumbnail / QR preview button */}
                  <button
                    type="button"
                    onClick={() => onOpenInvoiceModal(inv)}
                    className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-amber-400 hover:scale-105 transition-transform flex-shrink-0 cursor-pointer overflow-hidden relative group"
                    title="Click to view full invoice & download image"
                  >
                    {inv.qrCodeUrl ? (
                      <img src={inv.qrCodeUrl} alt="QR" className="w-full h-full object-cover p-1 bg-white" />
                    ) : inv.billLogo ? (
                      <img src={inv.billLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Receipt size={22} />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={16} className="text-white" />
                    </div>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-green-400">
                        +₹{Number(inv.amount).toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : inv.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {inv.status}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {inv.billName}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2 flex-wrap font-mono">
                      <span>Ref: <strong className="text-[var(--text-primary)]">{inv.invoiceNumber}</strong></span>
                      <span>• App: <strong className="text-[var(--glow-color-1)]">{inv.appName}</strong></span>
                      <span>• A/C: <strong className="text-[var(--glow-color-1)]">{inv.accountNumber}</strong></span>
                      <span>({inv.accountName})</span>
                    </div>

                    {inv.recipientName && (
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Issued To: <strong className="text-[var(--text-primary)]">{inv.recipientName}</strong>
                        {inv.recipientPhone ? ` (${inv.recipientPhone})` : ''}
                      </div>
                    )}

                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {new Date(inv.createdAt).toLocaleString()}
                      {inv.processedBy ? ` • Processed by ${inv.processedBy}` : ''}
                    </div>
                  </div>
                </div>

                {/* Actions: Same verification system as deposit function */}
                <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                  {/* View / Download Image Button */}
                  <button
                    type="button"
                    onClick={() => onOpenInvoiceModal(inv)}
                    className="px-3 py-1.5 rounded-xl btn-theme-soft text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> View / Download GFX
                  </button>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => handleCopyInvoiceLink(inv)}
                    className="px-2.5 py-1.5 rounded-xl btn-theme-outline text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="Copy Shareable Web Link to Invoice"
                  >
                    {copiedLinkId === inv.id ? <Check size={13} className="text-[var(--success-color)]" /> : <Share2 size={13} />}
                    <span className="hidden sm:inline">{copiedLinkId === inv.id ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>

                  {/* Copy WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleCopyWhatsApp(inv)}
                    className="px-2.5 py-1.5 rounded-xl btn-theme-outline text-xs cursor-pointer"
                    title="Copy WhatsApp Text Receipt"
                  >
                    {copiedInvoiceId === inv.id ? <Check size={13} className="text-[var(--success-color)]" /> : <Copy size={13} />}
                  </button>

                  {/* Verification Buttons */}
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => onProcessInvoice(inv.id, 'approve')}
                        className="px-3 py-1.5 rounded-xl btn-theme-success text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1"
                        title="Approve invoice and auto-credit player balance"
                      >
                        <Check size={13} strokeWidth={3} /> Approve (Confirm)
                      </button>

                      <button
                        type="button"
                        onClick={() => onProcessInvoice(inv.id, 'reject')}
                        className="px-2.5 py-1.5 rounded-xl btn-theme-danger text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <X size={13} /> Reject
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                        onDeleteInvoice(inv.id);
                      }
                    }}
                    className="p-1.5 rounded-lg btn-theme-danger cursor-pointer"
                    title="Delete invoice record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
