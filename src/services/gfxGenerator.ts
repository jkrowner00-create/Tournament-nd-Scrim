// High-Resolution Canvas GFX Generator for Esports Receipts, Match Credentials & Winner Posters

export interface WithdrawalReceiptOptions {
  amount: number | string;
  sentByName: string; // "Name he sent by"
  appName: string; // "app name" (e.g. Easypaisa, JazzCash, SadaPay)
  sentWithNumber: string; // "the number he sent with"
  recipientName: string;
  recipientAccount: string;
  transactionRef: string;
  dateStr?: string;
  note?: string;
  platformName?: string;
}

export interface MatchCredentialsGfxOptions {
  tournamentTitle: string;
  gameName: string;
  mapName: string;
  mode: string;
  roomId: string;
  roomPassword: string;
  matchTimeStr: string;
  prizePool?: number | string;
  customRules?: string;
  platformName?: string;
}

export interface WinnerPodiumGfxOptions {
  tournamentTitle: string;
  gameName: string;
  dateStr: string;
  firstPlace: { name: string; prize: number | string; kills?: number | string };
  secondPlace?: { name: string; prize: number | string; kills?: number | string };
  thirdPlace?: { name: string; prize: number | string; kills?: number | string };
  totalPrizeDistributed?: number | string;
  platformName?: string;
}

export interface ScrimScheduleGfxOptions {
  scrimTitle: string;
  dateStr: string;
  totalSlots: number | string;
  entryFee: number | string;
  prizePool: number | string;
  totalMatches?: number | string;
  matches?: Array<{ matchNum: number; map: string; time?: string }>;
  schedule?: Array<{ matchNum: number; map: string; time: string }>;
  rules?: string;
  platformName?: string;
}

export interface DepositReceiptGfxOptions {
  amount: number | string;
  playerName: string;
  userEmail?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'rejected';
  dateStr?: string;
  platformName?: string;
  processedBy?: string;
  depositRef?: string;
}

export interface BillInvoiceGfxOptions {
  invoiceNumber: string;
  billName: string; // "bill name"
  appName: string; // "app name" (e.g. Easypaisa, JazzCash, SadaPay)
  accountNumber: string; // "there account number"
  accountName: string; // "there name"
  amount: number | string;
  billLogo?: string; // "the bill logo (optional)"
  qrCodeUrl?: string; // "there qr code for the Payment (optional)"
  recipientName?: string;
  recipientPhone?: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  status: 'pending' | 'completed' | 'rejected';
  dateStr?: string;
  platformName?: string;
  platformLogo?: string;
  themeColor?: string;
  confirmationId?: string;
}

// 1. Generate Ultra-Crisp High-DPI Withdrawal Payment Voucher GFX
export function generateWithdrawalReceiptCanvas(opts: WithdrawalReceiptOptions): string {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const primary = '#10B981'; // Vibrant Emerald Green
  const gold = '#F59E0B'; // Amber Gold
  const bgDark = '#090D14';
  const cardBg = '#111827';
  const textMuted = '#94A3B8';
  const textWhite = '#F8FAFC';

  // 1. Background with radial aura
  ctx.fillStyle = bgDark;
  ctx.fillRect(0, 0, width, height);

  const radial = ctx.createRadialGradient(width / 2, 180, 20, width / 2, 180, 420);
  radial.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
  radial.addColorStop(0.5, 'rgba(15, 23, 42, 0.6)');
  radial.addColorStop(1, 'rgba(9, 13, 20, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // 2. Card Frame with neon border
  const margin = 32;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const cardX = margin;
  const cardY = margin;
  const radius = 24;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
  ctx.stroke();
  ctx.restore();

  // 3. Top Decorative Ribbon
  ctx.save();
  const gradHeader = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
  gradHeader.addColorStop(0, '#047857');
  gradHeader.addColorStop(0.5, '#10B981');
  gradHeader.addColorStop(1, '#059669');
  ctx.fillStyle = gradHeader;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 8, [radius, radius, 0, 0]);
  ctx.fill();
  ctx.restore();

  // 4. Header Branding
  ctx.textAlign = 'center';
  ctx.fillStyle = gold;
  ctx.font = '900 14px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('★ OFFICIAL PAYOUT DISPATCH ★', width / 2, 85);

  ctx.fillStyle = textWhite;
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText((opts.platformName || 'SS BATTLE APP').toUpperCase(), width / 2, 122);

  ctx.fillStyle = textMuted;
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('AUTHENTIC ESPORTS CASH PRIZE VOUCHER', width / 2, 144);

  // Divider
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 30, 165);
  ctx.lineTo(cardX + cardW - 30, 165);
  ctx.stroke();

  // 5. Huge Amount Badge Box
  const badgeY = 185;
  const badgeH = 120;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX + 24, badgeY, cardW - 48, badgeH, 16);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = primary;
  ctx.font = '800 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('TOTAL AMOUNT CREDITED', width / 2, badgeY + 32);

  ctx.fillStyle = textWhite;
  ctx.font = '900 48px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '-1px';
  const cleanAmt = String(opts.amount).replace(/[^0-9.]/g, '');
  ctx.fillText(`Rs. ${Number(cleanAmt || opts.amount).toLocaleString('en-IN')}`, width / 2, badgeY + 84);

  // Status Chip below Amount
  ctx.fillStyle = '#064E3B';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 80, badgeY + 94, 160, 22, 11);
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#34D399';
  ctx.font = '900 10px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('✔ SUCCESSFUL & VERIFIED', width / 2, badgeY + 109);

  // 6. Two-Column Information Layout
  // Column 1: SENDER DETAILS (As requested: Amount, Name he sent by, App name, Number he sent with)
  const colY = 330;
  const colW = (cardW - 48 - 16) / 2;
  const col1X = cardX + 24;
  const col2X = col1X + colW + 16;
  const boxH = 290;

  // Box 1: Sender (Admin)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(col1X, colY, colW, boxH, 16);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Box 2: Receiver (Player)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(col2X, colY, colW, boxH, 16);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Column 1 Titles & Content
  ctx.textAlign = 'left';
  ctx.fillStyle = gold;
  ctx.font = '900 11px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('📤 SENDER DISPATCH INFO', col1X + 16, colY + 28);

  const renderField = (x: number, y: number, label: string, val: string, highlight = false) => {
    ctx.fillStyle = textMuted;
    ctx.font = '700 10px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(label.toUpperCase(), x, y);

    ctx.fillStyle = highlight ? '#38BDF8' : textWhite;
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '0px';
    // truncate if needed
    const maxChars = 22;
    const text = val.length > maxChars ? val.slice(0, maxChars) + '...' : val;
    ctx.fillText(text || '—', x, y + 17);
  };

  // Sender Fields: Name he sent by, App name, Number he sent with
  renderField(col1X + 16, colY + 60, 'Sent By (Sender Name)', opts.sentByName || 'Official Admin');
  renderField(col1X + 16, colY + 115, 'App Used To Send', opts.appName || 'Easypaisa / Wallet', true);
  renderField(col1X + 16, colY + 170, 'Sender Mobile / Account', opts.sentWithNumber || '—');
  renderField(col1X + 16, colY + 225, 'Authorization Seal', 'OFFICIAL DISPATCH APPROVED', false);

  // Column 2 Titles & Content (Receiver)
  ctx.fillStyle = primary;
  ctx.font = '900 11px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('📥 BENEFICIARY PLAYER', col2X + 16, colY + 28);

  renderField(col2X + 16, colY + 60, 'Player Account Name', opts.recipientName || 'Verified Player');
  renderField(col2X + 16, colY + 115, 'Receiving Account', opts.recipientAccount || '—', true);
  renderField(col2X + 16, colY + 170, 'Payout Classification', 'Tournament Prize Cash');
  renderField(col2X + 16, colY + 225, 'Status Verification', 'Instant Wallet Delivery');

  // 7. Transaction Audit Metadata Box
  const metaY = 640;
  const metaH = 180;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX + 24, metaY, cardW - 48, metaH, 16);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = textWhite;
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('TRANSACTION AUDIT LEDGER', cardX + 44, metaY + 30);

  renderField(cardX + 44, metaY + 56, 'Transaction Ref ID', opts.transactionRef || `SSB-${Date.now().toString().slice(-8)}`, true);
  renderField(cardX + 44, metaY + 110, 'Timestamp Processed', opts.dateStr || new Date().toLocaleString());

  renderField(col2X + 16, metaY + 56, 'Cryptographic Verification', 'MATCHES AUTHENTIC RTDB');
  renderField(col2X + 16, metaY + 110, 'Admin Notes', opts.note || 'Prize Distributed by SS BATTLE');

  // 8. Digital Stamp Seal Graphic on Bottom Right
  const stampX = cardX + cardW - 120;
  const stampY = metaY + 90;
  ctx.save();
  ctx.translate(stampX, stampY);
  ctx.rotate(-0.15);
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#10B981';
  ctx.font = '900 9px system-ui, -apple-system, sans-serif';
  ctx.fillText('SS BATTLE APP', 0, -12);
  ctx.font = '900 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('VERIFIED', 0, 4);
  ctx.font = '800 8px system-ui, -apple-system, sans-serif';
  ctx.fillText('OFFICIAL PAYOUT', 0, 18);
  ctx.restore();

  // 9. Bottom Footer Bar with Barcode Aesthetic
  const footerY = 855;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 30, footerY);
  ctx.lineTo(cardX + cardW - 30, footerY);
  ctx.stroke();

  // Barcode lines
  const barX = cardX + 36;
  const barY = footerY + 16;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
  const bars = [3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 4];
  let curX = barX;
  bars.forEach(b => {
    ctx.fillRect(curX, barY, b, 24);
    curX += b + 3;
  });

  ctx.textAlign = 'right';
  ctx.fillStyle = textMuted;
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('Powered by SS BATTLE APP Esports Ledger', cardX + cardW - 36, barY + 12);
  ctx.font = '500 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('Official screenshot for player records & proofs', cardX + cardW - 36, barY + 26);

  return canvas.toDataURL('image/png');
}

// 2. Generate Match Room ID & Password Announcement GFX Card
export function generateMatchCredentialsCanvas(opts: MatchCredentialsGfxOptions): string {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 900;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const amber = '#F59E0B';
  const cyan = '#06B6D4';
  const bg = '#0B0F17';
  const card = '#111827';
  const textWhite = '#F8FAFC';
  const textMuted = '#94A3B8';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Aura
  const radial = ctx.createRadialGradient(width / 2, 200, 30, width / 2, 200, 380);
  radial.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  radial.addColorStop(1, 'rgba(11, 15, 23, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Border Box
  const m = 32;
  const cw = width - m * 2;
  const ch = height - m * 2;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m, m, cw, ch, 24);
  ctx.fillStyle = card;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.stroke();
  ctx.restore();

  // Top header line
  ctx.fillStyle = amber;
  ctx.beginPath();
  ctx.roundRect(m, m, cw, 8, [24, 24, 0, 0]);
  ctx.fill();

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = amber;
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2.5px';
  ctx.fillText('⚡ OFFICIAL MATCH CREDENTIALS ⚡', width / 2, 85);

  ctx.fillStyle = textWhite;
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  ctx.fillText((opts.tournamentTitle || 'BATTLE ROYALE TOURNAMENT').toUpperCase(), width / 2, 126);

  ctx.fillStyle = textMuted;
  ctx.font = '700 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${opts.gameName || 'Battle Royale'} • Map: ${opts.mapName || 'Bermuda'} • ${opts.mode || 'Squad'}`, width / 2, 154);

  // High Stakes Room Pass Box
  const passY = 185;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m + 24, passY, cw - 48, 220, 20);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Room ID
  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '800 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('CUSTOM ROOM ID', width / 2, passY + 36);

  ctx.fillStyle = amber;
  ctx.font = '900 44px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText(opts.roomId || 'WAITING...', width / 2, passY + 84);

  // Password
  ctx.fillStyle = textMuted;
  ctx.font = '800 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('ROOM PASSWORD', width / 2, passY + 135);

  ctx.fillStyle = '#10B981';
  ctx.font = '900 40px monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText(opts.roomPassword || 'WAITING...', width / 2, passY + 180);

  // Match Time Banner
  const timeY = 430;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m + 24, timeY, cw - 48, 90, 16);
  ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = cyan;
  ctx.font = '800 11px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('SCHEDULED START TIME', width / 2, timeY + 32);

  ctx.fillStyle = textWhite;
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(opts.matchTimeStr || 'STARTING SHORTLY', width / 2, timeY + 66);

  // Warning & Rules Box
  const rulesY = 540;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m + 24, rulesY, cw - 48, 240, 16);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#EF4444';
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('⚠️ MANDATORY MATCH PROTOCOLS & RULES', m + 44, rulesY + 35);

  const rulesList = [
    '1. Join room at least 5 minutes before match start time.',
    '2. Strictly fair play: No hacks, third-party panels, or emulator teaming.',
    '3. Do NOT leak or share room ID/Password outside registered players.',
    '4. Match replay is reviewed prior to distributing winning cash prizes.',
  ];

  ctx.fillStyle = textMuted;
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  rulesList.forEach((rule, idx) => {
    ctx.fillText(rule, m + 44, rulesY + 75 + idx * 32);
  });

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Issued by ${opts.platformName || 'SS BATTLE APP'} • Official Tournament Organizers`, width / 2, height - 50);

  return canvas.toDataURL('image/png');
}

// 4. Helper to preload an image with timeout
function preloadImage(src?: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    if (!src || typeof src !== 'string' || !src.trim()) {
      return resolve(null);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
    setTimeout(() => resolve(null), 3500); // 3.5s timeout safeguard
  });
}

// 5. Draw Bill Receipt / Payment Invoice GFX on Canvas (Sync and Async)
export function renderBillInvoiceToContext(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: BillInvoiceGfxOptions,
  logoImg?: HTMLImageElement | null,
  qrImg?: HTMLImageElement | null
) {
  const isPaid = opts.status === 'completed';
  const isRejected = opts.status === 'rejected';
  const themeAccent = opts.themeColor || '#F59E0B';
  const primary = isPaid ? '#10B981' : isRejected ? '#EF4444' : themeAccent;
  const gold = '#FBBF24';
  const bgDark = '#080C14';
  const cardBg = '#0F172A';
  const innerCardBg = '#1E293B';
  const textMuted = '#94A3B8';
  const textWhite = '#F8FAFC';

  // 1. Background with radial glow
  ctx.fillStyle = bgDark;
  ctx.fillRect(0, 0, width, height);

  const radial = ctx.createRadialGradient(width / 2, 200, 30, width / 2, 200, 480);
  radial.addColorStop(0, isPaid ? 'rgba(16, 185, 129, 0.22)' : isRejected ? 'rgba(239, 68, 68, 0.22)' : 'rgba(245, 158, 11, 0.25)');
  radial.addColorStop(0.6, 'rgba(15, 23, 42, 0.65)');
  radial.addColorStop(1, 'rgba(8, 12, 20, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // 2. Main Frame Border
  const margin = 28;
  const cw = width - margin * 2;
  const ch = height - margin * 2;
  const radius = 24;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, margin, cw, ch, radius);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = isPaid ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.5)';
  ctx.stroke();
  ctx.restore();

  // 3. Top Decorative Ribbon
  ctx.save();
  const gradRibbon = ctx.createLinearGradient(margin, margin, margin + cw, margin);
  gradRibbon.addColorStop(0, isPaid ? '#047857' : '#B45309');
  gradRibbon.addColorStop(0.5, isPaid ? '#10B981' : '#F59E0B');
  gradRibbon.addColorStop(1, isPaid ? '#059669' : '#D97706');
  ctx.fillStyle = gradRibbon;
  ctx.beginPath();
  ctx.roundRect(margin, margin, cw, 10, [radius, radius, 0, 0]);
  ctx.fill();
  ctx.restore();

  // 4. Header with Logo & Platform
  let headerContentY = 82;
  if (logoImg && logoImg.width > 0) {
    try {
      ctx.save();
      const logoSize = 64;
      const logoX = width / 2 - logoSize / 2;
      const logoY = 60;
      ctx.beginPath();
      ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // Border around logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2);
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      headerContentY = 146;
    } catch {
      headerContentY = 82;
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = primary;
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('★ OFFICIAL PAYMENT BILL & INVOICE ★', width / 2, headerContentY);

  ctx.fillStyle = textWhite;
  ctx.font = '900 26px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText((opts.billName || 'OFFICIAL PAYMENT BILL').toUpperCase(), width / 2, headerContentY + 34);

  ctx.fillStyle = textMuted;
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText(`ISSUED VIA ${(opts.appName || 'EASYPAISA').toUpperCase()} • ${opts.platformName || 'SS BATTLE APP'}`, width / 2, headerContentY + 56);

  // Divider
  const divY = headerContentY + 74;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 28, divY);
  ctx.lineTo(margin + cw - 28, divY);
  ctx.stroke();

  // 5. Meta Bar: Invoice No, Date, Status
  const metaY = divY + 16;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, metaY, cw - 48, 52, 14);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Invoice Number (Left)
  ctx.textAlign = 'left';
  ctx.fillStyle = textMuted;
  ctx.font = '600 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('INVOICE REF #', margin + 40, metaY + 22);
  ctx.fillStyle = textWhite;
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(opts.invoiceNumber || 'INV-2026-0001', margin + 40, metaY + 39);

  // Date (Center)
  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '600 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('ISSUE DATE', width / 2, metaY + 22);
  ctx.fillStyle = textWhite;
  ctx.font = '700 12px system-ui, -apple-system, sans-serif';
  ctx.fillText(opts.dateStr || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }), width / 2, metaY + 39);

  // Status Badge (Right)
  ctx.textAlign = 'right';
  const statusX = margin + cw - 40;
  const statusLabel = isPaid ? 'VERIFIED / PAID' : isRejected ? 'REJECTED' : 'PENDING APPROVAL';
  ctx.fillStyle = isPaid ? '#34D399' : isRejected ? '#F87171' : '#FBBF24';
  ctx.font = '900 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(statusLabel, statusX, metaY + 33);

  // 6. Huge Amount Due Display Box
  const amountBoxY = metaY + 68;
  const amountBoxH = 110;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, amountBoxY, cw - 48, amountBoxH, 18);
  ctx.fillStyle = isPaid ? 'rgba(16, 185, 129, 0.10)' : 'rgba(245, 158, 11, 0.10)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isPaid ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)';
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('TOTAL BILL AMOUNT PAYABLE', width / 2, amountBoxY + 32);

  ctx.fillStyle = isPaid ? '#10B981' : gold;
  ctx.font = '900 44px system-ui, -apple-system, sans-serif';
  ctx.fillText(`₹ ${Number(opts.amount || 0).toLocaleString()}`, width / 2, amountBoxY + 80);

  // 7. Payment Destination & QR Section
  const detailsY = amountBoxY + amountBoxH + 18;
  const hasQr = !!(qrImg && qrImg.width > 0) || !!opts.qrCodeUrl;
  const leftColW = hasQr ? (cw - 48) * 0.62 : cw - 48;
  const rightColW = hasQr ? (cw - 48) * 0.35 : 0;
  const cardsH = 260;

  // Left Card: Beneficiary Details (App, Account Number, Account Name)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, detailsY, leftColW, cardsH, 16);
  ctx.fillStyle = innerCardBg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = primary;
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('📥 BENEFICIARY RECEIVING DETAILS', margin + 44, detailsY + 32);

  const drawRow = (label: string, val: string, yPos: number, highlight = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = textMuted;
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(label.toUpperCase(), margin + 44, yPos);

    ctx.fillStyle = highlight ? '#FBBF24' : textWhite;
    ctx.font = highlight ? '900 16px system-ui, -apple-system, sans-serif' : '700 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(val, margin + 44, yPos + 22);
  };

  drawRow('Payment App / Gateway', opts.appName || 'Easypaisa', detailsY + 68);
  drawRow('Account Number / Mobile', opts.accountNumber || '03709892708', detailsY + 128, true);
  drawRow('Account Holder Name', opts.accountName || 'Shamroz Khan', detailsY + 188);

  // Optional Recipient
  if (opts.recipientName) {
    ctx.fillStyle = textMuted;
    ctx.font = '600 10px system-ui, -apple-system, sans-serif';
    ctx.fillText(`BILL FOR: ${opts.recipientName.toUpperCase()}${opts.recipientPhone ? ` (${opts.recipientPhone})` : ''}`, margin + 44, detailsY + 238);
  }

  // Right Card: QR Code
  if (hasQr) {
    const qrX = margin + 24 + leftColW + (cw - 48) * 0.03;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(qrX, detailsY, rightColW, cardsH, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = primary;
    ctx.stroke();
    ctx.restore();

    if (qrImg && qrImg.width > 0) {
      try {
        const qrPadding = 16;
        const qrSize = Math.min(rightColW - qrPadding * 2, 175);
        const qrImgX = qrX + (rightColW - qrSize) / 2;
        const qrImgY = detailsY + 20;
        ctx.drawImage(qrImg, qrImgX, qrImgY, qrSize, qrSize);
      } catch {
        // Fallback placeholder
      }
    } else {
      // Mock QR graphic pattern if image not preloaded
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.font = '900 13px system-ui, -apple-system, sans-serif';
      ctx.fillText('PAY VIA QR', qrX + rightColW / 2, detailsY + 95);
      ctx.fillStyle = '#475569';
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('Scan with App', qrX + rightColW / 2, detailsY + 118);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 11px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('SCAN & PAY NOW', qrX + rightColW / 2, detailsY + cardsH - 24);
    ctx.fillStyle = '#64748B';
    ctx.font = '600 9px system-ui, -apple-system, sans-serif';
    ctx.fillText((opts.appName || 'EASYPAISA').toUpperCase(), qrX + rightColW / 2, detailsY + cardsH - 10);
  }

  // 8. Payment Instructions / Note Box
  const noteBoxY = detailsY + cardsH + 18;
  const noteBoxH = 92;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, noteBoxY, cw - 48, noteBoxH, 14);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FBBF24';
  ctx.font = '900 11px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('ℹ️ PAYMENT & VERIFICATION INSTRUCTIONS', margin + 44, noteBoxY + 28);

  ctx.fillStyle = textMuted;
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  const defaultNote =
    opts.note ||
    '1. Send the exact amount using your payment app • 2. Take a transaction screenshot • 3. Submit proof to Admin to activate instantly.';
  ctx.fillText(defaultNote.slice(0, 100), margin + 44, noteBoxY + 52);
  if (defaultNote.length > 100) {
    ctx.fillText(defaultNote.slice(100, 200), margin + 44, noteBoxY + 70);
  }

  // 9. Digital Stamps & Barcode
  if (isPaid) {
    // Large Angled Verified Approval Stamp
    ctx.save();
    ctx.translate(width / 2 + 130, detailsY + 90);
    ctx.rotate((-14 * Math.PI) / 180);

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 4;
    ctx.strokeRect(-135, -42, 270, 84);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.fillRect(-135, -42, 270, 84);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#10B981';
    ctx.font = '900 20px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('VERIFIED & PAID', 0, -8);

    ctx.font = '800 11px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('OFFICIALLY CONFIRMED', 0, 14);

    ctx.font = '600 9px system-ui, -apple-system, sans-serif';
    ctx.fillText(`CONFIRM REF: ${opts.confirmationId || opts.invoiceNumber}`, 0, 29);
    ctx.restore();
  }

  // 10. Barcode & Security Hash
  const barcodeY = noteBoxY + noteBoxH + 20;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  const barCount = 48;
  const barStart = width / 2 - 130;
  for (let i = 0; i < barCount; i++) {
    const barW = (i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2);
    ctx.fillRect(barStart + i * 5.4, barcodeY, barW, 26);
  }

  // Footer branding
  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `Authentic Esports Bill • Verified by ${opts.platformName || 'SS BATTLE APP'} • Support: +92 3709892708`,
    width / 2,
    height - 44
  );
}

// Synchronous bill invoice generation
export function generateBillInvoiceCanvas(opts: BillInvoiceGfxOptions): string {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  renderBillInvoiceToContext(ctx, width, height, opts);
  return canvas.toDataURL('image/png');
}

// Asynchronous bill invoice generation (preloads logo and QR code images)
export async function generateBillInvoiceCanvasAsync(opts: BillInvoiceGfxOptions): Promise<string> {
  const [logoImg, qrImg] = await Promise.all([
    preloadImage(opts.billLogo || opts.platformLogo),
    preloadImage(opts.qrCodeUrl),
  ]);

  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  renderBillInvoiceToContext(ctx, width, height, opts, logoImg, qrImg);
  return canvas.toDataURL('image/png');
}

// Helper to format WhatsApp-shareable Bill Invoice Text
export function formatWhatsAppBillText(opts: BillInvoiceGfxOptions & { invoiceUrl?: string }): string {
  const isPaid = opts.status === 'completed';
  const invoiceLink =
    opts.invoiceUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/?invoice=${opts.confirmationId || opts.invoiceNumber}`
      : '');

  return [
    `🧾 *${(opts.platformName || 'SS BATTLE APP').toUpperCase()} — OFFICIAL BILL INVOICE*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 *Bill Name:* ${opts.billName}`,
    `🆔 *Invoice No:* ${opts.invoiceNumber}`,
    `📅 *Date:* ${opts.dateStr || new Date().toLocaleDateString()}`,
    `💰 *AMOUNT DUE:* ₹${Number(opts.amount || 0).toLocaleString()}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📥 *PAYMENT DETAILS:*`,
    `• *Payment App:* ${opts.appName}`,
    `• *Account Number:* ${opts.accountNumber}`,
    `• *Account Name:* ${opts.accountName}`,
    opts.recipientName ? `• *Customer:* ${opts.recipientName}` : '',
    `━━━━━━━━━━━━━━━━━━━━`,
    invoiceLink ? `🔗 *View Invoice Online:* ${invoiceLink}` : '',
    `⚡ *Status:* ${isPaid ? '✅ VERIFIED & CONFIRMED (PAID)' : '⏳ PENDING VERIFICATION'}`,
    opts.note ? `\n📝 *Instructions:* ${opts.note}` : '',
    `\n⚠️ *Important:* Please send transaction screenshot after payment to confirm activation.`,
    `━━━━━━━━━━━━━━━━━━━━`,
  ]
    .filter(Boolean)
    .join('\n');
}

// 7. Generate High-DPI Deposit Voucher GFX Receipt
export function generateDepositReceiptCanvas(opts: DepositReceiptGfxOptions): string {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 950;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const isApproved = opts.status === 'completed';
  const primary = isApproved ? '#10B981' : '#F59E0B'; // Emerald / Amber
  const bgDark = '#090D14';
  const cardBg = '#0F172A';
  const textMuted = '#94A3B8';
  const textWhite = '#F8FAFC';

  // Background
  ctx.fillStyle = bgDark;
  ctx.fillRect(0, 0, width, height);

  const radial = ctx.createRadialGradient(width / 2, 170, 20, width / 2, 170, 420);
  radial.addColorStop(0, isApproved ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)');
  radial.addColorStop(0.5, 'rgba(15, 23, 42, 0.6)');
  radial.addColorStop(1, 'rgba(9, 13, 20, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Border Frame
  const margin = 28;
  const cw = width - margin * 2;
  const ch = height - margin * 2;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, margin, cw, ch, 24);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = isApproved ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.5)';
  ctx.stroke();
  ctx.restore();

  // Top Ribbon
  ctx.save();
  const ribbon = ctx.createLinearGradient(margin, margin, margin + cw, margin);
  ribbon.addColorStop(0, isApproved ? '#047857' : '#B45309');
  ribbon.addColorStop(0.5, isApproved ? '#10B981' : '#F59E0B');
  ribbon.addColorStop(1, isApproved ? '#059669' : '#D97706');
  ctx.fillStyle = ribbon;
  ctx.beginPath();
  ctx.roundRect(margin, margin, cw, 10, [24, 24, 0, 0]);
  ctx.fill();
  ctx.restore();

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = primary;
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('★ OFFICIAL DEPOSIT RECEIPT ★', width / 2, 85);

  ctx.fillStyle = textWhite;
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText((opts.platformName || 'SS BATTLE APP').toUpperCase(), width / 2, 124);

  ctx.fillStyle = textMuted;
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('VERIFIED PLAYER WALLET TOP-UP RECORD', width / 2, 146);

  // Divider
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 28, 168);
  ctx.lineTo(margin + cw - 28, 168);
  ctx.stroke();

  // Amount Box
  const amountBoxY = 188;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, amountBoxY, cw - 48, 120, 18);
  ctx.fillStyle = isApproved ? 'rgba(16, 185, 129, 0.10)' : 'rgba(245, 158, 11, 0.10)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isApproved ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)';
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('AMOUNT CREDITED TO WALLET', width / 2, amountBoxY + 34);

  ctx.fillStyle = isApproved ? '#10B981' : '#FBBF24';
  ctx.font = '900 48px system-ui, -apple-system, sans-serif';
  ctx.fillText(`+₹ ${Number(opts.amount || 0).toLocaleString()}`, width / 2, amountBoxY + 85);

  // Player & Transaction Details Box
  const detailsY = 328;
  const detailsH = 340;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, detailsY, cw - 48, detailsH, 16);
  ctx.fillStyle = '#1E293B';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  const drawRow = (label: string, val: string, yPos: number, isBig = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = textMuted;
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(label.toUpperCase(), margin + 44, yPos);

    ctx.fillStyle = isBig ? '#FBBF24' : textWhite;
    ctx.font = isBig ? '900 17px system-ui, -apple-system, sans-serif' : '700 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(val, margin + 44, yPos + 22);
  };

  drawRow('Account / Player Name', opts.playerName || 'Verified Player', detailsY + 36, true);
  drawRow('Deposit Reference #', opts.depositRef || `DEP-${Date.now().toString().slice(-8)}`, detailsY + 98);
  drawRow('Gateway / Bank Transaction ID', opts.transactionId || 'Verified By Admin', detailsY + 160);
  drawRow('Verified Date & Time', opts.dateStr || new Date().toLocaleString(), detailsY + 222);
  drawRow('Deposit Status', isApproved ? 'CONFIRMED & AVAILABLE IN BALANCE' : 'PENDING APPROVAL', detailsY + 284);

  // Digital Approved Stamp
  if (isApproved) {
    ctx.save();
    ctx.translate(width / 2 + 150, detailsY + 150);
    ctx.rotate((-12 * Math.PI) / 180);

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-125, -38, 250, 76);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(-125, -38, 250, 76);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#10B981';
    ctx.font = '900 18px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('VERIFIED & CREDITED', 0, -6);

    ctx.font = '700 10px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('OFFICIAL RECEIPT SEAL', 0, 14);
    ctx.restore();
  }

  // Barcode
  const barY = detailsY + detailsH + 24;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  for (let i = 0; i < 48; i++) {
    const barW = (i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2);
    ctx.fillRect(width / 2 - 130 + i * 5.4, barY, barW, 24);
  }

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Issued by ${opts.platformName || 'SS BATTLE APP'} • Official Deposit Auditor`, width / 2, height - 42);

  return canvas.toDataURL('image/png');
}

// 8. Generate Scrim Schedule & Match Maps GFX
export function generateScrimScheduleCanvas(opts: ScrimScheduleGfxOptions): string {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const amber = '#F59E0B';
  const cyan = '#06B6D4';
  const bgDark = '#080C14';
  const cardBg = '#0F172A';
  const innerCardBg = '#1E293B';
  const textMuted = '#94A3B8';
  const textWhite = '#F8FAFC';

  // Background
  ctx.fillStyle = bgDark;
  ctx.fillRect(0, 0, width, height);

  const radial = ctx.createRadialGradient(width / 2, 180, 30, width / 2, 180, 480);
  radial.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  radial.addColorStop(0.6, 'rgba(15, 23, 42, 0.7)');
  radial.addColorStop(1, 'rgba(8, 12, 20, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Border Frame
  const margin = 28;
  const cw = width - margin * 2;
  const ch = height - margin * 2;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, margin, cw, ch, 24);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.stroke();
  ctx.restore();

  // Top Ribbon
  ctx.save();
  const ribbon = ctx.createLinearGradient(margin, margin, margin + cw, margin);
  ribbon.addColorStop(0, '#B45309');
  ribbon.addColorStop(0.5, '#F59E0B');
  ribbon.addColorStop(1, '#D97706');
  ctx.fillStyle = ribbon;
  ctx.beginPath();
  ctx.roundRect(margin, margin, cw, 10, [24, 24, 0, 0]);
  ctx.fill();
  ctx.restore();

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = amber;
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('⚡ OFFICIAL SCRIM MATCH SCHEDULE ⚡', width / 2, 85);

  ctx.fillStyle = textWhite;
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText((opts.scrimTitle || 'COMPETITIVE TIER-1 SCRIMS').toUpperCase(), width / 2, 125);

  ctx.fillStyle = textMuted;
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText(`TOTAL MATCHES: ${opts.totalMatches || 3} • SLOTS: ${opts.totalSlots || 15} • ${opts.platformName || 'SS BATTLE APP'}`, width / 2, 148);

  // Divider
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 28, 168);
  ctx.lineTo(margin + cw - 28, 168);
  ctx.stroke();

  // Stakes Bar: Prize Pool & Entry Fee
  const barY = 186;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, barY, cw - 48, 64, 14);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '600 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('TOTAL PRIZE POOL', width / 2 - 150, barY + 24);
  ctx.fillStyle = '#FBBF24';
  ctx.font = '900 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(`₹ ${Number(opts.prizePool || 0).toLocaleString()}`, width / 2 - 150, barY + 48);

  ctx.fillStyle = textMuted;
  ctx.font = '600 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('ENTRY FEE', width / 2 + 150, barY + 24);
  ctx.fillStyle = '#34D399';
  ctx.font = '900 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(Number(opts.entryFee || 0) === 0 ? 'FREE ENTRY' : `₹ ${opts.entryFee}`, width / 2 + 150, barY + 48);

  // Matches Grid
  const matchesY = 270;
  const matchList = opts.matches && opts.matches.length > 0
    ? opts.matches
    : [
        { matchNum: 1, map: 'Bermuda', time: 'Match 1' },
        { matchNum: 2, map: 'Purgatory', time: 'Match 2' },
        { matchNum: 3, map: 'Nextera', time: 'Match 3' },
      ];

  ctx.textAlign = 'left';
  ctx.fillStyle = amber;
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('🗺️ MATCH BY MATCH MAP BREAKDOWN', margin + 28, matchesY);

  const cardSpacing = 72;
  matchList.slice(0, 6).forEach((m, idx) => {
    const my = matchesY + 16 + idx * cardSpacing;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(margin + 24, my, cw - 48, 60, 12);
    ctx.fillStyle = innerCardBg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Match Number Pill
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(margin + 40, my + 12, 100, 36, 8);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FBBF24';
    ctx.font = '900 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`MATCH #${m.matchNum}`, margin + 90, my + 34);

    // Map Name
    ctx.textAlign = 'left';
    ctx.fillStyle = textWhite;
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(m.map.toUpperCase(), margin + 160, my + 36);

    // Time / Note
    if (m.time) {
      ctx.textAlign = 'right';
      ctx.fillStyle = cyan;
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.time, margin + cw - 44, my + 35);
    }
  });

  // Rules Section
  const rulesY = matchesY + 24 + Math.min(matchList.length, 6) * cardSpacing;
  const rulesH = height - rulesY - 70;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + 24, rulesY, cw - 48, rulesH, 14);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#EF4444';
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('⚠️ SCRIM PROTOCOLS, RULES & SCORING', margin + 44, rulesY + 28);

  const defaultRules = opts.rules ||
    '1. Official BGIS 10-Point Scoring System • 2. Emulators and 3rd party panels strictly banned • 3. Team IGL must submit match finish screenshots within 10 minutes.';
  ctx.fillStyle = textMuted;
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';

  // Multi-line wrap
  const words = defaultRules.split(' ');
  let line = '';
  let lineY = rulesY + 54;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > cw - 90 && n > 0) {
      ctx.fillText(line, margin + 44, lineY);
      line = words[n] + ' ';
      lineY += 22;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, margin + 44, lineY);

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = textMuted;
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Issued by ${opts.platformName || 'SS BATTLE APP'} • Official Tournament Organizers`, width / 2, height - 38);

  return canvas.toDataURL('image/png');
}

// 9. Helper to trigger instantaneous download of dataURL
export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// 10. GAME GFX CREATION ENGINE & PRESETS
// ==========================================

export interface GameGfxPreset {
  id: string;
  name: string;
  description: string;
  themeColor: string;
  secondaryColor: string;
  fontStyle: 'military' | 'cyber' | 'inferno' | 'royal' | 'glacier' | 'crimson' | 'standard';
  tagline: string;
  bgGradient: string;
  glowColor: string;
  overlayPattern: 'hexagons' | 'grid' | 'sparks' | 'hazard' | 'lines';
  badgeStyle: 'stencil' | 'neon' | 'gold_shield' | 'flame' | 'clean';
  badgeIcon: string;
}

export const GAME_GFX_PRESETS: GameGfxPreset[] = [
  {
    id: 'freefire_inferno',
    name: 'Free Fire Inferno',
    description: 'Blazing volcanic heat, aggressive fire orange & battle royale glory',
    themeColor: '#FF5722',
    secondaryColor: '#EF4444',
    fontStyle: 'inferno',
    tagline: 'BOOYAH BATTLE ROYALE SURVIVAL',
    bgGradient: 'from-orange-950/60 via-red-950/40 to-black',
    glowColor: 'rgba(255, 87, 34, 0.45)',
    overlayPattern: 'sparks',
    badgeStyle: 'flame',
    badgeIcon: '🔥',
  },
  {
    id: 'bgmi_warzone',
    name: 'BGMI / PUBG Warzone',
    description: 'Tactical military gold, stencil combat hazard & chicken dinner prestige',
    themeColor: '#EAB308',
    secondaryColor: '#CA8A04',
    fontStyle: 'military',
    tagline: 'WINNER WINNER CHICKEN DINNER',
    bgGradient: 'from-amber-950/60 via-yellow-950/40 to-black',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    overlayPattern: 'hazard',
    badgeStyle: 'stencil',
    badgeIcon: '🎖️',
  },
  {
    id: 'cyber_velocity',
    name: 'Cyberpunk Neon',
    description: 'Electric cyan, glitch magenta laser grid & futuristic esports vibe',
    themeColor: '#06B6D4',
    secondaryColor: '#EC4899',
    fontStyle: 'cyber',
    tagline: 'NEON ESPORTS CHAMPIONSHIP',
    bgGradient: 'from-cyan-950/60 via-fuchsia-950/40 to-black',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    overlayPattern: 'grid',
    badgeStyle: 'neon',
    badgeIcon: '⚡',
  },
  {
    id: 'royal_gold',
    name: 'Royal Crown Gold',
    description: 'Luxury polished gold foil, obsidian dark shield & grand master tournament',
    themeColor: '#F59E0B',
    secondaryColor: '#D97706',
    fontStyle: 'royal',
    tagline: 'GRAND CHAMPIONSHIP ARENA',
    bgGradient: 'from-amber-950/60 via-slate-900 to-black',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    overlayPattern: 'hexagons',
    badgeStyle: 'gold_shield',
    badgeIcon: '👑',
  },
  {
    id: 'glacier_ice',
    name: 'Glacier Sub-Zero',
    description: 'Crystalline Arctic ice cyan, deep blizzard navy & precision sniper combat',
    themeColor: '#38BDF8',
    secondaryColor: '#2563EB',
    fontStyle: 'glacier',
    tagline: 'SUB-ZERO TACTICAL SNIPER PROTOCOL',
    bgGradient: 'from-sky-950/60 via-blue-950/40 to-black',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    overlayPattern: 'lines',
    badgeStyle: 'neon',
    badgeIcon: '❄️',
  },
  {
    id: 'blood_samurai',
    name: 'Blood Crimson & Samurai',
    description: 'Menacing blood crimson, obsidian armor & hardcore elimination mode',
    themeColor: '#EF4444',
    secondaryColor: '#991B1B',
    fontStyle: 'crimson',
    tagline: 'NO MERCY HARDCORE TOURNAMENT',
    bgGradient: 'from-red-950/70 via-neutral-950 to-black',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    overlayPattern: 'sparks',
    badgeStyle: 'flame',
    badgeIcon: '🩸',
  },
  {
    id: 'toxic_matrix',
    name: 'Toxic Emerald Matrix',
    description: 'Radioactive green, matrix terminal grid & biohazard competitive scrims',
    themeColor: '#10B981',
    secondaryColor: '#059669',
    fontStyle: 'military',
    tagline: 'BIOHAZARD SCRIM LEAGUE',
    bgGradient: 'from-emerald-950/60 via-teal-950/40 to-black',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    overlayPattern: 'grid',
    badgeStyle: 'stencil',
    badgeIcon: '🧪',
  },
  {
    id: 'void_violet',
    name: 'Void Hyperdrive Purple',
    description: 'Mystic cosmic violet, ultraviolet nebula & hyperspace tournament cup',
    themeColor: '#A855F7',
    secondaryColor: '#6366F1',
    fontStyle: 'cyber',
    tagline: 'ULTRAVIOLET ESPORTS MASTERS',
    bgGradient: 'from-purple-950/60 via-indigo-950/40 to-black',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    overlayPattern: 'hexagons',
    badgeStyle: 'neon',
    badgeIcon: '🟣',
  },
];

export interface GameGfxBannerOptions {
  gameName: string;
  themeColor?: string;
  secondaryColor?: string;
  fontStyle?: 'military' | 'cyber' | 'inferno' | 'royal' | 'glacier' | 'crimson' | 'standard';
  tagline?: string;
  overlayPattern?: 'hexagons' | 'grid' | 'sparks' | 'hazard' | 'lines' | 'none';
  badgeStyle?: 'stencil' | 'neon' | 'gold_shield' | 'flame' | 'clean';
  platformName?: string;
  platformLogo?: string;
}

/**
 * Generates an ultra-high-definition 1200x520 esports banner for a game title,
 * dynamically styled with the game's selected GFX creation theme!
 */
export function generateGameGfxBannerCanvas(opts: GameGfxBannerOptions): string {
  const width = 1200;
  const height = 520;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const themeColor = opts.themeColor || '#FF5722';
  const secondaryColor = opts.secondaryColor || '#EF4444';
  const fontStyle = opts.fontStyle || 'inferno';
  const pattern = opts.overlayPattern || 'sparks';
  const tagline = (opts.tagline || 'OFFICIAL COMPETITIVE ESPORTS TITLE').toUpperCase();
  const gameName = (opts.gameName || 'ESPORTS TITLE').toUpperCase();

  // 1. Base Dark Slate / Black Canvas
  ctx.fillStyle = '#090D16';
  ctx.fillRect(0, 0, width, height);

  // 2. Multi-point atmospheric radial lighting
  const radialGlow = ctx.createRadialGradient(width * 0.3, height * 0.4, 40, width * 0.3, height * 0.4, 600);
  radialGlow.addColorStop(0, `${themeColor}66`);
  radialGlow.addColorStop(0.5, `${secondaryColor}33`);
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  const secondaryGlow = ctx.createRadialGradient(width * 0.85, height * 0.7, 20, width * 0.85, height * 0.7, 450);
  secondaryGlow.addColorStop(0, `${secondaryColor}44`);
  secondaryGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = secondaryGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Texture / Pattern Layer
  ctx.save();
  if (pattern === 'grid') {
    ctx.strokeStyle = `${themeColor}1A`;
    ctx.lineWidth = 1;
    const step = 32;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (pattern === 'hazard') {
    ctx.strokeStyle = `${themeColor}22`;
    ctx.lineWidth = 14;
    for (let x = -height; x < width + height; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }
  } else if (pattern === 'hexagons') {
    ctx.strokeStyle = `${themeColor}1E`;
    ctx.lineWidth = 1.2;
    const r = 28;
    const h = r * Math.sqrt(3);
    for (let y = 0; y < height + h; y += h) {
      for (let x = 0; x < width + 3 * r; x += 3 * r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = x + r * Math.cos(a);
          const py = y + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (pattern === 'lines') {
    ctx.strokeStyle = `${themeColor}25`;
    ctx.lineWidth = 1.5;
    for (let y = 20; y < height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width * (0.3 + (y % 40) / 40 * 0.7), y);
      ctx.stroke();
    }
  } else {
    // Sparks / particles
    ctx.fillStyle = `${themeColor}88`;
    for (let i = 0; i < 80; i++) {
      const px = (Math.sin(i * 123) * 0.5 + 0.5) * width;
      const py = (Math.cos(i * 321) * 0.5 + 0.5) * height;
      const sz = ((i % 5) + 1) * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 4. Outer Glowing Frame
  ctx.save();
  ctx.strokeStyle = `${themeColor}55`;
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Corner brackets
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 4;
  const bracketLen = 32;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(16, 16 + bracketLen);
  ctx.lineTo(16, 16);
  ctx.lineTo(16 + bracketLen, 16);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 16 - bracketLen, 16);
  ctx.lineTo(width - 16, 16);
  ctx.lineTo(width - 16, 16 + bracketLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(16, height - 16 - bracketLen);
  ctx.lineTo(16, height - 16);
  ctx.lineTo(16 + bracketLen, height - 16);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 16 - bracketLen, height - 16);
  ctx.lineTo(width - 16, height - 16);
  ctx.lineTo(width - 16, height - 16 - bracketLen);
  ctx.stroke();
  ctx.restore();

  // 5. Header / Platform Branding
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(opts.platformName || 'SS BATTLE APP • ESPORTS ARENA', 48, 62);

  ctx.fillStyle = themeColor;
  ctx.font = '900 11px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.textAlign = 'right';
  ctx.fillText('⚡ VERIFIED TOURNAMENT TITLE', width - 48, 62);
  ctx.restore();

  // 6. Tagline Pill / Badge
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '800 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1.5px';
  const tagWidth = ctx.measureText(tagline).width + 36;
  const tagY = 120;

  ctx.fillStyle = `${themeColor}22`;
  ctx.strokeStyle = `${themeColor}88`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Stencil slant badge
  ctx.moveTo(48, tagY);
  ctx.lineTo(48 + tagWidth, tagY);
  ctx.lineTo(48 + tagWidth - 12, tagY + 30);
  ctx.lineTo(48, tagY + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(tagline, 62, tagY + 20);
  ctx.restore();

  // 7. Main Game Title (Huge with Neon Drop-Glow)
  ctx.save();
  ctx.shadowColor = themeColor;
  ctx.shadowBlur = 32;

  // Font styling according to theme
  let fontDescriptor = '900 68px system-ui, -apple-system, sans-serif';
  if (fontStyle === 'inferno' || fontStyle === 'crimson') {
    fontDescriptor = 'italic 900 70px "Impact", system-ui, sans-serif';
  } else if (fontStyle === 'military') {
    fontDescriptor = '900 64px "Arial Black", system-ui, sans-serif';
  } else if (fontStyle === 'cyber') {
    fontDescriptor = '900 66px "Courier New", monospace';
  } else if (fontStyle === 'royal') {
    fontDescriptor = '900 64px "Georgia", serif';
  } else if (fontStyle === 'glacier') {
    fontDescriptor = '800 66px system-ui, sans-serif';
  }
  ctx.font = fontDescriptor;

  // Dual tone gradient on text
  const textGrad = ctx.createLinearGradient(48, 170, 48, 250);
  textGrad.addColorStop(0, '#FFFFFF');
  textGrad.addColorStop(0.65, '#F1F5F9');
  textGrad.addColorStop(1, themeColor);
  ctx.fillStyle = textGrad;
  ctx.fillText(gameName, 48, 235);
  ctx.restore();

  // 8. Bottom Information Cards (Stats, Scrims, Tournaments)
  const cards = [
    { label: 'COMPETITIVE FORMAT', val: 'SOLO / DUO / SQUAD', icon: '🏆' },
    { label: 'PRIZE DISTRIBUTION', val: 'INSTANT WALLET PAYOUTS', icon: '💰' },
    { label: 'CUSTOM ROOMS', val: 'AUTO CREDENTIALS & SLOTS', icon: '🔑' },
  ];

  const cardW = 340;
  const cardH = 74;
  const cardY = 370;

  cards.forEach((c, i) => {
    const cx = 48 + i * (cardW + 32);
    ctx.save();
    // Card BG
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = `${themeColor}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();

    // Accent left stripe
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.roundRect(cx, cardY, 4, cardH, [14, 0, 0, 14]);
    ctx.fill();

    // Text inside card
    ctx.fillStyle = '#94A3B8';
    ctx.font = '800 10px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(`${c.icon}  ${c.label}`, cx + 18, cardY + 28);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(c.val, cx + 18, cardY + 52);
    ctx.restore();
  });

  // 9. Watermark / Security Tag
  ctx.save();
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`AUTHENTIC ESPORTS ASSET • GENERATED FOR ${opts.platformName || 'SS BATTLE'}`, width - 48, height - 32);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

