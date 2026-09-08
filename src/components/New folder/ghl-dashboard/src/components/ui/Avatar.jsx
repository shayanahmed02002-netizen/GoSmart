import React from 'react'

export default function Avatar({ name, color, size = 32 }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-semibold text-white shrink-0"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}
