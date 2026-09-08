import React, { useState } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'
import { dataService } from '../../services/dataService'
import PrimaryButton from '../ui/PrimaryButton'

const inputCls = 'w-full bg-canvas border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-primary'
const labelCls = 'text-xs font-semibold text-subink uppercase tracking-wide mb-1.5 block'

function emptyDoc() {
  return { id: `doc_${Math.random().toString(36).slice(2, 9)}`, title: '', content: '' }
}

export default function AgentForm({ agent, onSaved, onCancel }) {
  const isNew = !agent?.id
  const [name, setName] = useState(agent?.name || '')
  const [description, setDescription] = useState(agent?.description || '')
  const [instructions, setInstructions] = useState(agent?.instructions || '')
  const [documents, setDocuments] = useState(agent?.documents?.length ? agent.documents : [emptyDoc()])
  const [saving, setSaving] = useState(false)

  const updateDoc = (id, patch) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  const addDoc = () => setDocuments((prev) => [...prev, emptyDoc()])

  const removeDoc = (id) => setDocuments((prev) => (prev.length > 1 ? prev.filter((d) => d.id !== id) : prev))

  const cleanDocuments = documents
    .map((d) => ({ ...d, title: d.title.trim(), content: d.content.trim() }))
    .filter((d) => d.title || d.content)

  const canSave = name.trim() && cleanDocuments.length > 0 && !saving

  const save = async () => {
    if (!canSave) return
    setSaving(true)
    const payload = {
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      documents: cleanDocuments,
      status: agent?.status || 'draft',
    }
    if (isNew) {
      await dataService.createAgent(payload)
    } else {
      await dataService.updateAgent(agent.id, payload)
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Agent Name</label>
        <input className={inputCls} placeholder="e.g. Pricing & Plans Assistant" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <input
          className={inputCls}
          placeholder="What does this agent help with?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Instructions (optional)</label>
        <textarea
          className={`${inputCls} min-h-[70px] resize-y`}
          placeholder="Tone, style, or rules the agent should follow when answering."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`${labelCls} mb-0`}>Knowledge Base</label>
          <button onClick={addDoc} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark">
            <Plus size={13} /> Add Document
          </button>
        </div>
        <p className="text-xs text-subink mb-3">
          Paste or type anything the agent should know — FAQs, policies, product info. The agent will only answer using what you add here.
        </p>

        <div className="space-y-3">
          {documents.map((doc, i) => (
            <div key={doc.id} className="border border-line rounded-lg p-3 bg-canvas/60">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-subink shrink-0" />
                <input
                  className="flex-1 bg-surface border border-line rounded-md px-2.5 py-1.5 text-sm text-ink outline-none focus:border-primary"
                  placeholder={`Document ${i + 1} title (e.g. Refund Policy)`}
                  value={doc.title}
                  onChange={(e) => updateDoc(doc.id, { title: e.target.value })}
                />
                {documents.length > 1 && (
                  <button onClick={() => removeDoc(doc.id)} className="p-1.5 rounded-md text-subink hover:text-danger hover:bg-danger-light shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <textarea
                className="w-full bg-surface border border-line rounded-md px-2.5 py-2 text-sm text-ink outline-none focus:border-primary min-h-[110px] resize-y"
                placeholder="Paste the content this document should cover..."
                value={doc.content}
                onChange={(e) => updateDoc(doc.id, { content: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <PrimaryButton onClick={save} className={!canSave ? 'opacity-50 pointer-events-none' : ''}>
          {isNew ? 'Create Agent' : 'Save Changes'}
        </PrimaryButton>
        <button onClick={onCancel} className="text-sm font-medium text-subink hover:text-ink px-3.5 py-2 rounded-lg border border-line">
          Cancel
        </button>
      </div>
    </div>
  )
}
