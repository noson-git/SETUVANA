/**
 * SETUVANA - Web Audio DTMF & Telephony Sound Generator
 * Synthesizes realistic Indian telecom DTMF tones and ringbacks
 */

const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDTMFTone(key: string, durationMs: number = 180): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = DTMF_FREQUENCIES[key];
  if (!freqs) return;

  const [f1, f2] = freqs;
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.frequency.value = f1;
  osc2.frequency.value = f2;

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);

  osc1.stop(now + durationMs / 1000);
  osc2.stop(now + durationMs / 1000);
}

export function playRingingTone(cycles: number = 2): () => void {
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  let active = true;
  let cycleCount = 0;

  const playRingCycle = () => {
    if (!active || cycleCount >= cycles || !ctx) return;
    cycleCount++;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = 400;
    osc2.frequency.value = 450;

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.setValueAtTime(0.08, now + 1.2);
    gain.gain.linearRampToValueAtTime(0, now + 1.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.3);
    osc2.stop(now + 1.3);

    if (cycleCount < cycles && active) {
      setTimeout(playRingCycle, 3000);
    }
  };

  playRingCycle();

  return () => {
    active = false;
  };
}
