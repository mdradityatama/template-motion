import type React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { kicks } from "./lib/motion";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { colors, FPS, motion } from "./theme";
import { BAR, BEAT, DROP, T } from "./timeline";

// Set to true once scripts/mix_audio.py has written public/audio/mix.wav.
const MIX = false;

// Motion blur windows [from, to] in seconds: only where things move fast
// (zoom-throughs, whip-pans, dives).
const BLUR: [number, number][] = [];

// Which scene is on screen at t, and how scenes are joined. Bridges (portal
// zoom-through, flood, whip-pan, shutter, morph) go between the cases.
const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cta) return <Hook t={t} s={T.hook} />;
  return <Cta t={t} s={T.cta} />;
};

// Beat punches on the camera after the drop.
const DROP_BEATS = new Array(8).fill(0).map((_, i) => DROP + i * BEAT);
const DROP_BARS = new Array(2).fill(0).map((_, i) => DROP + i * BAR);

const Frame: React.FC<{ t: number }> = ({ t }) => {
  const punch = kicks(t, DROP_BEATS, motion.punchBeat) + kicks(t, DROP_BARS, motion.punchBar);
  return (
    <AbsoluteFill style={{ background: colors.surface, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + punch})` }}>
        <Scenes t={t} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Average of sub-frame renders (plus-lighter at 1/n opacity each), centred
// on t, like a 180 degree film shutter.
const Blurred: React.FC<{ t: number; samples: number }> = ({ t, samples }) => (
  <AbsoluteFill style={{ isolation: "isolate" }}>
    {new Array(samples).fill(0).map((_, i) => (
      <AbsoluteFill key={i} style={{ mixBlendMode: "plus-lighter", filter: `opacity(${1 / samples})` }}>
        <Frame t={t + (0.5 / FPS) * (i / (samples - 1) - 0.5)} />
      </AbsoluteFill>
    ))}
  </AbsoluteFill>
);

export const Film: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const blur = BLUR.some(([a, z]) => t >= a && t <= z);
  return (
    <AbsoluteFill>
      {/* music + SFX, built by scripts/mix_audio.py */}
      {MIX ? <Audio src={staticFile("audio/mix.wav")} /> : null}
      {blur ? <Blurred t={t} samples={motion.whipBlurSamples} /> : <Frame t={t} />}
    </AbsoluteFill>
  );
};
