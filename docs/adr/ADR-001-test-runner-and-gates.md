# ADR-001 — Vitest + RTL, ESLint et Prettier comme gates CI

- Statut : Accepted
- Issues : P3-1, P3-3, P3-4, P3-7

## Contexte

Le projet initial n’avait aucun test et une CI qui ne faisait que builder l’exe Windows sur `main`. Aucun garde-fou n’empêchait une régression de passer en merge.

## Décision

Utiliser **Vitest + React Testing Library**, déjà alignés avec Vite, et ajouter quatre commandes locales et CI :

```bash
npm test
npm run lint
npm run format:check
npm run build
npm run coverage
```

Un gate supplémentaire exige **100 % de couverture sur le code nouveau** et **au moins 80 % sur les lignes modifiées** (`BASE_REF=origin/develop npm run coverage:patch`).

## Conséquences

- Les refactors ne peuvent être mergés qu’avec une CI verte.
- Les seuils sont vérifiés mécaniquement, pas à la main.
- Toute baisse de seuil doit être tracée comme dette.
