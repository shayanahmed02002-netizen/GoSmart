import React, { useState } from 'react'
import ContactsTable from './ContactsTable'
import ContactDetail from './ContactDetail'
import PipelineBoard from './PipelineBoard'

export default function CrmView() {
  const [tab, setTab] = useState('contacts')
  const [selectedContact, setSelectedContact] = useState(null)

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-canvas border border-line rounded-lg p-1 w-fit">
        {[{ id: 'contacts', label: 'Contacts' }, { id: 'pipeline', label: 'Pipeline' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-surface text-ink shadow-card' : 'text-subink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'contacts' ? <ContactsTable onSelect={setSelectedContact} /> : <PipelineBoard />}
      <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} />
    </div>
  )
}
