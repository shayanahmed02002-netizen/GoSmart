# AI Agents feature — what was added

## New tab: Automation → "AI Agents"

Sits next to "Workflows" and "Lead Assignment" (`AutomationView.jsx`).

## New files

- `src/components/automation/AgentsPanel.jsx` — list of agents, create/edit/test/delete
- `src/components/automation/AgentCard.jsx` — one agent's card (status, doc count, questions answered)
- `src/components/automation/AgentForm.jsx` — create/edit an agent: name, description,
  instructions, and any number of knowledge-base **documents** (title + pasted text)
- `src/components/automation/AgentChatTester.jsx` — chat UI to test an agent by asking it
  questions right in the app; shows which document(s) each answer came from

## Changed files

- `src/services/dataService.js`
  - `getAgents / createAgent / updateAgent / deleteAgent` — same Supabase-or-mock pattern
    as `workflows` and `assignment_rules`
  - `askAgent(agentId, question)` — the actual "answer using the knowledge base" logic
  - A small retrieval engine: `chunkDocument`, `buildAgentIndex`, `scoreChunk`,
    `answerFromChunks` — splits each document into passages, scores them against the
    question with a simplified TF‑IDF, and returns the best-matching passage(s) as the
    answer, plus which document(s) it came from
- `supabase/schema.sql` — new `agents` table (`name`, `description`, `status`,
  `instructions`, `documents jsonb`, `conversations_count`) with the same
  "public read/write" RLS policy used elsewhere in this demo schema

## How it works today (no external API needed)

1. User creates an agent and pastes in one or more documents (FAQ, policy, pricing, etc).
2. Someone asks the agent a question (via the built-in tester, or by calling
   `dataService.askAgent(agentId, question)` from anywhere else in the app — e.g. a future
   "AI reply" workflow step or the Conversations inbox).
3. The engine breaks the knowledge base into passages, finds the passage(s) most relevant
   to the question, and returns them as the answer with source document names attached.
4. If nothing relevant is found, it says so instead of guessing.

This is fully client-side and works instantly with the mock data store or a real Supabase
project — no API key required.

## Upgrading to a generative model later

The retrieval step above is a good foundation for a real LLM: keep it for grounding, and
have it feed the top-matching passages + the agent's `instructions` + the user's question
into a real model call. **Do that from a server-side function** (e.g. a Supabase Edge
Function), not directly from the browser — a client bundle can't safely hold an API key.
`askAgent` in `dataService.js` is the single place to swap in that call once you have a
backend endpoint for it.

## To apply

Copy the changed/added files into your existing project (paths match), then either:
- run `supabase/schema.sql`'s new `agents` section (or the whole file) in your Supabase
  SQL editor, or
- do nothing — without Supabase configured, the app runs on the in-memory mock agent
  seeded in `dataService.js` automatically.

Then `npm install && npm run dev` as usual.
