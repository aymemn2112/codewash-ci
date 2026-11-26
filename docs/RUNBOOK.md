# Runbook — “something broke during a school day”

Quick, ordered checks for the most likely failures. Commands run from `CodeWashGame/`.

## 1. The app shows a blank screen or stays on the loading screen
- The loader auto-dismisses after 8 s at the latest; if it never does, JS likely crashed.
- Open DevTools (browser) or run `npm run electron:dev` and check the console.
- Rebuild and retry:
  ```bash
  npm ci && npm run build && npm run preview
  ```
- Try another profile: a corrupt save is the most common cause (see §2).

## 2. “Some saved data could not be read and was reset to defaults”
- This is expected when a profile's saved JSON is corrupt; the game keeps defaults.
- To clear the affected profile, use **Settings → Delete profile progress**, or in the
  console: `localStorage.removeItem('heroSkills_v23_p1')` (adjust the profile id).
- Backups: the raw saves are in `localStorage` under `heroSkills_v23_pN`.

## 3. No sound or no music
- The first sound starts on the first click (browser autoplay policy) — click once.
- Check volumes in **Settings → Audio Configuration**.
- Music files were converted to Ogg; verify `public/assets/sounds/bgm/*.ogg` exist.
- Console errors about `Audio` mean the asset is missing: re-run `npm run build`.

## 4. The microphone (Reading skill) does not listen
- Web Speech API needs a Chromium engine and microphone permission. Grant it.
- A denied permission stops the recogniser (it will not loop); reload to retry.
- Non-Chromium browsers are unsupported for speech — use Chrome/Edge/Electron.

## 5. A theme shows missing/odd images or no themed music
- Verify the theme assets exist under `public/assets/themes/`.
- Check the theme music paths in `constants/gameData.jsx` (should be `.ogg`).
- See [`docs/themes/AUTHORING.md`](./themes/AUTHORING.md) to fix or add a theme.

## 6. The bug-report button does nothing useful
- Configure the endpoint in **Settings → Bug Reporting**.
- To receive locally: `npm run bug:receive`, set `http://localhost:8787/report`.
- Details: [`docs/BUG_REPORTING.md`](./BUG_REPORTING.md).

## 7. The build or the pipeline is red
- Run the same checks locally:
  ```bash
  npm run lint && npm run format:check && npm run coverage && npm run build
  ```
- Coverage gate failing? Add tests for the changed lines (`npm run coverage:patch`).
- CI on the org repo is billing-blocked; use the public mirror `aymemn2112/codewash-ci`.

## 8. Emergency reset of all local data
```js
// Browser console / Electron devtools
Object.keys(localStorage)
  .filter((k) => k.startsWith('heroSkills_v23'))
  .forEach((k) => localStorage.removeItem(k));
location.reload();
```

## Useful commands
| Command | Purpose |
|---|---|
| `npm run dev` | run in the browser |
| `npm test` / `npm run coverage` | tests / coverage |
| `npm run build` | production bundle |
| `npm run bug:receive` | local bug-report receiver |
| `npm run perf` | bundle/asset snapshot |
