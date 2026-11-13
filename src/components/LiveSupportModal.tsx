import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Headset, Send, MessageCircle, X } from 'lucide-react';

interface LiveSupportModalProps {
  onClose: () => void;
}

export const LiveSupportModal: React.FC<LiveSupportModalProps> = ({ onClose }) => {
  const { chatMessages, sendUserChatMessage, settings, currentUser } = useApp();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      await sendUserChatMessage(inputText);
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const cleanWaNumber = (settings.supportContact || '').replace(/[^0-9]/g, '');
  const waUrl = cleanWaNumber ? `https://wa.me/${cleanWaNumber}` : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="glass-panel w-full max-w-lg h-[560px] max-h-[92vh] rounded-2xl border border-[var(--border-color)] overflow-hidden flex flex-col shadow-2xl animate-card-enter">
        {/* Header */}
        <div className="p-3.5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Headset className="w-5 h-5 text-[var(--warning-color)]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Live Support & Ticket Center
              </h3>
              <p className="text-[10px] text-[var(--success-color)] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success-color)] inline-block" />
                Staff Online • Instant Assistance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cleanWaNumber && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 min-h-[34px] text-xs font-bold rounded-xl btn-theme-success flex items-center gap-1"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-black/40">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--text-secondary)]">
              <Headset className="w-12 h-12 text-[var(--warning-color)] mb-2 opacity-80" />
              <strong className="text-sm text-[var(--text-primary)]">
                How can we help you today?
              </strong>
              <p className="max-w-xs mt-1">
                Drop your query below regarding tournament rules, slot bookings, or withdrawal approvals. Our admin will respond directly.
              </p>
            </div>
          ) : (
            chatMessages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed break-words shadow-sm ${
                      isUser
                        ? 'bg-[var(--glow-color-1)] text-[var(--btn-accent-text)] font-bold rounded-tr-none'
                        : 'bg-[var(--secondary-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] mt-0.5 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-2.5 border-t border-[var(--border-color)] bg-[var(--secondary-bg)] flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={currentUser ? 'Type your message here...' : 'Please login to send message'}
            disabled={!currentUser || isSending}
            className="flex-1 px-3 py-2 app-input text-xs"
          />
          <button
            type="submit"
            disabled={!currentUser || !inputText.trim() || isSending}
            className="px-4 min-h-[40px] rounded-xl btn-accent font-bold flex items-center justify-center disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
