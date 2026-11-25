// Keyboard and mouse intents for Saffron Stall. One frame of input becomes one
// intent object that world.step consumes; nothing here touches game state.
import { STATIONS } from './config.js';

const PANTRY_KEYS = { 1: 'noodle', 2: 'rice', 3: 'chicken', 4: 'shrimp', 5: 'saffron', 6: 'chili' };

export function createInput() {
  return {
    left: false, right: false,
    queue: [], // intents waiting to be consumed this frame
    click: null, // { x, y } in canvas pixels, consumed by main
    muted: false,
  };
}

export function attachInput(input, canvas, callbacks) {
  const key = (event) => {
    if (event.repeat) return;
    const k = event.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') { input.left = true; event.preventDefault(); }
    if (k === 'arrowright' || k === 'd') { input.right = true; event.preventDefault(); }
    if (k === ' ') { input.queue.push({ use: true }); event.preventDefault(); }
    if (k === 'enter') callbacks.onEnter();
    if (k === 'p') callbacks.onPause();
    if (k === 'r') callbacks.onRestart();
    if (k === 'm') { input.muted = !input.muted; callbacks.onMute(input.muted); }
    if (k === 'x') input.queue.push({ drop: true });
    if (k === 'escape') callbacks.onPause();
    if (PANTRY_KEYS[k]) input.queue.push({ pick: PANTRY_KEYS[k] });
  };
  const keyUp = (event) => {
    const k = event.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') input.left = false;
    if (k === 'arrowright' || k === 'd') input.right = false;
  };
  window.addEventListener('keydown', key);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    input.click = { x, y };
  });
  return () => {
    window.removeEventListener('keydown', key);
    window.removeEventListener('keyup', keyUp);
  };
}

// Turn the queued raw input into one intent for this frame. `use` at a station
// maps to that station's action; a click maps to walk-to + use, or to a
// pantry ingredient button, or to an order ticket (serve).
export function consumeIntent(input, world, stationAt) {
  const intent = { move: 0 };
  if (input.left) intent.move -= 1;
  if (input.right) intent.move += 1;
  if (input.click) {
    const { x, y } = input.click;
    input.click = null;
    const hit = stationAt(x, y);
    if (hit) {
      if (hit.type === 'station') { intent.targetStation = hit.id; intent.clickUse = true; }
      else if (hit.type === 'pick') intent.pick = hit.id;
      else if (hit.type === 'serve') intent.serveOrder = hit.id;
      else if (hit.type === 'button') intent.button = hit.id;
    }
  }
  while (input.queue.length > 0) {
    const q = input.queue.shift();
    if (q.use) intent.use = true;
    if (q.pick) intent.pick = q.pick;
    if (q.drop) intent.drop = true;
  }
  return intent;
}

export { STATIONS };
