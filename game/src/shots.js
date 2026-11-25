// Screenshot scenes behind ?shot=cover|play|rush|serve. Each one plays the real
// rules forward from a fresh world at a fixed step, steered by a scripted
// autopilot that calls the same actions a player would, so the frame is what a
// real game looks like and the same seed always gives the same frame.
import { STEP } from './config.js';
import { INGREDIENTS } from './recipes.js';
import {
  SCREEN_PLAY, chopHit, createWorld, currentStation, pickIngredient,
  plateAction, resetWorld, servePlate, step, wokAction,
} from './world.js';

const STATIONS = { pantry: 150, chop: 450, wok: 760, plate: 1060 };

function arrived(world, stationId) {
  return Math.abs(world.chef.x - STATIONS[stationId]) < 25;
}

function gotoStep(world, stationId) {
  step(world, STEP, { targetStation: stationId });
  return arrived(world, stationId);
}

function buildDish(world, parts, maxSteps) {
  // Cooks the dish whose parts are listed, plating each component as it is
  // prepped. Returns false if the step budget runs out.
  let steps = 0;
  for (const part of parts) {
    const kind = INGREDIENTS[part].kind;
    while (!arrived(world, 'pantry') && steps < maxSteps) { gotoStep(world, 'pantry'); steps += 1; }
    pickIngredient(world, part);
    if (kind === 'protein') {
      while (!arrived(world, 'chop') && steps < maxSteps) { gotoStep(world, 'chop'); steps += 1; }
      for (let i = 0; i < 3; i += 1) { chopHit(world); step(world, STEP, {}); steps += 1; }
    } else if (kind === 'base') {
      while (!arrived(world, 'wok') && steps < maxSteps) { gotoStep(world, 'wok'); steps += 1; }
      wokAction(world);
      let locked = false;
      while (!locked && steps < maxSteps) {
        step(world, STEP, {});
        steps += 1;
        const n = world.wok.needle;
        if (n >= 0.46 && n <= 0.54) { wokAction(world); locked = true; }
      }
      if (!locked) return false;
    }
    while (!arrived(world, 'plate') && steps < maxSteps) { gotoStep(world, 'plate'); steps += 1; }
    plateAction(world);
    step(world, STEP, {});
    steps += 1;
  }
  return steps < maxSteps;
}

function waitFor(world, cond, maxSteps) {
  let steps = 0;
  while (!cond(world) && steps < maxSteps) { step(world, STEP, {}); steps += 1; }
  return steps < maxSteps;
}

function startNextBase(world, maxSteps) {
  let steps = 0;
  while (!arrived(world, 'pantry') && steps < maxSteps) { gotoStep(world, 'pantry'); steps += 1; }
  pickIngredient(world, 'noodle');
  while (!arrived(world, 'wok') && steps < maxSteps) { gotoStep(world, 'wok'); steps += 1; }
  wokAction(world);
  for (let i = 0; i < 20; i += 1) step(world, STEP, {});
  return steps < maxSteps;
}

export function stageShot(name, world) {
  resetWorld(world);
  world.screen = SCREEN_PLAY;
  const budget = 60 * 120; // 120 seconds of game time, worst case
  if (name === 'rush') {
    world.time = 62;
    world.spawnTimer = 0.5;
    waitFor(world, (w) => w.orders.length >= 2, budget);
    const first = world.orders[0];
    if (first) buildDish(world, first.dish.parts, budget);
    world.rushBanner = 2.5; // freeze with the banner showing
    return { screen: SCREEN_PLAY, best: world.coins };
  }
  // All other shots: wait for the first order, then cook exactly that dish.
  waitFor(world, (w) => w.orders.length >= (name === 'cover' ? 2 : 1), budget);
  const first = world.orders[0];
  if (!first) return { screen: SCREEN_PLAY, best: 0 };
  if (name === 'cover') {
    buildDish(world, first.dish.parts, budget);
    // Plate complete and ready to serve; start the next dish's base in the
    // wok so the frame also shows one dish mid-assembly.
    startNextBase(world, budget);
    return { screen: SCREEN_PLAY, best: world.coins };
  }
  if (name === 'serve') {
    buildDish(world, first.dish.parts, budget);
    while (!arrived(world, 'plate') && true) { gotoStep(world, 'plate'); }
    servePlate(world);
    // Let the next ticket arrive so the board is not empty, while the
    // "+N coins" float is still visible.
    world.spawnTimer = 0.5;
    for (let i = 0; i < 60; i += 1) step(world, STEP, {});
    return { screen: SCREEN_PLAY, best: world.coins };
  }
  // play: serve the first dish, then freeze mid-chop on the next one.
  buildDish(world, first.dish.parts, budget);
  while (!arrived(world, 'plate')) { gotoStep(world, 'plate'); }
  servePlate(world);
  waitFor(world, (w) => w.orders.length >= 1, budget);
  const next = world.orders[0];
  if (next) {
    const protein = next.dish.parts.find((p) => INGREDIENTS[p].kind === 'protein');
    while (!arrived(world, 'pantry')) { gotoStep(world, 'pantry'); }
    pickIngredient(world, protein);
    while (!arrived(world, 'chop')) { gotoStep(world, 'chop'); }
    chopHit(world);
    chopHit(world);
  }
  return { screen: SCREEN_PLAY, best: world.coins };
}

export function createShotWorld(seed = 1) {
  return createWorld(seed);
}
