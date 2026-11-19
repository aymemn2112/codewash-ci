# Continuous integration

## Workflows

Workflows live at the **repository root** in `.github/workflows/` (GitHub does not read
workflows from subdirectories — the received `CodeWashGame/.github/workflows/` was ignored,
which is why the first pipeline never ran).

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | PR and push to `develop` / `main` | lint, format check, tests + coverage, build |
| `build-exe.yml` | push to `main`, manual | portable Windows `.exe` + GitHub release |

## Quality gates

`ci.yml` runs, in order, from `CodeWashGame/`:

1. `npm ci` — reproducible install from the lockfile.
2. `npm run lint` — ESLint 9 (static analysis). Fails on errors. Complexity is report-only
   for now (warning at > 10) and becomes blocking after the M4 split.
3. `npm run format:check` — Prettier check.
4. `npm run coverage` — Vitest with global coverage thresholds (see `docs/TESTING.md`).
5. `npm run coverage:patch` — **patch coverage gate**: fails when fewer than 80% of the
   executable lines changed by the PR are covered. Compares `coverage/lcov.info` with
   `git diff` against the base branch (`BASE_REF`).
6. `npm run build` — production bundle must build.
7. Upload the coverage report as an artifact.
8. `npm audit --audit-level=critical` — **report-only** (`continue-on-error`). The received
   dependency tree has 31 advisories; they are tracked in `DEBT.md`.

A red check blocks the merge once branch protection requires it.

## Branch protection (blocked by repository rights)

The intended settings for `develop` and `main` are:

- Require a pull request before merging.
- Require status checks: `Lint, format, tests and build`.
- Require branches to be up to date before merging.
- Disallow force pushes and deletions.
- Optional: require one approving review.

**Status: not enabled.** The team account has `WRITE` access, not `ADMIN`, and no
administrator is available (GitHub returns `404` on the protection endpoint). This is tracked
as **D-36** in `DEBT.md`. Until an admin enables it, CI results are advisory: never merge a
red PR.

## Local safety net (no admin needed)

A `pre-push` hook runs the CI checks before every push:

```bash
git config core.hooksPath .githooks   # enable once per clone
```

The hook (`.githooks/pre-push`) runs `lint`, `format:check`, `coverage` and `build`. Use
`git push --no-verify` only in an emergency, and record why if it happens.

## Local equivalents

```bash
cd CodeWashGame
npm run lint
npm run format:check
npm run coverage
BASE_REF=origin/develop npm run coverage:patch
npm run build
```

Run all of them before opening a PR; CI runs the same commands.

## Notes

- Coverage threshold starts just below the measured baseline (45% lines) because the
  received project had no tests. It is ratcheted upward each PR; see `DEBT.md` D-34.
- **Merge order matters once.** The one-time Prettier baseline (`chore/format-baseline`)
  must be merged before the branch that introduces the patch-coverage gate. Otherwise the
  gate compares against a tree without the reformat and flags thousands of reformatted
  lines as "changed but uncovered".
- The Windows build job is intentionally separate: electron-builder's `win` target needs
  `windows-latest`.
- If a gate must be bypassed, record it in `DEBT.md` §3.6 with a repayment plan.