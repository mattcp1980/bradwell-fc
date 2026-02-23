# Bradwell FC

Club management web app for Bradwell FC. Provides a public-facing site, a parent portal, and an admin dashboard for club officials.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Auth & Database | Supabase (Postgres + Auth + Storage + Realtime) |
| Hosting | GCP (Cloud Storage + CDN Load Balancer) |
| Infrastructure | Pulumi (TypeScript, GCS backend) |

## Project Structure

```
bradwell-fc/
├── app/          # React/Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── public/    # Unauthenticated: fixtures, news, about
│       │   ├── parent/    # Parent role: availability, schedule, docs
│       │   └── admin/     # Official role: full management dashboard
│       ├── components/
│       │   ├── ui/        # Primitive UI components
│       │   ├── layout/    # Page shells, nav, sidebars
│       │   └── shared/    # Business components reused across roles
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Supabase client, helpers
│       └── types/         # Shared TypeScript types
└── infra/        # Pulumi IaC
```

## Roles

| Role | Access |
|---|---|
| `public` | Fixtures, results, news, club info |
| `parent` | Above + availability submission, training schedule, documents, gallery |
| `official` | Everything + squad/fixture management, team sheets, admin dashboard |

Roles are enforced at the Supabase RLS level and UI routing level.

## Getting Started

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Pulumi CLI](https://www.pulumi.com/docs/install/)
- GCP project with billing enabled

### App (local dev)

```bash
cd app
npm install
cp .env.local.example .env.local   # fill in your Supabase URL and anon key
npm run dev
```

### Supabase (local)

```bash
supabase start
supabase gen types typescript --local > app/src/types/supabase.ts
```

### Infrastructure

The Pulumi state is stored in a GCS bucket (`gs://bradwell-fc-pulumi-state`). Create this bucket manually before running Pulumi for the first time:

```bash
gcloud storage buckets create gs://bradwell-fc-pulumi-state \
  --location=europe-west2 \
  --uniform-bucket-level-access
```

Then:

```bash
cd infra
npm install
pulumi stack select bradwell-fc/dev   # or prod
pulumi preview
pulumi up
```

## Key Commands

```bash
# App
cd app && npm run dev          # local dev server
cd app && npm run build        # production build
cd app && npm run typecheck    # type check without emitting
cd app && npm run test         # run test suite
cd app && npm run test:watch   # watch mode

# Supabase
supabase start
supabase gen types typescript --local > app/src/types/supabase.ts

# Infra
cd infra && pulumi preview     # always preview before applying
cd infra && pulumi up
```

## Environment Variables

### app/.env.local

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Copy `app/.env.local.example` as a starting point. Never commit `.env.local`.

### Pulumi (stack config)

Configured per-stack in `infra/Pulumi.{env}.yaml`:

```
gcp:project      # GCP project ID
gcp:region       # europe-west2
bradwell-fc:env  # dev | prod
```

Secrets (e.g. any service-level keys) are set with `pulumi config set --secret` and stored encrypted in the stack config.

## Social Media

Currently: deep-link buttons to native Facebook/Instagram admin pages. No API integration in scope for v1.

Phase 2 plan: Meta Graph API via a Cloud Run proxy service. Access tokens stored in GCP Secret Manager.
