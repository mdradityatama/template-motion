# Motion films, 100 % code

Monorepo of short promo / explainer films built with Remotion. Each film is its own folder and npm workspace, started from `_film-template/`. Skills: `motion-design` (pipeline, assets, gotchas, critique loop) and `remotion-best-practices` (Remotion API rules).

## Starting a new film

1. Copy `_film-template/` to `<name>-<seconds>s/` (e.g. `acme-promo-60s`). Move the source material (PPT, docs, references) into that folder.
2. First deliverable is only the folder, `BRIEF.md` and extracted-content docs in `docs/`. No code, `npm install`, voice-over, music download, render or commit until the user has reviewed and approved `BRIEF.md`.
3. After approval: set `name` in the film's `package.json` and the output file in its `render` script, add the folder to `workspaces` in the root `package.json`, run `npm install`, then build.

## Working rules

- Confirm anything ambiguous (copy, facts, structure, style, asset picks such as the music track, layout) with AskUserQuestion before deciding. Put the recommended option first.
- Motion should be bold: "wow" transitions or bridging animations between scenes, a camera and space you can feel, varied rhythm (e.g. fast-fast-fast-slow). Every brief has a motion direction section (camera world, rhythm, transition set, intensity) and a per-bridge transition table. When there are several motion options, offer them to the user (previews help) instead of picking.
- Prepare assets yourself: music and SFX from Mixkit (free license, commercial use OK) or other license-clean sources, or synthesized in code. Never leave asset sourcing as a user TODO.
- Once the brief is approved, build every scene and render the full film. No partial preview or stills-approval stop. Keep the internal critique loop (contact sheets, frame strips at each bridge, self-scoring) before delivering.
- Revisions to a finished deliverable (deck, outline, build script) go into new `-v2` files; v1 stays untouched. For small feedback on the newest version the same day, ask whether to edit in place.
- Azure voice-over uses HD voices (S0 tier). Indonesian: `id-ID-Gadis:DragonHDOmniLatestNeural`.

## Conventions

- Remotion 4.0.532, React 19.2.3, pinned the same in every film.
- Every layer is a pure function of film time `t` (seconds); scenes take `(t, s)` where `s` is the scene start. No CSS transitions, no unseeded random (`prng` in `src/lib/motion.ts`).
- Visual values (colors, type, safe zone, layout, motion springs) live in `public/brand/tokens.json` and are read by `src/theme.ts`. No hard-coded hex in scenes.
- Scene starts sit on the beat grid in `src/timeline.ts`; the music drop lands on the key visual moment. `scripts/mix_audio.py` mirrors the timeline, places SFX by measured peak and normalizes to -14 LUFS (two-pass loudnorm) into `public/audio/mix.wav`.
- Render with `npm run render` (h264, crf 16, bt709). `out/` is never committed.
- On-screen copy: no emoji, no em dash, max ~6 words per line. Claims only from the source docs; illustrative numbers and UI carry "Contoh data" / "Ilustrasi tampilan".
- Quick stills: `node scripts/probe.mjs <seconds...>` writes `out/probe/sheet.png`.
