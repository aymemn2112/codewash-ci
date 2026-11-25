# Métriques après refactor — preuve avant/après

Issue : P4-19. Baseline : `docs/metrics/`. Mesures après : `docs/metrics/after/`.

## Périmètre

Les mesures « après » sont prises sur l’arbre complet de la track A : services `clock`, `rng`, `storage`, `storageKeys`, injection dans `App.jsx`, `SkillCard.jsx`, `PhantomEvent.jsx` et les utils, fabrique audio/BGM sans singleton global, ADR et documentation. Le même contenu est présent sur les trois branches de la track A (`refactor/dependency-injection`, `refactor/audio-io`, `docs/adrs`).

Les chiffres « avant » correspondent à l’état initial snapshoté (`DEBT.md` §1 et §2).

## Comparatif

| Métrique | Avant | Après | Commentaire |
|---|---:|---:|---|
| Tests | 0 | **27 fichiers / 147 tests** | Vitest + RTL (ADR-001) |
| Couverture — statements | 0 % | **59,80 %** (1052/1759) | |
| Couverture — branches | 0 % | **54,65 %** (698/1277) | |
| Couverture — functions | 0 % | **54,06 %** (193/357) | |
| Couverture — lines | 0 % | **59,90 %** (983/1641) | Voir `after/patch-coverage.txt` pour le code nouveau |
| Patch coverage (lignes modifiées) | — | **80,59 %** (137/170) | Gate à 80 % respecté (`BASE_REF=origin/develop`) |
| ESLint (erreurs) | 0 | **0** | |
| ESLint (warnings) | 0 | **14** | Warnings `complexity` préexistants |
| Règle `complexity` (erreurs) | 38 | **14** | Baisse nette |
| Duplication — clones jscpd | 6 | 13 | Hausse due aux helpers de test partagés à factoriser |
| Duplication — lignes | 144 (2,53 %) | **193 (2,25 %)** | Pourcentage en baisse |
| Cycles d’import (madge) | 0 | **0** | Aucun cycle introduit |
| Occurrences I/O (`grep`) | 82 | **79** | Baisse nette, stubs de test inclus |
| `npm audit` — vulnérabilités | 31 | 31 | Inchangé (1 critique, 20 high) |
| Build | OK | **OK** | `npm run build` (voir `after/build.log`) |

## Dettes résiduelles mesurées

- 14 warnings `complexity` restent sur `App.jsx`, `SkillCard.jsx` et les drawers (track B).
- 13 clones jscpd / 193 lignes dupliquées, principalement des helpers de test (`createAudioMock`, `stubAudio`) : à factoriser dans `src/test/`.
- 31 vulnérabilités npm, dont 1 critique : hors périmètre track A.
- `D-15` reste `partial` : la dédup `getRandom*` est faite, la suppression de `MenuDrawer_old.jsx` appartient à la track B.

## Reproduction

Depuis `CodeWashGame/` :

```bash
grep -rnE "localStorage|Date\.now|new Date|Math\.random|new Audio|SpeechRecognition|webkitSpeechRecognition|requestFullscreen|fetch\(" src/ \
  | grep -vE '(^|/)\._' > ../docs/metrics/after/io-grep.txt
npx eslint . --ignore-pattern '**/._*' -f json -o ../docs/metrics/after/eslint-clean.json
npx eslint src/ --rule '{"complexity":["error",10]}' -f json -o ../docs/metrics/after/complexity.json
npx jscpd src/ --min-lines 5 --min-tokens 50 --ignore '**/._*' --reporters console,json --output ../docs/metrics/after
npx madge --circular --extensions js,jsx src/ > ../docs/metrics/after/madge-circular.txt
npm run coverage > ../docs/metrics/after/coverage.txt 2>&1
BASE_REF=origin/develop npm run coverage:patch > ../docs/metrics/after/patch-coverage.txt 2>&1
npm run build > ../docs/metrics/after/build.log 2>&1
```

Les fichiers bruts sont dans `docs/metrics/after/` (`coverage.txt`, `patch-coverage.txt`, `build.log`, `jscpd-console.txt`, `madge-circular.txt`, `wc-lines.txt`, etc.).
