import { CalendarDays, Crown, Gift, Wallet, BellRing, ChevronRight } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import { iso } from '../store/seed'
import { NOW, balance, clientById, endTime, servicesLabel, stylistName, tierById, walletTotalHeld } from '../store/ops'
import { fmtDate, money } from '../ui/format'
import { Avatar, Card, Pill, Stat } from './ui'
import { openSection } from './Admin'

export const STATUS: Record<string, { label: string; tone: 'zinc' | 'amber' | 'emerald' | 'cocoa' | 'violet' | 'red' }> = {
  pending: { label: 'To confirm', tone: 'amber' },
  confirmed: { label: 'Confirmed', tone: 'emerald' },
  arrived: { label: 'In the salon', tone: 'violet' },
  done: { label: 'Done', tone: 'zinc' },
  noshow: { label: 'No-show', tone: 'red' },
}

export function Today() {
  const s = useDemo((x) => x)
  const today = s.bookings.filter((b) => b.date === iso(0) && b.status !== 'noshow').sort((a, b) => a.time.localeCompare(b.time))
  const pending = s.bookings.filter((b) => b.status === 'pending')
  const topups = s.topups.filter((t) => t.status === 'pending')
  const cashback = s.ledger.filter((l) => l.kind === 'cashback').reduce((sum, l) => sum + l.amount, 0)
  const members = s.clients.filter((c) => c.status === 'active').length

  return (
    <>
      <div className="grid grid-cols-2 gap-3 @4xl:grid-cols-4">
        <Stat label="Bookings today" value={today.length} sub={`${today.filter((b) => b.status === 'done').length} done · ${today.filter((b) => b.time > NOW).length} still to come`} icon={CalendarDays} tone="cocoa" />
        <Stat label="Waiting for you" value={pending.length + topups.length} sub={`${pending.length} bookings · ${topups.length} top-ups`} icon={BellRing} tone={pending.length + topups.length ? 'amber' : 'zinc'} />
        <Stat label="Credit in VIP wallets" value={money(walletTotalHeld(s))} sub={`${members} active members`} icon={Wallet} tone="emerald" f="admin.wallet" />
        <Stat label="Cash back given" value={money(cashback)} sub="Last 30 days" icon={Gift} tone="cocoa" />
      </div>

      <div className="grid gap-4 @4xl:grid-cols-[1fr_1.15fr]">
        <Card title="Needs your attention">
          {pending.length + topups.length === 0 && <div className="text-[13.5px] text-zinc-500">All caught up.</div>}
          {pending.map((b) => (
            <button
              key={b.id}
              data-demo={`a:attention:${b.id}`}
              onClick={() => {
                demo().update((x) => {
                  x.adminUi.selectedBooking = b.id
                  x.adminUi.day = b.date
                })
                openSection('bookings')
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left"
            >
              <CalendarDays size={18} className="shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold">New booking · {b.name}</div>
                <div className="truncate text-[12px] text-zinc-600">
                  {servicesLabel(s.content, b.services)} · {fmtDate(b.date)} {b.time}
                </div>
              </div>
              <ChevronRight size={17} className="text-zinc-400" />
            </button>
          ))}
          {topups.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                demo().update((x) => void (x.adminUi.selectedTopup = t.id))
                openSection('wallet')
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left"
            >
              <Wallet size={18} className="shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold">Top-up to approve · {clientById(s, t.client)?.name}</div>
                <div className="text-[12px] text-zinc-600">{money(t.amount)} transfer with screenshot</div>
              </div>
              <ChevronRight size={17} className="text-zinc-400" />
            </button>
          ))}
          <div className="border-t border-zinc-100 pt-3">
            <div className="mb-2 text-[12.5px] font-semibold text-zinc-500">Top VIP balances</div>
            {s.clients
              .filter((c) => c.status === 'active')
              .slice(0, 4)
              .map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 py-1.5">
                  <Avatar name={c.name} className="h-7 w-7 text-[10.5px]" />
                  <span className="flex-1 text-[13.5px]">{c.name}</span>
                  <Pill tone="cocoa">
                    <Crown size={10} /> {tierById(s.content, c.tier).name}
                  </Pill>
                  <span className="w-[110px] text-right text-[13px] font-semibold">{money(balance(s.ledger, c.id).total)}</span>
                </div>
              ))}
          </div>
        </Card>

        <Card title={`Today · ${fmtDate(iso(0))}`} actions={<span className="text-[12px] text-zinc-500">Now {NOW}</span>}>
          <div className="space-y-1.5">
            {today.map((b) => (
              <div key={b.id} className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${b.status === 'done' ? 'opacity-55' : ''}`}>
                <div className="w-[86px] shrink-0 text-[12.5px] font-semibold text-zinc-600">
                  {b.time}–{endTime(b.time, b.minutes)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[13.5px] font-medium">
                    {b.name} {b.vip && <Crown size={12} className="text-gold-deep" />}
                  </div>
                  <div className="truncate text-[12px] text-zinc-500">
                    {servicesLabel(s.content, b.services)} · {stylistName(s.content, b.stylist)}
                  </div>
                </div>
                <Pill tone={STATUS[b.status].tone}>{STATUS[b.status].label}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
