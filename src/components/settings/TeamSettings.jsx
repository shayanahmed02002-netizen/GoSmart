import React, { useEffect, useState } from 'react'
import { Plus, MoreVertical, Mail, Phone, ShieldCheck, Trash2, RotateCcw, Ban, CheckCircle2, Lock } from 'lucide-react'
import { dataService, TEAM_ROLES } from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import PrimaryButton from '../ui/PrimaryButton'
import SlideOver from '../ui/SlideOver'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

const ROLE_BADGE = {
  owner: { color: '#22A87A', bg: '#22A87A1A' },
  admin: { color: '#2F86EB', bg: '#2F86EB1A' },
  agent: { color: '#5B6270', bg: '#5B62701A' },
}

const STATUS_BADGE = {
  active: { color: '#22A87A', bg: '#22A87A1A', label: 'Active' },
  invited: { color: '#F5A623', bg: '#F5A6231A', label: 'Invited' },
  suspended: { color: '#EF5A6F', bg: '#EF5A6F1A', label: 'Suspended' },
}

function InviteForm({ onClose, onInvited }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('agent')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setSaving(true)
    setError('')
    try {
      const member = await dataService.inviteTeamMember({ name, email, phone, role })
      onInvited(member)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not send invite — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-subink">Full name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Lee"
          className="mt-1 w-full bg-canvas border border-line rounded-lg px-3.5 py-2 text-sm outline-none focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-subink">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jordan@youragency.com"
          className="mt-1 w-full bg-canvas border border-line rounded-lg px-3.5 py-2 text-sm outline-none focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-subink">Phone (optional)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-0100"
          className="mt-1 w-full bg-canvas border border-line rounded-lg px-3.5 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-subink">Role</label>
        <div className="mt-1.5 space-y-1.5">
          {TEAM_ROLES.filter((r) => r.id !== 'owner').map((r) => (
            <label
              key={r.id}
              className={`flex items-start gap-2.5 border rounded-lg px-3.5 py-2.5 cursor-pointer transition-colors ${role === r.id ? 'border-primary bg-primary/5' : 'border-line hover:bg-canvas'}`}
            >
              <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-ink">{r.label}</p>
                <p className="text-xs text-subink">{r.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-subink bg-canvas border border-line rounded-lg px-3.5 py-2.5">
        They'll show up as "Invited" right away. Actually emailing them a login link requires
        connecting an invite email flow — until then, share access with them directly.
      </p>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="text-sm text-subink hover:text-ink px-3.5 py-2">
          Cancel
        </button>
        <PrimaryButton className={saving ? 'opacity-70 pointer-events-none' : ''}>
          {saving ? 'Sending…' : 'Send invite'}
        </PrimaryButton>
      </div>
    </form>
  )
}

function MemberRow({ member, isMe, canManage, onChangeRole, onChangeStatus, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const roleColors = ROLE_BADGE[member.role] || ROLE_BADGE.agent
  const statusInfo = STATUS_BADGE[member.status] || STATUS_BADGE.active

  return (
    <tr className="border-b border-line/60 last:border-b-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={member.name} color={member.avatarColor} size={34} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{member.name}{isMe && <span className="text-subink font-normal"> (you)</span>}</p>
            <p className="text-xs text-subink truncate flex items-center gap-1"><Mail size={11} />{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {member.phone
          ? <span className="text-sm text-subink flex items-center gap-1"><Phone size={11} />{member.phone}</span>
          : <span className="text-sm text-subink/60">—</span>}
      </td>
      <td className="px-4 py-3">
        {canManage && member.role !== 'owner' ? (
          <select
            value={member.role}
            onChange={(e) => onChangeRole(member, e.target.value)}
            className="bg-canvas border border-line rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary"
          >
            {TEAM_ROLES.filter((r) => r.id !== 'owner').map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        ) : (
          <Badge color={roleColors.color} bg={roleColors.bg}>
            {member.role === 'owner' && <ShieldCheck size={11} className="inline mr-1 -mt-0.5" />}
            {TEAM_ROLES.find((r) => r.id === member.role)?.label || member.role}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        {!canManage || member.role === 'owner' ? (
          member.role === 'owner' && <Lock size={14} className="text-subink/50 inline-block" />
        ) : confirmingRemove ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs text-subink">Remove {member.name.split(' ')[0]}?</span>
            <button onClick={() => onRemove(member)} className="text-xs font-medium text-danger px-2 py-1 rounded-md hover:bg-danger-light">Yes</button>
            <button onClick={() => setConfirmingRemove(false)} className="text-xs font-medium text-subink px-2 py-1 rounded-md hover:bg-canvas">Cancel</button>
          </div>
        ) : (
          <div className="relative inline-block">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-1.5 rounded-lg hover:bg-canvas text-subink">
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-48 bg-surface border border-line rounded-xl2 shadow-pop p-1.5">
                  {member.status === 'invited' && (
                    <button
                      onClick={() => { onChangeStatus(member, 'active'); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink hover:bg-canvas text-left"
                    >
                      <RotateCcw size={14} className="text-subink" /> Resend invite
                    </button>
                  )}
                  {member.status === 'active' && (
                    <button
                      onClick={() => { onChangeStatus(member, 'suspended'); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink hover:bg-canvas text-left"
                    >
                      <Ban size={14} className="text-subink" /> Suspend access
                    </button>
                  )}
                  {member.status === 'suspended' && (
                    <button
                      onClick={() => { onChangeStatus(member, 'active'); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink hover:bg-canvas text-left"
                    >
                      <CheckCircle2 size={14} className="text-subink" /> Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => { setConfirmingRemove(true); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger-light text-left"
                  >
                    <Trash2 size={14} /> Remove from team
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export default function TeamSettings() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  const load = () => {
    setLoading(true)
    dataService.getTeamMembers().then((res) => {
      setMembers(res)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const myEmail = (user?.email || '').toLowerCase()
  const me = members.find((m) => m.email.toLowerCase() === myEmail)
  // Bootstrap case: nobody in the roster matches the signed-in user yet
  // (e.g. brand-new workspace) — treat them as owner rather than locking
  // them out of a team page with nothing on it.
  const canManage = members.length === 0 || me?.role === 'owner' || me?.role === 'admin'

  const handleChangeRole = async (member, role) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)))
    await dataService.updateTeamMember(member.id, { role })
  }

  const handleChangeStatus = async (member, status) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, status } : m)))
    await dataService.updateTeamMember(member.id, { status })
  }

  const handleRemove = async (member) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    await dataService.removeTeamMember(member.id)
  }

  const handleInvited = (member) => {
    setMembers((prev) => [...prev, member])
  }

  if (!canManage) {
    return (
      <Card className="p-0">
        <EmptyState title="Owner access required" subtitle="Only the agency owner or an admin can manage team members." />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-base">Team members</h3>
          <p className="text-sm text-subink mt-0.5">{members.length} {members.length === 1 ? 'person has' : 'people have'} access to this workspace</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setInviteOpen(true)}>Invite member</PrimaryButton>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : members.length === 0 ? (
          <EmptyState title="No team members yet" subtitle="Invite your first teammate to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-subink border-b border-line bg-canvas/60">
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-4 py-2.5 font-medium">Phone</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    isMe={m.email.toLowerCase() === myEmail}
                    canManage={canManage}
                    onChangeRole={handleChangeRole}
                    onChangeStatus={handleChangeStatus}
                    onRemove={handleRemove}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SlideOver open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a team member">
        <InviteForm onClose={() => setInviteOpen(false)} onInvited={handleInvited} />
      </SlideOver>
    </div>
  )
}
