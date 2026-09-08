import React, { useEffect, useMemo, useState } from 'react'
import { dataService } from '../../services/dataService'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'

export default function CalendarView() {
  const [appointments, setAppointments] = useState([])
  const [cursor, setCursor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => { dataService.getAppointments().then(setAppointments) }, [])

  const { weeks, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    const weeks = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
    return { weeks, monthLabel: cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' }) }
  }, [cursor])

  const apptsByDay = (date) => {
    if (!date) return []
    const key = date.toISOString().slice(0, 10)
    return appointments.filter((a) => a.date === key)
  }

  const today = new Date().toDateString()
  const upcoming = [...appointments].sort((a, b) => a.date.localeCompare(b.date)).filter((a) => a.date >= new Date().toISOString().slice(0, 10)).slice(0, 6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm">{monthLabel}</h3>
          <div className="flex gap-1">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="px-2.5 py-1 rounded-lg border border-line text-sm hover:bg-canvas">‹</button>
            <button onClick={() => setCursor(new Date())} className="px-2.5 py-1 rounded-lg border border-line text-sm hover:bg-canvas">Today</button>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="px-2.5 py-1 rounded-lg border border-line text-sm hover:bg-canvas">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-subink font-medium mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="space-y-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1.5">
              {week.map((day, di) => {
                const dayAppts = apptsByDay(day)
                const isToday = day && day.toDateString() === today
                return (
                  <button
                    key={di}
                    disabled={!day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-lg border text-left p-1.5 text-xs transition-colors ${
                      !day ? 'border-transparent' : isToday ? 'border-primary bg-primary-light' : 'border-line hover:bg-canvas'
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`font-medium ${isToday ? 'text-primary-dark' : 'text-ink'}`}>{day.getDate()}</span>
                        {dayAppts.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {dayAppts.slice(0, 3).map((a) => <span key={a.id} className="w-1.5 h-1.5 rounded-full bg-primary" />)}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-display font-semibold text-sm mb-4">
          {selectedDay ? selectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Upcoming'}
        </h3>
        <div className="space-y-3">
          {(selectedDay ? apptsByDay(selectedDay) : upcoming).length === 0 && (
            <p className="text-sm text-subink">No appointments{selectedDay ? ' this day' : ''}.</p>
          )}
          {(selectedDay ? apptsByDay(selectedDay) : upcoming).map((a) => (
            <div key={a.id} className="flex items-center gap-3 pb-3 border-b border-line/60 last:border-0 last:pb-0">
              <Avatar name={a.contactName} color={a.avatarColor} size={30} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{a.contactName}</p>
                <p className="text-xs text-subink">{a.type} · {a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
