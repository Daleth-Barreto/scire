# Seed

Baseline code for experiments. Experiments branch from here into git
worktrees. Only merge gains that clear the margin defined in grader.py.

## Convention

- Each experiment is a directory with its own `result.json`
- `result.json` REQUIRED fields: `metric`, `value`, `hypothesis`, `lessons`
- Optional: `code_diff.md`, `plots/`