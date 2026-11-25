# Theme authoring (no React changes required)

A theme is a folder of images plus one copy/paste block in
`CodeWashGame/src/constants/gameData.jsx`. You do not need to touch any React
component.

## 1. Prepare the images

Put your files in `CodeWashGame/public/assets/themes/`:

| File | Recommended size | Used for |
|---|---:|---|
| `<id>.png` or `<id>.jpg` | 1920×1080 or larger | Game background |
| `<id>_logo.svg` or `.png` | 800×300, transparent | Main menu logo |
| `<id>_card.svg` or `.png` | 400×600 | Memory card back |

SVG is preferred for logos and card backs: it stays sharp at every screen size
and needs no image editor. If a file is missing, the game shows a safe `📦`
placeholder instead of crashing.

You can reuse existing mob pictures from `public/assets/mobs/` instead of
drawing new enemies.

## 2. Copy the config block

In `THEME_CONFIG`, copy the `classic` block and replace the values:

```js
mytheme: {
    name: 'My Theme',
    style: {
        backgroundImage: `url('assets/themes/mytheme.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    assets: {
        logo: 'assets/themes/mytheme_logo.svg',
        cardBack: 'assets/themes/mytheme_card.svg',
        mobs: {
            'My Boss': 'assets/mobs/boss/wither.png',
        },
    },
    skills: {
        reading: { name: 'Lore', boss: 'My Boss', mobType: 'Standard' },
        math: { name: 'Craft', boss: 'My Boss', mobType: 'Creeper' },
        writing: { name: 'Notes', boss: 'My Boss', mobType: 'Skeleton' },
        cleaning: { name: 'Tidy', boss: 'My Boss', mobType: 'Chest' },
        memory: { name: 'Recall', boss: 'My Boss', mobType: 'Mascot' },
        patterns: { name: 'Signals', boss: 'My Boss', mobType: 'Standard' },
    },
    bgm: [
        'assets/sounds/bgm/piano1.wav',
        'assets/sounds/bgm/calm1.wav',
    ],
    scrollbar: { track: '#1c1917', thumb: '#fbbf24' },
},
```

Rules:

- `id` must be lowercase, with no spaces (`fantasy`, `scifi`, …).
- `skills` must contain the six ids: `reading`, `math`, `writing`, `cleaning`,
  `memory`, `patterns`.
- Every `boss` name must have a matching entry in `assets.mobs`.
- `bgm` must list 2 or 3 files from `public/assets/sounds/bgm/`.
- `scrollbar` colors are hex strings (`#rrggbb`).

## 3. Add it to the picker

Add one line to `THEMES_LIST`:

```js
{ id: 'mytheme', name: 'My Theme', img: 'assets/themes/mytheme.png' },
```

## 4. Check your work

From `CodeWashGame/`:

```bash
npm run format:check
npm test -- --run
npm run build
```

The theme catalog test verifies that every referenced file exists and that all
six skills have a label, a boss and themed art.

## Existing themes

`classic`, `kpop`, `pokemon`, `spy`, `fantasy`, `scifi`.
