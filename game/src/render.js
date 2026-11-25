// Saffron Stall — every pixel the judge and the player see. Canvas 2D only,
// all art drawn in code: no image files, no network.
import { CHEF_Y, COUNTER_Y, H, PALETTE, SHIFT_SECONDS, STATIONS, W } from './config.js';
import { INGREDIENTS } from './recipes.js';
import { starsFor } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

// Layout the hit-test and the renderer share.
export const PANTRY_BUTTONS = [
  { id: 'noodle', key: '1', col: 0, row: 0 },
  { id: 'rice', key: '2', col: 1, row: 0 },
  { id: 'chicken', key: '3', col: 2, row: 0 },
  { id: 'shrimp', key: '4', col: 0, row: 1 },
  { id: 'saffron', key: '5', col: 1, row: 1 },
  { id: 'chili', key: '6', col: 2, row: 1 },
];
const PANTRY_X = 52;
const PANTRY_Y = 296;
const PANTRY_CELL = 74;

function pantryButtonRect(button) {
  return {
    x: PANTRY_X + button.col * PANTRY_CELL,
    y: PANTRY_Y + button.row * PANTRY_CELL,
    w: 66, h: 66,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- Food icons, drawn small and readable ---------------------------------
export function drawIngredient(ctx, id, x, y, s) {
  const c = INGREDIENTS[id].color;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'noodle') {
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath(); ctx.ellipse(0, 6, s * 0.52, s * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f5c542'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, -s * 0.08 + i * s * 0.12);
      ctx.quadraticCurveTo(-s * 0.12, -s * 0.2 + i * s * 0.12, 0, -s * 0.06 + i * s * 0.12);
      ctx.quadraticCurveTo(s * 0.14, s * 0.06 + i * s * 0.12, s * 0.34, -s * 0.08 + i * s * 0.12);
      ctx.stroke();
    }
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath(); ctx.arc(s * 0.26, -s * 0.2, s * 0.08, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'rice') {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath(); ctx.ellipse(0, 8, s * 0.5, s * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 2, s * 0.34, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#d8c9a8'; ctx.lineWidth = s * 0.05;
    ctx.beginPath(); ctx.arc(0, 2, s * 0.34, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.3); ctx.lineTo(s * 0.3, -s * 0.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.24, -s * 0.18); ctx.lineTo(s * 0.36, -s * 0.3); ctx.stroke();
  } else if (id === 'chicken') {
    ctx.fillStyle = '#e8a87c';
    ctx.beginPath(); ctx.arc(-s * 0.08, -s * 0.06, s * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c97e4a';
    ctx.beginPath(); ctx.arc(-s * 0.08, -s * 0.06, s * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s * 0.16, s * 0.14); ctx.lineTo(s * 0.42, s * 0.38); ctx.stroke();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath(); ctx.arc(s * 0.46, s * 0.42, s * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.34, s * 0.5, s * 0.08, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'shrimp') {
    ctx.strokeStyle = '#ff8fa3'; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, s * 0.04, s * 0.32, Math.PI * 1.15, Math.PI * 1.95); ctx.stroke();
    ctx.strokeStyle = '#e84142'; ctx.lineWidth = s * 0.06;
    ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.26); ctx.lineTo(-s * 0.38, -s * 0.38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.26); ctx.lineTo(-s * 0.18, -s * 0.4); ctx.stroke();
    ctx.fillStyle = '#ffd32a';
    ctx.beginPath(); ctx.arc(s * 0.3, -s * 0.12, s * 0.06, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'saffron') {
    ctx.fillStyle = '#f5b301';
    roundRect(ctx, -s * 0.16, -s * 0.3, s * 0.32, s * 0.55, s * 0.08); ctx.fill();
    ctx.fillStyle = '#8a5a33';
    ctx.fillRect(-s * 0.1, -s * 0.42, s * 0.2, s * 0.14);
    ctx.fillStyle = '#ffd32a';
    ctx.beginPath(); ctx.arc(0, s * 0.42, s * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chili') {
    ctx.fillStyle = '#e84142';
    roundRect(ctx, -s * 0.16, -s * 0.3, s * 0.32, s * 0.55, s * 0.08); ctx.fill();
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(-s * 0.1, -s * 0.42, s * 0.2, s * 0.14);
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath(); ctx.arc(0, s * 0.02, s * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, s * 0.2, s * 0.07, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  void c;
}

function drawLantern(ctx, x, y, s, color, t) {
  const sway = Math.sin(t * 0.9 + x) * 3;
  ctx.save();
  ctx.translate(x + sway, y);
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -s - 8); ctx.lineTo(0, -s + 4); ctx.stroke();
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, s * 1.6);
  glow.addColorStop(0, color + 'aa');
  glow.addColorStop(1, color + '00');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, s * 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.3, s * 0.92, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#f5b301';
  ctx.fillRect(-s * 0.22, -s - 4, s * 0.44, 5);
  ctx.fillRect(-s * 0.22, s - 1, s * 0.44, 5);
  ctx.restore();
}

function drawChef(ctx, world, t) {
  const { x } = world.chef;
  const bob = world.chef.moving ? Math.abs(Math.sin(world.chef.walkPhase)) * 4 : Math.sin(t * 2) * 1.5;
  const y = CHEF_Y - bob;
  const shake = world.chop.shake > 0 ? (Math.random() - 0.5) * 4 : 0;
  ctx.save();
  ctx.translate(x + shake, y);
  // Legs.
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(-16, -34, 12, 34);
  ctx.fillRect(4, -34, 12, 34);
  // Body + apron.
  ctx.fillStyle = '#f5f0e6';
  roundRect(ctx, -26, -86, 52, 56, 10); ctx.fill();
  ctx.fillStyle = '#d63031';
  ctx.fillRect(-26, -58, 52, 8);
  // Arms.
  ctx.strokeStyle = '#f5f0e6'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-22, -76); ctx.lineTo(-34, -52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, -76); ctx.lineTo(34, -52); ctx.stroke();
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(0, -98, 17, 0, Math.PI * 2); ctx.fill();
  // Toque.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-10, -112, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -116, 11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -112, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-15, -114, 30, 8);
  // Face.
  ctx.fillStyle = '#241a12';
  ctx.beginPath(); ctx.arc(-6, -99, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -99, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#241a12'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(0, -94, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Held ingredient above the head.
  if (world.held) {
    ctx.fillStyle = 'rgba(255,243,214,0.92)';
    ctx.beginPath(); ctx.arc(0, -142, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PALETTE.saffron; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -142, 24, 0, Math.PI * 2); ctx.stroke();
    drawIngredient(ctx, world.held.id, 0, -142, 30);
    if (world.held.stage === 'ready') {
      text(ctx, '✓', 20, -160, 20, PALETTE.leaf);
    }
  }
  ctx.restore();
}

function drawOrderBoard(ctx, world) {
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, 28, 14, 980, 138, 12); ctx.fill();
  ctx.strokeStyle = PALETTE.boardEdge; ctx.lineWidth = 3;
  roundRect(ctx, 28, 14, 980, 138, 12); ctx.stroke();
  text(ctx, 'ORDER BOARD', 48, 32, 15, PALETTE.saffron, 'left');
  text(ctx, `${world.orders.length}/${3} tickets`, 988, 32, 13, '#c9b8e8', 'right');
  for (let i = 0; i < 3; i += 1) {
    const x = 44 + i * 320;
    const y = 44;
    const order = world.orders[i];
    ctx.fillStyle = order ? '#fff8e7' : 'rgba(255,248,231,0.08)';
    roundRect(ctx, x, y, 296, 96, 10); ctx.fill();
    if (!order) {
      text(ctx, '— waiting —', x + 148, y + 48, 15, '#8f7fb8');
      continue;
    }
    const frac = Math.max(0, order.timeLeft / order.maxTime);
    const urgent = frac < 0.35;
    text(ctx, `#${order.id} ${order.dish.name}`, x + 14, y + 18, 17, PALETTE.ink, 'left');
    text(ctx, `${order.dish.coins}c`, x + 282, y + 18, 16, '#8a5a33', 'right');
    for (let p = 0; p < 3; p += 1) {
      drawIngredient(ctx, order.dish.parts[p], x + 34 + p * 44, y + 56, 34);
    }
    // Countdown bar.
    ctx.fillStyle = '#e0d4c0';
    roundRect(ctx, x + 14, y + 80, 268, 10, 5); ctx.fill();
    ctx.fillStyle = urgent ? PALETTE.chili : frac < 0.6 ? PALETTE.amber : PALETTE.leaf;
    roundRect(ctx, x + 14, y + 80, 268 * frac, 10, 5); ctx.fill();
    text(ctx, `${Math.ceil(order.timeLeft)}s`, x + 282, y + 56, 15, urgent ? PALETTE.chili : PALETTE.ink, 'right');
  }
}

function drawStations(ctx, world, t) {
  // Counter.
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, COUNTER_Y, W, 170);
  ctx.fillStyle = PALETTE.counterTop;
  ctx.fillRect(0, COUNTER_Y, W, 26);
  ctx.fillStyle = PALETTE.counterEdge;
  ctx.fillRect(0, COUNTER_Y + 26, W, 6);
  const station = world.screen === SCREEN_PLAY ? currentStationName(world) : null;

  // Station labels + highlight.
  for (const st of STATIONS) {
    const active = station === st.id;
    ctx.fillStyle = active ? PALETTE.saffron : 'rgba(255,243,214,0.75)';
    roundRect(ctx, st.x - 88, COUNTER_Y - 46, 176, 30, 8); ctx.fill();
    text(ctx, st.label, st.x, COUNTER_Y - 31, 15, active ? PALETTE.ink : '#5a4a33');
  }

  // PANTRY: ingredient buttons.
  ctx.fillStyle = '#3a2b52';
  roundRect(ctx, 36, 268, 250, 178, 12); ctx.fill();
  ctx.strokeStyle = PALETTE.boardEdge; ctx.lineWidth = 2;
  roundRect(ctx, 36, 268, 250, 178, 12); ctx.stroke();
  text(ctx, 'PANTRY — pick 1-6', 161, 286, 13, PALETTE.saffron);
  for (const button of PANTRY_BUTTONS) {
    const r = pantryButtonRect(button);
    const held = world.held && world.held.id === button.id;
    ctx.fillStyle = held ? PALETTE.saffron : '#fff8e7';
    roundRect(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.strokeStyle = held ? '#8a5a33' : '#d8c9a8'; ctx.lineWidth = 2;
    roundRect(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
    drawIngredient(ctx, button.id, r.x + 33, r.y + 28, 40);
    text(ctx, `${button.key} ${INGREDIENTS[button.id].name}`, r.x + 33, r.y + 56, 11, PALETTE.ink);
  }

  // CHOP BOARD.
  const chopping = world.held && INGREDIENTS[world.held.id].kind === 'protein' && world.held.stage === 'raw';
  ctx.fillStyle = '#d8a86a';
  roundRect(ctx, 380, 428, 140, 40, 8); ctx.fill();
  ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 2;
  roundRect(ctx, 380, 428, 140, 40, 8); ctx.stroke();
  if (chopping) {
    const jx = 450 + (world.chop.shake > 0 ? (Math.random() - 0.5) * 6 : 0);
    drawIngredient(ctx, world.held.id, jx, 448, 44);
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < world.chop.progress ? PALETTE.leaf : '#e0d4c0';
      ctx.beginPath(); ctx.arc(420 + i * 30, 486, 8, 0, Math.PI * 2); ctx.fill();
    }
    text(ctx, 'SPACE x3', 450, 512, 13, PALETTE.cream);
  } else {
    text(ctx, 'protein here', 450, 448, 13, '#5a4a33');
  }

  // WOK with fire.
  const wok = world.wok;
  const fireH = wok.active ? 26 + Math.sin(t * 9) * 6 : 10;
  const fireGlow = ctx.createRadialGradient(760, 452, 4, 760, 452, 110);
  fireGlow.addColorStop(0, wok.active ? 'rgba(255,120,40,0.85)' : 'rgba(255,120,40,0.25)');
  fireGlow.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = fireGlow;
  ctx.beginPath(); ctx.arc(760, 452, 110, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a3f4a';
  ctx.beginPath(); ctx.ellipse(760, 452, 78, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#23262e';
  ctx.beginPath(); ctx.ellipse(760, 446, 68, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff7a2a';
  ctx.beginPath();
  ctx.moveTo(726, 468);
  ctx.quadraticCurveTo(740, 468 - fireH, 760, 468 - fireH * 0.7);
  ctx.quadraticCurveTo(780, 468 - fireH, 794, 468);
  ctx.closePath(); ctx.fill();
  if (wok.active && world.held) drawIngredient(ctx, world.held.id, 760, 440, 40);
  if (wok.active) {
    // Fire needle meter — raised clear of the chef's held-item bubble.
    const mx = 690; const my = 340; const mw = 140; const mh = 16;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(ctx, mx - 6, my - 20, mw + 12, mh + 34, 8); ctx.fill();
    ctx.fillStyle = PALETTE.chili; ctx.fillRect(mx, my, mw * 0.25, mh);
    ctx.fillStyle = '#f5c542'; ctx.fillRect(mx + mw * 0.25, my, mw * 0.17, mh);
    ctx.fillStyle = PALETTE.leaf; ctx.fillRect(mx + mw * 0.42, my, mw * 0.16, mh);
    ctx.fillStyle = '#f5c542'; ctx.fillRect(mx + mw * 0.58, my, mw * 0.17, mh);
    ctx.fillStyle = PALETTE.chili; ctx.fillRect(mx + mw * 0.75, my, mw * 0.25, mh);
    const nx = mx + wok.needle * mw;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(nx, my - 6); ctx.lineTo(nx - 6, my - 16); ctx.lineTo(nx + 6, my - 16); ctx.closePath(); ctx.fill();
    text(ctx, 'SPACE to lock!', 760, my + 32, 12, PALETTE.cream);
  } else {
    text(ctx, 'base here', 760, 380, 13, '#5a4a33');
  }

  // PLATING.
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath(); ctx.ellipse(1060, 448, 72, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8c9a8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(1060, 448, 72, 24, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath(); ctx.ellipse(1060, 448, 48, 15, 0, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < world.plate.length; i += 1) {
    drawIngredient(ctx, world.plate[i], 1022 + i * 38, 442, 36);
  }
  const complete = world.plate.length === 3;
  if (complete) {
    // Above the plate, clear of the chef standing at the station.
    const pulse = 0.7 + Math.sin(t * 6) * 0.3;
    ctx.fillStyle = `rgba(46,204,113,${pulse})`;
    roundRect(ctx, 975, 384, 170, 34, 10); ctx.fill();
    text(ctx, 'SERVE! (SPACE)', 1060, 401, 15, '#ffffff');
  } else {
    text(ctx, `${world.plate.length}/3 on the plate`, 1060, 503, 13, PALETTE.cream);
  }
}

function currentStationName(world) {
  let best = null;
  let bestDist = 110;
  for (const st of STATIONS) {
    const dist = Math.abs(world.chef.x - st.x);
    if (dist < bestDist) { bestDist = dist; best = st; }
  }
  return best ? best.id : null;
}

function drawHud(ctx, world) {
  // Shift timer, top right.
  const left = Math.ceil(world.shiftLeft);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, 1024, 14, 228, 138, 12); ctx.fill();
  ctx.strokeStyle = PALETTE.boardEdge; ctx.lineWidth = 3;
  roundRect(ctx, 1024, 14, 228, 138, 12); ctx.stroke();
  text(ctx, 'SHIFT', 1138, 32, 13, PALETTE.saffron);
  text(ctx, `${mm}:${ss}`, 1138, 66, 34, left <= 30 ? PALETTE.chili : PALETTE.cream);
  text(ctx, `🪙 ${world.coins} coins`, 1138, 102, 17, PALETTE.gold, 'center');
  text(ctx, `served ${world.served}  •  streak ${world.streak}`, 1138, 128, 13, '#c9b8e8');
  // Hearts.
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < world.hearts ? PALETTE.chili : 'rgba(232,65,66,0.25)';
    ctx.beginPath();
    const hx = 1052 + i * 34; const hy = 168;
    ctx.moveTo(hx, hy + 8);
    ctx.bezierCurveTo(hx - 12, hy - 4, hx - 6, hy - 14, hx, hy - 6);
    ctx.bezierCurveTo(hx + 6, hy - 14, hx + 12, hy - 4, hx, hy + 8);
    ctx.fill();
  }
  // Rush banner.
  if (world.rushBanner > 0) {
    const a = Math.min(1, world.rushBanner);
    ctx.fillStyle = `rgba(232,65,66,${0.9 * a})`;
    roundRect(ctx, 440, 170, 400, 44, 10); ctx.fill();
    text(ctx, '🔥 RUSH HOUR — orders come faster! 🔥', 640, 192, 19, '#ffffff');
  }
  // Toast message.
  if (world.messageTtl > 0 && world.message) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const wdt = ctx.measureText(world.message).width + 36;
    roundRect(ctx, 640 - wdt / 2, 648, wdt, 34, 10); ctx.fill();
    text(ctx, world.message, 640, 665, 15, PALETTE.cream);
  }
  // Controls hint.
  text(ctx, '← → move   •   1-6 grab   •   SPACE use   •   X drop   •   P pause   •   M mute', 640, 700, 12, 'rgba(255,243,214,0.6)');
}

function drawTitle(ctx, world, t) {
  drawBackground(ctx, t);
  ctx.fillStyle = 'rgba(18,10,36,0.55)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'SAFFRON STALL', 640, 190, 84, PALETTE.saffron);
  text(ctx, '— Night-Market Wok Kitchen —', 640, 250, 26, PALETTE.cream);
  text(ctx, '12 recipes  •  wok-fire timing  •  3-minute rush shifts', 640, 300, 20, '#c9b8e8');
  const lines = [
    '1  Grab ingredients at the PANTRY (keys 1-6)',
    '2  Chop proteins, wok the base — stop the needle in the GREEN',
    '3  Plate base + protein + sauce, then SERVE the matching ticket',
    '4  Fast serves earn tips. Streaks pay double. 3 hearts per shift.',
  ];
  for (let i = 0; i < lines.length; i += 1) text(ctx, lines[i], 640, 360 + i * 34, 18, PALETTE.cream);
  const pulse = 0.65 + Math.sin(t * 4) * 0.35;
  ctx.fillStyle = `rgba(245,179,1,${pulse})`;
  roundRect(ctx, 490, 510, 300, 56, 12); ctx.fill();
  text(ctx, 'PRESS ENTER TO COOK', 640, 538, 22, PALETTE.ink);
  text(ctx, 'mouse + keyboard  •  sounds are synthesized, no files', 640, 600, 14, 'rgba(255,243,214,0.7)');
}

function drawOver(ctx, world) {
  drawBackground(ctx, 0);
  ctx.fillStyle = 'rgba(18,10,36,0.72)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'SHIFT OVER', 640, 170, 64, PALETTE.saffron);
  text(ctx, `You served ${world.served} dishes and earned ${world.coins} coins`, 640, 240, 24, PALETTE.cream);
  text(ctx, `Best streak: x${world.bestStreak}`, 640, 280, 20, '#c9b8e8');
  const stars = starsFor(world);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < stars ? PALETTE.gold : 'rgba(255,211,42,0.25)';
    const sx = 560 + i * 80;
    ctx.beginPath();
    for (let p = 0; p < 10; p += 1) {
      const r = p % 2 === 0 ? 30 : 13;
      const a = -Math.PI / 2 + (p * Math.PI) / 5;
      const px = sx + Math.cos(a) * r;
      const py = 350 + Math.sin(a) * r;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
  text(ctx, stars === 3 ? 'Three stars — the night market sings your name!' : stars === 2 ? 'Two stars — the stall is buzzing!' : stars === 1 ? 'One star — a solid shift. Faster hands next time!' : 'No stars yet — the wok is still warm. Try again!', 640, 430, 20, PALETTE.cream);
  const pulse = 0.65 + Math.sin(Date.now() / 300) * 0.35;
  ctx.fillStyle = `rgba(245,179,1,${pulse})`;
  roundRect(ctx, 490, 490, 300, 56, 12); ctx.fill();
  text(ctx, 'PRESS R TO COOK AGAIN', 640, 518, 20, PALETTE.ink);
}

function drawBackground(ctx, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // Awning stripes across the top.
  for (let i = 0; i < 16; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.awningRed : PALETTE.awningCream;
    ctx.beginPath();
    ctx.moveTo(i * 80, 0);
    ctx.lineTo(i * 80 + 80, 0);
    ctx.lineTo(i * 80 + 64, 46);
    ctx.lineTo(i * 80 - 16, 46);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 46, W, 6);
  // Lanterns.
  drawLantern(ctx, 90, 108, 16, '#ff6b6b', t);
  drawLantern(ctx, 1190, 108, 16, '#ff9f43', t);
  drawLantern(ctx, 330, 96, 12, '#f5b301', t);
  drawLantern(ctx, 950, 96, 12, '#ff6b6b', t);
  // Back wall + window glow.
  ctx.fillStyle = '#1d1233';
  ctx.fillRect(300, 170, 680, 240);
  ctx.strokeStyle = '#3a2b52'; ctx.lineWidth = 4;
  ctx.strokeRect(300, 170, 680, 240);
  ctx.fillStyle = 'rgba(245,179,1,0.14)';
  ctx.fillRect(320, 190, 640, 200);
  text(ctx, 'SAFFRON STALL', 640, 200, 22, 'rgba(245,179,1,0.85)');
  text(ctx, 'wok • chop • plate • serve', 640, 230, 14, 'rgba(201,184,232,0.8)');
  // Hanging pots.
  for (let i = 0; i < 4; i += 1) {
    const px = 360 + i * 180;
    ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, 170); ctx.lineTo(px, 252); ctx.stroke();
    ctx.fillStyle = '#4a4f5a';
    ctx.beginPath(); ctx.ellipse(px, 266, 34, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2c2f38';
    ctx.beginPath(); ctx.ellipse(px, 262, 28, 10, 0, 0, Math.PI * 2); ctx.fill();
  }
}

export function render(ctx, world, t) {
  ctx.save();
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * world.shake * 24, (Math.random() - 0.5) * world.shake * 24);
  }
  if (world.screen === SCREEN_TITLE) { drawTitle(ctx, world, t); ctx.restore(); return; }
  if (world.screen === SCREEN_OVER) { drawOver(ctx, world); ctx.restore(); return; }
  drawBackground(ctx, t);
  drawOrderBoard(ctx, world);
  drawStations(ctx, world, t);
  // Steam particles.
  for (const p of world.particles) {
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, p.ttl) * 0.5})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.ttl, 0, Math.PI * 2); ctx.fill();
  }
  drawChef(ctx, world, t);
  // Floating score texts.
  for (const f of world.floats) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.ttl));
    text(ctx, f.text, f.x, f.y, 22, f.color);
    ctx.globalAlpha = 1;
  }
  drawHud(ctx, world);
  ctx.restore();
}

// Hit-testing for mouse clicks. Returns null or a hit object.
export function stationAt(world, x, y) {
  // Order tickets: click to serve a matching complete plate.
  for (let i = 0; i < world.orders.length; i += 1) {
    const tx = 44 + i * 320;
    if (x >= tx && x <= tx + 296 && y >= 44 && y <= 140) return { type: 'serve', id: world.orders[i].id };
  }
  // Pantry ingredient buttons.
  for (const button of PANTRY_BUTTONS) {
    const r = pantryButtonRect(button);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return { type: 'pick', id: button.id };
  }
  // Serve button (drawn above the plate, clear of the chef).
  if (world.plate.length === 3 && x >= 975 && x <= 1145 && y >= 384 && y <= 418) {
    return { type: 'station', id: 'plate' };
  }
  // Station zones: walk to the nearest station under the click.
  if (y >= COUNTER_Y - 60 && y <= 660) {
    let best = null;
    let bestDist = 160;
    for (const st of STATIONS) {
      const dist = Math.abs(x - st.x);
      if (dist < bestDist) { bestDist = dist; best = st; }
    }
    if (best) return { type: 'station', id: best.id };
  }
  return null;
}
