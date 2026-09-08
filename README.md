# Pipeline HQ — CRM Dashboard

A GoHighLevel-style all-in-one dashboard built with React, Vite, Tailwind CSS,
Recharts and Lucide icons.

## Modules

- **Dashboard** — stat cards, revenue/leads trend, pipeline-by-stage breakdown, activity feed
- **CRM** — searchable/filterable contacts table with a detail slide-over, and a
  drag-and-drop deal pipeline (Kanban) across 6 stages
- **Calendar** — month grid with appointment indicators, day drill-down, upcoming list
- **Conversations** — threaded inbox (SMS / Email / Facebook) with a live-feeling composer
- **Marketing** — funnels, campaigns table, and conversion analytics

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

```bash
npm run build     # production build to /dist
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  services/
    dataService.js          # all data access — mock now, API-ready later
  components/
    ui/                      # Avatar, Badge, Card, Skeleton, SlideOver, EmptyState, PrimaryButton
    layout/
      Sidebar.jsx
      Topbar.jsx
    dashboard/
      DashboardView.jsx
      StatCard.jsx
    crm/
      CrmView.jsx            # tabs between the two views below
      ContactsTable.jsx
      ContactDetail.jsx
      PipelineBoard.jsx      # drag-and-drop kanban
      DealCard.jsx
    calendar/
      CalendarView.jsx
    conversations/
      ConversationsView.jsx
    marketing/
      MarketingView.jsx      # tabs between the three panels below
      FunnelsPanel.jsx
      CampaignsPanel.jsx
      MarketingAnalytics.jsx
  App.jsx                    # composition root — sidebar/topbar + page router
  main.jsx                   # React entry point
  index.css                  # Tailwind directives + base styles
tailwind.config.js            # design tokens (colors, type scale)
```

One component per file. Each module folder groups a page-level `*View.jsx` with
the smaller pieces it's built from.

## Connect Supabase

The app runs on mock data out of the box. To back it with a real Supabase
database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in the Supabase dashboard, paste in `supabase/schema.sql`
   from this repo, and run it. That creates every table (`contacts`, `deals`,
   `appointments`, `conversations`, `messages`, `funnels`, `campaigns`,
   `revenue_history`), enables Row Level Security with permissive demo
   policies, and seeds enough rows to populate every module.
3. Copy `.env.example` to `.env` and fill in your project's URL and anon key
   (Project Settings → API in the Supabase dashboard):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. `npm install && npm run dev`. The app detects the env vars automatically
   and switches from mock data to live Supabase queries — no other code
   changes needed.

Leave `.env` unset (or delete it) and the app falls back to mock data again.

**Before shipping this with real customer data:** the seed policies in
`schema.sql` allow anyone with the anon key to read and write every row.
Add authentication and scope the RLS policies to the signed-in user (e.g. an
`owner_id uuid references auth.users` column + a policy comparing it to
`auth.uid()`) before this goes further than a demo.

### How the data layer is wired

Everything the UI reads or writes goes through `src/services/dataService.js`.
Each exported function (`getContacts`, `getDeals`, `updateDealStage`,
`getAppointments`, `getConversations`, `sendMessage`, `getFunnels`,
`getCampaigns`, `getStats`) checks `src/services/supabaseClient.js` — if a
Supabase client was created (env vars present), it queries Supabase and maps
the snake_case rows to the camelCase shape components expect; otherwise it
falls back to the in-memory mock store. Component code never needs to know
which one is active.

## Design tokens

Defined in `tailwind.config.js`:

- `primary` — teal `#0EA5A5`, used for the core brand actions and active states
- `accent` — violet `#6D5EF5`, used for the pipeline chart and highlights
- `warn` / `danger` / `won` — status colors for stages, badges, and campaign states
- Type: **Plus Jakarta Sans** (display/numbers) + **Inter** (body/data)

## Notes

- The Kanban board uses native HTML5 drag-and-drop — no extra dependency.
- The calendar grid is hand-built (no calendar library) to keep the bundle light.
- All async calls include a small artificial delay in mock mode so loading
  states (skeletons) are visible and testable before a real API exists.
