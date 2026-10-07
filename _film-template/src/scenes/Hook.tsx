import type React from "react";
import { AbsoluteFill } from "remotion";
import { HitSwap, MaskWords, parse } from "../components/Words";
import { colors, CW, CY, deepGradient, SAFE, type } from "../theme";
import { b } from "../timeline";

// Example scene. Every scene is a pure function of the film time t and its
// own start s. Section rhythm: 3 fast hits on beats, then 1 slow held line.
export const Hook: React.FC<{ t: number; s: number }> = ({ t, s }) => (
  <AbsoluteFill style={{ background: deepGradient }}>
    <HitSwap
      t={t}
      hits={[
        { text: "Satu.", at: b(s, 1) },
        { text: "Dua.", at: b(s, 2) },
        { text: "Tiga.", at: b(s, 3) },
      ]}
      until={b(s, 4)}
      size={type.hit}
      color={colors.white}
      top={CY - type.hit * 0.625}
      left={SAFE.left}
      width={CW}
    />
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: SAFE.left, paddingRight: SAFE.right }}>
      <MaskWords
        t={t}
        words={parse("Pesan *utama* | tahan di sini.")}
        start={b(s, 4)}
        size={type.headline}
        color={colors.white}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);
