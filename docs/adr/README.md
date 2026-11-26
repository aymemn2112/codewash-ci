# Architecture Decision Records

Ce dossier trace les décisions structurelles prises pendant la phase M4 (refactor domaine / I-O) du projet CodeWash.

Format : contexte → décision → conséquences. Statut : `Accepted` sauf mention contraire.

| ADR | Décision | Issues |
|---|---|---|
| [ADR-001](./ADR-001-test-runner-and-gates.md) | Vitest + RTL, ESLint et Prettier comme gates CI | P3-1, P3-3, P3-4, P3-7 |
| [ADR-002](./ADR-002-characterization-first.md) | Tests de caractérisation avant chaque refactor | P3-2, P3-7 |
| [ADR-003](./ADR-003-inject-io-services.md) | Injection de l’horloge, du RNG et du stockage | P4-4, P4-5, P4-6 |
| [ADR-004](./ADR-004-audio-factory.md) | Fabrique audio et suppression du singleton BGM | P4-7, P4-8 |
| [ADR-005](./ADR-005-storage-keys-migration.md) | Clés centralisées et migration non destructive | P4-15 |
| [ADR-006](./ADR-006-metrics-evidence.md) | Preuve avant/après par métriques reproductibles | P4-19 |

Les mesures avant/après sont dans [`docs/metrics/AFTER.md`](../metrics/AFTER.md).

## Index et portée

- ADR-001 à ADR-006 couvrent les décisions structurelles de M4 (outillage, tests de
  caractérisation, injection des I/O, fabrique audio, clés de stockage, preuve par métriques).
- Aucune nouvelle décision structurelle n'a été requise en M5 : les missions (performance,
  bug reporting, traduction, thèmes) s'appuient sur ces décisions. Toute décision future doit
  ajouter une entrée ici en suivant le format contexte → décision → conséquences.

Voir aussi [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) pour le panorama global.
