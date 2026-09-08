import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { dataService, STAGES } from '../../services/dataService'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'
import Avatar from '../ui/Avatar'
import { Badge, StageBadge } from '../ui/Badge'
import EmptyState from '../ui/EmptyState'

export default function ContactsTable({ onSelect }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    dataService.getContacts({ search, stage: stageFilter }).then((res) => {
      setContacts(res)
      setLoading(false)
    })
  }, [search, stageFilter])

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-line">
        <div className="flex items-center gap-2 bg-canvas border border-line rounded-lg px-3 py-1.5 flex-1 min-w-[180px]">
          <Search size={14} className="text-subink" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStageFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${stageFilter === 'all' ? 'bg-ink text-white border-ink' : 'border-line text-subink hover:bg-canvas'}`}
          >
            All
          </button>
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStageFilter(s.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${stageFilter === s.id ? 'text-white border-transparent' : 'border-line text-subink hover:bg-canvas'}`}
              style={stageFilter === s.id ? { backgroundColor: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-subink border-b border-line">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium hidden md:table-cell">Contact</th>
              <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Tags</th>
              <th className="px-4 py-2.5 font-medium">Stage</th>
              <th className="px-4 py-2.5 font-medium hidden md:table-cell">Owner</th>
              <th className="px-4 py-2.5 font-medium">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-line/60">
                  <td className="px-4 py-3" colSpan={6}><Skeleton className="h-6 w-full" /></td>
                </tr>
              ))}
            {!loading && contacts.length === 0 && (
              <tr><td colSpan={6}><EmptyState title="No contacts found" subtitle="Try a different search or filter." /></td></tr>
            )}
            {!loading && contacts.map((c) => (
              <tr key={c.id} onClick={() => onSelect(c)} className="border-b border-line/60 hover:bg-canvas cursor-pointer transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} color={c.avatarColor} size={28} />
                    <span className="font-medium text-ink">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden md:table-cell text-subink">{c.email}</td>
                <td className="px-4 py-2.5 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((t) => <Badge key={t} color="#5B6270" bg="#F0F1F3">{t}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-2.5"><StageBadge stageId={c.stage} /></td>
                <td className="px-4 py-2.5 hidden md:table-cell text-subink">{c.owner}</td>
                <td className="px-4 py-2.5 text-subink">{c.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
