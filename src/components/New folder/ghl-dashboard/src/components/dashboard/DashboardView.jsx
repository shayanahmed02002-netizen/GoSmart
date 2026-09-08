import React, { useEffect, useMemo, useState } from 'react'
import { Users, MessageSquare } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { dataService, STAGES } from '../../services/dataService'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'
import StatCard from './StatCard'

export default function DashboardView() {
  const [stats, setStats] = useState(null)
  const [contacts, setContacts] = useState([])
  const [convos, setConvos] = useState([])

  useEffect(() => {
    dataService.getStats().then(setStats)
    dataService.getContacts().then(setContacts)
    dataService.getConversations().then(setConvos)
  }, [])

  const activity = useMemo(() => {
    const fromContacts = contacts.slice(0, 4).map((c) => ({
      id: c.id, icon: Users, color: c.avatarColor,
      text: `${c.name} moved to ${STAGES.find((s) => s.id === c.stage)?.label || c.stage}`,
      time: c.lastActivity,
    }))
    const fromConvos = convos.slice(0, 3).map((c) => ({
      id: c.id, icon: MessageSquare, color: c.avatarColor,
      text: `${c.contactName}: "${c.lastMessage.slice(0, 40)}${c.lastMessage.length > 40 ? '…' : ''}"`,
      time: c.lastTime,
    }))
    return [...fromContacts, ...fromConvos].slice(0, 6)
  }, [contacts, convos])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Contacts" value={stats?.totalContacts ?? 0} deltaPct={stats?.contactsDeltaPct ?? 0} loading={!stats} />
        <StatCard label="Open Pipeline Value" value={(stats?.openPipelineValue ?? 0).toLocaleString()} prefix="$" deltaPct={stats?.openPipelineDeltaPct ?? 0} loading={!stats} />
        <StatCard label="Appointments This Week" value={stats?.appointmentsThisWeek ?? 0} deltaPct={stats?.appointmentsDeltaPct ?? 0} loading={!stats} />
        <StatCard label="Conversion Rate" value={stats?.conversionRate ?? 0} suffix="%" deltaPct={stats?.conversionDeltaPct ?? 0} loading={!stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm">Revenue & Leads — last 6 months</h3>
          </div>
          {stats ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.history} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5A5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0EA5A5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E6E8EC" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5B6270' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5B6270' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E6E8EC', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#0EA5A5" strokeWidth={2.5} fill="url(#revFill)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-[220px] w-full" />
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Pipeline by Stage</h3>
          <div className="space-y-3">
            {stats ? (
              stats.stageBreakdown.map((s) => {
                const max = Math.max(...stats.stageBreakdown.map((x) => x.count), 1)
                return (
                  <div key={s.stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-subink font-medium">{s.stage}</span>
                      <span className="font-semibold text-ink">{s.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-canvas overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(s.count / max) * 100}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                )
              })
            ) : (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-display font-semibold text-sm mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activity.length === 0 && <Skeleton className="h-16 w-full" />}
          {activity.map((a) => {
            const Icon = a.icon
            return (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${a.color}1A` }}>
                  <Icon size={14} style={{ color: a.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink truncate">{a.text}</p>
                  <p className="text-xs text-subink">{a.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
