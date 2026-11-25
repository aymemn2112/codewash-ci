# UI translation (D-27)

CodeWashGame ships with two locales: **English** (`en`, default) and **French** (`fr`).
The language selector lives in the achievements drawer (`MenuDrawer`) and the choice is
persisted in `localStorage` under `STORAGE_KEYS.LOCALE` (`heroLocale_v1`).

## How it works

- `CodeWashGame/src/i18n/translations.js` holds both dictionaries and the pure helpers
  `translate`, `interpolate` and `isLocaleSupported`.
- `CodeWashGame/src/i18n/I18nProvider.jsx` reads the stored locale, exposes
  `{ locale, setLocale, t }` and writes every accepted change back to storage.
- `CodeWashGame/src/i18n/useTranslation.js` returns the context, or a read-only English
  fallback when a component is rendered outside the provider (unit tests).
- `CodeWashGame/src/main.jsx` wraps `<App />` in `<I18nProvider>`.

Components never import English copy from constants for display. Canonical English data in
`constants/gameData.jsx` and `constants/achievements.jsx` remains the source of truth for
identifiers and game logic, but labels, descriptions and accessibility text go through
`t('key')`.

## Key conventions

| Prefix | Usage | Example |
| --- | --- | --- |
| `common.*` | Shared one-word labels | `common.hp`, `common.cancel` |
| `menu.*` | Achievements drawer | `menu.totalLevel` |
| `settings.*`, `cosmetics.*`, `controls.*` | Other drawers and corner buttons | `controls.enterFullscreen` |
| `modal.*`, `alert.*`, `overlay.*` | Modals and full-screen messages | `overlay.death` |
| `skill.*`, `themeSkill.*` | Skill names, actions, quests | `themeSkill.kpop.reading` |
| `achievement.*`, `tier.*`, `badge.*` | Achievements and progression | `achievement.tier.phantom_hunter.2` |
| `border.*`, `color.*` | Cosmetic names and descriptions | `border.livewire.description` |

Use `{name}` placeholders for dynamic values:

```js
t('menu.skillLevel', { level: data.level }); // "Lvl 12" / "Niv. 12"
```

Do **not** translate technical identifiers, storage keys, asset paths, proper nouns for
mobs/bosses (`Creeper`, `Phantom`, …) or the parental secret answer (`FLOPPY DISK`).

## Adding or changing copy

1. Add the key to **both** `en` and `fr` dictionaries with the same placeholders.
2. Replace the literal in the component with `t('key')`; never hardcode English in JSX,
   `aria-label`, `title` or `alt`.
3. Run `npm test -- --run`. The following guards run automatically:
   - `src/i18n/translations.test.js` checks key parity, non-empty values, placeholder
     parity and that every data-driven label has a translation.
   - `src/i18n/noHardcodedStrings.test.js` fails when a banned legacy literal reappears
     in a component.
   - `src/i18n/I18nProvider.test.jsx` checks persistence and locale validation.

## Adding a locale

1. Add `{ id: '<code>', label: '<native name>' }` to `LOCALES`.
2. Add a dictionary with exactly the same keys and placeholders as `en`.
3. Extend `MenuDrawer.i18n.test.jsx` with a switch assertion for the new locale.

No third-party i18n dependency is required; the layer is intentionally small so the new
source files stay at 100% coverage for the `coverage:new-code` gate.
