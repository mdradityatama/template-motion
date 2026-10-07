# template-motion

Template monorepo untuk film motion graphic berbasis kode (Remotion). Satu folder per film, masing-masing jadi npm workspace. Skills agent sudah terpasang.

## Struktur

```
template-motion/
  .agents/skills/remotion-best-practices/   skill Remotion (sumber: remotion-dev/skills, lihat skills-lock.json)
  .claude/skills/motion-design/             pipeline motion design, aset, gotcha, critique loop
  .claude/skills/remotion-best-practices/   salinan skill Remotion untuk Claude Code
  _film-template/                           kerangka film, disalin untuk tiap film baru
  CLAUDE.md                                 aturan kerja dan konvensi untuk agent
  package.json                              root npm workspaces
  skills-lock.json
```

Isi `_film-template/`:

```
BRIEF.md                    template brief (spesifikasi, brand, arah motion, beat map, jembatan, musik, verifikasi)
package.json                Remotion 4.0.532, script dev / build / lint / mix / render
public/brand/tokens.json    token warna, tipe, safe zone, layout, motion
public/sfx/                 12 SFX Mixkit dasar
scripts/mix_audio.py        musik + SFX ke public/audio/mix.wav, -14 LUFS
scripts/probe.mjs           render still per detik + contact sheet
src/theme.ts                membaca tokens.json
src/timeline.ts             grid beat (BPM, drop, awal scene)
src/lib/motion.ts           easing, spring, kamera, PRNG
src/components/Words.tsx    MaskWords (masked rise), HitSwap (hit cepat per beat)
src/scenes/                 dua scene contoh: Hook, Cta
src/Film.tsx                urutan scene, camera punch, motion blur sub-frame
```

## Prasyarat

- Node 24, npm 11
- Python 3.10+ dengan `numpy` dan `imageio-ffmpeg` (`pip install numpy imageio-ffmpeg`)

## Membuat film baru

1. Salin `_film-template/` ke folder baru, mis. `acme-promo-60s/`.
2. Isi `BRIEF.md` dan `docs/`, review dulu sebelum build.
3. Di `package.json` film: ganti `name`, `description`, dan nama file output di script `render`.
4. Tambahkan nama folder ke `workspaces` di `package.json` root, lalu `npm install` di root.
5. Ganti `public/brand/tokens.json` dengan brand film, atur BPM dan drop di `src/timeline.ts` dan `scripts/mix_audio.py`, bangun scene.
6. `npm run mix`, set `MIX = true` di `src/Film.tsx`, lalu `npm run render`.

## Script (jalankan di folder film)

| Script | Fungsi |
|---|---|
| `npm run dev` | Remotion Studio |
| `npm run lint` | ESLint + `tsc` |
| `npm run mix` | Bangun `public/audio/mix.wav` |
| `npm run render` | Render `out/<film>.mp4` (h264, crf 16, bt709) |
| `node scripts/probe.mjs 1 4 8` | Still di detik tertentu + `out/probe/sheet.png` |
