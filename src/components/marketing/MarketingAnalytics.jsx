import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dataService } from '../../services/dataService'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'

export default function MarketingAnalytics() {
  const [funnels, setFunnels] = useState([])
  useEffect(() => { dataService.getFunnels().then(setFunnels) }, [])
  const chartData = funnels.map((f) => ({ name: f.name.split(' ').slice(0, 2).join(' '), rate: Number(((f.conversions / f.visitors) * 100).toFixed(1)) }))
  return (
    <Card className="p-5">
      <h3 className="font-display font-semibold text-sm mb-4">Funnel Conversion Rate</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
            <CartesianGrid vertical={false} stroke="#E6E8EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#5B6270' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5B6270' }} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E6E8EC', fontSize: 12 }} />
            <Bar dataKey="rate" fill="#6D5EF5" radius={[6, 6, 0, 0]} name="Conversion %" />
          </BarChart>
        </ResponsiveContainer>
      ) : <Skeleton className="h-[240px] w-full" />}
    </Card>
  )
}
