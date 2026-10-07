import type React from "react";
import { clamp01, prog, sp } from "../lib/motion";
import { brandGradient, colors, font, motion } from "../theme";

export type Word = { text: string; accent?: boolean } | "\n";

// "a b c" -> Word[], with *word* marking an accent and | a line break.
export const parse = (s: string): Word[] =>
  s.split(" ").flatMap((tok): Word[] => {
    if (tok === "|") return ["\n"];
    const accent = tok.startsWith("*");
    const text = tok.replace(/\*/g, "");
    return [{ text, accent }];
  });

// Masked rise: each word slides up out
// of its own overflow mask with a small rotation, 55 ms apart. `out` sends
// the words back up and away.
export const MaskWords: React.FC<{
  t: number;
  words: Word[];
  start: number;
  out?: number;
  size: number;
  color?: string;
  weight?: number;
  accent?: string;
  align?: "left" | "center";
  stagger?: number;
  style?: React.CSSProperties;
}> = ({
  t,
  words,
  start,
  out,
  size,
  color = colors.ink,
  weight = 700,
  accent = brandGradient,
  align = "center",
  stagger = motion.wordStagger,
  style,
}) => {
  let i = 0;
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
        color,
        textAlign: align,
        ...style,
      }}
    >
      {words.map((w, k) => {
        if (w === "\n") return <br key={k} />;
        const pin = sp(t, start + i * stagger, "heavy");
        const pout = out === undefined ? 0 : prog(t, out + i * 0.03, out + i * 0.03 + 0.3);
        i++;
        const y = (1 - pin) * 110 - pout * 110;
        return (
          <span
            key={k}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              marginRight: "0.24em",
              paddingBottom: "0.1em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${y}%) rotate(${(1 - pin) * 6}deg)`,
                transformOrigin: "0 100%",
                ...(w.accent
                  ? {
                      backgroundImage: accent,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                  : null),
              }}
            >
              {w.text}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Fast beat hits in one slot: each word slams in on its beat (punch spring,
// scale 1.35 -> 1) and is knocked up and out by the next one.
export const HitSwap: React.FC<{
  t: number;
  hits: { text: string; at: number }[];
  until: number;
  size: number;
  color?: string;
  top: number;
  left: number;
  width: number;
  align?: "left" | "center";
}> = ({ t, hits, until, size, color = colors.ink, top, left, width, align = "center" }) => (
  <div style={{ position: "absolute", top, left, width, height: size * 1.25, overflow: "hidden" }}>
    {hits.map((h, i) => {
      const end = i + 1 < hits.length ? hits[i + 1].at : until;
      if (t < h.at || t > end + 0.2) return null;
      const pin = sp(t, h.at, "punch");
      const pout = prog(t, end, end + 0.14);
      // shrink long words so they stay on one line inside the column
      const fit = Math.min(size, width / (h.text.length * 0.62));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: align === "center" ? "center" : "flex-start",
            fontFamily: font,
            fontWeight: 800,
            fontSize: fit,
            letterSpacing: "-0.02em",
            color,
            whiteSpace: "nowrap",
            transform: `translateY(${(1 - clamp01(pin)) * 60 - pout * 120}%) scale(${1 + (1 - pin) * 0.35})`,
            transformOrigin: align === "center" ? "50% 60%" : "0 60%",
            opacity: 1 - pout,
          }}
        >
          {h.text}
        </div>
      );
    })}
  </div>
);
