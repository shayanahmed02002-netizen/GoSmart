-- =============================================================================
-- Pipeline HQ — Supabase schema
-- Run this in your Supabase project's SQL editor (Database → SQL Editor).
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  avatar_color text default '#0EA5A5',
  owner text,
  tags text[] default '{}',
  stage text not null default 'new'
    check (stage in ('new','contacted','qualified','proposal','negotiation','won','lost')),
  source text,
  last_activity text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- deals  (pipeline / kanban)
-- ---------------------------------------------------------------------------
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  contact_name text not null,
  avatar_color text default '#0EA5A5',
  title text not null,
  value numeric(12,2) not null default 0,
  stage text not null default 'new'
    check (stage in ('new','contacted','qualified','proposal','negotiation','won','lost')),
  owner text,
  days_in_stage int default 0,
  close_date timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  contact_name text not null,
  avatar_color text default '#0EA5A5',
  type text,
  date date not null,
  time text,
  owner text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- conversations + messages
-- ---------------------------------------------------------------------------
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  contact_name text not null,
  avatar_color text default '#0EA5A5',
  channel text not null default 'sms' check (channel in ('sms','email','facebook')),
  unread int default 0,
  last_message text,
  last_time text,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  from_role text not null check (from_role in ('contact','agent')),
  text text not null,
  time text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- realtime: stream new/updated messages + conversation rows to the client
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

-- full row data (not just changed columns) on UPDATE/DELETE events
alter table messages replica identity full;
alter table conversations replica identity full;

-- ---------------------------------------------------------------------------
-- marketing: funnels + campaigns
-- ---------------------------------------------------------------------------
create table if not exists funnels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visitors int default 0,
  opt_ins int default 0,
  conversions int default 0,
  status text default 'active' check (status in ('active','paused')),
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'email' check (channel in ('sms','email')),
  sent int default 0,
  opened int default 0,
  clicked int default 0,
  status text default 'draft' check (status in ('draft','scheduled','sent')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- revenue_history — feeds the dashboard's 6-month trend chart
-- ---------------------------------------------------------------------------
create table if not exists revenue_history (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  sort_order int not null,
  revenue numeric(12,2) not null default 0,
  leads int default 0,
  appointments int default 0
);

-- ---------------------------------------------------------------------------
-- workflows  (automation builder)
-- ---------------------------------------------------------------------------
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft' check (status in ('active','paused','draft')),
  trigger jsonb not null default '{}',
  steps jsonb not null default '[]',
  enrolled int default 0,
  completed int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- assignment_rules  (lead assignment)
-- ---------------------------------------------------------------------------
create table if not exists assignment_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  priority int not null default 1,
  conditions jsonb not null default '[]',
  method text not null default 'round_robin'
    check (method in ('round_robin','least_busy','specific_user')),
  assignees text[] default '{}',
  last_assigned_index int default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- team_members  (agency staff — Settings → Team)
-- ---------------------------------------------------------------------------
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  avatar_color text default '#0EA5A5',
  role text not null default 'agent' check (role in ('owner','admin','agent')),
  status text not null default 'invited' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Demo-friendly "allow all" policies so the app works immediately. Tighten
-- these before shipping anything with real customer data — e.g. scope reads
-- to auth.uid() = owner_id once you add per-user ownership, and restrict
-- writes to authenticated users only.
-- ---------------------------------------------------------------------------
alter table contacts enable row level security;
alter table deals enable row level security;
alter table appointments enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table funnels enable row level security;
alter table campaigns enable row level security;
alter table revenue_history enable row level security;
alter table workflows enable row level security;
alter table assignment_rules enable row level security;
alter table team_members enable row level security;

create policy "public read/write — contacts" on contacts for all using (true) with check (true);
create policy "public read/write — deals" on deals for all using (true) with check (true);
create policy "public read/write — appointments" on appointments for all using (true) with check (true);
create policy "public read/write — conversations" on conversations for all using (true) with check (true);
create policy "public read/write — messages" on messages for all using (true) with check (true);
create policy "public read/write — funnels" on funnels for all using (true) with check (true);
create policy "public read/write — campaigns" on campaigns for all using (true) with check (true);
create policy "public read/write — revenue_history" on revenue_history for all using (true) with check (true);
create policy "public read/write — workflows" on workflows for all using (true) with check (true);
create policy "public read/write — assignment_rules" on assignment_rules for all using (true) with check (true);
create policy "public read/write — team_members" on team_members for all using (true) with check (true);

-- =============================================================================
-- Seed data — enough to populate every module out of the box
-- =============================================================================

insert into contacts (name, email, phone, avatar_color, owner, tags, stage, source, last_activity) values
  ('Ava Bennett',   'ava.bennett@example.com',   '(300) 555-0110', '#0EA5A5', 'Maria Chen',   '{Hot Lead,Referral}',  'new',         'Facebook Ad',  '2h ago'),
  ('Liam Osei',     'liam.osei@example.com',     '(301) 555-0111', '#6D5EF5', 'James Okafor', '{Webinar}',            'contacted',   'Google',       '5h ago'),
  ('Noah Nakamura', 'noah.nakamura@example.com', '(302) 555-0112', '#F5A623', 'Priya Patel',  '{Facebook Ad,VIP}',    'qualified',   'Referral',     '1h ago'),
  ('Emma Fischer',  'emma.fischer@example.com',  '(303) 555-0113', '#EF5A6F', 'Tom Reyes',    '{Follow-up}',          'proposal',    'Website Form', '8h ago'),
  ('Sofia Romero',  'sofia.romero@example.com',  '(304) 555-0114', '#2F86EB', 'Maria Chen',   '{Local,VIP}',          'negotiation', 'Walk-in',      '3h ago'),
  ('Mateo Kowalski','mateo.kowalski@example.com','(305) 555-0115', '#0EA5A5', 'James Okafor', '{Hot Lead}',           'won',         'Facebook Ad',  '1d ago'),
  ('Zoe Singh',     'zoe.singh@example.com',     '(306) 555-0116', '#6D5EF5', 'Priya Patel',  '{Referral,Follow-up}', 'new',         'Google',       '4h ago'),
  ('Ethan Dubois',  'ethan.dubois@example.com',  '(307) 555-0117', '#F5A623', 'Tom Reyes',    '{Webinar}',            'contacted',   'Referral',     '6h ago')
on conflict do nothing;

insert into deals (contact_name, avatar_color, title, value, stage, owner, days_in_stage, close_date)
select name, avatar_color, name || ' — CRM Setup', (1000 + (random() * 6000)::int), stage, owner, (random() * 8)::int, now() + ((random() * 20 - 5) || ' days')::interval
from contacts where stage <> 'lost'
on conflict do nothing;

insert into appointments (contact_name, avatar_color, type, date, time, owner)
select name, avatar_color,
  (array['Discovery Call','Onboarding','Walkthrough','Consultation','Follow-up'])[1 + (random()*4)::int],
  (current_date + ((random()*10)::int - 2)),
  (8 + (random()*8)::int) || ':' || (case when random() > 0.5 then '00' else '30' end),
  owner
from contacts
limit 6
on conflict do nothing;

insert into conversations (contact_name, avatar_color, channel, unread, last_message, last_time)
select name, avatar_color, (array['sms','email','facebook'])[1 + (random()*2)::int],
  (random()*2)::int, 'Hi, I saw your ad — do you still have availability this week?', '9:15 AM'
from contacts
limit 5
on conflict do nothing;

insert into funnels (name, visitors, opt_ins, conversions, status) values
  ('Free Consultation Funnel', 4820, 1330, 214, 'active'),
  ('Webinar Registration', 3110, 1470, 302, 'active'),
  ('Local Service Landing Page', 2260, 640, 98, 'paused'),
  ('Lead Magnet — Pricing Guide', 5590, 2110, 411, 'active')
on conflict do nothing;

insert into campaigns (name, channel, sent, opened, clicked, status) values
  ('Spring Promo — SMS Blast', 'sms', 1820, 1620, 410, 'sent'),
  ('Monthly Newsletter', 'email', 3220, 1890, 512, 'sent'),
  ('Re-engagement Drip — Step 2', 'email', 640, 298, 77, 'scheduled'),
  ('Review Request Follow-up', 'sms', 960, 900, 340, 'sent'),
  ('Holiday Hours Announcement', 'email', 3220, 1210, 140, 'draft')
on conflict do nothing;

insert into revenue_history (month, sort_order, revenue, leads, appointments) values
  ('Mar', 1, 9800, 46, 21),
  ('Apr', 2, 11200, 52, 24),
  ('May', 3, 10650, 58, 27),
  ('Jun', 4, 13400, 64, 30),
  ('Jul', 5, 12900, 70, 33),
  ('Aug', 6, 15600, 76, 36)
on conflict do nothing;

insert into team_members (name, email, phone, avatar_color, role, status) values
  ('Maria Chen',   'maria@pipelinehq.demo',   '(300) 555-0101', '#0EA5A5', 'owner', 'active'),
  ('James Okafor', 'james@pipelinehq.demo',   '(300) 555-0102', '#6D5EF5', 'admin', 'active'),
  ('Priya Patel',  'priya@pipelinehq.demo',   '(300) 555-0103', '#F5A623', 'agent', 'active'),
  ('Tom Reyes',    'tom@pipelinehq.demo',     '(300) 555-0104', '#EF5A6F', 'agent', 'invited')
on conflict (email) do nothing;
-- STEP 1: paste this near the bottom of your table definitions,
-- right before the '-- Row Level Security' section

-- ---------------------------------------------------------------------------
-- workflows  (automation builder)
-- ---------------------------------------------------------------------------
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft' check (status in ('active','paused','draft')),
  trigger jsonb not null default '{}',
  steps jsonb not null default '[]',
  enrolled int default 0,
  completed int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- assignment_rules  (lead assignment)
-- ---------------------------------------------------------------------------
create table if not exists assignment_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  priority int not null default 1,
  conditions jsonb not null default '[]',
  method text not null default 'round_robin'
    check (method in ('round_robin','least_busy','specific_user')),
  assignees text[] default '{}',
  last_assigned_index int default 0,
  created_at timestamptz not null default now()
);

-- STEP 2: add these two lines next to your other `enable row level security` lines

alter table workflows enable row level security;
alter table assignment_rules enable row level security;

-- STEP 3: add these two lines next to your other `create policy` lines

create policy "public read/write — workflows" on workflows for all using (true) with check (true);
create policy "public read/write — assignment_rules" on assignment_rules for all using (true) with check (true); 