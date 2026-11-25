# ADR-002 — Tests de caractérisation avant refactor

- Statut : Accepted
- Issues : P3-2, P3-7

## Contexte

Le code de `App.jsx`, `gameUtils.js`, `soundManager.js` et `PhantomEvent.jsx` encode des comportements non documentés (sélection de mobs, cooldowns, ordre des sons, persistance). Les modifier sans garde-fou risquait de casser des règles de jeu silencieusement.

## Décision

Pour chaque refactor, trois commits dans cet ordre :

1. tests de caractérisation qui figent le comportement actuel ;
2. refactor (aucun changement de comportement visible) ;
3. tests du code nouveau injecté.

Chaque commit garde la suite verte.

## Conséquences

- La non-régression est prouvée par les tests, pas par relecture.
- Le diff d’un refactor reste petit et réversible.
- Les tests de caractérisation peuvent rester en place comme filet de sécurité.
