import React, { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, FileText } from 'lucide-react'
import { dataService } from '../../services/dataService'

export default function AgentChatTester({ agent }) {
  const [messages, setMessages] = useState([
    { id: 'intro', from: 'agent', text: `Hi! I'm ${agent.name}. Ask me anything from my knowledge base.`, sources: [] },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const question = input.trim()
    if (!question || sending) return
    setInput('')
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, from: 'user', text: question }])
    setSending(true)
    const { answer, sources } = await dataService.askAgent(agent.id, question)
    setMessages((prev) => [...prev, { id: `a_${Date.now()}`, from: 'agent', text: answer, sources }])
    setSending(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.from === 'user' ? 'bg-primary text-white' : 'bg-canvas border border-line text-ink'
                }`}
            >
              {m.from === 'user' ? <User size={13} /> : <Bot size={13} />}
            </div>
            <div className={`max-w-[80%] ${m.from === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`rounded-xl2 px-3.5 py-2.5 text-sm whitespace-pre-wrap ${m.from === 'user' ? 'bg-primary text-white' : 'bg-canvas text-ink border border-line'
                  }`}
              >
                {m.text}
              </div>
              {m.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {m.sources.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 text-[11px] text-subink bg-canvas border border-line rounded-full px-2 py-0.5">
                      <FileText size={10} /> {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-canvas border border-line text-ink">
              <Bot size={13} />
            </div>
            <div className="rounded-xl2 px-3.5 py-2.5 text-sm bg-canvas border border-line text-subink">Thinking…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-line mt-3">
        <input
          className="flex-1 bg-canvas border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          placeholder="Ask this agent a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="p-2.5 rounded-lg bg-primary text-white disabled:opacity-50 hover:bg-primary-dark transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}