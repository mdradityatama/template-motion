# <Nama film>, video <jenis> <durasi> s

Status: draft untuk review, <YYYY-MM-DD>. Belum ada kode, npm install, voice-over, unduh musik, atau render sebelum brief ini disetujui.

Sumber isi: <repo, PPT, website, atau dokumen sumber>. Inventaris fakta dan klaim: `docs/<nama>_features.md`.
Sumber visual: <logo, website, theme app>, dirangkum di `docs/design_tokens.md` + `public/brand/tokens.json`.

## 1. Spesifikasi

| | |
|---|---|
| Format | 9:16, 1080×1920, 30 fps, <durasi> detik (<frame> frame) |
| Platform | <Instagram Reels, TikTok, WhatsApp Story, LinkedIn, ...> |
| Safe zone | Konten penting di luar atas 220 px, bawah 380 px, kanan 140 px, kiri 80 px. Ground dan motif tetap full frame |
| Audio | <Musik + SFX, tanpa voice-over / dengan voice-over Azure HD `id-ID-Gadis:DragonHDOmniLatestNeural`> |
| Bahasa | <Bahasa Indonesia> |
| Audiens | <siapa yang menonton> |
| Tujuan | <pesan utama>. Ajakan: <CTA> |
| Stack | Remotion 4.0.532 |

## 2. Brand

- Nama: **<nama>**, <tagline atau kepanjangan>. Wordmark: <file logo atau dibuat di kode>.
- Palet (lengkap di `docs/design_tokens.md`):
  - Ground terang `surface #......`, card `#......`.
  - Teks: judul `ink #......`, caption `ink-muted #......`.
  - `primary #......` untuk fill, wordmark, flood, grafik. Tidak untuk teks kecil.
  - Scene gelap (hook, drop, CTA): gradient `#......` > `#......`, teks putih. Tidak boleh dua scene gelap berurutan kecuali di dalam flood.
- Font: <family>, angka tabular.
- Radius card <..>, chip <..>, panel <..>.
- Copy: tanpa emoji, tanpa em dash, maks ~6 kata per baris di layar. Klaim hanya dari dokumen sumber. Angka dan UI ilustratif diberi label "Contoh data" / "Ilustrasi tampilan".

## 3. Arah motion

| Item | Keputusan |
|---|---|
| Dunia kamera | <mis. zoom-through berantai: tiap scene lahir dari elemen scene sebelumnya> |
| Ritme | <mis. cepat-cepat-cepat-lambat: 3 hit cepat di beat, lalu 1 ketukan lambat yang menahan pesan minimal 1.5 s> |
| Transisi | <flood / iris, whip-pan + motion blur, morph elemen bersama, shutter strip, zoom-in dan zoom-out> |
| Intensitas | <hype di hook dan drop, premium dan bersih di scene penjelasan> |

Nilai teknis (spring, durasi transisi, camera punch) ada di grup `motion` di `public/brand/tokens.json`. Jika ada beberapa opsi motion, tawarkan ke user untuk dipilih.

## 4. Struktur cerita dan beat map

Pola: <masalah > solusi > angka / lainnya>. Waktu memakai kandidat musik <A> (<BPM> BPM, 1 beat ≈ <..> s). Drop jatuh di **<..> s** pada momen visual kunci. Waktu final dikunci ke grid beat di `src/timeline.ts` setelah musik dipilih dan diukur ulang.

| # | Waktu | Scene | Teks layar (draft) | 3 hit cepat + 1 lambat | Intensitas |
|---|---|---|---|---|---|
| 1 | 0-<..> | Hook (gelap) | "<..>" | <..> | Hype |
| 2 | <..> | <..> | "<..>" | <..> | Premium |
| n | <..>-<durasi> | CTA | "<..>" / <kontak> | <..>. Logo diam minimal 1.5 s di akhir | Premium |

## 5. Jembatan antar scene

| Jembatan | Transisi | Elemen bersama |
|---|---|---|
| 1 > 2 | <..> | <..> |
| 2 > 3 | <..> | <..> |

## 6. Musik dan SFX

Musik Mixkit (Mixkit Stock Music Free License, boleh komersial). Kandidat sudah diukur energinya; pilih satu:

| | Lagu | Artis / genre | Tempo | Struktur dipakai | Offset |
|---|---|---|---|---|---|
| **A (rekomendasi)** | <judul> `<url>` | <..> | <..> BPM | <drop di lagu .. s jatuh di film .. s> | Lagu mulai di <..> s |
| B | <..> | <..> | <..> | <..> | <..> |

SFX Mixkit dasar di `public/sfx` (1113 check, 1117 tick, 1125 click, 1143 impact, 1489 rise, 1490 whoosh, 2357 bubble, 2364 pop, 2568 key, 2573 toast, 2865 success, 3083 sparkle), tambahan dicari saat build. Pemetaan:
- Hit cepat: tick atau pop per beat.
- Whip-pan dan shutter: whoosh. Zoom-through: rise.
- Flood di drop: impact + bass hit.
- CTA: sparkle / success.
- Tiap SFX ditaruh di puncak terukur, gain 0.04-0.3. Mix akhir -14 LUFS two-pass loudnorm. Musik fade in 0.25 s, fade out 1.4 s.

## 7. Struktur project (tahap build)

```
<nama-film>/
  BRIEF.md
  docs/                      fakta sumber, design tokens
  package.json, tsconfig.json, eslint.config.mjs, .prettierrc, remotion.config.ts, .gitignore
  public/brand/tokens.json   token warna, tipe, bentuk, motion (dibaca src/theme.ts)
  public/sfx/*               SFX Mixkit
  public/audio/              music.mp3 + mix.wav
  scripts/mix_audio.py, scripts/probe.mjs (still per waktu + contact sheet)
  src/Root.tsx, src/Film.tsx (urutan scene, jembatan, motion blur sub-frame), src/theme.ts, src/timeline.ts
  src/lib/motion.ts          spring preset dari token, easing, kamera (zoom log), PRNG ber-seed
  src/components/            Words + komponen film
  src/scenes/                <daftar scene>
```

## 8. Langkah build (setelah BRIEF disetujui)

1. Daftarkan folder ke `workspaces` di root `package.json`, `npm install`. Cek `npm run lint`.
2. Download musik terpilih dan SFX tambahan, ukur ulang BPM dan drop, kunci `src/timeline.ts` dan `scripts/mix_audio.py`.
3. Bangun komponen dasar dan transisi, lalu semua scene di atas beat map.
4. `npm run mix`, set `MIX = true` di `src/Film.tsx`, render penuh `npm run render` (h264 crf 16, bt709).
5. Critique loop: contact sheet, strip frame di tiap jembatan, cek keterbacaan di lebar 360 px, skor 1-10 per kriteria, perbaiki sampai semua minimal 8.
6. Commit.

## 9. Verifikasi (tahap build)

- `npm run lint` bersih.
- Output <durasi> s, 1080×1920, 30 fps.
- Contact sheet dengan overlay safe zone: tidak ada teks penting di zona UI platform.
- Tiap bagian punya 3 hit cepat + 1 ketukan lambat; pesan lambat terbaca minimal 1.5 s.
- Drop jatuh tepat di <..> s bersamaan momen visual kunci; tidak ada pop frame yang tidak dijelaskan.
- Loudness -14 LUFS ±1.
- Tidak ada klaim di luar dokumen sumber; label "Contoh data" ada di semua angka dan grafik ilustratif.

## 10. Keputusan review brief (<YYYY-MM-DD>)

1. Musik: <..>.
2. Copy teks layar: <..>.
