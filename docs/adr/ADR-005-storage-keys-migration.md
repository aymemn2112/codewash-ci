# ADR-005 — Clés centralisées et migration non destructive

- Statut : Accepted
- Issue : P4-15

## Contexte

Les clés `heroSkills_v23`, `currentProfile_v1`, `heroProfileNames_v1` et les variantes `_v1` étaient dupliquées dans `App.jsx`, avec un fallback legacy en ligne. Aucune migration n’était formalisée.

## Décision

Créer `src/services/storageKeys.js` qui exporte :

- `STORAGE_KEYS` pour les clés historiques ;
- `getStorageKey(profileId)`, `getBorderEffectKey(profileId)`, `getBorderColorKey(profileId)` ;
- `migrateLegacySkills(storage, profileId = 1)`.

La migration **copie** la valeur legacy vers la clé du profil cible uniquement si cette dernière est absente. Elle ne supprime jamais la clé source.

## Conséquences

- Aucune perte de données en cas d’échec ou de rollback.
- Le câblage dans `App.jsx` est nécessaire pour bénéficier du service (track B).
