import React from 'react'
import { Mail, Phone, MessageSquare } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { Badge, StageBadge } from '../ui/Badge'
import SlideOver from '../ui/SlideOver'
import PrimaryButton from '../ui/PrimaryButton'

export default function ContactDetail({ contact, onClose }) {
  if (!contact) return null
  return (
    <SlideOver open={!!contact} onClose={onClose} title="Contact Details">
      <div className="flex items-center gap-3 mb-5">
        <Avatar name={contact.name} color={contact.avatarColor} size={48} />
        <div>
          <p className="font-display font-semibold text-base">{contact.name}</p>
          <StageBadge stageId={contact.stage} />
        </div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2.5 text-sm"><Mail size={15} className="text-subink" /> {contact.email}</div>
        <div className="flex items-center gap-2.5 text-sm"><Phone size={15} className="text-subink" /> {contact.phone}</div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {contact.tags.map((t) => <Badge key={t} color="#5B6270" bg="#F0F1F3">{t}</Badge>)}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div><p className="text-xs text-subink mb-0.5">Owner</p><p className="font-medium">{contact.owner}</p></div>
        <div><p className="text-xs text-subink mb-0.5">Source</p><p className="font-medium">{contact.source}</p></div>
      </div>
      <div className="flex gap-2">
        <PrimaryButton icon={MessageSquare} className="flex-1 justify-center">Message</PrimaryButton>
        <button className="flex-1 border border-line rounded-lg text-sm font-medium hover:bg-canvas">Schedule</button>
      </div>
    </SlideOver>
  )
}
