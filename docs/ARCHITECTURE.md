# Architecture

Level Up RPG is a React 19 + Vite app shipped both as a web build and as an Electron
desktop app. This document explains the layers, where state lives, where I/O happens,
and why the structure is what it is.

## Layers

```
src/
├── App.jsx              composition root: hooks + layout wiring (no I/O)
├── main.jsx             React entry, imports global CSS + I18nProvider
├── components/          presentation
│   ├── game/            App-level pieces (carousel, drawers layer, overlays, controls)
│   ├── skills/          SkillCard and skill UI
│   ├── drawers/         Menu / Settings / Cosmetics drawers
│   ├── modals/          Reset, Bug report
│   ├── profile/         Profile card
│   └── ui/              small primitives (SafeImage, PixelHeart, toasts...)
├── hooks/               stateful orchestration (drawers, carousel, audio, speech, borders, bug report)
├── domain/              pure logic, no React (challenges, carousel math, auras, tempo, skill games, profile storage)
├── services/            injectable I/O adapters (clock, rng, storage, storage keys)
├── lib/                 logger + log ring buffer, bug report builder
├── i18n/                context, provider, translations (EN/FR), no-hardcoded-strings guard
├── constants/           game data (skills, mobs, themes, achievements)
└── styles/              global.css
```

## Where state lives

| State | Location |
|---|---|
| Skills, stats, theme, profiles | `useState` in `App.jsx`, persisted via `domain/profileStorage` |
| Carousel index/drag | `hooks/useCarousel` |
| Drawers/modals visibility | `hooks/useDrawers` |
| Audio volumes + BGM/SFX players | `hooks/useAudioSettings` |
| Borders/cosmetics | `hooks/useBorders` |
| Speech recognition | `hooks/useSpeechRecognition` |
| Bug-report endpoint | `hooks/useBugReportSettings` |
| Locale | `i18n/I18nProvider` |

## I/O boundaries

Every side effect goes through one place, so it is mockable in tests:

| I/O | Adapter |
|---|---|
| `localStorage` | `services/storage.js` (`browserStorage`) |
| Clock (`Date`) | `services/clock.js` (`defaultClock`) |
| Randomness | `services/rng.js` (`defaultRng`) |
| Audio playback | `utils/soundManager` factories (`createBGMManager`, `createSfxPlayer`, injectable `audioFactory`) |
| Microphone | `hooks/useSpeechRecognition` (injectable constructor) |
| Fullscreen | `hooks/useFullscreen` |
| Network (bug report) | `lib/bugReport` (injectable `transport`) |

## Themes and i18n

- Themes are data-driven (`constants/gameData.jsx` → `THEME_CONFIG`, `THEMES_LIST`); art,
  skill names, bosses, music playlists and scrollbar colours come from the theme.
  See [`docs/themes/AUTHORING.md`](./themes/AUTHORING.md).
- UI copy lives in `i18n/translations.js` (EN/FR); components read it with
  `useTranslation()`. A test forbids hardcoded UI strings.
  See [`docs/i18n/TRANSLATING.md`](./i18n/TRANSLATING.md).

## Why (decisions)

See the ADR index: [`docs/adr/README.md`](./adr/README.md).

## Testing

Test strategy, tools and coverage rules: [`docs/TESTING.md`](./TESTING.md).
CI pipeline and gates: [`docs/CI.md`](./CI.md).
