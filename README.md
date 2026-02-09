# PlacePro- MIT ADT

PlacePro- MIT ADT is a standalone, education-focused Google Forms-like web app built with React, TypeScript, Tailwind CSS, and Supabase.

## Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Routing: React Router
- Data state: TanStack React Query
- Backend: Supabase (Auth + Postgres + RLS)

## Features in V1

- Email/password auth for admins (teachers/coordinators).
- Form management dashboard with status, response count, duplicate, delete.
- Form builder with live preview and field controls:
  - `short_text`, `long_text`, `email`, `number`, `date`, `select`, `checkbox`, `section_title`
- Public form URL (`/f/:slug`) accessible without login.
- Public response submission with validation.
- Admin responses dashboard with detail drawer, filters, and CSV export.
- Education starter templates for first-form setup:
  - Student Application / Feedback
  - Student Placement Coordinator Application

## Project structure

- `database/schema.sql`: Supabase tables, indexes, triggers, and RLS policies.
- `src/`: React app source.

## 1) Supabase setup

1. Create a new Supabase project.
2. Open SQL Editor in Supabase.
3. Run the SQL from `database/schema.sql`.
4. In Supabase project settings, copy:
   - Project URL
   - Anon public key

## 2) Environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3) Run locally

```bash
npm install
npm run dev
```

Open the app at the URL shown by Vite.

## 4) End-to-end usage flow

1. Register at `/auth` with email, password, and full name.
2. Go to `/app/forms`.
3. Create a new form (blank or template).
4. Edit title/fields and set status to `live`.
5. Share public URL `/f/:slug`.
6. Submit from public page as a respondent.
7. Open `/app/forms/:id/responses` to view records.
8. Click `Export CSV` to download response data.

## Notes

- Public form access is enforced by RLS (`is_public = true` and `status = 'live'`).
- Anonymous users can only insert new rows into `form_responses` for valid live/public forms.
- Admins can only access forms/responses they own.
