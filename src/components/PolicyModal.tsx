import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Gift, Copy, Check, X, Users, Clock } from 'lucide-react';

interface PolicyModalProps {
  policyType: 'privacy' | 'terms' | 'refund' | 'fairPlay' | 'refer';
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyType, onClose }) => {
  const { settings, userProfile, applyReferralCode, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [lateCodeInput, setLateCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  let title = 'Information';
  let content = '';

  if (policyType === 'privacy') {
    title = 'Privacy Policy';
    content = settings.policyPrivacy;
  } else if (policyType === 'terms') {
    title = 'Terms & Conditions';
    content = settings.policyTerms;
  } else if (policyType === 'refund') {
    title = 'Refund & Cancellation Policy';
    content = settings.policyRefund;
  } else if (policyType === 'fairPlay') {
    title = 'Fair Play & Anti-Cheat Policy';
    content = settings.policyFairPlay;
  } else if (policyType === 'refer') {
    title = 'Refer & Earn Rewards';
  }

  const referralCode = userProfile?.referralCode || 'ESPORTS10';
  const referralBonus = settings.referralBonus || 10;
  const referralEarnings = userProfile?.referralEarnings || 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast('Referral code copied!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareLink = () => {
    const link = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    showToast('Shareable referral link copied!', 'success');
  };

  const handleApplyLateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lateCodeInput.trim()) return;

    setIsApplying(true);
    try {
      await applyReferralCode(lateCodeInput);
      setLateCodeInput('');
    } catch (err: any) {
      showToast(err.message || 'Could not apply referral code.', 'danger');
    } finally {
      setIsApplying(false);
    }
  };

  const hoursOld = userProfile?.createdAt ? (Date.now() - userProfile.createdAt) / 3600000 : 99;
  const canApplyLateCode = !userProfile?.referredBy && hoursOld <= 48;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg max-h-[85vh] rounded-2xl border border-[var(--border-color)] overflow-hidden flex flex-col animate-card-enter">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)]">
          <div className="flex items-center gap-2">
            {policyType === 'refer' ? (
              <Gift className="w-5 h-5 text-[var(--warning-color)]" />
            ) : (
              <Shield className="w-5 h-5 text-[var(--warning-color)]" />
            )}
            <h3 className="font-bold text-base text-[var(--text-primary)]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {policyType === 'refer' ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-[var(--warning-color)] flex items-center justify-center">
                <Gift className="w-7 h-7 text-[var(--warning-color)]" />
              </div>

              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  Invite Squad Mates & Earn ₹{referralBonus}
                </h4>
                <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                  Share your referral link with friends. When they join a tournament, your wallet receives ₹{referralBonus} cash reward!
                </p>
              </div>

              {/* Referral Code Card */}
              <div className="p-4 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)]">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                  Your Unique Referral Code
                </span>
                <div className="flex items-center justify-center gap-2 my-2">
                  <span className="text-2xl font-black font-mono tracking-widest text-[var(--warning-color)]">
                    {referralCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="w-9 h-9 rounded-xl btn-theme-soft flex items-center justify-center cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-[var(--success-color)]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={handleShareLink}
                  className="w-full min-h-[42px] mt-2 py-2 rounded-xl btn-accent font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Share Referral Link
                </button>
              </div>

              {/* Referral Stats */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Referral Reward</span>
                  </div>
                  <strong className="text-sm font-bold text-[var(--warning-color)]">
                    ₹{referralBonus} Per Friend
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-1">
                    <Gift className="w-3.5 h-3.5 text-green-400" />
                    <span>Total Earned</span>
                  </div>
                  <strong className="text-sm font-bold text-green-400">
                    ₹{referralEarnings.toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Apply Late Referral Code */}
              {canApplyLateCode && (
                <form
                  onSubmit={handleApplyLateCode}
                  className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-left space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Were you invited by a friend? (48hr window)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lateCodeInput}
                      onChange={e => setLateCodeInput(e.target.value)}
                      placeholder="Enter Friend's Refer Code"
                      className="flex-1 px-3 py-1.5 app-input text-xs font-mono uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !lateCodeInput.trim()}
                      className="px-4 min-h-[38px] rounded-xl btn-accent text-xs font-extrabold disabled:opacity-50 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)] text-xs">
              {content || 'Policy details will be loaded here shortly.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
