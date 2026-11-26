# Changelog — received → delivered

Baseline (received state): tag `v0.0-as-received` (`25b3629`).

## M1 — Launch & document
- Real `.gitignore`; removed 374 tracked AppleDouble `._*` files.
- `README.md` with install / browser / Electron / Windows build and known issues.
- Fixed the Windows workflow location (GitHub only reads `.github/workflows` at the repo root).

## M2 — Map the debt
- `DEBT.md`: codebase map, I/O map, 36 debt items, risk matrix, phased plan, metrics.
- Baseline metrics captured before any refactor; GitHub issues created from the register.

## M3 — Safety net
- Vitest + Testing Library; characterization tests for combat/XP, achievements, audio, timers.
- CI pipeline (lint, format, coverage, 80% patch gate, build) at the repo root.
- Prettier baseline; ESLint static analysis; `docs/TESTING.md`, `docs/CI.md`.
- Pre-push hook as a local gate (org branch protection blocked — D-36).

## M4 — Directed jet (refactor)
- Track B: dead code removed; logger + log buffer; storage errors surfaced; Web Speech behind
  `useSpeechRecognition` (auto-restart backoff); default theme debranded to `classic`;
  `App.jsx` 1492 → ~1000 lines, `GlobalStyles.jsx` → 6 lines + `styles/global.css`.
- Track A: injectable `services/clock|rng|storage|storageKeys`; audio factory (no BGM singleton);
  ADRs; before/after metrics (`docs/metrics/after`).

## M5 — Missions (4)
- **Performance (#46)**: startup loader with %, BGM WAV→Ogg (~190 MB → ~11 MB),
  global CSS bundled, memoized `SkillCard`, `npm run perf` + `docs/PERFORMANCE.md`.
- **Bug reporting (#47)**: configurable endpoint, real form (description, steps, screenshots,
  logs/game files), JSON POST, `npm run bug:receive` + `docs/BUG_REPORTING.md`.
- **Themes (#49)**: six themes (classic, kpop, pokemon, spy, fantasy, scifi), themed art,
  music playlists and scrollbar; `docs/themes/AUTHORING.md`.
- **Translation (#48)**: EN/FR i18n provider with a no-hardcoded-strings guard;
  `docs/i18n/TRANSLATING.md`.

## Metrics (received → delivered)

| Metric | Received | Delivered |
|---|---|---|
| Tests | 0 | **268** |
| Coverage (lines) | 0% | **67.06%** |
| CI | ineffective | pipeline + 80% patch gate (mirror) |
| `dist/` total | 243 MB | **63 MB** |
| JS bundle | 362.79 kB (gzip 102.62) | 358.56 kB (gzip 108.05) |
| Lint errors | 0 (28 false, junk files) | 0 |
| Formatter | none | Prettier, enforced |

The final JS gzip is slightly above the received bundle because M5 **added features**
(i18n dictionary, six themes); the performance work alone cut it to 97.52 kB gzip.

## Known residual debt
See the final section of [`DEBT.md`](../DEBT.md).
