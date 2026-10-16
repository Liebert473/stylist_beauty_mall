import { AnimatePresence, motion } from 'framer-motion'
import { Check, Crown, Phone, Receipt, UserCheck, X } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import { iso } from '../store/seed'
import { CLOSE, OPEN, bookingMessage, confirmBooking, endTime, servicesLabel, servicesTotal, setBookingStatus, sendViber, stylistName } from '../store/ops'
import type { Booking } from '../store/types'
import { Photo } from '../ui/Photo'
import { fmtLong, fmtParts, money } from '../ui/format'
import { Pill, ViberButton } from './ui'
import { STATUS } from './Today'
import { openSection } from './Admin'

const HOUR = 46
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const START = toMin(OPEN)
const HOURS = Array.from({ length: Math.ceil((toMin(CLOSE) - START) / 60) + 1 }, (_, i) => START + i * 60)

export const selectBooking = (id: string | null) => demo().update((s) => void (s.adminUi.selectedBooking = id))

export function startCheckout(b: Booking) {
  demo().update((s) => {
    s.checkout = { client: b.vip ?? '', booking: b.id, services: [...b.services], stylist: b.stylist, payWallet: b.payWallet ?? true, done: null }
  })
  openSection('checkout')
}

function Detail({ b }: { b: Booking }) {
  const content = useDemo((s) => s.content)
  const sent = useDemo((s) => s.phone.viber.some((m) => m.text === bookingMessage(s.content, b)))
  return (
    <motion.div layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-cocoa/30 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-bold">{b.name}</span>
            {b.vip && (
              <Pill tone="cocoa">
                <Crown size={10} /> VIP
              </Pill>
            )}
            <Pill tone={STATUS[b.status].tone}>{STATUS[b.status].label}</Pill>
            <Pill>{b.source === 'website' ? 'Website' : b.source === 'vip' ? 'VIP area' : b.source === 'phone' ? 'Phone' : 'Walk-in'}</Pill>
          </div>
          <div className="mt-1 text-[13.5px] text-zinc-700">
            {servicesLabel(content, b.services)} · {money(servicesTotal(content, b.services))}
          </div>
          <div className="text-[13px] text-zinc-500">
            {fmtLong(b.date)} · {b.time}–{endTime(b.time, b.minutes)} · {stylistName(content, b.stylist)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[12.5px] text-zinc-500">
            <Phone size={12} /> {b.phone}
            {b.note && <span className="ml-2 italic">“{b.note}”</span>}
          </div>
        </div>
        <button onClick={() => selectBooking(null)} className="text-zinc-400">
          <X size={18} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
        {b.status === 'pending' && (
          <>
            <button data-demo="a:confirm" onClick={() => confirmBooking(b.id)} className="flex items-center gap-1.5 rounded-lg bg-cocoa px-3.5 py-2 text-[13px] font-semibold text-gold">
              <Check size={15} /> Confirm
            </button>
            <button className="rounded-lg border border-zinc-300 px-3.5 py-2 text-[13px] text-zinc-600">Suggest another time</button>
          </>
        )}
        {b.status === 'confirmed' && (
          <>
            {sent ? (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-viber">
                <Check size={15} /> Confirmation sent on Viber
              </span>
            ) : (
              <ViberButton demoId="a:viber-booking" onClick={() => sendViber(bookingMessage(content, b))} label="Send confirmation on Viber" />
            )}
            <button onClick={() => setBookingStatus(b.id, 'arrived')} className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-[13px] text-zinc-700">
              <UserCheck size={15} /> Arrived
            </button>
          </>
        )}
        {(b.status === 'arrived' || b.status === 'confirmed') && b.vip && (
          <button data-demo="a:to-checkout" onClick={() => startCheckout(b)} className="flex items-center gap-1.5 rounded-lg bg-cocoa px-3.5 py-2 text-[13px] font-semibold text-gold">
            <Receipt size={15} /> Check out
          </button>
        )}
      </div>
      {b.status === 'pending' && <div className="mt-2 text-[12px] text-zinc-500">Confirming lets you send the customer a ready-made Viber message.</div>}
    </motion.div>
  )
}

export function Bookings() {
  const day = useDemo((s) => s.adminUi.day)
  const selected = useDemo((s) => s.bookings.find((b) => b.id === s.adminUi.selectedBooking))
  const team = useDemo((s) => s.content.team.stylists)
  const all = useDemo((s) => s.bookings)
  const content = useDemo((s) => s.content)
  const dayBookings = all.filter((b) => b.date === day && b.status !== 'noshow')
  const days = Array.from({ length: 7 }, (_, i) => iso(i))

  return (
    <>
      <div className="flex gap-2">
        {days.map((d) => {
          const p = fmtParts(d)
          const n = all.filter((b) => b.date === d).length
          const pend = all.some((b) => b.date === d && b.status === 'pending')
          return (
            <button
              key={d}
              data-demo={`a:day:${d}`}
              onClick={() => demo().update((s) => void (s.adminUi.day = d))}
              className={`relative flex flex-1 flex-col items-center rounded-xl border py-2 ${day === d ? 'border-cocoa bg-cocoa text-gold' : 'border-zinc-200 bg-white text-zinc-700'}`}
            >
              <span className="text-[11px] uppercase">{d === iso(0) ? 'Today' : p.dow}</span>
              <span className="text-[18px] leading-tight font-bold">{p.day}</span>
              <span className={`text-[10.5px] ${day === d ? 'text-gold/70' : 'text-zinc-400'}`}>{n} bookings</span>
              {pend && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />}
            </button>
          )
        })}
      </div>

      <AnimatePresence>{selected && <Detail key={selected.id} b={selected} />}</AnimatePresence>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid border-b border-zinc-200" style={{ gridTemplateColumns: `54px repeat(${team.length}, 1fr)` }}>
          <div />
          {team.map((t) => {
            const off = t.off.includes(day)
            return (
              <div key={t.id} className="flex items-center gap-2 border-l border-zinc-100 px-2.5 py-2">
                <Photo photo={t.photo} position="center 20%" className="h-8 w-8 shrink-0 rounded-full" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold">{t.name}</div>
                  <div className={`truncate text-[11px] ${off ? 'font-semibold text-red-600' : 'text-zinc-500'}`}>{off ? 'Day off' : t.role}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="relative grid" style={{ gridTemplateColumns: `54px repeat(${team.length}, 1fr)`, height: ((toMin(CLOSE) - START) / 60) * HOUR + 8 }}>
          <div className="relative">
            {HOURS.slice(0, -1).map((m) => (
              <div key={m} className="absolute right-2 text-[10.5px] text-zinc-400" style={{ top: ((m - START) / 60) * HOUR - 6 }}>
                {`${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`}
              </div>
            ))}
          </div>
          {team.map((t) => {
            const off = t.off.includes(day)
            return (
              <div key={t.id} className={`relative border-l border-zinc-100 ${off ? 'bg-[repeating-linear-gradient(45deg,#fafafa_0_8px,#f1f1f1_8px_16px)]' : ''}`}>
                {HOURS.slice(0, -1).map((m) => (
                  <div key={m} className="absolute inset-x-0 border-t border-zinc-100" style={{ top: ((m - START) / 60) * HOUR }} />
                ))}
                {dayBookings
                  .filter((b) => b.stylist === t.id)
                  .map((b) => {
                    const pend = b.status === 'pending'
                    const sel = selected?.id === b.id
                    return (
                      <motion.button
                        key={b.id}
                        layout
                        data-demo={`a:booking:${b.id}`}
                        onClick={() => selectBooking(b.id)}
                        initial={pend ? { scale: 0.8, opacity: 0 } : false}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1 text-left text-[11.5px] leading-tight ${
                          pend
                            ? 'border-2 border-dashed border-amber-500 bg-amber-50 text-amber-900'
                            : b.status === 'done'
                              ? 'bg-zinc-100 text-zinc-500'
                              : b.vip
                                ? 'bg-cocoa text-gold'
                                : 'bg-gold/50 text-cocoa-dark'
                        } ${sel ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                        style={{ top: ((toMin(b.time) - START) / 60) * HOUR + 1, height: (b.minutes / 60) * HOUR - 2 }}
                      >
                        <div className="flex items-center gap-1 truncate font-semibold">
                          {b.vip && <Crown size={10} className="shrink-0" />}
                          {b.name}
                        </div>
                        <div className="truncate opacity-80">
                          {b.time} · {servicesLabel(content, b.services)}
                        </div>
                      </motion.button>
                    )
                  })}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-[12px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border-2 border-dashed border-amber-500 bg-amber-50" /> Website request to confirm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-cocoa" /> VIP (confirmed automatically)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-gold/50" /> Confirmed
        </span>
      </div>
    </>
  )
}
