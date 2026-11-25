# CodeWash — Level Up RPG

A small educational RPG for children: the player trains skills (reading, math, writing,
memory, patterns) by fighting mobs, earning XP, levels, badges and achievements.

This repository contains the project **as received** from Code Wash Inc. It is a legacy,
vibe-coded codebase: it works, but it carries significant technical debt. See
[`DEBT.md`](./DEBT.md) for the debt register and the cleanup plan.

> **Status:** received state, under stabilization. Tests and CI quality gates are being
> added in milestone M3 (see `DEBT.md`).

## Stack

| Layer | Technology |
|---|---|
| UI | React 19 (JSX) |
| Bundler | Vite (forced to `rolldown-vite@7.2.5` through `overrides`) |
| Styling | Tailwind CSS 4 + generated global styles |
| Desktop shell | Electron 39 + electron-builder (portable Windows `.exe`) |
| Lint | ESLint 9 (flat config) + Prettier |
| Tests | Vitest + Testing Library (jsdom) |
| CI | GitHub Actions: lint, format, tests + coverage, build, Windows `.exe` |

## Prerequisites

- **Node.js 20 LTS** (tested with `v20.20.2`) and npm 10+
- A Chromium-based browser (Chrome, Edge, Chromium) for the browser build
- **Windows** to produce the portable `.exe` (electron-builder targets `win`; on Linux/macOS
  use Wine or build on Windows/CI)

## Quick start

All application commands run from the `CodeWashGame/` directory:

```bash
cd CodeWashGame
npm ci
```

### Browser build (fastest way to run)

```bash
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open it in a Chromium-based
browser.

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

### Desktop build (Electron, current OS)

```bash
npm run electron:dev
```

This builds the Vite bundle into `dist/` and opens it in an Electron window.

### Portable Windows `.exe`

```bash
npm run electron:build
```

Output goes to `CodeWashGame/release/` (`LevelUpRPG-Portable.exe`). This target must be built
on Windows (or with Wine); the project CI does it on `windows-latest`.

## Scripts

Run from `CodeWashGame/`:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (browser) |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve the production bundle |
| `npm run lint` | ESLint over the project |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run coverage` | Tests + coverage report (`coverage/`) |
| `npm run coverage:patch` | Require 80% coverage on lines changed vs `BASE_REF` |
| `npm run format` | Format source with Prettier |
| `npm run format:check` | Verify formatting (CI gate) |
| `npm run electron:dev` | Build then run the Electron app |
| `npm run electron:build` | Build the portable Windows executable |

Run `npm test` and `npm run coverage` before opening a PR. See
[`docs/TESTING.md`](./docs/TESTING.md) for the testing strategy and
[`docs/CI.md`](./docs/CI.md) for the pipeline and quality gates.

## Repository layout

```
.
├── README.md                  # this file
├── DEBT.md                    # technical debt register (living document)
└── CodeWashGame/              # application
    ├── electron/              # Electron main process (main.cjs)
    ├── public/                # static assets served as-is
    ├── src/
    │   ├── App.jsx            # root component (state, battle loop, speech, layout)
    │   ├── components/        # UI: drawers, modals, skills, profile, ui
    │   ├── constants/         # game data, assets, achievements
    │   └── utils/             # game rules, achievements, audio
    ├── docs/                  # feature documentation (microphone, ...)
    ├── index.html
    └── package.json
```

## Configuration notes

- **Vite override.** `package.json` pins `vite` to `npm:rolldown-vite@7.2.5` via
  `overrides`. This is intentional in the received project but was undocumented; do not
  remove it without checking Node compatibility.
- **Storage.** Player data is stored in the browser/Electron `localStorage` under versioned
  keys such as `heroSkills_v23`, `currentProfile_v1`, `heroProfileNames_v1`. Key migration
  is not centralized yet (see `DEBT.md`, D-11).
- **Audio.** Background music is managed by a module-level singleton (`getBGMManager()`);
  some components instantiate `Audio` directly (see `DEBT.md`, D-07/D-08).
- **Speech recognition.** The Reading skill uses the Web Speech API. It requires a
  Chromium engine and microphone permission. Details:
  [`CodeWashGame/docs/MICROPHONE_FEATURE.md`](./CodeWashGame/docs/MICROPHONE_FEATURE.md).

## Known issues

Captured during the initial launch and tracked in [`DEBT.md`](./DEBT.md):

- The received project had no tests; a characterization suite and coverage gate now exist
  (D-23). Coverage is still being ratcheted up.
- CI runs on every PR/push; the received Windows build workflow was in a subdirectory and
  never executed — it now lives at the repository root (D-24, D-35).
- `App.jsx` is a ~1500-line god component mixing state, game rules, speech and layout (D-10).
- Clock (`Date.now()`), randomness (`Math.random()`) and audio are not injectable, which
  makes deterministic testing impossible without refactoring (D-04, D-05, D-09).
- The main menu/startup feels slow; no baseline metric captured yet (D-29).
- The bug-report button opens a placeholder modal only (D-22).
- Themes are partially implemented: not all images/sizes/games/audio change (D-28).
- Silent error handling in several load paths (`catch { console.warn(...) }`) (D-18).

## Branching and contribution

- `main` — releasable state, updated only through release merges from `develop`.
- `develop` — integration branch; feature PRs land here.
- `feature/*`, `fix/*`, `refactor/*`, `docs/*`, `chore/*`, `ci/*`, `test/*` — one intent per
  branch.

Rules used by this project:

1. No refactor without characterization tests first.
2. One commit = one intent; keep the pipeline green.
3. Every PR references a `DEBT.md` item (`Refs D-xx`).
4. Leave the codebase better than you found it (Boy Scout rule).
5. Enable the local gate once per clone: `git config core.hooksPath .githooks`
   (runs lint, format, tests and build on `git push`; see [`docs/CI.md`](./docs/CI.md)).

## Documentation

- [`DEBT.md`](./DEBT.md) — debt register, codebase map, I/O map, metrics, risk matrix.
- [`docs/TESTING.md`](./docs/TESTING.md) — test strategy (clock, randomness, audio, speech).
- [`docs/CI.md`](./docs/CI.md) — pipeline, quality gates and branch protection.
- [`docs/i18n/TRANSLATING.md`](./docs/i18n/TRANSLATING.md) — locale layer and translation guide.
- [`CodeWashGame/docs/MICROPHONE_FEATURE.md`](./CodeWashGame/docs/MICROPHONE_FEATURE.md) —
  how the voice-controlled Reading skill works.
- Architecture Decision Records and the runbook are added in later milestones.