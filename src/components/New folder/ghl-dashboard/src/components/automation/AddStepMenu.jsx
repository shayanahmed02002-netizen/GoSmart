import React, { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { ACTION_TYPES } from '../../services/dataService'
import StepIcon from './StepIcon'

export default function AddStepMenu({ onAdd }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-full bg-canvas border border-line hover:border-primary hover:text-primary flex items-center justify-center text-subink transition-colors z-10"
        title="Add a step"
      >
        <Plus size={15} />
      </button>

      {open && (
        <div className="absolute top-9 z-20 w-64 bg-surface border border-line rounded-xl2 shadow-pop p-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subink px-2.5 py-1.5">Add an action</p>
          {ACTION_TYPES.map((action) => (
            <button
              key={action.id}
              onClick={() => { onAdd(action.id); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-ink hover:bg-canvas text-left"
            >
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${action.color}1A`, color: action.color }}
              >
                <StepIcon name={action.icon} size={13} />
              </span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
