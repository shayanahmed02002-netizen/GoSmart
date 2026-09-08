import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-line rounded-xl2 shadow-card ${className}`}>
      {children}
    </div>
  )
}
