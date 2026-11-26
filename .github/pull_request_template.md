## What & why

<!-- Short description. One intent per PR. -->

## References

- Refs D-xx / issue: #
- Closes #

## Boy-scout checklist

- [ ] Tests added or updated (characterization tests first for any refactor)
- [ ] Coverage on changed lines ≥ 80% (`npm run coverage:patch`)
- [ ] Lint, format and build are green (`npm run lint && npm run format:check && npm run build`)
- [ ] Documentation updated where relevant (`README`, `DEBT.md`, ADR, runbook, feature docs)
- [ ] Public interfaces/formats preserved, or a migration plan is documented
- [ ] Local pre-push gate ran (`git config core.hooksPath .githooks` once)
