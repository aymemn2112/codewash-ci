# Métriques après refactor — preuve avant/après

Issue : P4-19. Baseline : `docs/metrics/`. Mesures après : `docs/metrics/after/`.

## Périmètre

Les mesures « après » sont prises sur la branche **`docs/adrs`**, dont la base est `refactor/audio-io` (choix conservé). Elles incluent donc les refactors RNG et audio, mais **pas** les services `clock`, `storage` et `storageKeys` de `refactor/dependency-injection`. Le comparatif est donc partiel pour la track A complète.

Les chiffres « avant » correspondent à l’état initial snapshoté (`DEBT.md` §1 et §2).

## Comparatif

| Métrique | Avant | Après | Commentaire |
|---|---:|---:|---|
| Tests | 0 | **14 fichiers / 97 tests** | Vitest + RTL (ADR-001) |
| Couverture — statements | 0 % | **47,94 %** (840/1752) | |
| Couverture — branches | 0 % | **41,12 %** (521/1267) | |
| Couverture — functions | 0 % | **40,22 %** (142/353) | |
| Couverture — lines | 0 % | **48,07 %** (787/1637) | 100 % sur le code nouveau ajouté |
| ESLint (erreurs) | 0 | **0** | |
| ESLint (warnings) | 0 | **14** | Warnings `complexity` préexistants |
| Règle `complexity` (erreurs) | 38 | **14** | Baisse nette |
| Duplication — clones jscpd | 6 | 13 | Hausse due aux helpers de test partagés à factoriser |
| Duplication — lignes | 144 (2,53 %) | **193 (2,25 %)** | Pourcentage en baisse |
| Cycles d’import (madge) | 0 | **0** | Aucun cycle introduit |
| Occurrences I/O (`grep`) | 82 | 95 | Hausse due aux stubs dans les tests |
| `npm audit` — vulnérabilités | 31 | 31 | Inchangé (1 critique, 20 high) |
| Build | OK | **OK** | `npm run build` |

## Dettes résiduelles mesurées

- 14 warnings `complexity` restent sur `App.jsx`, `SkillCard.jsx` et les drawers (track B).
- Les tests de caractérisation dupliquent `createAudioMock` / `stubAudio` : à factoriser dans `src/test/` lors d’un prochain commit.
- 31 vulnérabilités npm, dont 1 critique : hors périmètre track A.

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
npm run build > ../docs/metrics/after/build.log 2>&1
```

Les fichiers bruts sont dans `docs/metrics/after/` (`coverage.txt`, `jscpd-console.txt`, `madge-circular.txt`, `wc-lines.txt`, etc.).
