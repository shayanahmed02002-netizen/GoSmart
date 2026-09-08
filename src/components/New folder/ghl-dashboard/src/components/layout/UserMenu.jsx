import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

export default function UserMenu() {
  const { user, signOut, isConfigured } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account'
  const role = user.user_metadata?.role || (user.isDemo ? 'Demo workspace' : 'Team member')

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-canvas transition-colors"
      >
        <Avatar name={name} color="#0EA5A5" size={28} />
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-medium text-ink">{name}</p>
          <p className="text-[11px] text-subink">{role}</p>
        </div>
        <ChevronDown size={14} className={`text-subink transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-60 bg-surface border border-line rounded-xl2 shadow-pop p-1.5">
          <div className="px-3 py-2.5 border-b border-line mb-1">
            <p className="text-sm font-medium text-ink truncate">{name}</p>
            <p className="text-xs text-subink truncate">{user.email}</p>
          </div>

          {user.isDemo && (
            <p className="px-3 py-2 text-[11px] text-subink">
              Running on demo data — connect Supabase to enable real accounts.
            </p>
          )}

          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink hover:bg-canvas text-left"
            onClick={() => setOpen(false)}
          >
            <UserIcon size={15} className="text-subink" />
            View profile
          </button>

          {isConfigured && (
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger-light text-left"
            >
              <LogOut size={15} />
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  )
}
