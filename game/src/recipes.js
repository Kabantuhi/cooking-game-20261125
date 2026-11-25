// Ingredients and the 12 dishes they combine into.
// Every dish = 1 base + 1 protein + 1 sauce. A base is stir-fried in the wok,
// a protein is chopped first, a sauce pours straight onto the plate.
export const INGREDIENTS = {
  noodle: { id: 'noodle', name: 'Noodle', kind: 'base', color: '#f5c542', price: 4 },
  rice: { id: 'rice', name: 'Rice', kind: 'base', color: '#fff8e7', price: 4 },
  chicken: { id: 'chicken', name: 'Chicken', kind: 'protein', color: '#e8a87c', price: 5 },
  shrimp: { id: 'shrimp', name: 'Shrimp', kind: 'protein', color: '#ff8fa3', price: 6 },
  saffron: { id: 'saffron', name: 'Saffron', kind: 'sauce', color: '#f5b301', price: 3 },
  chili: { id: 'chili', name: 'Chilli', kind: 'sauce', color: '#e84142', price: 3 },
};

export const BASES = ['noodle', 'rice'];
export const PROTEINS = ['chicken', 'shrimp'];
export const SAUCES = ['saffron', 'chili'];

export const DISHES = {
  'noodle+chicken+saffron': { name: 'Golden Noodle', coins: 14 },
  'noodle+chicken+chili': { name: 'Fire Noodle', coins: 14 },
  'noodle+shrimp+saffron': { name: 'Saffron Prawn Noodle', coins: 16 },
  'noodle+shrimp+chili': { name: 'Ember Prawn Noodle', coins: 16 },
  'rice+chicken+saffron': { name: 'Golden Fried Rice', coins: 14 },
  'rice+chicken+chili': { name: 'Volcano Rice', coins: 14 },
  'rice+shrimp+saffron': { name: 'Saffron Prawn Rice', coins: 16 },
  'rice+shrimp+chili': { name: 'Ember Prawn Rice', coins: 16 },
  // Shortcuts the board never orders but the plate can still serve for less:
  'noodle+chicken': { name: 'Plain Noodle', coins: 8 },
  'noodle+shrimp': { name: 'Plain Prawn Noodle', coins: 9 },
  'rice+chicken': { name: 'Plain Fried Rice', coins: 8 },
  'rice+shrimp': { name: 'Plain Prawn Rice', coins: 9 },
};

export function dishKey(parts) {
  return parts.join('+');
}

export function dishFor(parts) {
  return DISHES[dishKey(parts)] ?? null;
}

export function randomDish(random) {
  const base = BASES[Math.floor(random() * BASES.length)];
  const protein = PROTEINS[Math.floor(random() * PROTEINS.length)];
  const sauce = SAUCES[Math.floor(random() * SAUCES.length)];
  const key = dishKey([base, protein, sauce]);
  return { key, name: DISHES[key].name, coins: DISHES[key].coins, parts: [base, protein, sauce] };
}
