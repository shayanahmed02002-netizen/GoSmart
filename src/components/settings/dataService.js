/**
 * dataService.js
 * ---------------------------------------------------------------------------
 * Every read/write in the app goes through this file. If Supabase env vars
 * are set (see .env.example), every function below hits the real database
 * using the schema in supabase/schema.sql. If not, it falls back to the
 * in-memory MOCK store automatically — no code changes needed either way.
 * ---------------------------------------------------------------------------
 */

import { supabase } from './supabaseClient'

const DELAY = 260
const wait = (ms = DELAY) => new Promise((res) => setTimeout(res, ms))
const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export const STAGES = [
  { id: 'new', label: 'New Lead', color: '#6D5EF5' },
  { id: 'contacted', label: 'Contacted', color: '#0EA5A5' },
  { id: 'qualified', label: 'Qualified', color: '#2F86EB' },
  { id: 'proposal', label: 'Proposal Sent', color: '#F5A623' },
  { id: 'negotiation', label: 'Negotiation', color: '#EF8C3C' },
  { id: 'won', label: 'Won', color: '#22A87A' },
  { id: 'lost', label: 'Lost', color: '#EF5A6F' },
]

const OWNERS = ['Maria Chen', 'James Okafor', 'Priya Patel', 'Tom Reyes']
const TAG_POOL = ['Hot Lead', 'Referral', 'Webinar', 'Facebook Ad', 'VIP', 'Follow-up', 'Local']

export const TRIGGER_TYPES = [
  { id: 'new_lead', label: 'New Lead Created', description: 'Fires when a contact enters the CRM' },
  { id: 'stage_changed', label: 'Deal Stage Changed', description: 'Fires when a deal moves into a chosen stage' },
  { id: 'form_submitted', label: 'Form Submitted', description: 'Fires when a lead fills out a funnel form' },
  { id: 'appointment_booked', label: 'Appointment Booked', description: 'Fires when a contact books a calendar slot' },
  { id: 'tag_added', label: 'Tag Added', description: 'Fires when a tag is applied to a contact' },
]

export const ACTION_TYPES = [
  { id: 'send_email', label: 'Send Email', icon: 'Mail', color: '#2F86EB' },
  { id: 'send_sms', label: 'Send SMS', icon: 'MessageSquare', color: '#0EA5A5' },
  { id: 'wait', label: 'Wait', icon: 'Clock', color: '#5B6270' },
  { id: 'add_tag', label: 'Add Tag', icon: 'Tag', color: '#6D5EF5' },
  { id: 'assign_owner', label: 'Assign Owner', icon: 'UserCheck', color: '#22A87A' },
  { id: 'move_stage', label: 'Move Pipeline Stage', icon: 'ArrowRightLeft', color: '#F5A623' },
  { id: 'create_task', label: 'Create Task', icon: 'CheckSquare', color: '#EF8C3C' },
  { id: 'notify_team', label: 'Notify Team', icon: 'Bell', color: '#EF5A6F' },
]

export const ASSIGNMENT_METHODS = [
  { id: 'round_robin', label: 'Round Robin', description: 'Distributes new leads evenly, one after another' },
  { id: 'least_busy', label: 'Least Busy', description: 'Assigns to whoever currently has the fewest open deals' },
  { id: 'specific_user', label: 'Specific User', description: 'Always assigns to one chosen team member' },
]

export const TEAM_ROLES = [
  { id: 'owner', label: 'Owner', description: 'Full access, including billing and removing other admins' },
  { id: 'admin', label: 'Admin', description: 'Manages the team, settings, and all workspace data' },
  { id: 'agent', label: 'Agent', description: 'Works contacts and deals assigned to them' },
]

export const CONDITION_FIELDS = [
  { id: 'source', label: 'Lead Source', values: ['Facebook Ad', 'Google', 'Referral', 'Website Form', 'Walk-in'] },
  { id: 'tag', label: 'Tag', values: TAG_POOL },
  { id: 'stage', label: 'Pipeline Stage', values: STAGES.map((s) => s.label) },
]

// ---------------------------------------------------------------------------
// Supabase row → UI shape mappers (DB is snake_case, UI expects camelCase)
// ---------------------------------------------------------------------------

const mapContact = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  avatarColor: r.avatar_color,
  owner: r.owner,
  tags: r.tags || [],
  stage: r.stage,
  source: r.source,
  lastActivity: r.last_activity,
  createdAt: r.created_at,
})

const mapDeal = (r) => ({
  id: r.id,
  contactId: r.contact_id,
  contactName: r.contact_name,
  avatarColor: r.avatar_color,
  title: r.title,
  value: Number(r.value),
  stage: r.stage,
  owner: r.owner,
  daysInStage: r.days_in_stage,
  closeDate: r.close_date,
})

const mapAppointment = (r) => ({
  id: r.id,
  contactId: r.contact_id,
  contactName: r.contact_name,
  avatarColor: r.avatar_color,
  type: r.type,
  date: r.date,
  time: r.time,
  owner: r.owner,
})

const mapMessage = (r) => ({ id: r.id, from: r.from_role, text: r.text, time: r.time, createdAt: r.created_at })

const mapConversation = (r) => {
  const messages = (r.messages || [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(mapMessage)
  return {
    id: r.id,
    contactId: r.contact_id,
    contactName: r.contact_name,
    avatarColor: r.avatar_color,
    channel: r.channel,
    unread: r.unread,
    lastMessage: r.last_message,
    lastTime: r.last_time,
    messages,
  }
}

const mapFunnel = (r) => ({
  id: r.id, name: r.name, visitors: r.visitors, optIns: r.opt_ins, conversions: r.conversions, status: r.status,
})

const mapCampaign = (r) => ({
  id: r.id, name: r.name, channel: r.channel, sent: r.sent, opened: r.opened, clicked: r.clicked, status: r.status,
})

const mapWorkflow = (r) => ({
  id: r.id,
  name: r.name,
  status: r.status,
  trigger: r.trigger || { type: 'new_lead', config: {} },
  steps: r.steps || [],
  enrolled: r.enrolled || 0,
  completed: r.completed || 0,
  updatedAt: r.updated_at,
})

const mapAssignmentRule = (r) => ({
  id: r.id,
  name: r.name,
  active: r.active,
  priority: r.priority,
  conditions: r.conditions || [],
  method: r.method,
  assignees: r.assignees || [],
  lastAssignedIndex: r.last_assigned_index || 0,
})

const mapTeamMember = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  avatarColor: r.avatar_color,
  role: r.role,
  status: r.status,
  createdAt: r.created_at,
})

function throwIfError(error) {
  if (error) throw new Error(error.message || 'Supabase request failed')
}

// ---------------------------------------------------------------------------
// Mock data (used automatically when Supabase isn't configured)
// ---------------------------------------------------------------------------

const FIRST = ['Ava', 'Liam', 'Noah', 'Emma', 'Sofia', 'Mateo', 'Zoe', 'Ethan', 'Grace', 'Ibrahim', 'Lena', 'Kai', 'Ruby', 'Owen', 'Nadia', 'Leo']
const LAST = ['Bennett', 'Osei', 'Nakamura', 'Fischer', 'Romero', 'Kowalski', 'Singh', 'Dubois', 'Hartman', 'Alvarez', 'Novak', 'Petrov']

function seedContacts(count = 16) {
  return Array.from({ length: count }).map((_, i) => {
    const first = FIRST[i % FIRST.length]
    const last = LAST[(i * 3) % LAST.length]
    const stage = STAGES[Math.min(i % (STAGES.length - 1), STAGES.length - 2)].id
    const tagCount = 1 + (i % 3)
    return {
      id: uid('ct'),
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone: `(${300 + i}) 555-01${(10 + i).toString().slice(-2)}`,
      avatarColor: ['#0EA5A5', '#6D5EF5', '#F5A623', '#EF5A6F', '#2F86EB'][i % 5],
      owner: OWNERS[i % OWNERS.length],
      tags: Array.from({ length: tagCount }).map((__, t) => TAG_POOL[(i + t) % TAG_POOL.length]),
      stage,
      source: ['Facebook Ad', 'Google', 'Referral', 'Website Form', 'Walk-in'][i % 5],
      lastActivity: `${(i % 12) + 1}h ago`,
      createdAt: new Date(Date.now() - i * 86400000 * 1.6).toISOString(),
    }
  })
}

const MOCK_CONTACTS = seedContacts(16)

function seedDeals() {
  const values = [1200, 2400, 800, 5200, 1900, 3300, 640, 7800, 2100, 4600, 990, 3050, 1550, 6200, 2750, 1100]
  return MOCK_CONTACTS.filter((c) => c.stage !== 'lost').map((c, i) => ({
    id: uid('dl'),
    contactId: c.id,
    contactName: c.name,
    avatarColor: c.avatarColor,
    title: `${c.name.split(' ')[0]} — ${['Website Package', 'CRM Setup', 'Ad Management', 'Consulting Retainer', 'Funnel Build'][i % 5]}`,
    value: values[i % values.length],
    stage: c.stage,
    owner: c.owner,
    daysInStage: (i % 9) + 1,
    closeDate: new Date(Date.now() + ((i % 20) - 5) * 86400000).toISOString(),
  }))
}

let MOCK_DEALS = seedDeals()

function monthLabel(offset) {
  const d = new Date()
  d.setMonth(d.getMonth() - offset)
  return d.toLocaleString('en-US', { month: 'short' })
}

const MOCK_STATS_HISTORY = Array.from({ length: 6 }).map((_, i) => {
  const idx = 5 - i
  return {
    month: monthLabel(idx),
    revenue: Math.round(9000 + Math.sin(idx) * 2000 + idx * 900 + (idx % 2) * 1400),
    leads: 40 + idx * 6 + (idx % 3) * 5,
    appointments: 18 + idx * 3,
  }
})

const CHANNEL = ['sms', 'email', 'facebook']
const MOCK_CONVERSATIONS = MOCK_CONTACTS.slice(0, 8).map((c, i) => {
  const channel = CHANNEL[i % CHANNEL.length]
  const messages = [
    { id: uid('msg'), from: 'contact', text: sampleInbound(i), time: '9:1' + i + ' AM' },
    { id: uid('msg'), from: 'agent', text: sampleOutbound(i), time: '9:2' + i + ' AM' },
  ]
  if (i % 2 === 0) {
    messages.push({ id: uid('msg'), from: 'contact', text: 'Sounds good, thank you!', time: '9:3' + i + ' AM' })
  }
  return {
    id: uid('cv'),
    contactId: c.id,
    contactName: c.name,
    avatarColor: c.avatarColor,
    channel,
    unread: i % 3 === 0 ? (i % 2) + 1 : 0,
    lastMessage: messages[messages.length - 1].text,
    lastTime: messages[messages.length - 1].time,
    messages,
  }
})

function sampleInbound(i) {
  const arr = [
    'Hi, I saw your ad — do you still have availability this week?',
    'Can you resend the proposal? I lost the last email.',
    'What time works for the walkthrough on Thursday?',
    'Thanks for the quote, I need to check with my partner first.',
    'Is the onboarding call still on for tomorrow?',
  ]
  return arr[i % arr.length]
}
function sampleOutbound(i) {
  const arr = [
    'Yes! I have a 2pm and a 4:30pm open — which works better?',
    'Just resent it to this email, let me know if it comes through.',
    'Thursday at 11am works great on our end.',
    'No problem at all, happy to answer any questions in the meantime.',
    'Yep, confirmed for 10am tomorrow — see you then!',
  ]
  return arr[i % arr.length]
}

function seedAppointments() {
  const types = ['Discovery Call', 'Onboarding', 'Walkthrough', 'Consultation', 'Follow-up']
  return MOCK_CONTACTS.slice(0, 10).map((c, i) => {
    const day = new Date()
    day.setDate(day.getDate() + (i % 10) - 2)
    return {
      id: uid('ap'),
      contactId: c.id,
      contactName: c.name,
      avatarColor: c.avatarColor,
      type: types[i % types.length],
      date: day.toISOString().slice(0, 10),
      time: `${9 + (i % 8)}:${i % 2 === 0 ? '00' : '30'}`,
      owner: c.owner,
    }
  })
}
const MOCK_APPOINTMENTS = seedAppointments()

const MOCK_FUNNELS = [
  { id: uid('fn'), name: 'Free Consultation Funnel', visitors: 4820, optIns: 1330, conversions: 214, status: 'active' },
  { id: uid('fn'), name: 'Webinar Registration', visitors: 3110, optIns: 1470, conversions: 302, status: 'active' },
  { id: uid('fn'), name: 'Local Service Landing Page', visitors: 2260, optIns: 640, conversions: 98, status: 'paused' },
  { id: uid('fn'), name: 'Lead Magnet — Pricing Guide', visitors: 5590, optIns: 2110, conversions: 411, status: 'active' },
]

const MOCK_CAMPAIGNS = [
  { id: uid('cp'), name: 'Spring Promo — SMS Blast', channel: 'sms', sent: 1820, opened: 1620, clicked: 410, status: 'sent' },
  { id: uid('cp'), name: 'Monthly Newsletter', channel: 'email', sent: 3220, opened: 1890, clicked: 512, status: 'sent' },
  { id: uid('cp'), name: 'Re-engagement Drip — Step 2', channel: 'email', sent: 640, opened: 298, clicked: 77, status: 'scheduled' },
  { id: uid('cp'), name: 'Review Request Follow-up', channel: 'sms', sent: 960, opened: 900, clicked: 340, status: 'sent' },
  { id: uid('cp'), name: 'Holiday Hours Announcement', channel: 'email', sent: 3220, opened: 1210, clicked: 140, status: 'draft' },
]

let MOCK_WORKFLOWS = [
  {
    id: uid('wf'),
    name: 'New Lead Welcome Sequence',
    status: 'active',
    trigger: { type: 'new_lead', config: {} },
    steps: [
      { id: uid('st'), type: 'send_sms', config: { message: 'Hey {{first_name}}, thanks for reaching out — we got your info and will follow up shortly!' } },
      { id: uid('st'), type: 'wait', config: { duration: 1, unit: 'hours' } },
      { id: uid('st'), type: 'send_email', config: { subject: 'Welcome to Pipeline HQ', body: 'Here is what happens next...' } },
      { id: uid('st'), type: 'add_tag', config: { tag: 'Hot Lead' } },
    ],
    enrolled: 342,
    completed: 298,
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: uid('wf'),
    name: 'Proposal Sent Follow-up',
    status: 'active',
    trigger: { type: 'stage_changed', config: { stage: 'proposal' } },
    steps: [
      { id: uid('st'), type: 'wait', config: { duration: 2, unit: 'days' } },
      { id: uid('st'), type: 'send_email', config: { subject: 'Just checking in', body: 'Did you have a chance to review the proposal?' } },
      { id: uid('st'), type: 'create_task', config: { task: 'Call to follow up on proposal' } },
    ],
    enrolled: 128,
    completed: 91,
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: uid('wf'),
    name: 'Missed Appointment Recovery',
    status: 'paused',
    trigger: { type: 'appointment_booked', config: {} },
    steps: [
      { id: uid('st'), type: 'wait', config: { duration: 30, unit: 'minutes' } },
      { id: uid('st'), type: 'send_sms', config: { message: 'Sorry we missed you! Want to grab a new time?' } },
      { id: uid('st'), type: 'notify_team', config: { message: 'Lead missed their appointment' } },
    ],
    enrolled: 54,
    completed: 40,
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: uid('wf'),
    name: 'Webinar Signup Nurture',
    status: 'draft',
    trigger: { type: 'form_submitted', config: {} },
    steps: [
      { id: uid('st'), type: 'send_email', config: { subject: 'You\u2019re registered!', body: 'See you at the webinar.' } },
      { id: uid('st'), type: 'wait', config: { duration: 1, unit: 'days' } },
      { id: uid('st'), type: 'send_sms', config: { message: 'Reminder: the webinar starts tomorrow at 2pm.' } },
    ],
    enrolled: 0,
    completed: 0,
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
]

let MOCK_ASSIGNMENT_RULES = [
  {
    id: uid('ar'),
    name: 'Facebook Ads \u2192 Sales Pod A',
    active: true,
    priority: 1,
    conditions: [{ field: 'source', op: 'equals', value: 'Facebook Ad' }],
    method: 'round_robin',
    assignees: ['Maria Chen', 'James Okafor', 'Priya Patel'],
    lastAssignedIndex: 1,
  },
  {
    id: uid('ar'),
    name: 'VIP Tag \u2192 Maria Directly',
    active: true,
    priority: 2,
    conditions: [{ field: 'tag', op: 'equals', value: 'VIP' }],
    method: 'specific_user',
    assignees: ['Maria Chen'],
    lastAssignedIndex: 0,
  },
  {
    id: uid('ar'),
    name: 'Referrals \u2192 Least Busy Rep',
    active: true,
    priority: 3,
    conditions: [{ field: 'source', op: 'equals', value: 'Referral' }],
    method: 'least_busy',
    assignees: ['James Okafor', 'Priya Patel', 'Tom Reyes'],
    lastAssignedIndex: 0,
  },
  {
    id: uid('ar'),
    name: 'Website Form \u2192 Round Robin (All Reps)',
    active: false,
    priority: 4,
    conditions: [{ field: 'source', op: 'equals', value: 'Website Form' }],
    method: 'round_robin',
    assignees: OWNERS,
    lastAssignedIndex: 2,
  },
]

let MOCK_TEAM_MEMBERS = [
  { id: uid('tm'), name: 'Maria Chen', email: 'maria@pipelinehq.demo', phone: '(300) 555-0101', avatarColor: '#0EA5A5', role: 'owner', status: 'active', createdAt: new Date(Date.now() - 200 * 86400000).toISOString() },
  { id: uid('tm'), name: 'James Okafor', email: 'james@pipelinehq.demo', phone: '(300) 555-0102', avatarColor: '#6D5EF5', role: 'admin', status: 'active', createdAt: new Date(Date.now() - 140 * 86400000).toISOString() },
  { id: uid('tm'), name: 'Priya Patel', email: 'priya@pipelinehq.demo', phone: '(300) 555-0103', avatarColor: '#F5A623', role: 'agent', status: 'active', createdAt: new Date(Date.now() - 80 * 86400000).toISOString() },
  { id: uid('tm'), name: 'Tom Reyes', email: 'tom@pipelinehq.demo', phone: '(300) 555-0104', avatarColor: '#EF5A6F', role: 'agent', status: 'invited', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const dataService = {
  async getStats() {
    if (supabase) {
      const [{ data: deals, error: e1 }, { data: appts, error: e2 }, { data: contactRows, error: e3 }, { data: history, error: e4 }] =
        await Promise.all([
          supabase.from('deals').select('*'),
          supabase.from('appointments').select('date'),
          supabase.from('contacts').select('id'),
          supabase.from('revenue_history').select('*').order('sort_order'),
        ])
      throwIfError(e1); throwIfError(e2); throwIfError(e3); throwIfError(e4)

      const mappedDeals = deals.map(mapDeal)
      const openDeals = mappedDeals.filter((d) => !['won', 'lost'].includes(d.stage))
      const wonDeals = mappedDeals.filter((d) => d.stage === 'won')
      const now = new Date()
      const weekMs = 7 * 86400000
      return {
        totalContacts: contactRows.length,
        contactsDeltaPct: 8.4,
        openPipelineValue: openDeals.reduce((s, d) => s + d.value, 0),
        openPipelineDeltaPct: 12.1,
        appointmentsThisWeek: appts.filter((a) => Math.abs(new Date(a.date) - now) < weekMs).length,
        appointmentsDeltaPct: -3.2,
        conversionRate: Math.round((wonDeals.length / Math.max(mappedDeals.length, 1)) * 1000) / 10,
        conversionDeltaPct: 2.6,
        history: history.map((h) => ({ month: h.month, revenue: Number(h.revenue), leads: h.leads, appointments: h.appointments })),
        stageBreakdown: STAGES.filter((s) => s.id !== 'lost').map((s) => ({
          stage: s.label,
          color: s.color,
          count: mappedDeals.filter((d) => d.stage === s.id).length,
        })),
      }
    }

    await wait()
    const openDeals = MOCK_DEALS.filter((d) => !['won', 'lost'].includes(d.stage))
    const wonDeals = MOCK_DEALS.filter((d) => d.stage === 'won')
    return {
      totalContacts: MOCK_CONTACTS.length,
      contactsDeltaPct: 8.4,
      openPipelineValue: openDeals.reduce((s, d) => s + d.value, 0),
      openPipelineDeltaPct: 12.1,
      appointmentsThisWeek: MOCK_APPOINTMENTS.filter((a) => {
        const d = new Date(a.date)
        const now = new Date()
        const weekMs = 7 * 86400000
        return Math.abs(d - now) < weekMs
      }).length,
      appointmentsDeltaPct: -3.2,
      conversionRate: Math.round((wonDeals.length / Math.max(MOCK_DEALS.length, 1)) * 1000) / 10,
      conversionDeltaPct: 2.6,
      history: MOCK_STATS_HISTORY,
      stageBreakdown: STAGES.filter((s) => s.id !== 'lost').map((s) => ({
        stage: s.label,
        color: s.color,
        count: MOCK_DEALS.filter((d) => d.stage === s.id).length,
      })),
    }
  },

  async getContacts({ search = '', stage = 'all' } = {}) {
    if (supabase) {
      let query = supabase.from('contacts').select('*')
      if (stage !== 'all') query = query.eq('stage', stage)
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      const { data, error } = await query.order('created_at', { ascending: false })
      throwIfError(error)
      return data.map(mapContact)
    }

    await wait()
    return MOCK_CONTACTS.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      const matchesStage = stage === 'all' || c.stage === stage
      return matchesSearch && matchesStage
    })
  },

  // Bulk-imports contacts parsed from a spreadsheet (see ImportContacts.jsx).
  // `rows` is an array of { name, email, phone, owner, tags, stage, source }
  // already mapped from the sheet's columns. Rows missing a name are the
  // caller's responsibility to filter out before calling this.
  //
  // De-dupes against existing contacts by email (case-insensitive) so
  // re-uploading the same sheet, or one with overlapping rows, doesn't create
  // duplicate contacts — matching how GoHighLevel's importer skips existing
  // matches rather than erroring the whole batch out.
  //
  // Returns { imported, skipped, errors } — a per-batch summary, not per-row,
  // to keep this cheap for large sheets.
  async importContacts(rows) {
    const clean = rows
      .filter((r) => r.name && r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        email: (r.email || '').trim() || null,
        phone: (r.phone || '').trim() || null,
        owner: (r.owner || '').trim() || null,
        tags: Array.isArray(r.tags) ? r.tags : (r.tags ? String(r.tags).split(',').map((t) => t.trim()).filter(Boolean) : []),
        stage: STAGES.some((s) => s.id === r.stage) ? r.stage : 'new',
        source: (r.source || 'Import').trim(),
        avatar_color: ['#0EA5A5', '#6D5EF5', '#F5A623', '#EF5A6F', '#2F86EB'][Math.floor(Math.random() * 5)],
        last_activity: 'Just imported',
      }))

    if (supabase) {
      const { data: existing, error: fetchError } = await supabase.from('contacts').select('email')
      throwIfError(fetchError)
      const existingEmails = new Set((existing || []).map((e) => (e.email || '').toLowerCase()).filter(Boolean))

      const seen = new Set()
      const toInsert = []
      let skipped = 0
      for (const row of clean) {
        const key = row.email ? row.email.toLowerCase() : null
        if (key && (existingEmails.has(key) || seen.has(key))) {
          skipped++
          continue
        }
        if (key) seen.add(key)
        toInsert.push(row)
      }

      const errors = []
      const CHUNK = 500
      let imported = 0
      for (let i = 0; i < toInsert.length; i += CHUNK) {
        const chunk = toInsert.slice(i, i + CHUNK)
        const { error } = await supabase.from('contacts').insert(chunk)
        if (error) errors.push(error.message)
        else imported += chunk.length
      }

      return { imported, skipped, errors }
    }

    await wait(400)
    const existingEmails = new Set(MOCK_CONTACTS.map((c) => (c.email || '').toLowerCase()).filter(Boolean))
    const seen = new Set()
    let imported = 0
    let skipped = 0
    for (const row of clean) {
      const key = row.email ? row.email.toLowerCase() : null
      if (key && (existingEmails.has(key) || seen.has(key))) {
        skipped++
        continue
      }
      if (key) seen.add(key)
      MOCK_CONTACTS.unshift(mapContact({
        id: uid('ct'),
        ...row,
        created_at: new Date().toISOString(),
      }))
      imported++
    }
    return { imported, skipped, errors: [] }
  },

  async getDeals() {
    if (supabase) {
      const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false })
      throwIfError(error)
      return data.map(mapDeal)
    }
    await wait()
    return MOCK_DEALS
  },

  async updateDealStage(dealId, newStage) {
    if (supabase) {
      const { data, error } = await supabase
        .from('deals')
        .update({ stage: newStage, days_in_stage: 0 })
        .eq('id', dealId)
        .select()
        .single()
      throwIfError(error)
      return mapDeal(data)
    }
    await wait(120)
    MOCK_DEALS = MOCK_DEALS.map((d) => (d.id === dealId ? { ...d, stage: newStage, daysInStage: 0 } : d))
    return MOCK_DEALS.find((d) => d.id === dealId)
  },

  async getAppointments() {
    if (supabase) {
      const { data, error } = await supabase.from('appointments').select('*').order('date')
      throwIfError(error)
      return data.map(mapAppointment)
    }
    await wait()
    return MOCK_APPOINTMENTS
  },

  async getConversations() {
    if (supabase) {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .order('created_at', { ascending: false })
      throwIfError(error)
      return data.map(mapConversation)
    }
    await wait()
    return MOCK_CONVERSATIONS
  },

  async sendMessage(conversationId, text) {
    if (supabase) {
      const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      const { data: msg, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, from_role: 'agent', text, time })
        .select()
        .single()
      throwIfError(error)
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message: text, last_time: time })
        .eq('id', conversationId)
      throwIfError(updateError)
      return mapMessage(msg)
    }
    await wait(150)
    const convo = MOCK_CONVERSATIONS.find((c) => c.id === conversationId)
    const msg = { id: uid('msg'), from: 'agent', text, time: 'now' }
    if (convo) {
      convo.messages.push(msg)
      convo.lastMessage = text
      convo.lastTime = 'now'
    }
    return msg
  },

  // Subscribes to live updates for a single conversation: new inbound/outbound
  // messages, and unread/last-message changes on the conversation row itself
  // (e.g. if another agent or an automation updates it). Returns an unsubscribe
  // function — call it on unmount / when switching conversations. No-op (with
  // a warning) if Supabase isn't configured, so callers don't need to branch.
  subscribeToConversation(conversationId, { onMessage, onConversationUpdate } = {}) {
    if (!supabase) {
      console.warn('[dataService] subscribeToConversation: Supabase not configured, skipping realtime.')
      return () => { }
    }

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => onMessage?.(mapMessage(payload.new))
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}` },
        (payload) => onConversationUpdate?.({
          id: payload.new.id,
          unread: payload.new.unread,
          lastMessage: payload.new.last_message,
          lastTime: payload.new.last_time,
        })
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  },

  async getFunnels() {
    if (supabase) {
      const { data, error } = await supabase.from('funnels').select('*').order('created_at', { ascending: false })
      throwIfError(error)
      return data.map(mapFunnel)
    }
    await wait()
    return MOCK_FUNNELS
  },

  async getCampaigns() {
    if (supabase) {
      const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
      throwIfError(error)
      return data.map(mapCampaign)
    }
    await wait()
    return MOCK_CAMPAIGNS
  },

  // -- Automation: workflows ------------------------------------------------

  async getWorkflows() {
    if (supabase) {
      const { data, error } = await supabase.from('workflows').select('*').order('created_at', { ascending: false })
      throwIfError(error)
      return data.map(mapWorkflow)
    }
    await wait()
    return MOCK_WORKFLOWS
  },

  async createWorkflow(workflow) {
    const payload = {
      name: workflow.name || 'Untitled Workflow',
      status: workflow.status || 'draft',
      trigger: workflow.trigger || { type: 'new_lead', config: {} },
      steps: workflow.steps || [],
      enrolled: 0,
      completed: 0,
    }
    if (supabase) {
      const { data, error } = await supabase
        .from('workflows')
        .insert({ ...payload, updated_at: new Date().toISOString() })
        .select()
        .single()
      throwIfError(error)
      return mapWorkflow(data)
    }
    await wait(150)
    const created = { id: uid('wf'), ...payload, updatedAt: new Date().toISOString() }
    MOCK_WORKFLOWS = [created, ...MOCK_WORKFLOWS]
    return created
  },

  async updateWorkflow(workflowId, patch) {
    if (supabase) {
      const dbPatch = { ...patch, updated_at: new Date().toISOString() }
      const { data, error } = await supabase.from('workflows').update(dbPatch).eq('id', workflowId).select().single()
      throwIfError(error)
      return mapWorkflow(data)
    }
    await wait(120)
    MOCK_WORKFLOWS = MOCK_WORKFLOWS.map((w) =>
      w.id === workflowId ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w
    )
    return MOCK_WORKFLOWS.find((w) => w.id === workflowId)
  },

  async deleteWorkflow(workflowId) {
    if (supabase) {
      const { error } = await supabase.from('workflows').delete().eq('id', workflowId)
      throwIfError(error)
      return true
    }
    await wait(120)
    MOCK_WORKFLOWS = MOCK_WORKFLOWS.filter((w) => w.id !== workflowId)
    return true
  },

  // -- Automation: lead assignment ------------------------------------------

  async getAssignmentRules() {
    if (supabase) {
      const { data, error } = await supabase.from('assignment_rules').select('*').order('priority')
      throwIfError(error)
      return data.map(mapAssignmentRule)
    }
    await wait()
    return [...MOCK_ASSIGNMENT_RULES].sort((a, b) => a.priority - b.priority)
  },

  async createAssignmentRule(rule) {
    const priority = rule.priority || MOCK_ASSIGNMENT_RULES.length + 1
    const payload = {
      name: rule.name || 'Untitled Rule',
      active: rule.active ?? true,
      priority,
      conditions: rule.conditions || [],
      method: rule.method || 'round_robin',
      assignees: rule.assignees || [],
      last_assigned_index: 0,
    }
    if (supabase) {
      const { data, error } = await supabase.from('assignment_rules').insert(payload).select().single()
      throwIfError(error)
      return mapAssignmentRule(data)
    }
    await wait(150)
    const created = { id: uid('ar'), ...payload, lastAssignedIndex: 0 }
    delete created.last_assigned_index
    MOCK_ASSIGNMENT_RULES = [...MOCK_ASSIGNMENT_RULES, created]
    return created
  },

  async updateAssignmentRule(ruleId, patch) {
    if (supabase) {
      const { data, error } = await supabase.from('assignment_rules').update(patch).eq('id', ruleId).select().single()
      throwIfError(error)
      return mapAssignmentRule(data)
    }
    await wait(120)
    MOCK_ASSIGNMENT_RULES = MOCK_ASSIGNMENT_RULES.map((r) => (r.id === ruleId ? { ...r, ...patch } : r))
    return MOCK_ASSIGNMENT_RULES.find((r) => r.id === ruleId)
  },

  async deleteAssignmentRule(ruleId) {
    if (supabase) {
      const { error } = await supabase.from('assignment_rules').delete().eq('id', ruleId)
      throwIfError(error)
      return true
    }
    await wait(120)
    MOCK_ASSIGNMENT_RULES = MOCK_ASSIGNMENT_RULES.filter((r) => r.id !== ruleId)
    return true
  },

  // Simulates what happens when a new lead matches a rule: returns the next
  // assignee without actually persisting anything (used by the UI preview).
  async previewNextAssignee(ruleId) {
    await wait(80)
    const rule = MOCK_ASSIGNMENT_RULES.find((r) => r.id === ruleId)
    if (!rule || rule.assignees.length === 0) return null
    if (rule.method === 'specific_user') return rule.assignees[0]
    const nextIndex = (rule.lastAssignedIndex + 1) % rule.assignees.length
    return rule.assignees[nextIndex]
  },

  // -- Settings: agency team members ----------------------------------------

  async getTeamMembers() {
    if (supabase) {
      const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true })
      throwIfError(error)
      return data.map(mapTeamMember)
    }
    await wait()
    return [...MOCK_TEAM_MEMBERS]
  },

  // Adds a row to the team roster with status 'invited'. Note: this does NOT
  // create a real login for them — actually sending an invite email and
  // creating the auth account requires Supabase's admin API (service-role
  // key), which must run server-side (e.g. an Edge Function), never in the
  // browser. Wire this up to call that function once you have one; until
  // then this models "who's on the team" and their intended role/status.
  async inviteTeamMember({ name, email, phone = '', role = 'agent' }) {
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      avatar_color: ['#0EA5A5', '#6D5EF5', '#F5A623', '#EF5A6F', '#2F86EB'][Math.floor(Math.random() * 5)],
      role,
      status: 'invited',
    }
    if (supabase) {
      const { data, error } = await supabase.from('team_members').insert(payload).select().single()
      throwIfError(error)
      return mapTeamMember(data)
    }
    await wait(200)
    const created = {
      id: uid('tm'),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      avatarColor: payload.avatar_color,
      role: payload.role,
      status: payload.status,
      createdAt: new Date().toISOString(),
    }
    MOCK_TEAM_MEMBERS = [...MOCK_TEAM_MEMBERS, created]
    return created
  },

  // patch can include { role, status, name, phone } — used for both the role
  // dropdown and "resend invite" / "suspend" / "reactivate" actions.
  async updateTeamMember(memberId, patch) {
    if (supabase) {
      const dbPatch = {}
      if (patch.role !== undefined) dbPatch.role = patch.role
      if (patch.status !== undefined) dbPatch.status = patch.status
      if (patch.name !== undefined) dbPatch.name = patch.name
      if (patch.phone !== undefined) dbPatch.phone = patch.phone
      const { data, error } = await supabase.from('team_members').update(dbPatch).eq('id', memberId).select().single()
      throwIfError(error)
      return mapTeamMember(data)
    }
    await wait(150)
    MOCK_TEAM_MEMBERS = MOCK_TEAM_MEMBERS.map((m) => (m.id === memberId ? { ...m, ...patch } : m))
    return MOCK_TEAM_MEMBERS.find((m) => m.id === memberId)
  },

  async removeTeamMember(memberId) {
    if (supabase) {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId)
      throwIfError(error)
      return true
    }
    await wait(150)
    MOCK_TEAM_MEMBERS = MOCK_TEAM_MEMBERS.filter((m) => m.id !== memberId)
    return true
  },
}

export { OWNERS, TAG_POOL }
