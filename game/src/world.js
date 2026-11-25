// Saffron Stall — the whole game state and its rules. Pure logic, no drawing.
import {
  CHEF_SPEED, CHEF_Y, HEARTS, MAX_ORDERS, ORDER_TIME, ORDER_TIME_RUSH,
  RUSH_AT, SHIFT_SECONDS, SPAWN_EVERY, SPAWN_EVERY_RUSH, STATIONS,
} from './config.js';
import { INGREDIENTS, dishFor, randomDish } from './recipes.js';
import { mulberry32 } from './random.js';

export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_OVER = 4;
export const EVENT_BURNT = 8;

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

const WOK_GREEN = [0.42, 0.58];
const WOK_YELLOW = [0.25, 0.75];

export function createWorld(seed = 1) {
  const random = mulberry32(seed);
  return {
    seed,
    random,
    screen: SCREEN_TITLE,
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    chef: { x: 640, targetX: 640, face: 1, walkPhase: 0, moving: false },
    held: null, // { id, stage: 'raw' | 'ready', quality: 1 | 2 }
    plate: [], // ready ingredient ids on the plate, in add order
    chop: { progress: 0, shake: 0 },
    wok: { active: false, needle: 0, dir: 1, speed: 1.7, steam: 0 },
    orders: [],
    orderSeq: 0,
    spawnTimer: 6,
    coins: 0,
    served: 0,
    streak: 0,
    bestStreak: 0,
    hearts: HEARTS,
    rush: false,
    rushAnnounced: false,
    rushBanner: 0,
    floats: [], // { x, y, text, color, ttl }
    particles: [], // { x, y, vy, ttl, size }
    shake: 0,
    message: '',
    messageTtl: 0,
  };
}

export function resetWorld(world) {
  const fresh = createWorld(world.seed);
  Object.keys(fresh).forEach((key) => { world[key] = fresh[key]; });
  world.screen = SCREEN_PLAY;
}

export function currentStation(world) {
  let best = null;
  let bestDist = 110;
  for (const station of STATIONS) {
    const dist = Math.abs(world.chef.x - station.x);
    if (dist < bestDist) { bestDist = dist; best = station; }
  }
  return best;
}

function say(world, text, ttl = 1.6) {
  world.message = text;
  world.messageTtl = ttl;
}

function addFloat(world, x, y, text, color) {
  world.floats.push({ x, y, text, color, ttl: 1.4 });
}

function spawnOrder(world) {
  if (world.orders.length >= MAX_ORDERS) return;
  const dish = randomDish(world.random);
  const maxTime = world.rush ? ORDER_TIME_RUSH : ORDER_TIME;
  world.orderSeq += 1;
  world.orders.push({ id: world.orderSeq, dish, timeLeft: maxTime, maxTime, born: world.time });
}

export function pickIngredient(world, id) {
  const station = currentStation(world);
  if (!station || station.id !== 'pantry') { say(world, 'Go to the PANTRY first'); return false; }
  if (world.held) { say(world, 'Hands full — plate it or drop it (X)'); return false; }
  const ingredient = INGREDIENTS[id];
  if (!ingredient) return false;
  const stage = ingredient.kind === 'sauce' ? 'ready' : 'raw';
  world.held = { id, stage, quality: 1 };
  return true;
}

export function dropHeld(world) {
  if (!world.held) return false;
  world.held = null;
  world.chop.progress = 0;
  world.wok.active = false;
  say(world, 'Dropped');
  return true;
}

export function chopHit(world) {
  const station = currentStation(world);
  if (!station || station.id !== 'chop') return false;
  const held = world.held;
  if (!held) { say(world, 'Nothing to chop — grab a protein at the PANTRY'); return false; }
  if (held.stage === 'ready') { say(world, 'Already prepped'); return false; }
  if (INGREDIENTS[held.id].kind !== 'protein') {
    say(world, 'Only proteins need chopping — bases go to the WOK');
    return false;
  }
  world.chop.progress += 1;
  world.chop.shake = 0.18;
  if (world.chop.progress >= 3) {
    held.stage = 'ready';
    held.quality = 2;
    world.chop.progress = 0;
    say(world, `${INGREDIENTS[held.id].name} chopped clean!`);
  }
  return true;
}

export function wokAction(world) {
  const station = currentStation(world);
  if (!station || station.id !== 'wok') return false;
  const held = world.held;
  if (!held) { say(world, 'Nothing in the wok — grab a base at the PANTRY'); return false; }
  if (held.stage === 'ready') { say(world, 'Already cooked'); return false; }
  if (INGREDIENTS[held.id].kind !== 'base') {
    say(world, 'Only bases go in the wok — proteins go to the CHOP BOARD');
    return false;
  }
  if (!world.wok.active) {
    world.wok.active = true;
    world.wok.needle = 0;
    world.wok.dir = 1;
    world.wok.speed = 1.7 + Math.min(0.7, world.time / 180);
    say(world, 'Wok fired! Stop the needle in the GREEN');
    return true;
  }
  // Lock the needle.
  const n = world.wok.needle;
  world.wok.active = false;
  if (n >= WOK_GREEN[0] && n <= WOK_GREEN[1]) {
    held.stage = 'ready';
    held.quality = 2;
    say(world, 'PERFECT sear! +tip');
  } else if (n >= WOK_YELLOW[0] && n <= WOK_YELLOW[1]) {
    held.stage = 'ready';
    held.quality = 1;
    say(world, 'Cooked — a little pale');
  } else {
    world.held = null;
    world.shake = 0.3;
    say(world, 'BURNT! Tossed it out');
    return EVENT_BURNT;
  }
  return true;
}

function plateKinds(world) {
  return world.plate.map((id) => INGREDIENTS[id].kind);
}

export function plateAction(world) {
  const station = currentStation(world);
  if (!station || station.id !== 'plate') return false;
  if (world.held) {
    if (world.held.stage !== 'ready') {
      say(world, 'Prep it first — chop proteins, wok bases');
      return false;
    }
    const kind = INGREDIENTS[world.held.id].kind;
    if (plateKinds(world).includes(kind)) {
      say(world, `Plate already has a ${kind}`);
      return false;
    }
    world.plate.push(world.held.id);
    world.held = null;
    return true;
  }
  // No held item: try to serve a complete plate.
  return servePlate(world);
}

function canonicalPlateKey(plate) {
  // Dishes are keyed base+protein+sauce, whatever order the chef plated them.
  const byKind = {};
  for (const id of plate) byKind[INGREDIENTS[id].kind] = id;
  return [byKind.base, byKind.protein, byKind.sauce].filter(Boolean).join('+');
}

export function servePlate(world, orderId = null) {
  if (world.plate.length === 0) { say(world, 'Plate is empty'); return false; }
  const dish = dishFor(world.plate.slice().sort((a, b) => {
    const order = { base: 0, protein: 1, sauce: 2 };
    return order[INGREDIENTS[a].kind] - order[INGREDIENTS[b].kind];
  }));
  if (!dish) { say(world, 'That mix is no dish on the menu'); return false; }
  const key = canonicalPlateKey(world.plate);
  const order = world.orders.find((o) => (orderId === null || o.id === orderId) && o.dish.key === key);
  if (!order) { say(world, 'No open order wants this dish'); return false; }
  const timeBonus = Math.round((order.timeLeft / order.maxTime) * 8);
  const streakBonus = Math.min(6, world.streak * 2);
  const tip = timeBonus + streakBonus;
  const earned = dish.coins + tip;
  world.coins += earned;
  world.served += 1;
  world.streak += 1;
  world.bestStreak = Math.max(world.bestStreak, world.streak);
  world.orders = world.orders.filter((o) => o.id !== order.id);
  addFloat(world, 1060, 400, `+${earned} coins`, '#ffd32a');
  if (world.streak >= 3) addFloat(world, 1060, 360, `STREAK x${world.streak}!`, '#ff9f43');
  world.plate = [];
  return EVENT_SERVED;
}

function expireOrder(world, order) {
  world.orders = world.orders.filter((o) => o.id !== order.id);
  world.hearts -= 1;
  world.streak = 0;
  world.shake = 0.4;
  addFloat(world, 640, 120, `${order.dish.name} walked out! -1 heart`, '#e84142');
  return EVENT_EXPIRED;
}

export function step(world, dt, intent = {}) {
  if (world.screen !== SCREEN_PLAY) return 0;
  let events = 0;

  world.time += dt;
  world.shiftLeft = Math.max(0, SHIFT_SECONDS - world.time);
  if (!world.rush && world.time >= RUSH_AT) {
    world.rush = true;
    world.rushAnnounced = true;
    world.rushBanner = 3;
    say(world, 'RUSH HOUR! Orders come faster', 3);
  }
  if (world.rushBanner > 0) world.rushBanner -= dt;
  if (world.messageTtl > 0) world.messageTtl -= dt;
  if (world.shake > 0) world.shake -= dt;
  if (world.chop.shake > 0) world.chop.shake -= dt;

  // Chef movement.
  const chef = world.chef;
  if (intent.targetStation) {
    const station = STATIONS.find((s) => s.id === intent.targetStation);
    if (station) chef.targetX = station.x;
  }
  if (intent.move) {
    chef.targetX = Math.max(90, Math.min(1190, chef.x + intent.move * CHEF_SPEED * dt));
    chef.face = intent.move > 0 ? 1 : -1;
  }
  const dx = chef.targetX - chef.x;
  if (Math.abs(dx) > 2) {
    const stepX = Math.sign(dx) * Math.min(Math.abs(dx), CHEF_SPEED * dt);
    chef.x += stepX;
    chef.face = stepX > 0 ? 1 : -1;
    chef.moving = true;
    chef.walkPhase += dt * 12;
  } else {
    chef.moving = false;
  }

  // Intents.
  if (intent.pick) pickIngredient(world, intent.pick);
  if (intent.chop) chopHit(world);
  if (intent.wok) {
    const result = wokAction(world);
    if (result === EVENT_BURNT) events |= EVENT_BURNT;
  }
  if (intent.plate) {
    const result = plateAction(world);
    if (result === EVENT_SERVED) events |= EVENT_SERVED;
  }
  if (intent.serveOrder) {
    const result = servePlate(world, intent.serveOrder);
    if (result === EVENT_SERVED) events |= EVENT_SERVED;
  }
  if (intent.drop) dropHeld(world);

  // Wok needle.
  if (world.wok.active) {
    world.wok.needle += world.wok.dir * world.wok.speed * dt;
    if (world.wok.needle >= 1) { world.wok.needle = 1; world.wok.dir = -1; }
    if (world.wok.needle <= 0) { world.wok.needle = 0; world.wok.dir = 1; }
    world.wok.steam += dt;
    if (world.wok.steam > 0.12) {
      world.wok.steam = 0;
      world.particles.push({
        x: 760 + (world.random() - 0.5) * 60, y: 430,
        vy: -46 - world.random() * 20, ttl: 0.9, size: 5 + world.random() * 6,
      });
    }
    // The needle bounces at the top, so the wok never burns on its own —
    // the risk is locking it outside the green. Pressure comes from the
    // order timers and the rush, not from babysitting the wok.
  }

  // Orders.
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    spawnOrder(world);
    world.spawnTimer = world.rush ? SPAWN_EVERY_RUSH : SPAWN_EVERY;
  }
  for (const order of world.orders.slice()) {
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) events |= expireOrder(world, order);
  }

  // Particles and floats.
  for (const p of world.particles) { p.y += p.vy * dt; p.ttl -= dt; }
  world.particles = world.particles.filter((p) => p.ttl > 0);
  for (const f of world.floats) { f.y -= 26 * dt; f.ttl -= dt; }
  world.floats = world.floats.filter((f) => f.ttl > 0);

  // Shift end.
  if (world.hearts <= 0 || world.time >= SHIFT_SECONDS) {
    world.screen = SCREEN_OVER;
    events |= EVENT_OVER;
  }
  return events;
}

export function starsFor(world) {
  if (world.served >= 12) return 3;
  if (world.served >= 8) return 2;
  if (world.served >= 5) return 1;
  return 0;
}

export { CHEF_Y };
