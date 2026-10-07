"""Build public/audio/mix.wav: music + SFX on the film timeline, -14 LUFS.

Music: optional. Put the chosen track at public/audio/music.mp3, set BPM,
DROP and SONG_START below (and BEAT/DROP in src/timeline.ts) so the song's
drop lands on the film's key visual moment. Without the file the mix is
SFX only.
SFX: Mixkit previews in public/sfx, each placed by its measured peak. Cue
times are written relative to the scene starts read from src/timeline.ts.

Run: python scripts/mix_audio.py   (needs numpy + imageio-ffmpeg)
"""

import json
import re
import subprocess
from pathlib import Path

import imageio_ffmpeg
import numpy as np

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = Path(__file__).resolve().parent.parent
SR = 48000
DUR = 30.0

# Keep in sync with src/timeline.ts.
BEAT = 60 / 120
BAR = 4 * BEAT
DROP = 15.0
# Second in the song that plays at film time 0.
SONG_START = 0.0

MUSIC_GAIN = 0.17


def timeline() -> dict[str, float]:
    # mirrors src/timeline.ts: scene starts are whole beats from the drop
    src = (ROOT / "src/timeline.ts").read_text(encoding="utf-8")
    out = {"hook": 0.0, "cta": DROP}
    for name, n in re.findall(r"(\w+): onBeat\((-?\d+)\)", src):
        out[name] = round(DROP + int(n) * BEAT, 3)
    return out


T = timeline()


def b(s: float, n: float) -> float:
    return s + n * BEAT


def load(path: Path, filters: str = "") -> np.ndarray:
    cmd = [FF, "-v", "error", "-i", str(path)]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def peak(x: np.ndarray) -> float:
    return float(np.argmax(np.abs(x).max(axis=1))) / SR


def place(dst: np.ndarray, x: np.ndarray, start_s: float, gain: float) -> None:
    start = int(round(start_s * SR))
    a, b_ = max(0, start), min(len(dst), start + len(x))
    if b_ > a:
        dst[a:b_] += x[a - start : b_ - start] * gain


# (sfx id, film time of its peak, gain)
CUES: list[tuple[str, float, float]] = []


def cue(sfx: str, t: float, gain: float) -> None:
    CUES.append((sfx, t, gain))


# Mixkit SFX in public/sfx (add new ones by their Mixkit id).
CHECK, TICK, CLICK, IMPACT = "1113", "1117", "1125", "1143"
RISE, WHOOSH, BUBBLE, POP = "1489", "1490", "2357", "2364"
KEY, TOAST, SUCCESS, SPARKLE = "2568", "2573", "2865", "3083"

# Example cues for the two example scenes. Replace per film.
# 1 hook: a pop per hit, sparkle under the held line
h = T["hook"]
for n in (1, 2, 3):
    cue(POP, b(h, n) + 0.05, 0.09)
cue(SPARKLE, b(h, 4) + 0.3, 0.06)
cue(RISE, T["cta"] - 0.05, 0.12)
# 2 CTA: drop hit, three hits, call to action
c = T["cta"]
cue(IMPACT, c, 0.16)
for n in (1, 2):
    cue(CLICK, b(c, n) + 0.05, 0.1)
cue(SUCCESS, b(c, 3) + 0.2, 0.08)


def main() -> None:
    n = int(DUR * SR)
    t = np.arange(n) / SR

    print("scene starts", T)
    mix = np.zeros((n, 2), np.float32)
    song = ROOT / "public/audio/music.mp3"
    if song.exists():
        music = load(song, f"atrim=start={SONG_START:.4f},asetpts=PTS-STARTPTS")[:n]
        music = np.pad(music, ((0, n - len(music)), (0, 0)))
        fade = np.clip(t / 0.25, 0, 1) * np.clip((DUR - t) / 1.4, 0, 1)
        mix += music * MUSIC_GAIN * fade[:, None]
    else:
        print("no public/audio/music.mp3, SFX only")

    cache: dict[str, tuple[np.ndarray, float]] = {}
    for sfx, at, gain in CUES:
        if sfx not in cache:
            x = load(ROOT / f"public/sfx/{sfx}.mp3")
            cache[sfx] = (x, peak(x))
        x, p = cache[sfx]
        place(mix, x, at - p, gain)

    tmp = ROOT / "out/mix_raw.wav"
    tmp.parent.mkdir(exist_ok=True)
    pcm = np.clip(mix, -1, 1)
    subprocess.run(
        [FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(tmp)],
        input=pcm.astype(np.float32).tobytes(),
        check=True,
    )

    # two-pass loudnorm to -14 LUFS
    first = subprocess.run(
        [FF, "-hide_banner", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True,
        text=True,
    ).stderr
    m_ = json.loads(first[first.rfind("{") : first.rfind("}") + 1])
    af = (
        f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m_['input_i']}:measured_TP={m_['input_tp']}"
        f":measured_LRA={m_['input_lra']}:measured_thresh={m_['input_thresh']}:offset={m_['target_offset']}:linear=true"
    )
    out = ROOT / "public/audio/mix.wav"
    out.parent.mkdir(exist_ok=True)
    subprocess.run([FF, "-v", "error", "-y", "-i", str(tmp), "-af", af, "-ar", str(SR), str(out)], check=True)
    print("input LUFS", m_["input_i"], "-> -14, wrote", out)


if __name__ == "__main__":
    main()
