# Performance

Mission #46: faster startup, a loading screen with progress, a snappier menu, and
**measured** evidence.

## How to reproduce

From `CodeWashGame/`:

```bash
npm run build
npm run perf          # bundle/asset snapshot (scripts/perf-report.mjs)
```

Startup time is measured manually in Chromium DevTools:
1. Open DevTools → Performance.
2. Record, reload the page, stop when the menu is interactive.
3. Read "First Contentful Paint" and the time to the first user input.

## Baseline (received → before this branch)

| Metric | Value |
|---|---|
| JS bundle | 366.05 kB (**104.31 kB gzip**) |
| CSS bundle | 60.76 kB (10.97 kB gzip) |
| Build | 565 ms |
| `dist/` total | **243 MB** |
| Audio | 201 MB, 121 `.wav` files |
| Heaviest BGM | `piano3.wav` 47.3 MB, `calm1.wav` 43.8 MB, `calm3.wav` 38.7 MB, `calm2.wav` 33.9 MB |
| Startup UX | blank screen until React mounted; no progress indicator |

## Changes

1. **BGM → Ogg Vorbis** (`libvorbis -q:a 3`): the six WAV tracks now weigh ~11 MB
   total instead of ~190 MB. Paths updated in `soundManager.js`.
2. **Global CSS as a real stylesheet**: `src/styles/global.css` is imported in
   `main.jsx` and bundled by Vite instead of being injected as a 1 300-line
   `<style>` string at runtime. `GlobalStyles.jsx` removed.
3. **Startup loading screen**: `index.html` shows the title, a progress bar and a
   percentage while critical images preload; the App signals
   `window.__APP_READY__()` after mount, then the loader fades out.
4. **Memoized `SkillCard`** so the carousel does not re-render unchanged cards.
5. **`npm run perf`** (`scripts/perf-report.mjs`) for a reproducible snapshot.

## After

| Metric | Before | After | Change |
|---|---|---|---|
| JS bundle | 366.05 kB | **321.81 kB** | **−12.1%** |
| JS gzip | 104.31 kB | **97.52 kB** | **−6.5%** |
| CSS bundle | 60.76 kB | 82.81 kB | +36% (CSS now bundled, not injected) |
| JS+CSS gzip | 115.28 kB | **113.09 kB** | −1.9% |
| `dist/` total | 243 MB | **61.8 MB** | **−74.6%** |
| Startup UX | blank wait | **progress % screen** | new |

The CSS number grows because the stylesheet moved from the JS bundle into the CSS
bundle; the **total** transferred gzip weight still went down, and the browser no
longer parses/injects a large `<style>` at runtime.

## Remaining opportunities

- Large animated GIFs are now the heaviest assets (`book.gif` 11.6 MB, `axe.gif`/`hoe.gif` ~2 MB).
  Converting them to compressed video/WebP would cut `dist/` further (separate task).
- Real TTI numbers should be recorded on a GUI machine and added above.
- Lazy-loading the drawers/modals is the next bundle-size win (not done here to keep
  the change risk low).