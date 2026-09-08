import React from 'react'

export default function PrimaryButton({ children, onClick, icon: Icon, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
