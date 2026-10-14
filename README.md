# TaskFlow DevOps

A task-board portfolio project by devopspayal. The first release fixes the initial Cloudflare build failure and provides a working browser-local demo.

## Current release: 0.1.0

- Create, search, filter, move and delete tasks.
- Local browser persistence with a sample board; no account required.
- Cloudflare Workers Static Assets deployment, independent of the developer laptop.
- Node built-in tests run automatically through Wrangler's custom build command before deployment.
- Security response headers and a `/health.json` deployment smoke-check endpoint.

**Not implemented yet:** Supabase authentication/database, automated rollback, monitoring dashboards, Kubernetes, Jenkins, or GitHub Actions. This is not yet the completed advanced portfolio project. Supabase connection in the assistant does not connect the website automatically.

## Run and verify

Requires Node.js 22+ and npm. `npm test` has no external dependencies. `npm run dev` downloads pinned Wrangler 4.151.0 and starts the local development server. `npm run deploy` deploys to your authenticated Cloudflare account.

Cloudflare Workers Builds settings:

- Repository: `devopspayal/taskflow-devops`; branch: `main`
- Root directory: `/`
- Build command: leave empty (Wrangler runs `npm test` from `wrangler.jsonc`)
- Deploy command: `npm run deploy` (existing `npx wrangler deploy` also reads the config)

The `public` folder is the deployable website. No environment variables or credentials are needed for this release. Never commit secrets.

## Incident: initial deployment failed

The repository initially contained only a README. Wrangler reported: `Could not detect a directory containing static files`. The fix adds the real public assets and explicitly sets `assets.directory` in the Wrangler configuration. Tests fail deployment if expected assets are missing.

## Verification checklist

1. Run `npm test`.
2. Confirm the Cloudflare build is successful for the intended Git commit.
3. Open the deployed URL, create a task, change its status and reload to confirm browser persistence.
4. Request `/health.json` and check version `0.1.0`. This tests the static deployment, not database availability.

## Data and cost boundaries

Tasks stay in localStorage in the same browser and origin; they are not synced between devices. Clearing site data removes them. Only use sample/non-sensitive tasks. Cloudflare service quotas still apply. No AWS resources are used.

## Next milestones

Supabase auth with per-user row-level security, independent CI checks, documented deployment rollback, and evidence from real failure/recovery tests. Do not present planned features as completed work.
