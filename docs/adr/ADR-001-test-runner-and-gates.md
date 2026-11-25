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

Deux gates mécaniques vérifient la couverture :

```bash
BASE_REF=origin/develop npm run coverage:patch     # ≥ 80 % des lignes modifiées
BASE_REF=origin/develop npm run coverage:new-code  # 100 % des nouveaux fichiers sources
npm run coverage:gates                             # les deux à la suite
```

Le gate « nouveau code » s'applique aux fichiers sources ajoutés par la branche (lignes, statements, fonctions et branches). Les lignes modifiées dans des fichiers existants sont couvertes par le gate à 80 %.

## Conséquences

- Les refactors ne peuvent être mergés qu’avec une CI verte.
- Les seuils sont vérifiés mécaniquement, pas à la main.
- Toute baisse de seuil doit être tracée comme dette.
