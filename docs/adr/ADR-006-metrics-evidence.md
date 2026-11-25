# ADR-006 — Preuve avant/après par métriques reproductibles

- Statut : Accepted
- Issue : P4-19

## Contexte

Le registre de dettes contient un baseline (coverage, complexité, duplication, cycles, I/O). Sans re-mesure après les refactors, impossible de prouver que les changements ont amélioré la situation.

## Décision

Conserver les mesures initiales dans `docs/metrics/` et écrire les mesures après refactor dans `docs/metrics/after/`, avec un comparatif lisible dans `docs/metrics/AFTER.md`. Les commandes de reproduction sont documentées dans ce fichier.

## Conséquences

- Chaque affirmation d’amélioration est appuyée par un chiffre et une commande reproductible.
- Les régressions de métriques (duplication de tests, occurrences I/O dans les stubs) sont explicitement listées comme dettes résiduelles.
- Le périmètre de mesure est indiqué : l’arbre Track A complet est identique sur `refactor/dependency-injection`, `refactor/audio-io` et `docs/adrs` (services, audio, ADR, métriques).

Voir aussi [ADR-001](./ADR-001-test-runner-and-gates.md) et [ADR-002](./ADR-002-characterization-first.md).
