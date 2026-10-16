import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion } from 'framer-motion'
import { BellRing, Check, Copy, Crown, Link2, Smartphone, UserPlus } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import type { InviteForm, TierId } from '../store/types'
import { balance, createInvite, inviteMessage, sendViber, tierById } from '../store/ops'
import { money, fmtShort } from '../ui/format'
import { Avatar, Card, Label, Pill, ViberButton } from './ui'

export const setInvite = <K extends keyof InviteForm>(key: K, value: InviteForm[K]) => demo().update((s) => void (s.invite[key] = value))
export const openInvite = () =>
  demo().update((s) => {
    s.adminUi.inviteOpen = true
  })

const box = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[14.5px] outline-none focus:border-cocoa focus:ring-2 focus:ring-cocoa/15'

function InvitePanel() {
  const f = useDemo((s) => s.invite)
  const tiers = useDemo((s) => s.content.rewards.tiers)
  const created = useDemo((s) => s.clients.find((c) => c.id === s.invite.created))
  const sent = useDemo((s) => s.phone.viber.some((m) => m.link?.vip === 'setup'))
  const content = useDemo((s) => s.content)

  if (created) {
    return (
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-emerald-800">
          <Check size={17} /> {created.name} is set up as a {tierById(content, created.tier).name} VIP
        </div>
        <div className="mt-1 text-[13px] text-emerald-900/70">Username {created.username} · the invitation link works for 7 days and lets them choose their own password.</div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[13px] ring-1 ring-emerald-200">
          <Link2 size={15} className="text-zinc-400" />
          <span className="flex-1 truncate font-medium">{created.invite}</span>
          <Copy size={15} className="text-zinc-400" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          {sent ? (
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-viber">
              <Check size={15} /> Invitation sent on Viber
            </span>
          ) : (
            <ViberButton
              demoId="a:viber-invite"
              label="Send invitation on Viber"
              onClick={() => sendViber(inviteMessage(created.name), { label: 'Set up your VIP account', url: created.invite ?? '', vip: 'setup' })}
            />
          )}
          <span className="text-[12px] text-zinc-500">or copy the link into Messenger</span>
        </div>
      </motion.div>
    )
  }

  return (
    <Card title="Invite a VIP">
      <div className="grid grid-cols-2 gap-3">
        <label>
          <Label>Name</Label>
          <input data-demo="a:inv-name" className={box} value={f.name} onChange={(e) => setInvite('name', e.target.value)} />
        </label>
        <label>
          <Label>Phone (Viber)</Label>
          <input data-demo="a:inv-phone" className={box} value={f.phone} onChange={(e) => setInvite('phone', e.target.value)} />
        </label>
        <label>
          <Label hint="They choose their own password">Username</Label>
          <input data-demo="a:inv-user" className={box} value={f.username} onChange={(e) => setInvite('username', e.target.value)} />
        </label>
        <div>
          <Label>Starting tier</Label>
          <div className="flex gap-1.5">
            {tiers.map((t) => (
              <button key={t.id} onClick={() => setInvite('tier', t.id as TierId)} className={`flex-1 rounded-lg border py-2 text-[13px] font-semibold ${f.tier === t.id ? 'border-cocoa bg-cocoa text-gold' : 'border-zinc-300 text-zinc-600'}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        data-demo="a:inv-create"
        disabled={!f.name || !f.phone || !f.username}
        onClick={() => createInvite()}
        className="flex items-center gap-2 rounded-lg bg-cocoa px-4 py-2.5 text-[14px] font-semibold text-gold disabled:bg-zinc-300 disabled:text-white"
      >
        <UserPlus size={16} /> Create account &amp; invitation link
      </button>
    </Card>
  )
}

export function Clients() {
  const clients = useDemo((s) => s.clients)
  const ledger = useDemo((s) => s.ledger)
  const content = useDemo((s) => s.content)
  const open = useDemo((s) => s.adminUi.inviteOpen)
  const selected = useDemo((s) => s.adminUi.selectedClient)

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-[13.5px] text-zinc-600">
          {clients.filter((c) => c.status === 'active').length} active members · membership by invitation only
        </div>
        {!open && (
          <button data-demo="a:invite-open" onClick={openInvite} className="flex items-center gap-1.5 rounded-lg bg-cocoa px-3.5 py-2 text-[13px] font-semibold text-gold">
            <UserPlus size={15} /> Invite VIP
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <InvitePanel />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_1fr_0.6fr] gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-[11.5px] font-semibold tracking-wide text-zinc-500 uppercase">
          <span>Member</span>
          <span>Tier</span>
          <span>Status</span>
          <span className="text-right">Wallet</span>
          <span className="text-right">Visits</span>
        </div>
        {clients.map((c) => {
          const b = balance(ledger, c.id)
          const t = tierById(content, c.tier)
          return (
            <motion.button
              layout
              key={c.id}
              data-demo={`a:client:${c.id}`}
              onClick={() => demo().update((s) => void (s.adminUi.selectedClient = s.adminUi.selectedClient === c.id ? null : c.id))}
              className={`grid w-full grid-cols-[1.6fr_0.8fr_0.8fr_1fr_0.6fr] items-center gap-3 border-b border-zinc-100 px-4 py-2.5 text-left text-[13.5px] last:border-0 ${selected === c.id ? 'bg-gold/15' : ''}`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Avatar name={c.name} className="h-8 w-8 text-[11px]" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block truncate text-[11.5px] text-zinc-500">
                    @{c.username} · since {c.since}
                  </span>
                </span>
              </span>
              <span>
                <Pill tone="cocoa">
                  <Crown size={10} /> {t.name}
                </Pill>
              </span>
              <span className="flex items-center gap-1.5">
                {c.status === 'active' ? <Pill tone="emerald">Active</Pill> : <Pill tone="amber">Invited</Pill>}
                {c.app && <Smartphone size={14} className="text-cocoa" aria-label="App on home screen" />}
                {c.push && <BellRing size={14} className="text-cocoa" aria-label="Notifications on" />}
              </span>
              <span className="text-right font-semibold">{money(b.total)}</span>
              <span className="text-right text-zinc-600">{c.visits}</span>
            </motion.button>
          )
        })}
      </div>
      {selected && <ClientHistory id={selected} />}
    </>
  )
}

function ClientHistory({ id }: { id: string }) {
  const c = useDemo((s) => s.clients.find((x) => x.id === id))
  const lines = useDemo(useShallow((s) => s.ledger.filter((l) => l.client === id)))
  if (!c) return null
  return (
    <Card title={`${c.name} · wallet history`}>
      {lines.length === 0 && <div className="text-[13px] text-zinc-500">No wallet activity yet.</div>}
      {lines.slice(0, 6).map((l) => (
        <div key={l.id} className="flex items-center gap-3 text-[13px]">
          <span className="w-[60px] text-zinc-500">{fmtShort(l.when)}</span>
          <span className="flex-1">{l.note}</span>
          <span className="w-[70px] text-[11.5px] text-zinc-400">{l.by}</span>
          <span className={`w-[110px] text-right font-semibold ${l.amount > 0 ? 'text-emerald-700' : ''}`}>
            {l.amount > 0 ? '+' : '−'}
            {money(Math.abs(l.amount))}
          </span>
        </div>
      ))}
    </Card>
  )
}
