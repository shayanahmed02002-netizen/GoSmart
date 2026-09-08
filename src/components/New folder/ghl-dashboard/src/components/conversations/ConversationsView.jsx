import React, { useEffect, useState } from 'react'
import { Mail, Send, Facebook, MessageCircle } from 'lucide-react'
import { dataService } from '../../services/dataService'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import EmptyState from '../ui/EmptyState'

const CHANNEL_ICON = { sms: MessageCircle, email: Mail, facebook: Facebook }

export default function ConversationsView() {
  const [convos, setConvos] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    dataService.getConversations().then((res) => {
      setConvos(res)
      if (res[0]) setActiveId(res[0].id)
    })
  }, [])

  const active = convos.find((c) => c.id === activeId)

  const send = async () => {
    if (!draft.trim() || !active) return
    const text = draft
    setDraft('')
    setConvos((prev) => prev.map((c) => c.id === active.id
      ? { ...c, messages: [...c.messages, { id: 'tmp', from: 'agent', text, time: 'now' }], lastMessage: text, lastTime: 'now' }
      : c))
    await dataService.sendMessage(active.id, text)
  }

  return (
    <Card className="p-0 overflow-hidden h-[calc(100vh-160px)] min-h-[420px] flex">
      <div className="w-72 border-r border-line overflow-y-auto shrink-0">
        {convos.map((c) => {
          const Icon = CHANNEL_ICON[c.channel]
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full flex items-start gap-2.5 px-4 py-3 border-b border-line/60 text-left hover:bg-canvas transition-colors ${activeId === c.id ? 'bg-canvas' : ''}`}
            >
              <Avatar name={c.contactName} color={c.avatarColor} size={34} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{c.contactName}</p>
                  <Icon size={12} className="text-subink shrink-0" />
                </div>
                <p className="text-xs text-subink truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center shrink-0">{c.unread}</span>}
            </button>
          )
        })}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <>
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-line shrink-0">
              <Avatar name={active.contactName} color={active.avatarColor} size={32} />
              <div>
                <p className="text-sm font-medium">{active.contactName}</p>
                <p className="text-xs text-subink capitalize">{active.channel}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {active.messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-xl2 px-3.5 py-2 text-sm ${m.from === 'agent' ? 'bg-primary text-white rounded-br-sm' : 'bg-canvas text-ink rounded-bl-sm'}`}>
                    {m.text}
                    <p className={`text-[10px] mt-1 ${m.from === 'agent' ? 'text-white/70' : 'text-subink'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3.5 border-t border-line flex items-center gap-2 shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message..."
                className="flex-1 bg-canvas border border-line rounded-lg px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
              <button onClick={send} className="p-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white">
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <EmptyState title="No conversation selected" subtitle="Pick a thread from the list." />
        )}
      </div>
    </Card>
  )
}
