# Testing strategy

The project was received with **zero tests**. Milestone M3 adds a runner, a safety net of
characterization tests, and CI gates. This document explains how to run the tests and how
to deal with the code's non-deterministic I/O.

## Commands

Run from `CodeWashGame/`:

```bash
npm test            # single run (CI / pre-push)
npm run test:watch  # watch mode while developing
npm run coverage    # single run + coverage report in coverage/
```

## Stack

| Piece | Role |
|---|---|
| Vitest | test runner (native Vite integration) |
| jsdom | browser-like environment |
| @testing-library/react | component rendering and queries |
| @testing-library/jest-dom | DOM matchers (`toBeInTheDocument`, ...) |
| @vitest/coverage-v8 | coverage provider |

Configuration: `CodeWashGame/vitest.config.js`. Global setup: `CodeWashGame/src/test/setup.js`.

## What the safety net covers

Characterization tests freeze the current behavior of the critical flows identified in
`DEBT.md`:

- `src/utils/gameUtils.js` — combat math, XP/level progression, encounter cycle, content
  generation.
- `src/utils/achievementUtils.js` — defaults, unlock/tier logic, login dates.
- `src/utils/soundManager.js` — BGM rotation and SFX volume.
- `src/components/PhantomEvent.jsx` — cooldown logic and timers.
- Component smoke tests — `App`, `SkillCard`, `BugReportModal`, `SafeImage`.

They describe **what the code does today**, including oddities. When a test and the code
disagree during a refactor, decide which one is the contract before changing either.

## Handling non-deterministic I/O

The received code calls browser APIs directly. Until M4 injects adapters, tests control
them at the boundary.

### Clock (`Date.now`, `new Date`)

Use Vitest's fake timers:

```js
import { vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-01-15T10:00:00Z'))
})
afterEach(() => vi.useRealTimers())
```

`recordLoginDate` in `achievementUtils.js` and the daily-login effect in `App.jsx` are the
main users.

### Randomness (`Math.random`)

Stub it to make content deterministic:

```js
vi.spyOn(Math, 'random').mockReturnValue(0)        // first item / lower bound
vi.spyOn(Math, 'random').mockReturnValue(0.999...) // last item / upper bound
```

`gameUtils.js`, `mobDisplayUtils.js`, `SkillCard.jsx` and `soundManager.js` use it. Tests
assert ranges and invariants rather than a single hardcoded value where possible.

### Audio (`new Audio`)

jsdom does not implement playback. `src/test/setup.js` stubs
`HTMLMediaElement.prototype.play/pause` before each test. To assert calls, spy on the
constructor or on the prototype:

```js
const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play')
playUISound('click')
expect(play).toHaveBeenCalled()
```

### Speech recognition (Web Speech API)

Not available in jsdom. Provide a fake in the test:

```js
class FakeRecognition {
  start() {}
  stop() {}
  addEventListener() {}
}
window.webkitSpeechRecognition = FakeRecognition
```

Long-term (M4, D-09) the speech layer moves behind an interface, and tests will inject a
fake adapter instead of patching globals.

### `localStorage`

jsdom provides it. `setup.js` clears it after every test. For the `PhantomEvent` cooldown,
write the key, then advance fake timers.

## Coverage and thresholds

The coverage gate is configured in `vitest.config.js`. It starts at the **measured baseline**
(low, because the project had no tests) and is ratcheted up as tests are added:

| Milestone | Threshold |
|---|---|
| M3 (received baseline) | 0% (no tests) |
| M3 after characterization suite | lines 45% · functions 37% · branches 38% · statements 45% (measured: 50.09 / 39.25 / 40.52 / 47.71) |
| M3+ | raise to the measured value, then +5% per PR |
| M4 target | 80% of modified lines, 100% of new code |

Lowering a threshold is allowed only with an entry in `DEBT.md` §3.6 ("dette introduite
volontairement") explaining why.

## Writing a new test

1. Put it next to the code: `src/utils/gameUtils.test.js`.
2. Import `describe`, `it`, `expect`, `vi` from `vitest` (globals are disabled).
3. Freeze clock/random when the code under test uses them.
4. Assert behavior, not implementation details.
5. Run `npm test` and `npm run lint`.

## Not covered yet

- The full battle loop in `App.jsx` (needs the M4 extraction).
- Speech recognition flows (needs the adapter).
- Visual/theming behavior.
- Electron main process (`electron/main.cjs`).

These are tracked in `DEBT.md` and will be covered as the architecture is split.