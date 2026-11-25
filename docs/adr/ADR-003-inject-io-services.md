# ADR-003 — Injection de l’horloge, du RNG et du stockage

- Statut : Accepted
- Issues : P4-4, P4-5, P4-6

## Contexte

`Date.now()`, `new Date()`, `Math.random()` et `localStorage` étaient appelés directement dans la logique de jeu. Les tests devaient manipuler les globals ou devenaient non déterministes.

## Décision

Introduire quatre services dans `src/services/` :

- `clock.js` : `defaultClock()` renvoie la date courante ;
- `rng.js` : `defaultRng()` et les helpers `getRandom*` dédupliqués ;
- `storage.js` : `browserStorage` avec `getItem` / `setItem` / `removeItem` ;
- `storageKeys.js` : clés versionnées et migration legacy.

Les fonctions et composants reçoivent ces dépendances en paramètre ou en prop, avec le service réel comme valeur par défaut. Le comportement public reste identique.

## Conséquences

- Les tests injectent une horloge, un RNG et un stockage en mémoire.
- Aucune dépendance à un global dans le domaine.
- Le câblage dans `App.jsx` et `SkillCard.jsx` reste à faire côté interface (track B).
