// Render stills at the given film times (seconds) into out/probe/ and tile
// them into out/probe/sheet.png for a quick look.
// Usage: node scripts/probe.mjs 0.5 2.4 5.1 ...   (needs imageio-ffmpeg for the sheet)
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out", "probe");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: "Film" });

for (const [i, t] of times.entries()) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const file = path.join(out, `p${String(i).padStart(2, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output: file, scale: 0.5 });
  console.log(`t=${t}s frame=${frame} -> ${path.basename(file)}`);
}

const ff = execFileSync("python", ["-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"]).toString().trim();
const cols = Math.min(6, times.length);
const rows = Math.ceil(times.length / cols);
execFileSync(ff, [
  "-v", "error", "-y",
  "-i", path.join(out, "p%02d.png"),
  "-vf", `scale=270:-1,tile=${cols}x${rows}:padding=6:color=white`,
  "-frames:v", "1",
  path.join(out, "sheet.png"),
]);
console.log("sheet:", path.join(out, "sheet.png"));
