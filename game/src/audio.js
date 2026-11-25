// Procedural WebAudio sounds — no audio files. All synthesized, all optional.
export function createAudio() {
  return { ctx: null, muted: false, sizzle: null };
}

function ensure(audio) {
  if (audio.ctx) return audio.ctx;
  try {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    audio.ctx = new Ctx();
  } catch {
    audio.ctx = null;
  }
  return audio.ctx;
}

function blip(audio, freq, dur, type = 'sine', gain = 0.12, when = 0) {
  const ctx = ensure(audio);
  if (!ctx || audio.muted) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(audio, dur, gain = 0.08, freq = 1200) {
  const ctx = ensure(audio);
  if (!ctx || audio.muted) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start();
}

export const sfx = {
  chop(audio) { noise(audio, 0.07, 0.16, 900); blip(audio, 180, 0.06, 'triangle', 0.1); },
  wokStart(audio) { noise(audio, 0.5, 0.05, 3000); },
  wokPerfect(audio) { blip(audio, 660, 0.12, 'sine', 0.14); blip(audio, 990, 0.18, 'sine', 0.12, 0.08); },
  wokOk(audio) { blip(audio, 520, 0.12, 'sine', 0.12); },
  burnt(audio) { blip(audio, 140, 0.3, 'sawtooth', 0.1); },
  serve(audio) { blip(audio, 880, 0.1, 'sine', 0.14); blip(audio, 1174, 0.16, 'sine', 0.14, 0.09); blip(audio, 1568, 0.2, 'sine', 0.1, 0.18); },
  expire(audio) { blip(audio, 220, 0.25, 'square', 0.08); blip(audio, 165, 0.35, 'square', 0.08, 0.2); },
  click(audio) { blip(audio, 700, 0.05, 'sine', 0.08); },
  rush(audio) { blip(audio, 440, 0.15, 'triangle', 0.12); blip(audio, 554, 0.15, 'triangle', 0.12, 0.12); blip(audio, 659, 0.25, 'triangle', 0.12, 0.24); },
};
