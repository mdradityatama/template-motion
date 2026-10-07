// Beat map. Placeholder grid at 120 BPM with the drop at 15 s: once the music
// is picked, measure its BPM and drop, set BEAT and DROP, and put every scene
// start on a whole beat counted from the drop. Keep scripts/mix_audio.py in
// sync (it reads the onBeat() calls below).
export const BEAT = 60 / 120;
export const BAR = 4 * BEAT;

export const DROP = 15.0;
export const onBeat = (n: number) => Math.round((DROP + n * BEAT) * 1000) / 1000;

export const T = {
  hook: 0,
  cta: DROP,
  end: 30.0,
};

// Beat n of a scene that starts at s.
export const b = (s: number, n: number) => s + n * BEAT;
