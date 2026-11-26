# Onboarding

Goal: install, launch and test the project without asking anyone. Budget ~10 minutes.

## 1. Prerequisites
- Node.js 20 LTS (tested with `v20.20.2`) and npm 10+
- A Chromium-based browser (Chrome/Edge/Chromium) for the web build and the microphone
- Windows (or Wine/CI) to build the portable `.exe`

## 2. Install
```bash
cd CodeWashGame
npm ci
```

## 3. Launch
```bash
npm run dev          # browser, open the printed URL
# or
npm run electron:dev # desktop shell (builds then opens Electron)
```

## 4. Test and check
```bash
npm test                     # 268 tests
npm run coverage             # coverage report in coverage/
npm run lint                 # ESLint
npm run format:check         # Prettier
npm run build                # production bundle into dist/
```

Optional: `git config core.hooksPath .githooks` to run the checks before every push.

## 5. Verify everything works
- [ ] `npm test` passes (268 tests)
- [ ] `npm run build` succeeds
- [ ] The menu loads with the skill carousel and a loading percentage on first paint
- [ ] A battle starts and a challenge is shown
- [ ] Settings shows profiles, audio, language and the bug-report endpoint
- [ ] Switch language to Français and back
- [ ] Change theme and see art/music change

## 6. Where to go next
| Topic | Document |
|---|---|
| Code layout and I/O boundaries | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| What changed since the received state | [`CHANGELOG.md`](./CHANGELOG.md) |
| Debt register and residual debt | [`../DEBT.md`](../DEBT.md) |
| Testing strategy | [`TESTING.md`](./TESTING.md) |
| CI pipeline and gates | [`CI.md`](./CI.md) |
| Incidents during a school day | [`RUNBOOK.md`](./RUNBOOK.md) |
| Features overview | [`FEATURES.md`](./FEATURES.md) |
| Adding a theme / a language | [`themes/AUTHORING.md`](./themes/AUTHORING.md), [`i18n/TRANSLATING.md`](./i18n/TRANSLATING.md) |
| Decisions | [`adr/README.md`](./adr/README.md) |

## Known environment notes
- Web Speech API requires a Chromium engine; it may be unavailable elsewhere.
- On the org repository GitHub Actions are billing-blocked; the pipeline runs on the public
  mirror `aymemn2112/codewash-ci` and locally via the pre-push hook.