# Feature discovery

Where each feature lives and how a user finds it.

## The game
- The main menu shows a carousel of skill cards. Swipe or use the side arrows to change card;
  click the centre card to start a battle, then answer the challenge to damage the mob.
- Skills: Reading, Math, Writing, Cleaning, Memory, Pattern Recognition. Each unlocks
  difficulties as the level grows; bosses appear every 10 levels.

## Profile and progress
- **Settings → Select File**: three local profiles; switch or rename. “Parent?” gates
  Cleaning with a verification modal.
- Progress (levels, XP, badges, achievements) is saved per profile and survives reloads.

## Achievements
- Unlock toasts appear top-right when you earn an achievement or a new tier.
- The Menu drawer lists achievements and progress.

## Cosmetics and themes
- **Cosmetics** drawer (sparkle icon): pick a theme and border effects.
- Six themes: Classic, K-Pop Demon Hunters, Pokémon, Spy, Fantasy Quest, Sci-Fi Orbit.
- Choosing a theme changes background, logo, card art, mob art, music playlist and scrollbar.
- Add your own with [`docs/themes/AUTHORING.md`](./themes/AUTHORING.md).

## Language
- **Settings** includes a language selector (English / Français).
- The choice is remembered; adding a locale is documented in
  [`docs/i18n/TRANSLATING.md`](./i18n/TRANSLATING.md).

## Bug reporting
- The red bug button (bottom-right) opens a report form: description, steps, screenshots,
  and optional logs/game files.
- A maintainer configures the receiving URL in **Settings → Bug Reporting**; a local receiver
  is available via `npm run bug:receive` — see [`docs/BUG_REPORTING.md`](./BUG_REPORTING.md).

## Startup experience
- On launch a loading screen shows a progress percentage while key art preloads, then the
  menu appears (see [`docs/PERFORMANCE.md`](./PERFORMANCE.md)).

## Audio
- **Settings → Audio Configuration**: music and SFX volume sliders.
- Music starts on the first interaction (browser autoplay policy).
