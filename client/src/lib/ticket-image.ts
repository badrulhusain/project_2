export interface TicketImageData {
  title: string;
  dateText: string;
  timeText: string;
  venue: string;
  holder?: string;
  seats: number;
  status: string;
  qrDataUrl: string;
  token: string;
  parking?: string | null;
}

const INK = '#141414';
const YELLOW = '#F4E55A';
const PAPER = '#FAF7F2';
const PINK = '#F6B8D6';
const BLUE = '#9CC4F2';
const MINT = '#BFE8C9';

const W = 1080;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function neoBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, shadow = 10, border = 5) {
  ctx.fillStyle = INK;
  roundRect(ctx, x + shadow, y + shadow, w, h, r);
  ctx.fill();
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.lineWidth = border;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  return lines;
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.42;
    const px = cx + Math.cos(angle) * radius; const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load the QR code.'));
    image.src = src;
  });
}

export async function renderTicketPng(data: TicketImageData): Promise<Blob> {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'sans-serif';
  const body = getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'sans-serif';
  try { await Promise.all([document.fonts.load(`800 60px ${family}`), document.fonts.load(`700 30px ${body}`)]); } catch { /* fall back to default fonts */ }
  const qr = await loadImage(data.qrDataUrl);

  const qrSize = 470; const boxPad = 34; const boxSize = qrSize + boxPad * 2;
  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) throw new Error('Your browser cannot create the image.');
  probe.font = `800 92px ${family}`;
  const titleLines = wrap(probe, data.title.toUpperCase(), W - 140 - 120, 3);
  const rowCount = 3 + (data.holder ? 1 : 0) + (data.parking ? 1 : 0);
  const afterStatus = 335 + (titleLines.length - 1) * 92 + 70 + rowCount * 84 + 6 + 56;
  const perfRel = afterStatus + 80;
  const cardH = perfRel + 60 + boxSize + 58 + 34 + 70;
  const H = 90 + cardH + 150;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser cannot create the image.');
  ctx.textBaseline = 'alphabetic';

  // Background
  ctx.fillStyle = YELLOW; ctx.fillRect(0, 0, W, H);
  star(ctx, 70, 90, 46, BLUE); star(ctx, W - 80, H - 100, 54, PINK); star(ctx, W - 60, 120, 28, PAPER);

  // Ticket body
  const x = 70, y = 90, w = W - 140, h = cardH;
  neoBox(ctx, x, y, w, h, 44, PAPER, 14, 6);

  // Header band
  ctx.save();
  roundRect(ctx, x, y, w, 150, 44); ctx.clip();
  ctx.fillStyle = INK; ctx.fillRect(x, y, w, 150);
  ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(x, y + 110, w, 40);
  star(ctx, x + 70, y + 75, 26, YELLOW);
  ctx.fillStyle = '#fff'; ctx.font = `800 50px ${family}`; ctx.fillText('EVENT', x + 112, y + 94);
  const eventWidth = ctx.measureText('EVENT').width;
  ctx.fillStyle = YELLOW; ctx.fillText('SENSE', x + 112 + eventWidth, y + 94);
  // admit sticker
  const admit = data.seats > 1 ? `ADMITS ${data.seats}` : 'ADMIT ONE';
  ctx.font = `800 28px ${family}`;
  const aw = ctx.measureText(admit).width + 56;
  ctx.save(); ctx.translate(x + w - aw / 2 - 40, y + 76); ctx.rotate(0.06);
  neoBox(ctx, -aw / 2, -28, aw, 56, 28, YELLOW, 5, 4);
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(admit, 0, 10); ctx.restore();
  ctx.textAlign = 'left';

  // Title
  ctx.fillStyle = INK;
  ctx.font = `800 40px ${family}`;
  ctx.fillText('YOUR EVENT PASS', x + 60, y + 235);
  ctx.font = `800 92px ${family}`;
  titleLines.forEach((line, i) => ctx.fillText(line, x + 60, y + 335 + i * 92));
  let cursor = y + 335 + (titleLines.length - 1) * 92 + 70;

  // Info rows
  const rows: [string, string, string][] = [
    ['DATE', data.dateText, PINK],
    ['TIME', data.timeText, BLUE],
    ['VENUE', data.venue, MINT],
  ];
  if (data.holder) rows.push(['GUEST', data.holder, YELLOW]);
  if (data.parking) rows.push(['PARKING', data.parking, PAPER]);
  for (const [label, value, color] of rows) {
    neoBox(ctx, x + 60, cursor, 190, 62, 18, color, 5, 4);
    ctx.fillStyle = INK; ctx.font = `800 26px ${family}`; ctx.textAlign = 'center'; ctx.fillText(label, x + 60 + 95, cursor + 41); ctx.textAlign = 'left';
    ctx.font = `700 34px ${body}`;
    const text = wrap(ctx, value, w - 60 - 190 - 60 - 30, 1)[0] ?? '';
    ctx.fillText(text, x + 60 + 190 + 30, cursor + 43);
    cursor += 84;
  }

  // Status chip
  cursor += 6;
  const statusText = data.status.replaceAll('_', ' ').toUpperCase();
  ctx.font = `800 28px ${family}`;
  const sw = ctx.measureText(statusText).width + 56;
  neoBox(ctx, x + 60, cursor, sw, 56, 28, data.status === 'WAITLISTED' ? PINK : MINT, 5, 4);
  ctx.fillStyle = INK; ctx.fillText(statusText, x + 60 + 28, cursor + 38);

  // Perforation
  const perfY = y + perfRel;
  ctx.fillStyle = YELLOW;
  ctx.beginPath(); ctx.arc(x, perfY, 34, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w, perfY, 34, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.arc(x, perfY, 34, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + w, perfY, 34, Math.PI / 2, (Math.PI * 3) / 2); ctx.stroke();
  ctx.setLineDash([16, 14]); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x + 50, perfY); ctx.lineTo(x + w - 50, perfY); ctx.stroke(); ctx.setLineDash([]);

  // QR
  const qx = x + (w - boxSize) / 2; const qy = perfY + 60;
  neoBox(ctx, qx, qy, boxSize, boxSize, 30, '#fff', 10, 5);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, qx + boxPad, qy + boxPad, qrSize, qrSize);
  ctx.imageSmoothingEnabled = true;

  ctx.fillStyle = INK; ctx.textAlign = 'center';
  ctx.font = `800 30px ${family}`;
  ctx.fillText('SCAN AT THE DOOR', x + w / 2, qy + boxSize + 58);
  ctx.font = `600 20px ${body}`; ctx.fillStyle = '#5b5b5b';
  ctx.fillText(data.token.slice(0, 18).toUpperCase(), x + w / 2, qy + boxSize + 92);
  ctx.textAlign = 'left';

  // Footer
  ctx.fillStyle = INK; ctx.font = `800 30px ${family}`; ctx.textAlign = 'center';
  ctx.fillText('PLAN LESS. WASTE LESS. SHOW UP.', W / 2, y + h + 80);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create the image.')), 'image/png'));
}

export async function downloadTicketPng(data: TicketImageData, filename: string) {
  const blob = await renderTicketPng(data);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
