

## Fix "denied to github-actions[bot]" on sync workflow

The error tells us exactly what's happening: the push is being authenticated as `github-actions[bot]` (the default `GITHUB_TOKEN`), not as your PAT. That means `${{ secrets.DEMO_REPO_TOKEN }}` is empty at runtime, so the remote URL falls back to no credentials and Git uses the default token, which has no access to the destination repo.

The workflow YAML itself is correct. The fix is to make sure the secret is actually present and readable by this workflow run.

### Why this happens

When `${DEMO_REPO_TOKEN}` is empty, the remote URL becomes:
`https://x-access-token:@github.com/avalonlabsteam/demo-vehicle-import.git`
Git then falls back to the ambient credential helper (the `GITHUB_TOKEN` injected by Actions, which authenticates as `github-actions[bot]`) — exactly what the error shows.

### Checklist (do in order)

**1. Confirm the secret exists on the SOURCE repo (this one)**
- Source repo on GitHub → Settings → Secrets and variables → **Actions** tab → **Repository secrets**.
- A secret named exactly `DEMO_REPO_TOKEN` must be listed. Name is case-sensitive.
- If it's under "Environment secrets" or "Dependabot secrets" instead of "Actions → Repository secrets", it won't be available — move it.
- If the source repo is in an organization that restricts secret usage, ensure Actions are allowed: Org/Repo Settings → Actions → General → "Allow all actions".

**2. Confirm the token itself is valid and has push rights**
Quick local test (replace `YOUR_TOKEN`):
```
git clone https://x-access-token:YOUR_TOKEN@github.com/avalonlabsteam/demo-vehicle-import.git /tmp/test-clone
```
- If clone fails with 403/404 → token is wrong/expired/lacks access. Regenerate it.
- If clone works but push later fails → token is read-only; recreate with write scope.

**3. Recreate the token the simple way (classic PAT)**
Fine-grained PATs often silently lack visibility on org repos. Use a classic PAT to remove that variable:
- GitHub → avatar → Settings → Developer settings → Personal access tokens → **Tokens (classic)** → **Generate new token (classic)**.
- Scope: check **`repo`** (full control of private repositories — also covers public).
- Generate, copy the value (starts with `ghp_…`).
- If `avalonlabsteam` is an org with SSO, after creation click **Configure SSO** next to the token and **Authorize** it for `avalonlabsteam`. Without this, the token is rejected silently.

**4. Re-add the secret on the source repo**
- Source repo → Settings → Secrets and variables → Actions → click `DEMO_REPO_TOKEN` → **Update secret** (or delete and re-create) → paste the new classic PAT → Save.

**5. Confirm the token's user has write access on the destination**
- `avalonlabsteam/demo-vehicle-import` → Settings → Collaborators and teams → token-owning user listed with **Write** or **Admin**. If it's an org repo, the user must be an org member with write on this repo (directly or via a team).

**6. Re-run the workflow**
- Source repo → Actions tab → **Sync to demo repo** → **Run workflow** → branch `main` → Run.

### Optional diagnostic step (recommended)

To prevent guessing next time, add a step that fails fast with a clear message if the secret is missing or can't see the repo. This is the only code change in the plan, and it's purely diagnostic — no behavior change to the push.

Add this step in `.github/workflows/sync-to-demo.yml` BEFORE "Add destination remote":

```yaml
      - name: Verify token can access destination
        env:
          DEMO_REPO_TOKEN: ${{ secrets.DEMO_REPO_TOKEN }}
        run: |
          if [ -z "$DEMO_REPO_TOKEN" ]; then
            echo "::error::DEMO_REPO_TOKEN secret is empty or not exposed to this workflow."
            exit 1
          fi
          status=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer ${DEMO_REPO_TOKEN}" \
            https://api.github.com/repos/avalonlabsteam/demo-vehicle-import)
          echo "GitHub API status: $status"
          if [ "$status" != "200" ]; then
            echo "::error::Token cannot access destination repo (HTTP $status). Check token scopes, SSO authorization, and repo permissions."
            exit 1
          fi
```

Future failures will then say either "secret is empty" or "HTTP 401/403/404" instead of the misleading `github-actions[bot]` message.

### Out of scope

- No app code, route, component, or data changes.
- The push step itself stays as-is — the root cause is the secret/token, not the YAML.

