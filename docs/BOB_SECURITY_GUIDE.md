# Bob Security Guide

Operational security guidance when using Bob while developing MCP Shield.

## Core Rules

- Never paste real secrets into prompts.
- Never commit real credentials to the repo.
- Use environment variables for sensitive values.
- Keep demo data obviously fake.
- Review generated commands before executing.

## Recommended Workflow

1. Keep `.env` local and git-ignored.
2. Commit only `.env.example` with fake placeholders.
3. Run `git diff` before commit and look for accidental secrets.
4. Run scanner tests after major changes.
5. Validate demo files still use fake data.

## If a Secret Is Exposed

1. Revoke/rotate the secret immediately.
2. Remove it from code/history if applicable.
3. Update local environment securely.
4. Document the incident for team awareness.

## Prompt Hygiene

Use:
- "Add environment variable support for API tokens"

Avoid:
- "Use this token: `<real token>`"

## Demo Hygiene

All public artifacts should include fake values only, such as:

- `fake-password-123`
- `demo-token-abc`
- `api.fake-company.com`
