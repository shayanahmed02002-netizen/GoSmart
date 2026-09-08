import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'

export default function StatCard({ label, value, deltaPct, prefix = '', suffix = '', loading }) {
  const positive = deltaPct >= 0
  return (
    <Card className="p-4">
      {loading ? (
        <>
          <Skeleton className="h-3.5 w-24 mb-3" />
          <Skeleton className="h-7 w-20" />
        </>
      ) : (
        <>
          <p className="text-xs font-medium text-subink mb-1.5">{label}</p>
          <div className="flex items-baseline justify-between">
            <p className="font-display font-bold text-2xl text-ink">
              {prefix}{value}{suffix}
            </p>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-won' : 'text-danger'}`}>
              {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(deltaPct)}%
            </span>
          </div>
        </>
      )}
    </Card>
  )
}
