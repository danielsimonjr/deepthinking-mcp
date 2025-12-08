# Branch Protection Rules

This document describes the recommended branch protection rules for the deepthinking-mcp repository.

## Main/Master Branch Protection

Configure the following settings for the `master` (or `main`) branch:

### Required Status Checks

✅ **Require status checks to pass before merging**
- Require branches to be up to date before merging
- Required checks:
  - `Test on ubuntu-latest (Node 18.x)`
  - `Test on ubuntu-latest (Node 20.x)`
  - `Test on ubuntu-latest (Node 22.x)`
  - `Test Summary`
  - `Generate Coverage Report`

### Pull Request Requirements

✅ **Require pull request reviews before merging**
- Required number of approvals: 1
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners (if CODEOWNERS file exists)

✅ **Require conversation resolution before merging**
- All PR conversations must be resolved

### Commit Requirements

✅ **Require signed commits** (Optional, recommended for security)

✅ **Require linear history**
- Prevents merge commits, enforces rebase or squash

### Force Push Protection

✅ **Do not allow force pushes**
- Protects against accidental history rewrites

✅ **Do not allow deletions**
- Prevents accidental branch deletion

### Additional Settings

✅ **Require deployments to succeed before merging** (If applicable)

✅ **Lock branch** (Optional, for stable releases)
- Make branch read-only

---

## Develop Branch Protection (Optional)

If using a `develop` branch for integration:

### Required Status Checks

✅ **Require status checks to pass before merging**
- Required checks:
  - `Test on ubuntu-latest (Node 20.x)` (at minimum)
  - `Generate Coverage Report`

### Pull Request Requirements

✅ **Require pull request reviews before merging**
- Required number of approvals: 1

---

## How to Configure

### Via GitHub Web Interface

1. Navigate to: `https://github.com/USERNAME/deepthinking-mcp/settings/branches`
2. Click **Add rule** or edit existing rule
3. Enter branch name pattern: `master` (or `main`)
4. Configure settings as described above
5. Click **Create** or **Save changes**

### Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Protect master branch
gh api repos/:owner/:repo/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Test on ubuntu-latest (Node 18.x)","Test on ubuntu-latest (Node 20.x)","Test on ubuntu-latest (Node 22.x)","Test Summary","Generate Coverage Report"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

### Via Terraform (Infrastructure as Code)

```hcl
resource "github_branch_protection" "master" {
  repository_id = github_repository.repo.node_id
  pattern       = "master"

  required_status_checks {
    strict   = true
    contexts = [
      "Test on ubuntu-latest (Node 18.x)",
      "Test on ubuntu-latest (Node 20.x)",
      "Test on ubuntu-latest (Node 22.x)",
      "Test Summary",
      "Generate Coverage Report",
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
  }

  enforce_admins         = true
  require_linear_history = true
  allow_force_pushes     = false
  allow_deletions        = false
}
```

---

## Workflow Requirements

The following GitHub Actions workflows must pass:

1. **Test Suite** (`.github/workflows/test.yml`)
   - Runs on: Ubuntu, Windows, macOS
   - Node versions: 18.x, 20.x, 22.x
   - Checks: TypeScript, Linter, Tests

2. **Code Coverage** (`.github/workflows/coverage.yml`)
   - Runs on: Ubuntu latest
   - Node version: 20.x
   - Minimum coverage: 60% (warning), 80% (recommended)

---

## Bypassing Protection (Emergency)

Repository administrators can bypass these rules in emergencies by:

1. Temporarily disabling branch protection
2. Making the necessary changes
3. Re-enabling protection immediately

**NOTE**: This should only be done in critical situations and should be documented.

---

## CODEOWNERS File

Create a `.github/CODEOWNERS` file to automatically request reviews:

```
# Root ownership
*                           @username

# Core modules
/src/core/*                 @username
/src/types/*                @username

# MCP tools
/src/tools/*                @username

# Tests
/tests/*                    @username

# CI/CD
/.github/workflows/*        @username

# Documentation
/docs/*                     @username
*.md                        @username
```

---

## Best Practices

1. **Keep protection enabled** at all times for production branches
2. **Review workflow results** before merging PRs
3. **Require linear history** to maintain clean git history
4. **Enable signed commits** for added security
5. **Review and update** protection rules quarterly
6. **Document exceptions** when bypassing rules

---

## Troubleshooting

### Status checks not appearing

- Ensure workflows have run at least once on the branch
- Check workflow names match exactly in branch protection settings
- Verify workflows are triggered on `pull_request` events

### Cannot merge PR

- Verify all required status checks have passed
- Ensure all conversations are resolved
- Check that branch is up to date with base branch
- Confirm you have the required approvals

### Force push needed

- If absolutely necessary, temporarily disable protection
- Complete the force push
- Re-enable protection immediately
- Document the reason in an issue or PR

---

For more information, see:
- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
