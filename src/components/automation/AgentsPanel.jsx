import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { dataService } from '../../services/dataService'
import PrimaryButton from '../ui/PrimaryButton'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import SlideOver from '../ui/SlideOver'
import AgentCard from './AgentCard'
import AgentForm from './AgentForm'
import AgentChatTester from './AgentChatTester'

export default function AgentsPanel() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [formTarget, setFormTarget] = useState(null) // null = closed, {} = new, agent = edit
  const [testTarget, setTestTarget] = useState(null) // agent being tested, or null

  const load = () => {
    setLoading(true)
    dataService.getAgents().then((res) => {
      setAgents(res)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const toggleStatus = async (agent) => {
    const next = agent.status === 'active' ? 'draft' : 'active'
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, status: next } : a)))
    await dataService.updateAgent(agent.id, { status: next })
  }

  const remove = async (agent) => {
    setAgents((prev) => prev.filter((a) => a.id !== agent.id))
    await dataService.deleteAgent(agent.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-subink max-w-md">
          Give an agent a knowledge base and it will answer questions using only what you've added — great for FAQs, pricing, or policy lookups.
        </p>
        <PrimaryButton icon={Plus} onClick={() => setFormTarget({})}>Create Agent</PrimaryButton>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}
        </div>
      )}

      {!loading && agents.length === 0 && (
        <EmptyState title="No agents yet" subtitle="Create an agent and give it a knowledge base to start answering questions automatically." />
      )}

      {!loading && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleStatus={toggleStatus}
              onEdit={(a) => setFormTarget(a)}
              onTest={(a) => setTestTarget(a)}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      <SlideOver open={!!formTarget} onClose={() => setFormTarget(null)} title={formTarget?.id ? 'Edit Agent' : 'New AI Agent'}>
        {formTarget && (
          <AgentForm
            agent={formTarget.id ? formTarget : null}
            onSaved={() => { setFormTarget(null); load() }}
            onCancel={() => setFormTarget(null)}
          />
        )}
      </SlideOver>

      <SlideOver open={!!testTarget} onClose={() => setTestTarget(null)} title={testTarget ? `Test: ${testTarget.name}` : 'Test Agent'}>
        {testTarget && <AgentChatTester agent={testTarget} />}
      </SlideOver>
    </div>
  )
}
