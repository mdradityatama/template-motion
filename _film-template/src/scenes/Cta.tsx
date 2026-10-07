import type React from "react";
import { AbsoluteFill } from "remotion";
import { HitSwap, MaskWords, parse } from "../components/Words";
import { prog } from "../lib/motion";
import { colors, CW, CY, font, SAFE, type } from "../theme";
import { b } from "../timeline";

// Example closing scene on the light ground: 3 hits from the drop, then the
// call to action, then the contact line. Hold the end frame at least 1.5 s.
export const Cta: React.FC<{ t: number; s: number }> = ({ t, s }) => (
  <AbsoluteFill style={{ background: colors.surface }}>
    <HitSwap
      t={t}
      hits={[
        { text: "Ide.", at: s },
        { text: "Bangun.", at: b(s, 1) },
        { text: "Rilis.", at: b(s, 2) },
      ]}
      until={b(s, 3)}
      size={type.hit}
      top={CY - type.hit * 0.625}
      left={SAFE.left}
      width={CW}
    />
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: SAFE.left, paddingRight: SAFE.right }}>
      <MaskWords t={t} words={parse("Ajakan *bertindak* | di sini.")} start={b(s, 3)} size={type.headline} />
      <div
        style={{
          marginTop: 56,
          textAlign: "center",
          fontFamily: font,
          fontWeight: 500,
          fontSize: type.caption,
          color: colors.inkMuted,
          opacity: prog(t, b(s, 6), b(s, 7)),
        }}
      >
        www.example.com
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
