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
4. `npm run coverage` — Vitest with coverage thresholds (see `docs/TESTING.md`).
5. `npm run build` — production bundle must build.
6. Upload the coverage report as an artifact.
7. `npm audit --audit-level=critical` — **report-only** (`continue-on-error`). The received
   dependency tree has 31 advisories; they are tracked in `DEBT.md`.

A red check blocks the merge once branch protection requires it.

## Branch protection (to configure on GitHub)

For `develop` and `main`:

- Require a pull request before merging.
- Require status checks: `Lint, format, tests and build`.
- Require branches to be up to date before merging.
- Disallow force pushes and deletions.
- Optional: require one approving review.

## Local equivalents

```bash
cd CodeWashGame
npm run lint
npm run format:check
npm run coverage
npm run build
```

Run all of them before opening a PR; CI runs the same commands.

## Notes

- Coverage threshold starts just below the measured baseline (45% lines) because the
  received project had no tests. It is ratcheted upward each PR; see `DEBT.md` D-34.
- The Windows build job is intentionally separate: electron-builder's `win` target needs
  `windows-latest`.
- If a gate must be bypassed, record it in `DEBT.md` §3.6 with a repayment plan.