import React from 'react'

export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-line/70 rounded-md ${className}`} />
}
