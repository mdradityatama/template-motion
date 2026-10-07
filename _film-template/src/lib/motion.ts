// Time helpers. Every layer is a pure function of t (seconds), so any frame
// renders the same way on its own. Spring presets come from the "motion"
// group of public/brand/tokens.json.
import { H, springs, W } from "../theme";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const expoOut = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const expoInOut = (x: number) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;
};

// Eased progress of t between a and b, exactly 0 before a and 1 after b.
export const prog = (
  t: number,
  a: number,
  b: number,
  ease: (x: number) => number = easeOut,
) => {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return ease((t - a) / (b - a));
};

// Closed-form damped spring step response, 0 before start, settles at 1.
// k = stiffness, d = damping (unit mass).
export const spring = (t: number, start: number, k = 170, d = 26) => {
  const s = t - start;
  if (s <= 0) return 0;
  const w0 = Math.sqrt(k);
  const zeta = d / (2 * w0);
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return (
      1 -
      Math.exp(-zeta * w0 * s) *
        (Math.cos(wd * s) + ((zeta * w0) / wd) * Math.sin(wd * s))
    );
  }
  return 1 - Math.exp(-w0 * s) * (1 + w0 * s);
};

type Preset = keyof typeof springs;
export const sp = (t: number, start: number, preset: Preset = "container") =>
  spring(t, start, springs[preset].stiffness, springs[preset].damping);

// Damped wobble: oscillates around 0 after start, decays with rate.
export const wobble = (t: number, start: number, freq: number, rate: number) => {
  const s = t - start;
  if (s <= 0) return 0;
  return Math.exp(-rate * s) * Math.sin(s * freq * Math.PI * 2);
};

// Visible between a and b with fade in/out durations.
export const window01 = (t: number, a: number, b: number, fadeIn = 0.25, fadeOut = 0.25) =>
  Math.min(prog(t, a, a + fadeIn), 1 - prog(t, b - fadeOut, b));

// Zoom factor interpolated in log space, so equal steps feel equal.
export const logMix = (a: number, b: number, p: number) =>
  Math.exp(mix(Math.log(a), Math.log(b), p));

// Sum of exponentially decaying kicks at the given times (camera punch).
export const kicks = (t: number, times: number[], amp: number, decay = 9) =>
  times.reduce((acc, at) => (t >= at ? acc + amp * Math.exp(-decay * (t - at)) : acc), 0);

// Radius of a circle around (x, y) that clears the farthest frame corner.
export const coverRadius = (x: number, y: number) =>
  Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)) * 1.05;

// Seeded PRNG (mulberry32): deterministic "random" layouts.
export const prng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

// 2D camera: zoom around a world point (cx, cy) that lands on screen (sx, sy).
export type Cam = { zoom: number; cx: number; cy: number };
export const camTransform = (c: Cam, sx = W / 2, sy = H / 2) =>
  `translate(${sx}px, ${sy}px) scale(${c.zoom}) translate(${-c.cx}px, ${-c.cy}px)`;
export const toScreen = (c: Cam, x: number, y: number, sx = W / 2, sy = H / 2) => ({
  x: sx + (x - c.cx) * c.zoom,
  y: sy + (y - c.cy) * c.zoom,
});

// Camera keyframes [t, zoom, cx, cy]; segments eased in-out, zoom in log space.
export type CamKey = [number, number, number, number];
export const camAt = (t: number, keys: CamKey[], ease = easeInOut): Cam => {
  if (t <= keys[0][0]) return { zoom: keys[0][1], cx: keys[0][2], cy: keys[0][3] };
  for (let i = 1; i < keys.length; i++) {
    const [t1, z1, x1, y1] = keys[i];
    const [t0, z0, x0, y0] = keys[i - 1];
    if (t <= t1) {
      const p = prog(t, t0, t1, ease);
      return { zoom: logMix(z0, z1, p), cx: mix(x0, x1, p), cy: mix(y0, y1, p) };
    }
  }
  const last = keys[keys.length - 1];
  return { zoom: last[1], cx: last[2], cy: last[3] };
};
