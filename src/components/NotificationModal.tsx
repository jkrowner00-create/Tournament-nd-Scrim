import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, Calendar, Megaphone, Check, CheckCheck } from 'lucide-react';

interface NotificationModalProps {
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const {
    notifications,
    readNotifIds,
    markNotificationAsRead,
    markNotificationsAsRead,
    currentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const userNotifs = notifications.filter(
    n => n.target === 'all' || (currentUser && n.target === currentUser.uid)
  );

  const unreadItems = userNotifs.filter(n => !readNotifIds.includes(n.id));
  const displayedNotifs = activeTab === 'unread' ? unreadItems : userNotifs;

  const handleMarkAll = () => {
    markNotificationsAsRead();
    showToast('All announcements marked as read!', 'success');
  };

  const handleMarkSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(id);
    showToast('Notification marked as read', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg max-h-[85vh] rounded-2xl border border-[var(--border-color)] overflow-hidden flex flex-col shadow-2xl animate-card-enter">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--glow-color-1)]/15 border border-[var(--warning-color)]/30 flex items-center justify-center text-[var(--warning-color)]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                  Announcements & Alerts
                </h3>
                {unreadItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[var(--danger-color)] text-white">
                    {unreadItems.length} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Match schedules, custom room IDs, and tournament updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadItems.length > 0 && (
              <button
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-xl btn-theme-soft text-xs font-bold cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Sub-bar */}
        <div className="px-4 py-2 border-b border-[var(--border-color)]/50 bg-[var(--surface-color)]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 min-h-[34px] rounded-xl text-xs font-bold cursor-pointer ${
                activeTab === 'all' ? 'btn-accent' : 'btn-theme-outline'
              }`}
            >
              All ({userNotifs.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3.5 min-h-[34px] rounded-xl text-xs font-bold cursor-pointer ${
                activeTab === 'unread' ? 'btn-accent' : 'btn-theme-outline'
              }`}
            >
              Unread ({unreadItems.length})
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {displayedNotifs.length > 0 ? (
            displayedNotifs.map(n => {
              const isUnread = !readNotifIds.includes(n.id);
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isUnread
                      ? 'bg-gradient-to-r from-amber-500/10 via-[var(--secondary-bg)] to-[var(--secondary-bg)] border-[var(--warning-color)] shadow-md'
                      : 'bg-[var(--secondary-bg)]/80 border-[var(--border-color)]/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isUnread
                          ? 'bg-[var(--warning-color)]/20 text-[var(--warning-color)]'
                          : 'bg-white/5 text-gray-400'
                      }`}>
                        <Megaphone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-xs font-bold text-[var(--text-primary)]">
                            {n.title}
                          </strong>
                          {n.matchType && n.matchType !== 'all' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              [{n.matchType}]
                            </span>
                          )}
                          {isUnread && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[var(--warning-color)] text-black">
                              Unread
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(n.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {isUnread ? (
                      <button
                        onClick={e => handleMarkSingle(n.id, e)}
                        className="inline-flex items-center gap-1 px-3 min-h-[32px] rounded-xl btn-theme-soft text-[10px] font-bold cursor-pointer"
                        title="Mark this announcement as read"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Read</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-[var(--success-color)]" /> Read
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed pl-9">
                    {n.message}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>
                {activeTab === 'unread'
                  ? 'All caught up! No unread announcements.'
                  : 'No notifications at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
