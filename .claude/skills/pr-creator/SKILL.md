---
name: pr-creator
description: "Create and update Pull Requests for FateConnect. Use when the user asks to create/open/update a PR (e.g. criar PR, abrir PR, create PR, open pull request, atualizar descrição do PR). Derive title, Objetivo, and Alterações from the diff; infer GitHub issue number from the branch name (e.g. chore/3 → #3) and reference it in the PR body; write the PR title in English and the PR description in pt-BR, with Issue and Evidências sections."
---

# PR creator

Use this skill when creating or updating Pull Requests. Para mensagens de commit locais, usar a skill `write-commit`.

## Target branch

- Default base branch: `develop`.
- Use another base only for hotfix flows or when the user explicitly requests a different target branch.

## Gather context from diff

Before writing title/body, inspect changes against the target branch:

1. `git diff <target-branch>...HEAD` (preferred for detailed changes)
2. `git log <target-branch>..HEAD --oneline` (optional quick summary)

Use this diff as the source of truth for PR content.

## Build PR title

Format: `pr-type(branch-name): short description`

- `pr-type`: derive from branch type (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`).
- `branch-name`: GitHub issue **number** from the branch (e.g. `feat/3` → `3`, `chore/3` → `3`). Use the segment **after the first `/`**. If that segment is **digits only**, it is the issue id for the title and for the body (see below). If the branch does not follow `<tipo>/<número>` (e.g. `main`, or `feat/123` without a numeric id), omit the issue from the title parentheses or ask the user which issue to link.
- `short description`: in **English**, imperative, lowercase, and based on the actual diff (never invent). Only the PR **body** is written in pt-BR.

## Issue reference (from branch)

1. Read the current branch name (e.g. `git branch --show-current`).
2. When it matches `<prefix>/<issueNumber>` and `issueNumber` is **numeric** (e.g. `chore/3` → `3`), that is the **GitHub issue** for this PR.
3. In the PR description, include a section **`## Issue`** that references it so GitHub links and tracks work:
   - Use a bullet with the issue link syntax, e.g. `- #3` (renders as a link to issue 3).
   - The repo convention expects the issue to close on merge, add a separate line in the same section: `Closes #3` (or `Fixes #3`).

> ⚠️ **`Closes #N` does NOT auto-close in this repo.** GitHub only closes a referenced issue when the PR merges into the **default branch**, which here is `main`. This repo follows gitflow and PRs target `develop`, so the keyword never fires. Keep the line (it documents intent and works if the branch ever reaches `main`), but **close the issue manually after the merge** — `gh issue close <n> --comment "..."` — and move its card on the project board. Confirmed on PR #61 / issue #60.

⛔ **Mergeou = fechar. Não pergunte.** Fechar a issue é a última etapa de entregá-la, não uma decisão à parte — perguntar "quer que eu feche?" devolve ao usuário um passo que já está combinado. Cobrado em 30/08/2026, depois de eu perguntar sobre a #172 com o PR #236 já mergeado: *"não precisa nem me perguntar. mergeou == fechar a issue"*. O card vai para `Done` pelo bot em seguida.

## Build PR description (pt-BR)

The PR description must be in **pt-BR** and must include:

- `## Objetivo`: purpose of the branch based on diff.
- `## Alterações`: concrete changes from diff (files/features/rules/skills/behavior).
- `## Issue`: reference to the GitHub issue derived from the branch (see **Issue reference** above). Omit this section only when no numeric issue id can be inferred from the branch.
- `## Evidências`: reserved section for screenshots from the user.

Do not add assumptions not present in the diff.

## Open or update the PR

1. Push branch if needed:
   - `git push -u origin $(git branch --show-current)` (first push)
   - `git push` (updates)
2. Create PR with GitHub CLI (preferred):
   - `gh pr create --base <target-branch> --title "<title>" --body "<body>" --assignee @me`
   - **`--assignee @me` is mandatory** — every PR opened through this skill is assigned to the authenticated user, so it shows up in their "Assigned to you" list. Use `@me` rather than a hardcoded username so the skill stays correct for whoever runs it.
   - If the PR already exists without an assignee, fix it with `gh pr edit <n> --add-assignee @me`.
3. If GitHub CLI is unavailable, stop and tell the user — do not invent another path.

## Validation checklist

- Title derived from diff and formatted as `pr-type(Github Issue ID): breve descrição`.
- Description written in pt-BR.
- `Objetivo` and `Alterações` derived from diff.
- `## Issue` present when the branch name yields a numeric id (e.g. `chore/3` → `- #3`).
- `## Evidências` section present.
- PR assigned to the authenticated user (`--assignee @me`).
