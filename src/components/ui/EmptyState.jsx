import React from 'react'

export default function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-canvas border border-line mb-3" />
      <p className="font-display font-semibold text-ink">{title}</p>
      <p className="text-sm text-subink mt-1">{subtitle}</p>
    </div>
  )
}
