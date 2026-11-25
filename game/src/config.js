// Saffron Stall — layout, palette and tuning in one place.
export const W = 1280;
export const H = 720;
export const STEP = 1 / 60;

export const PALETTE = {
  skyTop: '#241640',
  skyBottom: '#120a24',
  awningRed: '#d63031',
  awningCream: '#f7ead7',
  wood: '#8a5a33',
  woodDark: '#6b4423',
  counterTop: '#b5773f',
  counterEdge: '#7a4a22',
  board: '#2b1d42',
  boardEdge: '#4a2f6e',
  cream: '#fff3d6',
  ink: '#241a12',
  saffron: '#f5b301',
  amber: '#ff9f43',
  chili: '#e84142',
  leaf: '#2ecc71',
  gold: '#ffd32a',
  white: '#ffffff',
};

export const SHIFT_SECONDS = 180;
export const ORDER_TIME = 55;
export const ORDER_TIME_RUSH = 42;
export const MAX_ORDERS = 3;
export const SPAWN_EVERY = 16;
export const SPAWN_EVERY_RUSH = 10;
export const RUSH_AT = 60;
export const HEARTS = 3;

// Stations across the counter, left to right.
export const STATIONS = [
  { id: 'pantry', label: 'PANTRY', x: 150, hint: 'pick an ingredient' },
  { id: 'chop', label: 'CHOP BOARD', x: 450, hint: 'chop it (3x SPACE)' },
  { id: 'wok', label: 'WOK', x: 760, hint: 'stop the needle in green' },
  { id: 'plate', label: 'PLATING', x: 1060, hint: 'assemble & serve' },
];

export const CHEF_SPEED = 520; // px per second
export const CHEF_Y = 560;
export const COUNTER_Y = 470; // top of the counter surface
