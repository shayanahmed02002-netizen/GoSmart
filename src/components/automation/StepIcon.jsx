import React from 'react'
import { Mail, MessageSquare, Clock, Tag, UserCheck, ArrowRightLeft, CheckSquare, Bell, Zap } from 'lucide-react'

const ICONS = { Mail, MessageSquare, Clock, Tag, UserCheck, ArrowRightLeft, CheckSquare, Bell, Zap }

export default function StepIcon({ name, size = 16, className = '' }) {
  const Icon = ICONS[name] || Zap
  return <Icon size={size} className={className} />
}
