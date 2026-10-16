import { useShallow } from 'zustand/react/shallow'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  CalendarPlus,
  Check,
  Clock,
  Copy,
  Crown,
  Gift,
  Home,
  ImagePlus,
  Lock,
  Megaphone,
  Plus,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { demo, useDemo } from '../store/store'
import type { LedgerLine, VipPage } from '../store/types'
import {
  balance,
  bonusFor,
  findService,
  nextTier,
  servicesLabel,
  servicesMinutes,
  servicesTotal,
  setTopupForm,
  slots,
  stylistName,
  submitTopup,
  submitVipBooking,
  activateVip,
  tierById,
} from '../store/ops'
import { Field } from '../site/Field'
import { useScrollToFlash } from '../site/Site'
import { DAYS } from '../site/BookPage'
import { Monogram, Wordmark } from '../ui/Logo'
import { Photo } from '../ui/Photo'
import { Receipt } from '../ui/Receipt'
import { fmtLong, fmtParts, fmtShort, money } from '../ui/format'

export const goVip = (page: VipPage) => demo().update((s) => void (s.vipPage = page))

const card = 'rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgb(74_42_29/0.08)]'
const input = 'w-full rounded-xl border border-cocoa/20 bg-white px-3.5 py-3 text-[15px] outline-none focus:border-cocoa'

function useClient() {
  const id = useDemo((s) => s.vip.session)
  return useDemo((s) => s.clients.find((c) => c.id === id))
}

// ——— sign in ———

function Login() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-cocoa px-7 py-10 text-center">
      <Monogram className="h-24 w-24" />
      <Wordmark className="mt-4 h-8" />
      <div className="mt-2 text-[11px] tracking-[0.35em] text-gold/70 uppercase">VIP members</div>
      <div className="mt-10 w-full space-y-3">
        <input className={`${input} border-0`} placeholder="Username" />
        <input className={`${input} border-0`} placeholder="Password" type="password" />
        <button className="w-full rounded-full bg-gold py-3.5 text-[14px] font-semibold tracking-[0.12em] text-cocoa-dark uppercase">Log in</button>
      </div>
      <div className="mt-6 flex items-center gap-1.5 text-[12px] text-white/50">
        <Lock size={12} /> Membership is by invitation only
      </div>
    </div>
  )
}

export const setPassword = (key: 'password' | 'password2', v: string) => demo().update((s) => void (s.vip[key] = v))

function Setup() {
  const invited = useDemo((s) => s.clients.find((c) => c.status === 'invited') ?? s.clients.find((c) => c.id === s.vip.session))
  const pw = useDemo((s) => s.vip.password)
  const pw2 = useDemo((s) => s.vip.password2)
  const ok = pw.length >= 8 && pw === pw2
  if (!invited) return <Login />
  return (
    <div className="min-h-full bg-cream">
      <div className="bg-cocoa px-6 pt-8 pb-10 text-center">
        <Monogram className="mx-auto h-16 w-16" />
        <div className="mt-4 text-[11px] tracking-[0.35em] text-gold/70 uppercase">You are invited</div>
        <div className="mt-1 font-display text-[28px] leading-tight text-gold">Welcome, {invited.name}</div>
      </div>
      <div className="-mt-5 space-y-3 px-5 pb-8">
        <div className={card}>
          <div className="text-[12px] text-ink/50">Your username</div>
          <div className="text-[17px] font-semibold text-cocoa-dark">{invited.username}</div>
        </div>
        <div className={`${card} space-y-3`}>
          <div className="text-[15px] font-semibold text-cocoa-dark">Choose your password</div>
          <input data-demo="v:pw" className={input} type="password" placeholder="New password (8+ characters)" value={pw} onChange={(e) => setPassword('password', e.target.value)} />
          <input data-demo="v:pw2" className={input} type="password" placeholder="Repeat password" value={pw2} onChange={(e) => setPassword('password2', e.target.value)} />
          <div className={`flex items-center gap-1.5 text-[12px] ${ok ? 'text-emerald-700' : 'text-ink/45'}`}>
            <Check size={13} /> Only you know your password — not even the salon
          </div>
          <button
            data-demo="v:setup-submit"
            disabled={!ok}
            onClick={() => activateVip(invited.id)}
            className="w-full rounded-full bg-cocoa py-3.5 text-[14px] font-semibold tracking-[0.12em] text-gold uppercase disabled:opacity-40"
          >
            Set password &amp; enter
          </button>
        </div>
      </div>
    </div>
  )
}

// ——— pieces ———

function WalletCard({ compact }: { compact?: boolean }) {
  const c = useClient()
  const ledger = useDemo((s) => s.ledger)
  if (!c) return null
  const b = balance(ledger, c.id)
  return (
    <Field f="vip.balance" className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_140%_at_0%_0%,#8a553b_0%,#4a2a1d_60%,#2c1912_100%)] p-5 text-white shadow-lg">
      <Monogram className="absolute -top-4 -right-6 h-36 w-36 opacity-[0.12]" />
      <div className="flex items-center gap-1.5 text-[11px] tracking-[0.25em] text-gold/80 uppercase">
        <Wallet size={13} /> Wallet balance
      </div>
      <motion.div key={b.total} initial={{ scale: 1.08, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="mt-1 font-display text-[36px] leading-tight text-gold">
        {money(b.total)}
      </motion.div>
      <div className="mt-1 flex gap-4 text-[11.5px] text-white/60">
        <span>Paid {money(b.paid)}</span>
        <span>Rewards {money(b.reward)}</span>
      </div>
      {!compact && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button data-demo="v:topup" onClick={() => goVip('topup')} className="flex items-center justify-center gap-1.5 rounded-full bg-gold py-2.5 text-[13px] font-semibold text-cocoa-dark">
            <Plus size={16} /> Top up
          </button>
          <button data-demo="v:book" onClick={() => goVip('book')} className="flex items-center justify-center gap-1.5 rounded-full border border-gold/50 py-2.5 text-[13px] font-semibold text-gold">
            <CalendarPlus size={16} /> Book
          </button>
        </div>
      )}
    </Field>
  )
}

function Progress() {
  const c = useClient()
  const content = useDemo((s) => s.content)
  const r = content.rewards
  if (!c) return null
  const tier = tierById(content, c.tier)
  const left = r.step - c.progress
  return (
    <Field f="vip.progress" className={card}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/40 text-cocoa">
            <Crown size={16} />
          </span>
          <div>
            <div className="text-[14px] font-semibold text-cocoa-dark">{tier.name} member</div>
            <div className="text-[11.5px] text-ink/50">{money(tier.cashback)} back every {money(r.step)}</div>
          </div>
        </div>
        <button onClick={() => goVip('rewards')} className="text-[12px] font-semibold text-gold-deep">
          Rewards →
        </button>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-sand">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold" animate={{ width: `${Math.min(100, (c.progress / r.step) * 100)}%` }} transition={{ duration: 0.9 }} />
      </div>
      <div className="mt-2 text-[12.5px] text-ink/65">
        Spend <b className="text-cocoa-dark">{money(left)}</b> more to get <b className="text-cocoa-dark">{money(tier.cashback)}</b> back
      </div>
    </Field>
  )
}

const LINE: Record<LedgerLine['kind'], { label: string; icon: typeof Plus }> = {
  topup: { label: 'Top-up', icon: ArrowDownLeft },
  bonus: { label: 'Top-up bonus', icon: Gift },
  payment: { label: 'Payment', icon: ArrowUpRight },
  cashback: { label: 'Cash back', icon: Sparkles },
  refund: { label: 'Refund', icon: ArrowUpRight },
  birthday: { label: 'Birthday gift', icon: Gift },
  adjust: { label: 'Adjustment', icon: Check },
}

function History({ limit }: { limit?: number }) {
  const c = useClient()
  const lines = useDemo(useShallow((s) => s.ledger.filter((l) => l.client === s.vip.session)))
  if (!c) return null
  const shown = limit ? lines.slice(0, limit) : lines
  if (!shown.length) return <div className="py-6 text-center text-[13px] text-ink/45">No activity yet — top up to get started.</div>
  return (
    <div className="divide-y divide-cocoa/8">
      {shown.map((l) => {
        const L = LINE[l.kind]
        return (
          <motion.div key={l.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-2.5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${l.amount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-sand text-cocoa'}`}>
              <L.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-cocoa-dark">{L.label}</div>
              <div className="truncate text-[11.5px] text-ink/50">
                {fmtShort(l.when)} · {l.note}
              </div>
            </div>
            <div className={`text-[13.5px] font-semibold whitespace-nowrap ${l.amount > 0 ? 'text-emerald-700' : 'text-ink'}`}>
              {l.amount > 0 ? '+' : '−'}
              {money(Math.abs(l.amount))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function Notices() {
  const notices = useDemo((s) => s.vip.notices)
  if (!notices.length) return null
  return (
    <Field f="vip.notices" className={`${card} space-y-2.5`}>
      <AnimatePresence initial={false}>
        {notices.slice(0, 2).map((n) => (
          <motion.div key={n.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/40 text-cocoa">
              {n.kind === 'cashback' ? <Sparkles size={15} /> : n.kind === 'booking' ? <CalendarCheck size={15} /> : n.kind === 'topup' ? <Wallet size={15} /> : <Bell size={15} />}
            </span>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-cocoa-dark">{n.title}</div>
              <div className="text-[12px] leading-snug text-ink/55">{n.text}</div>
            </div>
            <span className="ml-auto shrink-0 text-[11px] text-ink/40">{n.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </Field>
  )
}

function NewsList({ limit }: { limit?: number }) {
  const items = useDemo((s) => s.content.news.items)
  const shown = limit ? items.slice(0, limit) : items
  return (
    <div className="space-y-3">
      {shown.map((n) => (
        <Field key={n.id} f={`news.items.${n.id}`} className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgb(74_42_29/0.08)]">
          <Photo photo={n.photo} className="aspect-[16/8]" />
          <div className="p-4">
            <div className="flex items-center gap-2 text-[11px]">
              {n.audience === 'vip' ? (
                <span className="flex items-center gap-1 rounded-full bg-cocoa px-2 py-0.5 font-semibold tracking-wider text-gold uppercase">
                  <Crown size={10} /> Members only
                </span>
              ) : (
                <span className="rounded-full bg-sand px-2 py-0.5 font-semibold tracking-wider text-cocoa uppercase">News</span>
              )}
              <span className="text-ink/45">{fmtShort(n.date)}</span>
            </div>
            <div className="mt-1.5 text-[16px] leading-snug font-semibold text-cocoa-dark">{n.title || 'Untitled'}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-ink/65">{n.text}</div>
          </div>
        </Field>
      ))}
    </div>
  )
}

function NextBooking() {
  const id = useDemo((s) => s.vip.session)
  const content = useDemo((s) => s.content)
  const b = useDemo((s) => s.bookings.filter((x) => x.vip === id && x.status !== 'done' && x.status !== 'noshow').sort((a, z) => (a.date + a.time).localeCompare(z.date + z.time))[0])
  if (!b) return null
  return (
    <Field f="vip.booking" className={`${card} flex items-center gap-3`}>
      <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-cocoa py-1.5 text-gold">
        <span className="text-[10px] uppercase">{fmtParts(b.date).mon}</span>
        <span className="text-[19px] leading-none font-semibold">{fmtParts(b.date).day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">Confirmed · {b.time}</div>
        <div className="truncate text-[14px] font-semibold text-cocoa-dark">{servicesLabel(content, b.services)}</div>
        <div className="text-[12px] text-ink/55">with {stylistName(content, b.stylist)}</div>
      </div>
    </Field>
  )
}

// ——— screens ———

function HomeScreen() {
  const c = useClient()
  if (!c) return null
  return (
    <div className="space-y-3.5 p-4">
      <div>
        <div className="text-[13px] text-ink/50">Mingalaba,</div>
        <div className="font-display text-[26px] leading-tight text-cocoa-dark">{c.name}</div>
      </div>
      <WalletCard />
      <Notices />
      <NextBooking />
      <Progress />
      <div className="flex items-center justify-between pt-1">
        <div className="font-display text-[19px] text-cocoa-dark">For our members</div>
        <button onClick={() => goVip('news')} className="text-[12px] font-semibold text-gold-deep">
          All →
        </button>
      </div>
      <NewsList limit={2} />
    </div>
  )
}

function WalletScreen() {
  return (
    <div className="space-y-3.5 p-4">
      <WalletCard />
      <div className={card}>
        <div className="mb-1 font-display text-[18px] text-cocoa-dark">History</div>
        <History />
      </div>
      <div className="px-2 text-center text-[11.5px] leading-snug text-ink/45">Credit never expires. Every line is permanent — corrections are added as new lines with a reason.</div>
    </div>
  )
}

function TopupScreen() {
  const f = useDemo((s) => s.topup)
  const r = useDemo((s) => s.content.rewards)
  const content = useDemo((s) => s.content)
  const pending = useDemo((s) => s.topups.find((t) => t.client === s.vip.session && t.status === 'pending'))
  const acc = r.accounts.find((a) => a.id === f.account) ?? r.accounts[0]
  const bonus = bonusFor(content, f.amount)

  if (f.submitted || pending) {
    return (
      <div className="space-y-3.5 p-4">
        <div className={`${card} text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Clock size={26} />
          </div>
          <div className="mt-3 font-display text-[22px] text-cocoa-dark">Waiting for approval</div>
          <div className="mt-1 text-[13px] text-ink/60">
            {money(pending?.amount ?? f.amount)} via {acc.name}. We check the transfer and add it to your wallet — usually within minutes.
          </div>
        </div>
        <WalletCard compact />
      </div>
    )
  }

  return (
    <div className="space-y-3.5 p-4">
      <div className="font-display text-[24px] text-cocoa-dark">Top up</div>
      <div className={card}>
        <div className="mb-2 text-[13px] font-semibold text-ink/60">1 · Amount</div>
        <div className="grid grid-cols-3 gap-2">
          {r.bonuses.map((b) => (
            <Field key={b.id} f={`rewards.bonuses.${b.id}`}>
              <button
                data-demo={`v:amount:${b.amount}`}
                onClick={() => setTopupForm('amount', b.amount)}
                className={`w-full rounded-xl border px-1 py-2.5 text-center ${f.amount === b.amount ? 'border-cocoa bg-cocoa text-gold' : 'border-cocoa/20 text-cocoa-dark'}`}
              >
                <div className="text-[14px] font-semibold">{(b.amount / 1000).toLocaleString('en-US')}K</div>
                <div className={`text-[11px] ${f.amount === b.amount ? 'text-gold/80' : 'text-emerald-700'}`}>+{(b.bonus / 1000).toLocaleString('en-US')}K bonus</div>
              </button>
            </Field>
          ))}
        </div>
        {f.amount > 0 && (
          <div className="mt-2 text-[12.5px] text-ink/60">
            You get <b className="text-cocoa-dark">{money(f.amount + bonus)}</b> of credit.
          </div>
        )}
      </div>
      <div className={card}>
        <div className="mb-2 text-[13px] font-semibold text-ink/60">2 · Transfer to</div>
        <div className="mb-2 flex gap-1.5">
          {r.accounts.map((a) => (
            <button key={a.id} onClick={() => setTopupForm('account', a.id)} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${f.account === a.id ? 'bg-cocoa text-gold' : 'bg-sand text-cocoa'}`}>
              {a.name}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-sand px-3.5 py-3">
          <div>
            <div className="text-[12px] text-ink/55">{acc.holder}</div>
            <div className="text-[17px] font-semibold tracking-wide text-cocoa-dark">{acc.number}</div>
          </div>
          <Copy size={18} className="text-cocoa" />
        </div>
      </div>
      <div className={card}>
        <div className="mb-2 text-[13px] font-semibold text-ink/60">3 · Upload the screenshot</div>
        {f.screenshot ? (
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="h-24 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-cocoa/15">
              <Receipt amount={f.amount} txId={f.txId} small />
            </motion.div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1 text-[12.5px] font-semibold text-emerald-700">
                <Check size={14} /> Screenshot attached
              </div>
              <input data-demo="v:txid" className={`${input} py-2 text-[14px]`} placeholder="Transaction ID" value={f.txId} onChange={(e) => setTopupForm('txId', e.target.value)} />
            </div>
          </div>
        ) : (
          <button
            data-demo="v:upload"
            onClick={() => demo().update((s) => void (s.phone.overlay = 'photos'))}
            className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-cocoa/25 py-5 text-cocoa"
          >
            <ImagePlus size={24} />
            <span className="text-[13px] font-semibold">Choose screenshot</span>
          </button>
        )}
      </div>
      <button
        data-demo="v:topup-submit"
        disabled={!f.amount || !f.screenshot || !f.txId}
        onClick={() => submitTopup()}
        className="w-full rounded-full bg-cocoa py-3.5 text-[14px] font-semibold tracking-[0.12em] text-gold uppercase disabled:opacity-40"
      >
        Send for approval
      </button>
    </div>
  )
}

export const setVipBooking = <K extends keyof ReturnType<typeof demo>['vipBooking']>(key: K, value: ReturnType<typeof demo>['vipBooking'][K]) =>
  demo().update((s) => void (s.vipBooking[key] = value))

export const toggleVipService = (id: string) =>
  demo().update((s) => {
    const list = s.vipBooking.services
    s.vipBooking.services = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    s.vipBooking.time = ''
  })

function BookScreen() {
  const f = useDemo((s) => s.vipBooking)
  const content = useDemo((s) => s.content)
  const bookings = useDemo((s) => s.bookings)
  const c = useClient()
  const ledger = useDemo((s) => s.ledger)
  if (!c) return null
  const minutes = servicesMinutes(content, f.services)
  const total = servicesTotal(content, f.services)
  const cat = f.services.length ? findService(content, f.services[0])?.category ?? 'hair' : 'hair'
  const team = content.team.stylists.filter((t) => t.skills.includes(cat))
  const times = f.services.length && f.date && f.stylist ? slots(content, bookings, f.date, minutes, f.stylist, cat) : []
  const bal = balance(ledger, c.id).total

  if (f.submitted) {
    return (
      <div className="space-y-3.5 p-4">
        <div className={`${card} text-center`}>
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CalendarCheck size={26} />
          </motion.div>
          <div className="mt-3 font-display text-[24px] text-cocoa-dark">You’re booked</div>
          <div className="mt-1 text-[13.5px] text-ink/65">
            {servicesLabel(content, f.services)}
            <br />
            {fmtLong(f.date)} · {f.time} · {stylistName(content, f.stylist)}
          </div>
          {f.payWallet && <div className="mt-3 rounded-xl bg-sand px-3 py-2 text-[12.5px] text-cocoa">{money(total)} will be paid from your wallet at checkout</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3.5 p-4">
      <div className="font-display text-[24px] text-cocoa-dark">Book</div>
      <div className={card}>
        <div className="mb-2 text-[13px] font-semibold text-ink/60">Services</div>
        <div className="flex flex-wrap gap-1.5">
          {content.services.categories.flatMap((cg) =>
            cg.items
              .filter((i) => i.online)
              .slice(0, 3)
              .map((i) => (
                <button
                  key={i.id}
                  data-demo={`v:svc:${i.id}`}
                  onClick={() => toggleVipService(i.id)}
                  className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium ${f.services.includes(i.id) ? 'border-cocoa bg-cocoa text-gold' : 'border-cocoa/20 text-cocoa-dark'}`}
                >
                  {i.name}
                </button>
              )),
          )}
        </div>
        {f.services.length > 0 && (
          <div className="mt-2 text-[12.5px] text-ink/60">
            {minutes} min · {money(total)}
          </div>
        )}
      </div>
      <div className={card}>
        <div className="mb-2 text-[13px] font-semibold text-ink/60">Stylist</div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {team.map((t) => (
            <button key={t.id} data-demo={`v:stylist:${t.id}`} onClick={() => setVipBooking('stylist', t.id)} className="flex w-[70px] shrink-0 flex-col items-center gap-1">
              <Photo photo={t.photo} position="center 20%" className={`h-14 w-14 rounded-full ring-2 ring-offset-2 ${f.stylist === t.id ? 'ring-cocoa' : 'ring-transparent'}`} />
              <span className="text-center text-[11.5px] leading-tight font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={card}>
        <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-ink/60">
          Date &amp; time
          <span className="flex items-center gap-1 rounded-full bg-gold/40 px-2 py-0.5 text-[10.5px] tracking-wider text-cocoa uppercase">
            <Crown size={10} /> VIP priority
          </span>
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {DAYS.slice(0, 7).map((d) => {
            const p = fmtParts(d)
            return (
              <button
                key={d}
                data-demo={`v:date:${d}`}
                onClick={() => {
                  setVipBooking('date', d)
                  setVipBooking('time', '')
                }}
                className={`flex w-[46px] shrink-0 flex-col items-center rounded-xl border py-1.5 ${f.date === d ? 'border-cocoa bg-cocoa text-gold' : 'border-cocoa/15'}`}
              >
                <span className="text-[10px] uppercase">{p.dow}</span>
                <span className="text-[16px] font-semibold">{p.day}</span>
              </button>
            )
          })}
        </div>
        {times.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {times
              .filter((t) => t.free)
              .slice(0, 8)
              .map((t) => (
                <button
                  key={t.time}
                  data-demo={`v:time:${t.time}`}
                  onClick={() => setVipBooking('time', t.time)}
                  className={`rounded-lg border py-1.5 text-[12.5px] font-medium ${f.time === t.time ? 'border-cocoa bg-cocoa text-gold' : 'border-cocoa/20'}`}
                >
                  {t.time}
                </button>
              ))}
          </div>
        )}
      </div>
      <button
        data-demo="v:paywallet"
        onClick={() => setVipBooking('payWallet', !f.payWallet)}
        className={`${card} flex w-full items-center gap-3 text-left`}
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${f.payWallet ? 'bg-cocoa text-gold' : 'border border-cocoa/30'}`}>{f.payWallet && <Check size={15} />}</span>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-cocoa-dark">Pay from my wallet</div>
          <div className="text-[12px] text-ink/50">Balance {money(bal)} · charged at checkout</div>
        </div>
      </button>
      <button
        data-demo="v:book-submit"
        disabled={!f.services.length || !f.stylist || !f.date || !f.time}
        onClick={() => submitVipBooking()}
        className="w-full rounded-full bg-cocoa py-3.5 text-[14px] font-semibold tracking-[0.12em] text-gold uppercase disabled:opacity-40"
      >
        Confirm booking
      </button>
    </div>
  )
}

function RewardsScreen() {
  const c = useClient()
  const r = useDemo((s) => s.content.rewards)
  const content = useDemo((s) => s.content)
  if (!c) return null
  const nt = nextTier(content, c.tier)
  return (
    <div className="space-y-3.5 p-4">
      <div className="font-display text-[24px] text-cocoa-dark">Rewards</div>
      <Progress />
      {nt && (
        <div className={card}>
          <div className="text-[13px] text-ink/60">Spent in the last 12 months</div>
          <div className="text-[20px] font-semibold text-cocoa-dark">{money(c.spend12m)}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
            <div className="h-full rounded-full bg-cocoa" style={{ width: `${Math.min(100, (c.spend12m / nt.min) * 100)}%` }} />
          </div>
          <div className="mt-1.5 text-[12px] text-ink/55">
            {money(nt.min - c.spend12m)} more to reach {nt.name}
          </div>
        </div>
      )}
      <div className={card}>
        <div className="mb-2 font-display text-[17px] text-cocoa-dark">Cash back by tier</div>
        {r.tiers.map((t) => (
          <Field key={t.id} f={`rewards.tiers.${t.id}`} className={`flex items-center gap-3 rounded-xl px-2 py-2 ${t.id === c.tier ? 'bg-gold/30' : ''}`}>
            <Crown size={17} className={t.id === 'platinum' ? 'text-cocoa' : t.id === 'gold' ? 'text-gold-deep' : 'text-zinc-400'} />
            <div className="flex-1">
              <div className="text-[14px] font-semibold">{t.name}</div>
              <div className="text-[11.5px] text-ink/50">{t.perk}</div>
            </div>
            <div className="text-right text-[13px] font-semibold text-cocoa-dark">
              {money(t.cashback)}
              <div className="text-[10.5px] font-normal text-ink/45">per {money(r.step)}</div>
            </div>
          </Field>
        ))}
      </div>
      <div className={card}>
        <div className="mb-2 font-display text-[17px] text-cocoa-dark">Top-up bonus</div>
        {r.bonuses.map((b) => (
          <Field key={b.id} f={`rewards.bonuses.${b.id}`} className="flex justify-between py-1.5 text-[13.5px]">
            <span>Top up {money(b.amount)}</span>
            <span className="font-semibold text-emerald-700">+{money(b.bonus)}</span>
          </Field>
        ))}
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-sand px-3 py-2 text-[12.5px] text-cocoa">
          <Gift size={15} /> Birthday gift: {money(r.birthday)} credit in your birthday month
        </div>
      </div>
    </div>
  )
}

function NewsScreen() {
  return (
    <div className="space-y-3.5 p-4">
      <div className="font-display text-[24px] text-cocoa-dark">News &amp; offers</div>
      <NewsList />
    </div>
  )
}

// ——— shell ———

const TABS: { id: VipPage; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'book', label: 'Book', icon: CalendarPlus },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'news', label: 'News', icon: Megaphone },
]

function Celebrate() {
  const n = useDemo((s) => s.vip.celebrate)
  const done = useDemo((s) => s.checkout.done)
  return (
    <AnimatePresence>
      {n > 0 && done?.cashback ? (
        <motion.div
          key={n}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.95], y: [20, 0, 0, -10] }}
          transition={{ duration: 3.4, times: [0, 0.12, 0.85, 1] }}
          className="pointer-events-none absolute inset-x-6 top-1/3 z-40 rounded-3xl bg-cocoa p-6 text-center shadow-2xl"
        >
          <Sparkles className="mx-auto text-gold" size={34} />
          <div className="mt-2 font-display text-[30px] text-gold">+{money(done.cashback)}</div>
          <div className="text-[14px] text-white/80">cash back added to your wallet</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/** The invitation-only VIP members area (vip.stylistbeautymall.com), built mobile-first as an installable web app. */
export function Vip() {
  const page = useDemo((s) => s.vipPage)
  const session = useDemo((s) => s.vip.session)
  const unread = useDemo((s) => s.vip.notices.length)
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [page])
  useScrollToFlash(scroller)

  const signedIn = !!session && page !== 'setup' && page !== 'login'
  return (
    <div className="@container relative h-full w-full bg-cocoa-deep">
      <div className="relative mx-auto flex h-full w-full max-w-[480px] flex-col bg-cream text-ink @3xl:shadow-2xl">
        {signedIn && (
          <header className="flex shrink-0 items-center gap-2 bg-cocoa px-4 py-2.5">
            <Monogram className="h-8 w-8" />
            <div className="leading-none">
              <Wordmark className="h-4" />
              <div className="mt-1 text-[9px] tracking-[0.3em] text-gold/70 uppercase">VIP club</div>
            </div>
            <span className="relative ml-auto text-gold">
              <Bell size={20} />
              {unread > 0 && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-cocoa" />}
            </span>
          </header>
        )}
        <div ref={scroller} data-site-scroll className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={signedIn ? page : `out-${page}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="min-h-full">
              {page === 'setup' && <Setup />}
              {(page === 'login' || (!session && page !== 'setup')) && <Login />}
              {signedIn && page === 'home' && <HomeScreen />}
              {signedIn && page === 'wallet' && <WalletScreen />}
              {signedIn && page === 'topup' && <TopupScreen />}
              {signedIn && page === 'book' && <BookScreen />}
              {signedIn && page === 'rewards' && <RewardsScreen />}
              {signedIn && page === 'news' && <NewsScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
        {signedIn && (
          <nav className="grid shrink-0 grid-cols-5 border-t border-cocoa/10 bg-white pt-1.5 pb-1">
            {TABS.map((t) => {
              const on = page === t.id || (t.id === 'wallet' && page === 'topup')
              return (
                <button key={t.id} data-demo={`v:tab:${t.id}`} onClick={() => goVip(t.id)} className={`flex flex-col items-center gap-0.5 py-1 text-[10.5px] font-medium ${on ? 'text-cocoa' : 'text-ink/40'}`}>
                  <t.icon size={20} strokeWidth={on ? 2.3 : 1.8} />
                  {t.label}
                </button>
              )
            })}
          </nav>
        )}
        <Celebrate />
      </div>
    </div>
  )
}

