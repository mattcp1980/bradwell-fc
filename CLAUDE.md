# Bradwell FC - Claude Code Guidelines

## Project Overview

A club management web app for Bradwell FC. Provides a public-facing site, a parent portal, and an admin dashboard for club officials.

**Stack**: React + Vite, Supabase (auth, Postgres, storage, realtime), deployed to GCP via Pulumi.
**Region**: `europe-west2` (London)
**Pulumi state**: GCS bucket backend

---

## Architecture

```
bradwell-fc/
├── app/          # React/Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── public/    # Unauthenticated: fixtures, news, about
│       │   ├── parent/    # Parent role: availability, schedule, docs
│       │   └── admin/     # Official role: full management dashboard
│       ├── components/
│       │   ├── ui/        # Primitive UI components (buttons, inputs, etc.)
│       │   ├── layout/    # Page shells, nav, sidebars
│       │   └── shared/    # Business components reused across roles
│       ├── hooks/         # Custom React hooks (useFixtures, useAvailability, etc.)
│       ├── lib/           # Supabase client, helpers, constants
│       └── types/         # Shared TypeScript types/interfaces
└── infra/        # Pulumi IaC (TypeScript)
```

---

## Coding Standards

### General

- TypeScript everywhere - no `any` unless absolutely unavoidable, and always comment why
- Functional components only - no class components
- Prefer named exports over default exports for components
- Files named in `kebab-case`; components named in `PascalCase`
- Keep components small and focused - if a component exceeds ~150 lines, consider splitting it

### React / Vite

- Use React Query (TanStack Query) for all server state - no raw `useEffect` for data fetching
- Local UI state only via `useState`/`useReducer` - no global state library unless complexity demands it
- All Supabase calls go through custom hooks in `src/hooks/` - never call Supabase directly from components
- Forms use React Hook Form
- Routing via React Router v6

### Supabase

- Use Row Level Security (RLS) for all tables - never rely solely on client-side role checks
- Always define RLS policies before exposing a table to the frontend
- Use typed Supabase client generated from the DB schema (`supabase gen types typescript`)
- Migrations go in `supabase/migrations/` and are committed to version control
- Never store secrets in the frontend - Supabase anon key is fine (it's public by design), service role key never leaves the server/infra layer

### Pulumi (infra/)

- Language: TypeScript
- Backend: GCS bucket (`gs://bradwell-fc-pulumi-state`)
- Stack naming: `bradwell-fc/{env}` e.g. `bradwell-fc/prod`, `bradwell-fc/dev`
- All resources tagged with `project: bradwell-fc` and `env: <stack>`
- GCP project and region configured as stack config, not hardcoded
- Do not use `pulumi up` with `--yes` in CI without explicit approval - always preview first
- Secrets managed via `pulumi config set --secret`, never committed to source

---

## Role Model

Three roles enforced at both the Supabase RLS level and UI routing level:

| Role | Access |
|---|---|
| `public` | Fixtures, results, news, club info |
| `parent` | Above + availability submission, training schedule, documents, gallery |
| `official` | Everything + squad/fixture management, team sheets, admin dashboard |

Roles stored in a `profiles` table linked to `auth.users`. RLS policies reference `auth.uid()` and the `profiles.role` column.

---

## Testing

- New features and non-trivial bug fixes should be test driven where appropriate
- Use Vitest for unit and integration tests (co-located with source files as `*.test.ts` / `*.test.tsx`)
- Use React Testing Library for component tests
- Test custom hooks in isolation using `renderHook`
- Aim to test behaviour, not implementation - test what a component does, not how it does it
- Tests are not optional for: hooks, utility functions in `lib/`, role/access control logic, and any data transformation logic
- Run tests before marking a task complete: `cd app && npm run test`

---

## README

- The README at the root of the project (`README.md`) and the `app/README.md` should be kept up to date
- When adding a new feature, update the relevant README section to reflect it
- When adding new environment variables, update the Environment Variables section
- When adding new commands, update the Key Commands section
- When changing the architecture, update the architecture diagram/description

---

## Do / Don't

### Do
- Write RLS policies for every new table before wiring up the frontend
- Keep infra changes in `infra/` and app changes in `app/` - they are separate concerns
- Use Supabase Realtime for availability updates and live score features
- Prefer Supabase Storage for all file uploads (photos, PDFs)
- Write migrations for every schema change, even in dev
- Write tests for new features before or alongside the implementation
- Update the README when behaviour, setup, or structure changes

### Don't
- Don't add third-party UI libraries without discussing first - we are using a minimal, hand-rolled component set in `src/components/ui/`
- Don't add global state management (Redux, Zustand, etc.) without a clear justification - React Query + local state covers most cases
- Don't bypass RLS by using the service role key on the client
- Don't hardcode GCP project IDs, region, or Supabase URLs - use environment variables and Pulumi config
- Don't run `pulumi destroy` without explicit instruction
- Don't commit `.env` files or any file containing secrets
- Don't skip tests for hooks, utilities, or access control logic

---

## Environment Variables

### app/ (.env.local)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### infra/ (Pulumi config / stack config)
```
gcp:project
gcp:region        # europe-west2
pulumi:backend    # gs://bradwell-fc-pulumi-state
```

---

## Social Media

Current approach is deep-link buttons to native platform admin pages (no API integration). If Meta Graph API integration is added later:
- All API calls go through a Cloud Run service - never expose page access tokens to the frontend
- Tokens stored in GCP Secret Manager, referenced via Pulumi

---

## Key Commands

```bash
# App
cd app && npm run dev          # local dev
cd app && npm run build        # production build
cd app && npm run typecheck    # tsc --noEmit
cd app && npm run test         # run test suite

# Supabase
supabase start                 # local Supabase stack
supabase gen types typescript --local > src/types/supabase.ts

# Infra
cd infra && pulumi preview     # always preview before apply
cd infra && pulumi up          # apply changes
```

---

## Out of Scope (for now)

- Mobile app (PWA capabilities are fine, native app is not in scope)
- Payment processing / membership fees
- Live match tracking beyond manual score entry
- Meta Graph API posting (Phase 2+)
