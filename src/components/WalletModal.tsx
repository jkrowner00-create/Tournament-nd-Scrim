import React, { useState, useEffect } from 'react';
import type { PaymentMethod, WithdrawalRequest } from '../types';
import { useApp } from '../context/AppContext';
import { uploadToImgBB } from '../services/imgbb';
import {
  generateDepositReceiptCanvas,
  generateBillInvoiceCanvasAsync,
  downloadDataUrl,
  formatWhatsAppBillText,
} from '../services/gfxGenerator';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  QrCode,
  KeyRound,
  History,
  Copy,
  Check,
  X,
  Upload,
  Receipt,
  FileText,
  Download,
  Send,
  Coins,
  Repeat,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface WalletModalProps {
  initialTab?: 'deposit' | 'withdraw' | 'convert' | 'history' | 'paymentId' | 'share';
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ initialTab = 'deposit', onClose }) => {
  const {
    currentUser,
    userProfile,
    settings,
    paymentMethods,
    submitDepositRequest,
    redeemPaymentId,
    submitWithdrawalRequest,
    convertWinningToDeposit,
    convertPendingWithdrawalToDeposit,
    transferCoinsToPlayer,
    allWithdrawals,
    transactions,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'convert' | 'history' | 'share'>(
    initialTab === 'paymentId' ? 'deposit' : (initialTab as any) || 'deposit'
  );
  const [depositSubTab, setDepositSubTab] = useState<'invoice' | 'paymentId'>(
    initialTab === 'paymentId' ? 'paymentId' : 'invoice'
  );

  // Coin Sharing / P2P Transfer State
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('100');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<{
    recipientName: string;
    netAmount: number;
    fee: number;
  } | null>(null);

  // Deposit Invoice Step-by-Step Flow:
  // Step 1: 'amount' -> Asks how much money to deposit & selects payment channel
  // Step 2: 'invoice' -> Creates & displays the generated official invoice + verification form
  // Step 3: 'success' -> Shows submitted receipt & verification pending status
  const [depositStep, setDepositStep] = useState<'amount' | 'invoice' | 'success'>('amount');

  // Available payment methods with safe fallbacks
  const effectiveMethods: PaymentMethod[] =
    paymentMethods && paymentMethods.length > 0
      ? paymentMethods.filter(m => m.enabled !== false)
      : [
          {
            id: 'def_easypaisa',
            name: 'EasyPaisa',
            accountDetails: settings.easyPaisaNumber
              ? `${settings.easyPaisaNumber} (${settings.easyPaisaName || 'Official Hub'})`
              : '03128017777 (Shamroz Khan)',
            logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&q=80',
            enabled: true,
            type: 'Mobile Wallet',
          },
          {
            id: 'def_jazzcash',
            name: 'JazzCash',
            accountDetails: settings.jazzCashNumber
              ? `${settings.jazzCashNumber} (${settings.jazzCashName || 'Official Hub'})`
              : '03001234567 (Shamroz Khan)',
            logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&q=80',
            enabled: true,
            type: 'Mobile Wallet',
          },
        ];

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    effectiveMethods[0] || {
      id: 'default',
      name: 'Easypaisa',
      accountDetails: '03128017777 (Shamroz Khan)',
      enabled: true,
    }
  );

  // Dynamic Deposit Invoice ID & Ref
  const [activeDepositId, setActiveDepositId] = useState<string>(
    () => `DEP-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [activeInvoiceNumber, setActiveInvoiceNumber] = useState<string>(
    () => `INV-DEP-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [depositAmount, setDepositAmount] = useState<string>('200');
  const [depositScreenshot, setDepositScreenshot] = useState<File | null>(null);
  const [depositScreenshotPreview, setDepositScreenshotPreview] = useState<string | null>(null);
  const [depositTxnId, setDepositTxnId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Payment ID State
  const [paymentIdCode, setPaymentIdCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Withdraw Form State (Winning + Bonus money withdrawable)
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('Easypaisa');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Withdrawal Balance to Deposit Balance Conversion State
  const [convertAmount, setConvertAmount] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertingWithdrawalId, setConvertingWithdrawalId] = useState<string | null>(null);

  const [copiedText, setCopiedText] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  const balance = userProfile?.balance || 0;
  const winningCash = userProfile?.winningCash || 0;
  const bonusCash = userProfile?.bonusCash || 0;
  const totalWithdrawable = winningCash + bonusCash;
  const minWithdraw = settings.minWithdraw || 50;
  const minDeposit = settings.minDeposit ?? 50;

  // Split account into distinct Number and Holder Name for clean separate copying
  const getParsedPaymentAccount = (method: PaymentMethod) => {
    const raw = (method.accountDetails || '').trim();
    // Match strings like "03128017777 (Shamroz Khan)" or "03128017777 - Shamroz Khan"
    const matchParen = raw.match(/^([0-9\s\+\-A-Za-z]+?)\s*[\(\-–]\s*([^\)]+)[\)]?$/);
    let accNumber = raw;
    let accName = '';

    if (matchParen) {
      accNumber = matchParen[1].trim();
      accName = matchParen[2].trim();
    } else {
      const mLower = (method.name || '').toLowerCase();
      if (mLower.includes('jazz')) {
        accName = settings?.jazzCashName || 'Shamroz Khan';
        if (!accNumber || accNumber === raw) {
          accNumber = settings?.jazzCashNumber || raw || '03001234567';
        }
      } else if (mLower.includes('easy')) {
        accName = settings?.easyPaisaName || 'Shamroz Khan';
        if (!accNumber || accNumber === raw) {
          accNumber = settings?.easyPaisaNumber || raw || '03128017777';
        }
      } else {
        accName = method.name || 'Official Cash Hub';
      }
    }

    if (!accName) {
      accName = settings?.appName || 'Official Receiver';
    }

    return { number: accNumber, name: accName, raw };
  };

  const handleCopyNumber = (num: string) => {
    const cleanNum = num.replace(/[\(\)]/g, '').trim();
    navigator.clipboard.writeText(cleanNum);
    setCopiedNumber(true);
    showToast(`Account Number copied: ${cleanNum}`, 'success');
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyName = (name: string) => {
    const cleanName = name.replace(/[\(\)]/g, '').trim();
    navigator.clipboard.writeText(cleanName);
    setCopiedName(true);
    showToast(`Account Holder Name copied: ${cleanName}`, 'success');
    setTimeout(() => setCopiedName(false), 2000);
  };

  // Track screenshot file selection preview
  useEffect(() => {
    if (!depositScreenshot) {
      setDepositScreenshotPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(depositScreenshot);
    setDepositScreenshotPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [depositScreenshot]);

  const handleCopyDetails = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    showToast('Payment account details copied to clipboard!', 'success');
    setTimeout(() => setCopiedText(false), 2000);
  };

  // 1-Click Generate & Download Official Deposit Invoice (PNG)
  // Strictly matches active theme and uses the official app logo!
  const handleDownloadDepositInvoice = async () => {
    const amt = parseFloat(depositAmount) || minDeposit;
    const themeColor =
      typeof window !== 'undefined'
        ? getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#F59E0B'
        : '#F59E0B';

    try {
      const dataUrl = await generateBillInvoiceCanvasAsync({
        invoiceNumber: activeInvoiceNumber,
        billName: 'Wallet Deposit Top-Up',
        appName: selectedMethod.name || 'Mobile Banking',
        accountNumber: selectedMethod.accountDetails || '—',
        accountName: selectedMethod.name || 'Admin Cash Hub',
        amount: amt,
        billLogo: settings.logoUrl || selectedMethod.logoUrl, // Strictly use App Logo for the deposit!
        platformLogo: settings.logoUrl,
        themeColor, // Strictly match the active theme!
        qrCodeUrl: selectedMethod.qrCodeUrl,
        recipientName: userProfile?.displayName || userProfile?.email || 'Valued Player',
        recipientPhone: userProfile?.mobile || userProfile?.phoneNumber || '—',
        status: 'pending',
        platformName: settings.appName || 'SS BATTLE APP',
      });
      downloadDataUrl(dataUrl, `${activeDepositId}_INVOICE.png`);
      showToast('Official Deposit Invoice downloaded as PNG!', 'success');
    } catch {
      // Fallback generator
      const fallbackUrl = generateDepositReceiptCanvas({
        amount: amt,
        playerName: userProfile?.displayName || userProfile?.email || 'Player',
        transactionId: depositTxnId || activeDepositId,
        depositRef: activeDepositId,
        status: 'pending',
        platformName: settings.appName || 'SS BATTLE APP',
      });
      downloadDataUrl(fallbackUrl, `${activeDepositId}_INVOICE.png`);
      showToast('Deposit Invoice downloaded!', 'success');
    }
  };

  // Step 1 -> Step 2: Validate Amount and Create Official Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid deposit amount.', 'warning');
      return;
    }
    const minDep = settings.minDeposit ?? 50;
    if (amt < minDep) {
      showToast(`Minimum deposit amount is ₹${minDep}.`, 'warning');
      return;
    }
    // Generate fresh identifiers for this specific invoice
    const newDepId = `DEP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInvNum = `INV-DEP-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveDepositId(newDepId);
    setActiveInvoiceNumber(newInvNum);
    setDepositStep('invoice');
  };

  // Step 2 -> Submit Deposit Request + Invoice for Verification
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid deposit amount.', 'warning');
      return;
    }
    if (!depositScreenshot) {
      showToast('Please attach your payment screenshot proof.', 'warning');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading screenshot to ImgBB...');
    try {
      const screenshotUrl = await uploadToImgBB(depositScreenshot, setUploadStatus);
      const invoiceDetails = {
        depositId: activeDepositId,
        invoiceNumber: activeInvoiceNumber,
        methodName: selectedMethod.name,
        receivingAccount: selectedMethod.accountDetails,
        accountHolder: selectedMethod.name,
        amount,
        methodLogo: settings.logoUrl || selectedMethod.logoUrl, // Use App Logo for deposit!
        billName: 'Wallet Deposit Top-Up',
        qrCodeUrl: selectedMethod.qrCodeUrl,
        generatedAt: Date.now(),
      };

      await submitDepositRequest(amount, screenshotUrl, depositTxnId.trim(), invoiceDetails);
      setDepositStep('success');
    } catch (err: any) {
      showToast(err.message || 'Deposit submission failed.', 'danger');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleRedeemPaymentId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentIdCode.trim()) {
      showToast('Please enter a Payment ID.', 'warning');
      return;
    }

    setIsRedeeming(true);
    try {
      await redeemPaymentId(paymentIdCode);
      setPaymentIdCode('');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Payment ID redemption failed.', 'danger');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Withdraw flow: User can only withdraw winning and bonus money
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'warning');
      return;
    }
    if (amount < minWithdraw) {
      showToast(`Minimum withdrawal amount is ₹${minWithdraw}.`, 'warning');
      return;
    }
    if (amount > totalWithdrawable) {
      showToast(
        `Withdrawal amount cannot exceed your Withdrawable Balance (Winning ₹${winningCash.toFixed(2)} + Bonus ₹${bonusCash.toFixed(2)} = ₹${totalWithdrawable.toFixed(2)}). Main deposit balance is reserved for match entries.`,
        'danger'
      );
      return;
    }
    if (!withdrawAccount.trim()) {
      showToast('Please enter your account number / mobile.', 'warning');
      return;
    }

    setIsWithdrawing(true);
    try {
      await submitWithdrawalRequest(amount, withdrawMethod, withdrawAccount.trim());
      setWithdrawAmount('');
      setWithdrawAccount('');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Withdrawal request failed.', 'danger');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Convert Withdrawal Balance (Winnings / Bonus) into Deposit Balance
  const handleConvertBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(convertAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid conversion amount.', 'warning');
      return;
    }
    if (amt > totalWithdrawable) {
      showToast(`Cannot convert more than your Withdrawable Balance (₹${totalWithdrawable.toFixed(2)}).`, 'danger');
      return;
    }

    setIsConverting(true);
    try {
      await convertWinningToDeposit(amt);
      setConvertAmount('');
    } catch (err: any) {
      showToast(err.message || 'Balance conversion failed.', 'danger');
    } finally {
      setIsConverting(false);
    }
  };

  // Convert a pending withdrawal back to active deposit balance
  const handleConvertPendingWithdrawal = async (withdrawalId: string) => {
    setConvertingWithdrawalId(withdrawalId);
    try {
      await convertPendingWithdrawalToDeposit(withdrawalId);
    } catch (err: any) {
      showToast(err.message || 'Failed to convert withdrawal.', 'danger');
    } finally {
      setConvertingWithdrawalId(null);
    }
  };

  // User's own pending withdrawal requests
  const userPendingWithdrawals = allWithdrawals.filter(
    w => w.userId === currentUser?.uid && w.status === 'pending'
  );

  // Coin Sharing (P2P Transfer with 3.5% fee)
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid transfer amount.', 'warning');
      return;
    }
    const fee = Math.round(amt * 0.035 * 100) / 100;
    const totalDeduction = Math.round((amt + fee) * 100) / 100;
    if (balance < totalDeduction) {
      showToast(
        `Insufficient main balance. You need ₹${totalDeduction} (₹${amt} transfer + 3.5% fee of ₹${fee}), but current balance is ₹${balance.toFixed(2)}.`,
        'danger'
      );
      return;
    }
    if (!transferRecipient.trim()) {
      showToast('Please enter recipient Mobile Number, Game UID, or User ID.', 'warning');
      return;
    }

    setIsTransferring(true);
    try {
      const res = await transferCoinsToPlayer(transferRecipient.trim(), amt);
      setTransferSuccess({
        recipientName: res.recipientName,
        netAmount: res.netAmount,
        fee: res.fee,
      });
      setTransferRecipient('');
      showToast(`Successfully sent ₹${res.netAmount} to ${res.recipientName}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Coin transfer failed.', 'danger');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl animate-card-enter">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--glow-color-1)]/15 border border-[var(--glow-color-1)]/35 flex items-center justify-center text-[var(--glow-color-1)]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                Wallet Hub
              </h3>
              <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                Main Deposit: <strong className="text-[var(--text-primary)]">₹{balance.toFixed(2)}</strong> • Withdrawable:{' '}
                <strong className="text-[var(--success-color)]">₹{totalWithdrawable.toFixed(2)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top 5 Segmented Navigation Tabs */}
        <div className="grid grid-cols-5 p-1.5 bg-[var(--secondary-bg)] border-b border-[var(--border-color)] text-[11px] font-bold gap-1">
          <button
            onClick={() => {
              setActiveTab('deposit');
              setDepositStep('amount');
            }}
            className={`min-h-[38px] rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'deposit' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deposit</span>
            <span className="sm:hidden">Dep</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`min-h-[38px] rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'withdraw' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Withdraw</span>
            <span className="sm:hidden">With</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`min-h-[38px] rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'share' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setActiveTab('convert')}
            className={`min-h-[38px] rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'convert' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Convert</span>
            <span className="sm:hidden">Conv</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`min-h-[38px] rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'history' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: DEPOSIT FLOW */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              {/* Sub-Tabs: Invoice vs Payment ID */}
              <div className="flex gap-2 border-b border-[var(--border-color)] pb-2.5 text-xs font-semibold">
                <button
                  onClick={() => {
                    setDepositSubTab('invoice');
                    setDepositStep('amount');
                  }}
                  className={`flex-1 min-h-[36px] px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    depositSubTab === 'invoice' ? 'btn-theme-soft font-bold' : 'btn-theme-outline'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Official Invoice</span>
                </button>
                <button
                  onClick={() => setDepositSubTab('paymentId')}
                  className={`flex-1 min-h-[36px] px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    depositSubTab === 'paymentId' ? 'btn-theme-soft font-bold' : 'btn-theme-outline'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Pre-Paid ID</span>
                </button>
              </div>

              {depositSubTab === 'invoice' ? (
                /* STEP 1: Ask for how much money to deposit */
                depositStep === 'amount' ? (
                  <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                        <FileText size={14} /> Instant Deposit Invoice Generator
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                        Enter the amount you wish to deposit, choose your payment app, and we will generate an official invoice with receiving details, QR code, and 1-click PNG receipt.
                      </p>
                    </div>

                    {/* How Much Money to Deposit */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                          How much money to deposit? (PKR) *
                        </label>
                        <span className="text-[10px] text-[var(--primary-color)] font-bold">
                          Min: ₹{minDeposit}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-black text-[var(--primary-color)]">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={minDeposit}
                          step="any"
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          placeholder={`Min ₹${minDeposit}`}
                          required
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-base font-black text-white focus:border-[var(--primary-color)] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick Amount Presets */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                        Quick Amount Presets
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {[50, 100, 250, 500, 1000, 2000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDepositAmount(val.toString())}
                            className={`min-h-[38px] rounded-xl text-xs font-bold tabular-nums cursor-pointer ${
                              depositAmount === val.toString() ? 'btn-accent' : 'btn-theme-outline'
                            }`}
                          >
                            ₹{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select Payment App */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                        Select Payment App / Channel *
                      </label>
                      <div className="space-y-2">
                        {effectiveMethods.map(m => {
                          const isSelected = selectedMethod.id === m.id;
                          return (
                            <div
                              key={m.id}
                              onClick={() => setSelectedMethod(m)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)]/50 shadow-sm'
                                  : 'bg-[var(--secondary-bg)] border-[var(--border-color)] hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    m.logoUrl ||
                                    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&q=80'
                                  }
                                  alt={m.name}
                                  className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-[var(--border-color)] p-0.5"
                                />
                                <div>
                                  <div className="font-extrabold text-sm text-[var(--text-primary)]">
                                    {m.name}
                                  </div>
                                  <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                                    {m.accountDetails}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-[var(--bg-main)]'
                                    : 'border-gray-500'
                                }`}
                              >
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[46px] py-3 rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Receipt size={16} /> Generate Deposit Invoice (₹{depositAmount || 0})
                    </button>
                  </form>
                ) : depositStep === 'invoice' ? (
                  /* STEP 2: Display Official Invoice + Verification Form */
                  <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setDepositStep('amount')}
                        className="px-3 min-h-[36px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        ← Change Amount / Method
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadDepositInvoice}
                        className="px-3 min-h-[36px] rounded-xl btn-accent font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                        title="Download Official Invoice as PNG"
                      >
                        <Download size={12} strokeWidth={2.5} /> Download Invoice (PNG)
                      </button>
                    </div>

                    {/* OFFICIAL INVOICE CARD - MATCHES ACTIVE THEME & USES APP LOGO */}
                    <div className="p-4 rounded-3xl bg-[var(--surface-color)] border-2 border-[var(--primary-color)]/60 relative overflow-hidden shadow-2xl shadow-[var(--primary-glow)]">
                      {/* Theme Glow background */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--primary-color)]/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Invoice Header: App Logo + Platform Name */}
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                        <div className="flex items-center gap-2.5">
                          {/* APP LOGO FOR DEPOSIT */}
                          <img
                            src={
                              settings.logoUrl ||
                              'https://i.ibb.co/n5MmBPX/IMG-20260926-WA0035.jpg'
                            }
                            alt={settings.appName || 'App Logo'}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-900 border-2 border-[var(--primary-color)] p-0.5 shadow-md shadow-[var(--primary-glow)]"
                          />
                          <div>
                            <div className="text-[10px] uppercase font-black text-[var(--primary-color)] tracking-wider">
                              {settings.appName || 'SS BATTLE APP'} • Deposit Invoice
                            </div>
                            <div className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                              <span>Deposit via {selectedMethod.name}</span>
                              {selectedMethod.logoUrl && (
                                <img
                                  src={selectedMethod.logoUrl}
                                  alt={selectedMethod.name}
                                  className="w-3.5 h-3.5 rounded object-contain inline"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/40">
                          Pending Verification
                        </span>
                      </div>

                      {/* Invoice Details Grid */}
                      <div className="py-3 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">Invoice Ref:</span>
                          <span className="font-mono font-bold text-white">{activeInvoiceNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">Deposit ID:</span>
                          <span className="font-mono font-bold text-[var(--primary-color)]">{activeDepositId}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">Player Account:</span>
                          <span className="font-bold text-white">
                            {userProfile?.displayName || userProfile?.email}
                          </span>
                        </div>

                        {/* Amount Due Card */}
                        <div className="p-3.5 rounded-2xl bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block font-bold uppercase">
                              Amount to Transfer
                            </span>
                            <span className="text-2xl font-black text-[var(--primary-color)]">
                              ₹{depositAmount}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[var(--primary-color)] bg-[var(--primary-color)]/20 px-2 py-1 rounded-lg">
                            Exact Amount
                          </span>
                        </div>

                        {/* Receiving Account Box with 1-Click Copy */}
                        {(() => {
                          const accName = selectedMethod.accountName || selectedMethod.accountDetails.split('(')[1]?.replace(')', '').trim() || 'Official';
                          const accNum = selectedMethod.accountNumber || selectedMethod.accountDetails.split('(')[0]?.trim() || selectedMethod.accountDetails;
                          return (
                            <div className="p-3.5 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border-color)] space-y-2.5">
                              <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                                Send To ({selectedMethod.name} Account)
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">1. Account Name</span>
                                  <span className="font-bold text-white text-sm">{accName}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">2. Account Number</span>
                                  <span className="font-mono text-amber-400 font-bold text-sm">{accNum}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyDetails(accNum)}
                                className="w-full min-h-[40px] py-2 rounded-xl btn-theme-soft cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                                title="Copy Account Number"
                              >
                                {copiedText ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copiedText ? 'Account Number Copied!' : 'Copy Account Number'}</span>
                              </button>
                            </div>
                          );
                        })()}

                        {/* Optional Payment QR Code */}
                        {selectedMethod.qrCodeUrl && (
                          <div className="text-center pt-2 p-3 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border-color)]">
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1.5">
                              3. Payment QR Code
                            </span>
                            <img
                              src={selectedMethod.qrCodeUrl}
                              alt="Payment QR"
                              className="w-36 h-36 mx-auto rounded-xl border-2 border-white/20 bg-white p-1.5 shadow-md object-contain"
                            />
                            <span className="text-[10px] text-gray-400 block mt-1.5">
                              Scan QR in your {selectedMethod.name} app to pay instantly
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Invoice Footer Actions */}
                      <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px]">
                        <span className="text-[var(--text-secondary)]">
                          Issued by {settings.appName || 'SS BATTLE APP'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const txt = formatWhatsAppBillText({
                              invoiceNumber: activeInvoiceNumber,
                              billName: 'Wallet Deposit Top-Up',
                              appName: selectedMethod.name,
                              accountNumber: selectedMethod.accountDetails,
                              accountName: selectedMethod.name,
                              amount: parseFloat(depositAmount) || 0,
                              recipientName: userProfile?.displayName || userProfile?.email || 'Player',
                              status: 'pending',
                              platformName: settings.appName || 'SS BATTLE APP',
                            });
                            handleCopyDetails(txt);
                          }}
                          className="text-[var(--primary-color)] hover:underline font-bold cursor-pointer"
                        >
                          Copy WhatsApp Text
                        </button>
                      </div>
                    </div>

                    {/* VERIFICATION & CONFIRMATION SECTION (Same system as deposit function) */}
                    <div className="p-4 rounded-3xl bg-[var(--secondary-bg)] border border-[var(--border-color)] space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[var(--text-primary)]">
                        <ShieldCheck size={15} className="text-emerald-400" /> Payment Verification
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        After transferring <strong>₹{depositAmount}</strong> to the account above, enter your transaction reference and attach the receipt screenshot to verify:
                      </p>

                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                          Transaction ID / Ref # *
                        </label>
                        <input
                          type="text"
                          value={depositTxnId}
                          onChange={e => setDepositTxnId(e.target.value)}
                          placeholder="e.g. TRX-948210452 or 12-digit Ref"
                          required
                          className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono font-bold text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                          Payment Screenshot Proof *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setDepositScreenshot(e.target.files?.[0] || null)}
                          required
                          className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                        />
                        {depositScreenshotPreview && (
                          <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-amber-500/40">
                            <img
                              src={depositScreenshotPreview}
                              alt="Proof preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {uploadStatus && (
                          <p className="text-[10px] text-amber-400 mt-1 font-semibold">{uploadStatus}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full min-h-[46px] py-3 rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isUploading ? (
                          'Verifying & Uploading Proof...'
                        ) : (
                          <>
                            <CheckCircle2 size={16} /> Confirm Payment & Submit for Verification
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STEP 3: SUBMITTED CONFIRMATION */
                  <div className="p-6 rounded-3xl bg-[var(--surface-color)] border border-emerald-500/40 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[var(--text-primary)] uppercase tracking-wide">
                        Deposit Invoice Submitted!
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Your deposit of <strong className="text-[var(--warning-color)]">₹{depositAmount}</strong> has been logged under{' '}
                        <strong className="text-[var(--text-primary)]">{activeDepositId}</strong>.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-xs text-left space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Deposit ID:</span>
                        <span className="text-[var(--warning-color)] font-bold">{activeDepositId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Invoice Ref:</span>
                        <span className="text-[var(--text-primary)] font-bold">{activeInvoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Status:</span>
                        <span className="text-[var(--warning-color)] font-bold uppercase">Pending Admin Verification</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Our admin auditor will verify your transaction shortly and credit your balance automatically. You can track this in History.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadDepositInvoice}
                        className="flex-1 min-h-[42px] py-2.5 rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download size={14} /> Download PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDepositStep('amount');
                          setDepositAmount('200');
                          setDepositScreenshot(null);
                          setDepositTxnId('');
                          onClose();
                        }}
                        className="flex-1 min-h-[42px] py-2.5 rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
                      >
                        Done / View Balance
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* Sub-Tab 2: Payment ID Instant Redeem */
                <form onSubmit={handleRedeemPaymentId} className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[var(--warning-color)]/10 border border-[var(--warning-color)]/30 text-[11px] text-[var(--text-primary)]">
                    Pre-paid Payment IDs are issued by the admin and immediately credit cash to your wallet with zero waiting time!
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Enter Payment ID Code *
                    </label>
                    <input
                      type="text"
                      value={paymentIdCode}
                      onChange={e => setPaymentIdCode(e.target.value)}
                      placeholder="e.g. GAME-VIP-100"
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-xs font-mono uppercase font-bold text-[var(--warning-color)] focus:outline-none focus:border-[var(--glow-color-1)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRedeeming}
                    className="w-full min-h-[44px] py-2.5 rounded-xl btn-accent text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {isRedeeming ? 'Redeeming...' : 'Redeem Code & Add Cash'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: WITHDRAW FLOW */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border-color)] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[var(--text-secondary)] block">
                      Withdrawable Balance (Winning + Bonus)
                    </span>
                    <span className="text-xl font-black text-emerald-400">
                      ₹{totalWithdrawable.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold bg-slate-800 px-2 py-1 rounded-lg">
                    Min: ₹{minWithdraw}
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-color)]/60 text-[11px] text-[var(--text-secondary)]">
                  <span>🏆 Winnings: <strong className="text-white">₹{winningCash.toFixed(2)}</strong></span>
                  <span>🎁 Bonus: <strong className="text-white">₹{bonusCash.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Conversion shortcut banner */}
              <div
                onClick={() => setActiveTab('convert')}
                className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between cursor-pointer hover:bg-purple-500/15 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Repeat size={16} className="text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-purple-300">
                      Convert to Deposit Balance instead?
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">
                      Instant 0-fee credit to join matches immediately
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-400">Convert →</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Withdrawal Amount (Min ₹{minWithdraw}) *
                </label>
                <input
                  type="number"
                  min={minWithdraw}
                  step="any"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder={`Min ₹${minWithdraw}`}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Withdrawal Method *
                </label>
                <select
                  value={withdrawMethod}
                  onChange={e => setWithdrawMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-xs font-bold text-white"
                >
                  <option value="Easypaisa">EasyPaisa</option>
                  <option value="Jazz Cash">JazzCash</option>
                  <option value="SadaPay">SadaPay</option>
                  <option value="NayaPay">NayaPay</option>
                  <option value="Bank Transfer">Bank Transfer (IBAN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Account Number / Mobile Number *
                </label>
                <input
                  type="text"
                  value={withdrawAccount}
                  onChange={e => setWithdrawAccount(e.target.value)}
                  placeholder="e.g. 03001234567 or IBAN"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="text-[11px] text-gray-400 bg-[var(--card-bg)] p-2.5 rounded-xl border border-[var(--border-color)]">
                Withdrawals are audited and transferred within 1 to 24 hours. Rejected requests are automatically refunded to your Winning Balance.
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || totalWithdrawable < minWithdraw}
                className="w-full min-h-[44px] py-2.5 rounded-xl btn-accent text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isWithdrawing ? 'Submitting Request...' : `Submit Withdrawal Request`}
              </button>
            </form>
          )}

          {/* TAB: COIN SHARING (P2P TRANSFER WITH 3.5% FEE) */}
          {activeTab === 'share' && (
            <div className="space-y-4 text-xs">
              {transferSuccess ? (
                <div className="p-5 rounded-3xl bg-cyan-950/40 border border-cyan-500/40 text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white uppercase">Coins Sent Successfully!</h4>
                    <p className="text-xs text-gray-300 mt-1">
                      Credited <strong className="text-cyan-400">₹{transferSuccess.netAmount}</strong> as deposit coins to{' '}
                      <strong className="text-white">{transferSuccess.recipientName}</strong>.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Platform transaction fee (3.5%): ₹{transferSuccess.fee}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransferSuccess(null)}
                    className="w-full min-h-[42px] py-2.5 rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Share More Coins
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  {/* Explainer card */}
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wide">
                      <Send size={14} /> Peer-to-Peer Coin Sharing
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Send coins instantly to teammates or friends by their Game UID, Mobile Number, or User ID. Transferred coins go straight into the recipient's deposit wallet balance so they can register for scrims and tournaments.
                    </p>
                    <div className="text-[10px] text-amber-300 font-bold pt-1">
                      ⚡ Transaction fee: 3.5% deducted from sender on transfer.
                    </div>
                  </div>

                  {/* Sender Balance Pill */}
                  <div className="p-3 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-bold">
                        Your Available Deposit Balance
                      </span>
                      <span className="text-lg font-black text-white">₹{balance.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded-lg">
                      Ready to Transfer
                    </span>
                  </div>

                  {/* Recipient Input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">
                      Recipient Player *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Mobile Number, Game UID, or User ID"
                      value={transferRecipient}
                      onChange={e => setTransferRecipient(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-xs text-white font-bold placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                      Matches recipient's registered mobile number, in-game name/UID, or account ID.
                    </span>
                  </div>

                  {/* Transfer Amount Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                        Coins to Send (₹) *
                      </label>
                      <span className="text-[10px] text-gray-400">Min ₹10</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-cyan-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="10"
                        step="any"
                        required
                        value={transferAmount}
                        onChange={e => setTransferAmount(e.target.value)}
                        placeholder="e.g. 100"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-sm font-black text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[50, 100, 200, 500].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTransferAmount(val.toString())}
                        className={`min-h-[38px] rounded-xl text-xs font-bold tabular-nums cursor-pointer ${
                          transferAmount === val.toString() ? 'btn-accent' : 'btn-theme-outline'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>

                  {/* Live Breakdown Box with 3.5% fee */}
                  {(() => {
                    const parsed = parseFloat(transferAmount) || 0;
                    const fee = Math.round(parsed * 0.035 * 100) / 100;
                    const totalDeducted = Math.round((parsed + fee) * 100) / 100;
                    const isExceeding = totalDeducted > balance;

                    return (
                      <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[var(--text-secondary)]">
                          <span>Recipient Receives (Deposit Coins):</span>
                          <strong className="text-[var(--text-primary)] text-sm tabular-nums">₹{parsed.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between items-center text-[var(--text-secondary)]">
                          <span>Platform Transfer Fee (3.5%):</span>
                          <span className="font-mono text-[var(--warning-color)] font-bold tabular-nums">+₹{fee.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border-color)] flex justify-between items-center">
                          <span className="font-bold text-[var(--text-primary)]">Total Deducted from You:</span>
                          <span className={`text-base font-black tabular-nums ${isExceeding ? 'text-[var(--danger-color)]' : 'text-[var(--glow-color-1)]'}`}>
                            ₹{totalDeducted.toFixed(2)}
                          </span>
                        </div>
                        {isExceeding && (
                          <div className="text-[10px] text-[var(--danger-color)] font-bold">
                            Insufficient balance. You need ₹{totalDeducted.toFixed(2)} but have ₹{balance.toFixed(2)}.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="w-full min-h-[46px] py-3 rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{isTransferring ? 'Sending Coins...' : `Transfer Coins Now`}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: WITHDRAWAL BALANCE TO DEPOSIT BALANCE CONVERSION */}
          {activeTab === 'convert' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/40 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-black uppercase tracking-wider">
                  <Repeat size={16} /> Withdrawal to Deposit Conversion
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Instantly convert your withdrawable winning and bonus cash into Main Deposit Balance with <strong>zero fee</strong> and immediate credit to register for scrims and tournaments right away!
                </p>

                {/* Balances Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-[var(--text-secondary)] block font-bold uppercase">
                      Withdrawable Cash
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      ₹{totalWithdrawable.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">
                      Win: ₹{winningCash.toFixed(0)} • Bonus: ₹{bonusCash.toFixed(0)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-[var(--text-secondary)] block font-bold uppercase">
                      Current Deposit Cash
                    </span>
                    <span className="text-base font-black text-amber-400">
                      ₹{balance.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">
                      Match Entries Only
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion Form */}
              <form onSubmit={handleConvertBalance} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[var(--text-primary)] uppercase">
                      Amount to Convert (PKR) *
                    </label>
                    <span className="text-[10px] text-purple-300 font-bold">
                      Max: ₹{totalWithdrawable.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-purple-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={totalWithdrawable}
                      step="any"
                      value={convertAmount}
                      onChange={e => setConvertAmount(e.target.value)}
                      placeholder="e.g. 100"
                      required
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-sm font-black text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Percentage Shortcuts */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.25, 0.5, 0.75, 1.0].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const val = Math.floor(totalWithdrawable * pct);
                        setConvertAmount(val > 0 ? val.toString() : '');
                      }}
                      className="min-h-[36px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                {parseFloat(convertAmount) > 0 && (
                  <div className="p-3 rounded-2xl bg-[var(--glow-color-1)]/10 border border-[var(--glow-color-1)]/30 text-[11px] space-y-1 font-mono">
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Deducted from Withdrawable:</span>
                      <span>- ₹{parseFloat(convertAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--success-color)] font-bold">
                      <span>Added to Deposit Balance:</span>
                      <span>+ ₹{parseFloat(convertAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-primary)] font-bold pt-1 border-t border-[var(--border-color)]">
                      <span>New Deposit Balance:</span>
                      <span>₹{(balance + parseFloat(convertAmount)).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isConverting || totalWithdrawable <= 0 || !convertAmount}
                  className="w-full min-h-[46px] py-3 rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Repeat size={14} />
                  {isConverting
                    ? 'Converting Funds...'
                    : `Convert ₹${convertAmount || '0'} to Deposit Balance`}
                </button>
              </form>

              {/* Pending Withdrawals Conversion Section */}
              {userPendingWithdrawals.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
                  <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                    Convert Pending Withdrawal Requests
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Have an ongoing withdrawal awaiting bank transfer? You can cancel and convert it directly into Deposit Balance to play right away:
                  </p>
                  {userPendingWithdrawals.map(w => (
                    <div
                      key={w.id}
                      className="p-3 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-[var(--warning-color)]">
                          ₹{w.amount} → {w.methodDetails?.methodName}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          Requested: {new Date(w.requestTimestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConvertPendingWithdrawal(w.id)}
                        disabled={convertingWithdrawalId === w.id}
                        className="px-3 min-h-[36px] rounded-xl btn-theme-soft text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        {convertingWithdrawalId === w.id ? 'Converting...' : 'Convert to Deposit'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                All Transactions & Receipts
              </h4>
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div
                      key={tx.id || idx}
                      className="p-3 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-primary)] block">
                          {tx.description}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {new Date(tx.timestamp).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-black text-sm block tabular-nums ${
                            isPositive ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}₹{Math.abs(tx.amount || 0).toFixed(2)}
                        </span>
                        {tx.status && (
                          <span className="text-[9px] uppercase font-bold text-gray-400">
                            {tx.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-8 text-xs text-gray-400">
                  No transaction history recorded yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
