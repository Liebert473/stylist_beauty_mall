import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, Check, Lock, X } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import { approveTopup, balance, bonusFor, cashTopup, clientById } from '../store/ops'
import { Receipt } from '../ui/Receipt'
import { fmtShort, money } from '../ui/format'
import { Avatar, Card, Pill } from './ui'

export const setCash = (client: string | null, amount?: number) =>
  demo().update((s) => {
    if (client !== null) s.adminUi.selectedClient = client
    if (amount !== undefined) s.adminUi.cashAmount = amount
  })

function Approvals() {
  const s = useDemo((x) => x)
  const pending = s.topups.filter((t) => t.status === 'pending')
  if (!pending.length) return null
  return (
    <Card title={<span className="flex items-center gap-2">Transfers to approve <Pill tone="amber">{pending.length}</Pill></span>}>
      <AnimatePresence>
        {pending.map((t) => {
          const c = clientById(s, t.client)
          const acc = s.content.rewards.accounts.find((a) => a.id === t.account)
          const bonus = bonusFor(s.content, t.amount)
          return (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
              <div className="h-[168px] w-[96px] shrink-0 overflow-hidden rounded-lg shadow ring-1 ring-black/10">
                <Receipt amount={t.amount} txId={t.txId} small />
              </div>
              <div className="flex-1 space-y-1 text-[13.5px]">
                <div className="flex items-center gap-2">
                  <Avatar name={c?.name ?? ''} className="h-8 w-8 text-[11px]" />
                  <span className="text-[15px] font-semibold">{c?.name}</span>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-y-0.5 pt-1 text-zinc-700">
                  <span className="text-zinc-500">Amount</span>
                  <b>{money(t.amount)}</b>
                  <span className="text-zinc-500">To account</span>
                  <span>{acc?.name}</span>
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="font-mono">{t.txId}</span>
                  <span className="text-zinc-500">Bonus on approval</span>
                  <span className="font-semibold text-emerald-700">+{money(bonus)}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button data-demo="a:approve" onClick={() => approveTopup(t.id)} className="flex items-center gap-1.5 rounded-lg bg-cocoa px-3.5 py-2 text-[13px] font-semibold text-gold">
                    <Check size={15} /> Money received — approve
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-[13px] text-zinc-600">
                    <X size={15} /> Reject
                  </button>
                </div>
                <div className="text-[11.5px] text-zinc-500">Check the transfer in the salon’s {acc?.name} app first. Each transaction ID can only be used once.</div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </Card>
  )
}

function CashTopup() {
  const s = useDemo((x) => x)
  const sel = s.adminUi.selectedClient
  const amount = s.adminUi.cashAmount
  const bonus = bonusFor(s.content, amount)
  const members = s.clients.filter((c) => c.status === 'active')
  return (
    <Card title={<span className="flex items-center gap-2"><Banknote size={17} /> Cash top-up at the counter</span>}>
      <div className="grid grid-cols-2 gap-2 @4xl:grid-cols-3">
        {members.map((c) => (
          <button
            key={c.id}
            data-demo={`a:cash-client:${c.id}`}
            onClick={() => setCash(c.id)}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left ${sel === c.id ? 'border-cocoa bg-cocoa/5' : 'border-zinc-200'}`}
          >
            <Avatar name={c.name} className="h-7 w-7 text-[10.5px]" />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">{c.name}</div>
              <div className="text-[11px] text-zinc-500">{money(balance(s.ledger, c.id).total)}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {s.content.rewards.bonuses.map((b) => (
          <button
            key={b.id}
            data-demo={`a:cash-amount:${b.amount}`}
            onClick={() => setCash(null, b.amount)}
            className={`rounded-lg border px-3.5 py-2 text-[13.5px] ${amount === b.amount ? 'border-cocoa bg-cocoa text-gold' : 'border-zinc-300'}`}
          >
            <b>{money(b.amount)}</b> <span className={amount === b.amount ? 'text-gold/80' : 'text-emerald-700'}>+{money(b.bonus)}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3">
        <div className="text-[13.5px] text-zinc-600">
          Wallet credit: <b className="text-[16px] text-zinc-900">{money(amount + bonus)}</b>
          {bonus > 0 && <span className="text-zinc-500"> ({money(amount)} paid + {money(bonus)} bonus)</span>}
        </div>
        <button
          data-demo="a:cash-submit"
          disabled={!sel || !amount}
          onClick={() => {
            if (sel) cashTopup(sel, amount)
            setCash(null, 0)
          }}
          className="rounded-lg bg-cocoa px-4 py-2 text-[13.5px] font-semibold text-gold disabled:bg-zinc-300 disabled:text-white"
        >
          Record top-up
        </button>
      </div>
    </Card>
  )
}

export function WalletAdmin() {
  const s = useDemo((x) => x)
  return (
    <>
      <Approvals />
      <CashTopup />
      <Card title="Wallet history — all members" actions={<span className="flex items-center gap-1 text-[12px] text-zinc-500"><Lock size={12} /> Lines can’t be edited or deleted</span>}>
        <div data-field="admin.wallet" className="space-y-1.5">
          {s.ledger.slice(0, 9).map((l) => (
            <motion.div key={l.id} layout initial={{ opacity: 0, backgroundColor: 'rgb(252 214 159 / 0.6)' }} animate={{ opacity: 1, backgroundColor: 'rgb(252 214 159 / 0)' }} transition={{ duration: 1.6 }} className="flex items-center gap-3 rounded px-1 py-0.5 text-[13px]">
              <span className="w-[56px] text-zinc-500">{fmtShort(l.when)}</span>
              <span className="w-[150px] truncate font-medium">{clientById(s, l.client)?.name}</span>
              <span className="flex-1 truncate text-zinc-600">{l.note}</span>
              <Pill tone={l.bucket === 'paid' ? 'zinc' : 'cocoa'}>{l.bucket === 'paid' ? 'Paid' : 'Reward'}</Pill>
              <span className="w-[72px] truncate text-[11.5px] text-zinc-400">{l.by}</span>
              <span className={`w-[110px] text-right font-semibold ${l.amount > 0 ? 'text-emerald-700' : ''}`}>
                {l.amount > 0 ? '+' : '−'}
                {money(Math.abs(l.amount))}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="text-[12px] text-zinc-500">Refunds (owner only) pay back paid credit at {s.content.rewards.refundRate}%. Bonus and cash back credit are not refundable.</div>
      </Card>
    </>
  )
}
