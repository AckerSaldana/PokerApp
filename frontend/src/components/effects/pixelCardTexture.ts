// Shared card texture generation
// renderPixelCard: retro pixel-art style (used by FallingCards3D)
// renderCleanCard: smooth HD style (used by PokerHandsModal)

export const palette = {
  white: '#f8f8f8',
  cream: '#f0e0c0',
  black: '#181818',
  red: '#e83030',
  darkRed: '#a01010',
  gold: '#f8d830',
  darkGold: '#b89820',
  cardBack1: '#602080',
  cardBack2: '#401060',
};

export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';
export type Value = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const values: Value[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

export const pixelChars: Record<string, string[]> = {
  'A': ['  #  ', ' # # ', '#   #', '#####', '#   #', '#   #', '#   #'],
  'K': ['#  # ', '# #  ', '##   ', '##   ', '# #  ', '#  # ', '#   #'],
  'Q': [' ### ', '#   #', '#   #', '#   #', '# # #', '#  # ', ' ## #'],
  'J': ['  ###', '   # ', '   # ', '   # ', '#  # ', '#  # ', ' ##  '],
  '10': ['# ###', '##  #', '# # #', '# # #', '# # #', '# # #', '# ###'],
  '9': [' ### ', '#   #', '#   #', ' ####', '    #', '#   #', ' ### '],
  '8': [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
  '7': ['#####', '    #', '   # ', '  #  ', '  #  ', '  #  ', '  #  '],
  '6': [' ### ', '#    ', '#    ', '#### ', '#   #', '#   #', ' ### '],
  '5': ['#####', '#    ', '#### ', '    #', '    #', '#   #', ' ### '],
  '4': ['#   #', '#   #', '#   #', '#####', '    #', '    #', '    #'],
  '3': ['#### ', '    #', '    #', ' ### ', '    #', '    #', '#### '],
  '2': [' ### ', '#   #', '    #', '  ## ', ' #   ', '#    ', '#####'],
};

export function renderPixelCard(suit: Suit, value: Value): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const scale = 8;
  canvas.width = 64 * scale;
  canvas.height = 96 * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const isRed = suit === 'hearts' || suit === 'diamonds';
  const mainColor = isRed ? palette.red : palette.black;

  function drawPixel(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
  }

  // Card background
  drawPixel(0, 0, 64, 96, palette.cream);

  // Border
  drawPixel(0, 0, 64, 3, palette.black);
  drawPixel(0, 93, 64, 3, palette.black);
  drawPixel(0, 0, 3, 96, palette.black);
  drawPixel(61, 0, 3, 96, palette.black);

  // Inner highlight
  drawPixel(3, 3, 58, 2, palette.white);
  drawPixel(3, 3, 2, 90, palette.white);

  // Inner shadow
  drawPixel(3, 91, 58, 2, '#c0b090');
  drawPixel(59, 3, 2, 90, '#c0b090');

  // Suit drawing functions
  function drawHeart(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s, cy - s / 2, s, s, mainColor);
    drawPixel(cx, cy - s / 2, s, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s, mainColor);
    drawPixel(cx - s / 2, cy + s / 2, s / 2, s / 2, mainColor);
  }

  function drawDiamond(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s / 2, cy - s, s, s, mainColor);
    drawPixel(cx - s, cy - s / 2, s * 2, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s, mainColor);
  }

  function drawSpade(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s / 2, cy - s, s, s, mainColor);
    drawPixel(cx - s, cy - s / 2, s * 2, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s / 2, mainColor);
    drawPixel(cx - s / 4, cy + s / 2, s / 2, s / 2, mainColor);
  }

  function drawClub(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s / 2, cy - s, s, s, mainColor);
    drawPixel(cx - s, cy - s / 2, s, s, mainColor);
    drawPixel(cx, cy - s / 2, s, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s / 2, mainColor);
    drawPixel(cx - s / 4, cy + s / 2, s / 2, s / 2, mainColor);
  }

  function drawSuit(cx: number, cy: number, size: number) {
    switch (suit) {
      case 'hearts': drawHeart(cx, cy, size); break;
      case 'diamonds': drawDiamond(cx, cy, size); break;
      case 'spades': drawSpade(cx, cy, size); break;
      case 'clubs': drawClub(cx, cy, size); break;
    }
  }

  // Draw value
  function drawValue(x: number, y: number, val: Value, color: string) {
    const charData = pixelChars[val];
    if (charData) {
      charData.forEach((row, rowIndex) => {
        for (let col = 0; col < row.length; col++) {
          if (row[col] === '#') {
            drawPixel(x + col, y + rowIndex, 1, 1, color);
          }
        }
      });
    }
  }

  // Top-left corner
  drawValue(6, 8, value, mainColor);
  drawSuit(9, 20, 3);

  // Bottom-right corner
  drawValue(52, 81, value, mainColor);
  drawSuit(55, 69, 3);

  // Center suit
  drawSuit(32, 48, 8);

  return canvas;
}

// --- Clean HD card renderer (smooth, anti-aliased) ---

function drawSuitPath(ctx: CanvasRenderingContext2D, suit: Suit, cx: number, cy: number, size: number) {
  ctx.beginPath();
  switch (suit) {
    case 'hearts': {
      const s = size * 0.5;
      ctx.moveTo(cx, cy + s * 0.8);
      ctx.bezierCurveTo(cx - s * 1.2, cy - s * 0.2, cx - s * 0.6, cy - s * 1.2, cx, cy - s * 0.4);
      ctx.bezierCurveTo(cx + s * 0.6, cy - s * 1.2, cx + s * 1.2, cy - s * 0.2, cx, cy + s * 0.8);
      break;
    }
    case 'diamonds': {
      const s = size * 0.55;
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s * 0.65, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s * 0.65, cy);
      ctx.closePath();
      break;
    }
    case 'spades': {
      const s = size * 0.5;
      ctx.moveTo(cx, cy - s);
      ctx.bezierCurveTo(cx + s * 0.6, cy - s * 1.0, cx + s * 1.2, cy + s * 0.2, cx, cy + s * 0.4);
      ctx.bezierCurveTo(cx - s * 1.2, cy + s * 0.2, cx - s * 0.6, cy - s * 1.0, cx, cy - s);
      ctx.moveTo(cx - s * 0.2, cy + s * 0.3);
      ctx.lineTo(cx, cy + s * 0.9);
      ctx.lineTo(cx + s * 0.2, cy + s * 0.3);
      break;
    }
    case 'clubs': {
      const s = size * 0.3;
      // Top circle
      ctx.arc(cx, cy - s * 0.9, s, 0, Math.PI * 2);
      ctx.moveTo(cx - s * 1.1 + s, cy + s * 0.1);
      // Left circle
      ctx.arc(cx - s * 1.1, cy + s * 0.1, s, 0, Math.PI * 2);
      ctx.moveTo(cx + s * 1.1 + s, cy + s * 0.1);
      // Right circle
      ctx.arc(cx + s * 1.1, cy + s * 0.1, s, 0, Math.PI * 2);
      // Stem
      ctx.moveTo(cx - s * 0.3, cy + s * 0.5);
      ctx.lineTo(cx, cy + s * 1.6);
      ctx.lineTo(cx + s * 0.3, cy + s * 0.5);
      break;
    }
  }
  ctx.fill();
}

export function renderCleanCard(suit: Suit, value: Value): HTMLCanvasElement {
  const dpr = 3;
  const w = 80;
  const h = 120;
  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const isRed = suit === 'hearts' || suit === 'diamonds';
  const color = isRed ? '#dc2626' : '#1a1a1a';
  const radius = 6;

  // Card background with rounded corners
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, radius);
  ctx.fillStyle = '#fafaf5';
  ctx.fill();
  ctx.strokeStyle = '#d4d0c8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Value text (top-left)
  ctx.fillStyle = color;
  ctx.font = 'bold 16px "SF Mono", "Cascadia Code", "Consolas", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(value, 6, 6);

  // Small suit symbol (top-left, below value)
  drawSuitPath(ctx, suit, 13, 30, 12);

  // Center suit (large)
  drawSuitPath(ctx, suit, w / 2, h / 2 + 2, 36);

  // Value text (bottom-right, rotated)
  ctx.save();
  ctx.translate(w - 6, h - 6);
  ctx.rotate(Math.PI);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(value, 0, 0);
  ctx.restore();

  // Small suit (bottom-right)
  drawSuitPath(ctx, suit, w - 13, h - 30, 12);

  return canvas;
}
