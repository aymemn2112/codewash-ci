# ADR-004 — Fabrique audio et suppression du singleton BGM

- Statut : Accepted
- Issues : P4-7, P4-8

## Contexte

`soundManager.js` appelait `new Audio(...)` en interne et exposait `getBGMManager()` comme singleton global mutable. Impossible de tester la sortie audio sans stub global, et l’état du lecteur survivait aux mounts.

## Décision

- Centraliser la création des éléments audio dans `defaultAudioFactory = (src) => new Audio(src)`.
- Injecter cette fabrique dans `BGMManager`, `playUISound`, les wrappers UI et les sons de mob.
- Exposer `createBGMManager(options)` ; `getBGMManager()` délègue à cette fabrique sans cache.

## Conséquences

- Les tests vérifient la fabrique reçue et prouvent que `Audio` global n’est pas appelé.
- Chaque appel à `getBGMManager()` donne un manager indépendant.
- Les `new Audio(...)` restants de `SkillCard.jsx` doivent encore être routés vers le manager (track B).
