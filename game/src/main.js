// Saffron Stall — boot, game loop and screen flow. The world holds the rules,
// render.js draws them, input.js reads the player.
import { CHEF_Y, H, W } from './config.js';
import { attachInput, consumeIntent, createInput } from './input.js';
import { render, stationAt } from './render.js';
import { createAudio, sfx } from './audio.js';
import { stageShot } from './shots.js';
import {
  EVENT_BURNT, EVENT_EXPIRED, EVENT_OVER, EVENT_SERVED,
  SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE,
  chopHit, createWorld, currentStation, plateAction, resetWorld, servePlate,
  step, wokAction,
} from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? 1) || 1;
const shotName = params.get('shot');
const world = createWorld(seed);
window.__saffron = { world };
const input = createInput();
const audio = createAudio();
let paused = false;
let pendingUse = false;
let lastTime = performance.now();

function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

function useAtStation() {
  const station = currentStation(world);
  if (!station) return;
  if (station.id === 'chop') { if (chopHit(world)) sfx.chop(audio); }
  else if (station.id === 'wok') {
    const before = world.held ? world.held.stage : null;
    const result = wokAction(world);
    if (result === EVENT_BURNT) sfx.burnt(audio);
    else if (world.held && before === 'raw' && world.held.stage === 'ready') {
      if (world.held.quality === 2) sfx.wokPerfect(audio); else sfx.wokOk(audio);
    } else if (world.wok.active) sfx.wokStart(audio);
  } else if (station.id === 'plate') {
    const before = world.served;
    plateAction(world);
    if (world.served > before) sfx.serve(audio);
    else sfx.click(audio);
  }
}

function handleEvents(events) {
  if (events & EVENT_SERVED) sfx.serve(audio);
  if (events & EVENT_EXPIRED) sfx.expire(audio);
  if (events & EVENT_BURNT) sfx.burnt(audio);
  if (events & EVENT_OVER) announce(`Shift over. ${world.served} dishes, ${world.coins} coins.`);
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  const t = now / 1000;
  if (world.screen === SCREEN_PLAY && !paused) {
    const intent = consumeIntent(input, world, (x, y) => stationAt(world, x, y));
    if (intent.targetStation) pendingUse = !!intent.clickUse;
    if (intent.use) useAtStation();
    if (intent.serveOrder) {
      const before = world.served;
      servePlate(world, intent.serveOrder);
      if (world.served > before) sfx.serve(audio);
    }
    if (pendingUse) {
      const station = currentStation(world);
      if (station && station.id === intent.targetStation) { useAtStation(); pendingUse = false; }
      else if (Math.abs(world.chef.x - world.chef.targetX) < 4) pendingUse = false;
    }
    const events = step(world, dt, intent);
    handleEvents(events);
    if (world.screen === SCREEN_OVER) announce('Shift over');
  }
  render(ctx, world, t);
  requestAnimationFrame(frame);
}

attachInput(input, canvas, {
  onEnter() {
    if (world.screen === SCREEN_TITLE) {
      resetWorld(world);
      announce('Shift started. Grab ingredients at the pantry.');
    } else if (world.screen === SCREEN_OVER) resetWorld(world);
  },
  onPause() {
    if (world.screen === SCREEN_PLAY) { paused = !paused; announce(paused ? 'Paused' : 'Cooking'); }
  },
  onRestart() { if (world.screen !== SCREEN_TITLE) { resetWorld(world); paused = false; } },
  onMute(muted) { audio.muted = muted; announce(muted ? 'Muted' : 'Sound on'); },
});

canvas.addEventListener('pointerdown', () => {
  if (world.screen === SCREEN_TITLE) { resetWorld(world); announce('Shift started.'); }
  else if (world.screen === SCREEN_OVER) resetWorld(world);
});

if (shotName) {
  // Deterministic staged frame for screenshots: run the real rules forward,
  // then hold the frame still (render loop keeps painting it).
  stageShot(shotName, world);
  world.screen = SCREEN_PLAY;
  const frozen = performance.now();
  const paint = () => { render(ctx, world, frozen / 1000); requestAnimationFrame(paint); };
  requestAnimationFrame(paint);
} else {
  world.screen = SCREEN_TITLE;
  requestAnimationFrame(frame);
}

void CHEF_Y;
void H;
void W;
