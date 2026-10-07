import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import tokens from "../public/brand/tokens.json";

// Swap the family for the brand font of the film.
export const font = loadPoppins("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;

type Token = { name: string; value: unknown };

const pick = (list: Token[], name: string): unknown => {
  const tok = list.find((x) => x.name === name);
  if (!tok) throw new Error(`Missing token ${name}`);
  return tok.value;
};

const color = (name: string) => pick(tokens.color.tokens, name) as string;

// Every hex comes from public/brand/tokens.json.
export const colors = {
  surface: color("surface"),
  card: color("surface-card"),
  ink: color("ink"),
  inkMuted: color("ink-muted"),
  white: color("ink-inverse"),
  primary: color("primary"),
  spark: color("spark"),
};

const gradient = (name: string) => pick(tokens.color.gradients, name) as string;
export const deepGradient = gradient("gradient-deep");
export const brandGradient = gradient("gradient-brand");

const px = (list: Token[], name: string) => parseFloat(pick(list, name) as string);
export const radius = {
  chip: px(tokens.radius.tokens, "radius-chip"),
  card: px(tokens.radius.tokens, "radius-card"),
  panel: px(tokens.radius.tokens, "radius-panel"),
};

export const SAFE = {
  top: px(tokens.spacing.tokens, "safe-top"),
  bottom: px(tokens.spacing.tokens, "safe-bottom"),
  left: px(tokens.spacing.tokens, "safe-left"),
  right: px(tokens.spacing.tokens, "safe-right"),
};

export const W = px(tokens.layout.tokens, "width");
export const H = px(tokens.layout.tokens, "height");
export const FPS = px(tokens.layout.tokens, "fps");
export const DURATION = px(tokens.layout.tokens, "duration");

// Content column between the safe margins, centred on CX.
export const CW = W - SAFE.left - SAFE.right;
export const CX = SAFE.left + CW / 2;
export const CY = (SAFE.top + (H - SAFE.bottom)) / 2;

// Motion tokens (public/brand/tokens.json, group "motion").
type Spring = { stiffness: number; damping: number };
const springTok = (name: string) => pick(tokens.motion.tokens, name) as Spring;
export const springs = {
  ui: springTok("spring-ui"),
  container: springTok("spring-container"),
  heavy: springTok("spring-heavy"),
  punch: springTok("spring-punch"),
};

type Spec = Record<string, string | number>;
const spec = (name: string) => pick(tokens.motion.tokens, name) as Spec;
const whip = spec("whip-pan");
const punch = spec("camera-punch");

export const motion = {
  zoomThrough: parseFloat(spec("zoom-through").duration as string),
  whip: parseFloat(whip.duration as string),
  whipBlurSamples: whip.blurSamples as number,
  punchBeat: punch.perBeat as number,
  punchBar: punch.perBarAfterDrop as number,
  wordStagger: parseFloat(pick(tokens.motion.tokens, "word-stagger") as string) / 1000,
};

// Type scale from tokens.type.groups, px at 1080 x 1920.
const styles = tokens.type.groups.flatMap((g) => g.styles);
const size = (name: string) => {
  const s = styles.find((x) => x.name === name);
  if (!s) throw new Error(`Missing type style ${name}`);
  return parseFloat(s.fontSize);
};
export const type = {
  hit: size("hit-word"),
  headline: size("headline"),
  title: size("title"),
  subheading: size("subheading"),
  caption: size("caption"),
};
