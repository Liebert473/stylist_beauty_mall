import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Check, Clock, MessageCircle, Users } from 'lucide-react'
import { useDemo } from '../store/store'
import { iso } from '../store/seed'
import { findService, isOff, resetBookingForm, setBookingForm, slots, stylistName, submitBooking } from '../store/ops'
import { Photo } from '../ui/Photo'
import { fmtDate, fmtParts, money } from '../ui/format'
import { Field } from './Field'
import { Kicker } from './pages'

export const DAYS = Array.from({ length: 10 }, (_, i) => iso(i))

function Section({ n, title, done, children }: { n: number; title: string; done?: boolean; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm @3xl:p-7">
      <div className="mb-3 flex items-center gap-3 @3xl:mb-5">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ${done ? 'bg-cocoa text-gold' : 'bg-sand text-cocoa'}`}>
          {done ? <Check size={15} strokeWidth={3} /> : n}
        </span>
        <span className="font-display text-[19px] text-cocoa-dark @3xl:text-[24px]">{title}</span>
      </div>
      {children}
    </div>
  )
}

const input =
  'w-full rounded-xl border border-cocoa/20 bg-cream/60 px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-cocoa @3xl:text-[16px]'

export function BookPage() {
  const f = useDemo((s) => s.booking)
  const content = useDemo((s) => s.content)
  const bookings = useDemo((s) => s.bookings)
  const cat = content.services.categories.find((c) => c.id === f.category) ?? content.services.categories[0]
  const svc = findService(content, f.service)
  const team = content.team.stylists.filter((t) => t.skills.includes(cat.id))
  const times = svc && f.date ? slots(content, bookings, f.date, svc.minutes, f.stylist, svc.category) : []
  const stylistOff = !!f.stylist && !!f.date && isOff(content, f.stylist, f.date)

  if (f.submitted && svc) {
    const chosen = times.find((t) => t.time === f.time)?.stylist
    return (
      <section className="px-5 py-12 @3xl:px-16 @3xl:py-20">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto max-w-xl rounded-3xl bg-white p-7 text-center shadow-sm @3xl:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cocoa text-gold">
            <CalendarCheck size={30} />
          </div>
          <div className="mt-5 font-display text-[28px] text-cocoa-dark @3xl:text-[38px]">Request received</div>
          <p className="mt-2 text-[15px] text-ink/65">We will confirm your booking on Viber within minutes.</p>
          <div className="mt-6 space-y-2 rounded-2xl bg-sand p-5 text-left text-[15px]">
            <div className="font-semibold text-cocoa-dark">{svc.name}</div>
            <div className="flex items-center gap-2 text-ink/70">
              <CalendarCheck size={16} /> {fmtDate(f.date)} · {f.time}
            </div>
            <div className="flex items-center gap-2 text-ink/70">
              <Users size={16} /> {stylistName(content, f.stylist || chosen || '')}
            </div>
          </div>
          <button onClick={resetBookingForm} className="mt-6 text-[13px] font-semibold tracking-wider text-gold-deep uppercase">
            Book another service
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="bg-sand/60 px-4 py-8 @3xl:px-16 @3xl:py-14">
      <Kicker>Online booking</Kicker>
      <h1 className="font-display text-[32px] leading-tight text-cocoa-dark @3xl:text-[52px]">Book your visit</h1>
      <p className="mt-1 text-[14px] text-ink/60 @3xl:text-[17px]">No account needed — we confirm on Viber.</p>

      <div className="mt-6 space-y-4 @3xl:mt-10 @3xl:grid @3xl:grid-cols-2 @3xl:gap-6 @3xl:space-y-0">
        <Section n={1} title="Service" done={!!svc}>
          <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
            {content.services.categories.map((c) => (
              <button
                key={c.id}
                data-demo={`s:cat:${c.id}`}
                onClick={() => {
                  setBookingForm('category', c.id)
                  setBookingForm('service', '')
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ${f.category === c.id ? 'bg-cocoa text-gold' : 'bg-sand text-cocoa'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {cat.items
              .filter((i) => i.online)
              .map((i) => (
                <button
                  key={i.id}
                  data-demo={`s:svc:${i.id}`}
                  onClick={() => setBookingForm('service', i.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${f.service === i.id ? 'border-cocoa bg-cocoa/5' : 'border-cocoa/15'}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-cocoa-dark">{i.name}</div>
                    <div className="flex items-center gap-1 text-[12px] text-ink/50">
                      <Clock size={11} /> {i.minutes} min
                    </div>
                  </div>
                  <div className="text-[14px] font-semibold whitespace-nowrap text-cocoa">{money(i.price)}</div>
                </button>
              ))}
          </div>
        </Section>

        <Section n={2} title="Stylist" done={!!svc && !!f.stylist}>
          <div className="grid grid-cols-3 gap-2 @3xl:grid-cols-4">
            <button
              data-demo="s:stylist:any"
              onClick={() => setBookingForm('stylist', '')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 ${!f.stylist ? 'border-cocoa bg-cocoa/5' : 'border-cocoa/15'}`}
            >
              <span className="flex aspect-square w-full items-center justify-center rounded-lg bg-sand text-cocoa">
                <Users size={26} />
              </span>
              <span className="text-[12px] font-semibold">Anyone free</span>
            </button>
            {team.map((t) => (
              <Field key={t.id} f={`team.stylists.${t.id}.off`}>
                <button
                  data-demo={`s:stylist:${t.id}`}
                  onClick={() => setBookingForm('stylist', t.id)}
                  className={`flex w-full flex-col items-center gap-1.5 rounded-xl border p-2 ${f.stylist === t.id ? 'border-cocoa bg-cocoa/5' : 'border-cocoa/15'}`}
                >
                  <Photo photo={t.photo} className="aspect-square w-full rounded-lg" position="center 20%" />
                  <span className="text-[12px] leading-tight font-semibold">{t.name}</span>
                </button>
              </Field>
            ))}
          </div>
        </Section>

        <Section n={3} title="Date & time" done={!!f.date && !!f.time}>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {DAYS.map((d) => {
              const p = fmtParts(d)
              const off = !!f.stylist && isOff(content, f.stylist, d)
              return (
                <button
                  key={d}
                  data-demo={`s:date:${d}`}
                  onClick={() => {
                    setBookingForm('date', d)
                    setBookingForm('time', '')
                  }}
                  className={`flex w-[54px] shrink-0 flex-col items-center rounded-xl border py-2 ${
                    f.date === d ? 'border-cocoa bg-cocoa text-gold' : off ? 'border-dashed border-cocoa/20 text-ink/30' : 'border-cocoa/15 text-cocoa-dark'
                  }`}
                >
                  <span className="text-[11px] uppercase">{p.dow}</span>
                  <span className="text-[19px] leading-tight font-semibold">{p.day}</span>
                  <span className="text-[10px]">{off ? 'Off' : p.mon}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 min-h-[60px]">
            {!svc || !f.date ? (
              <div className="py-3 text-[13px] text-ink/45">Choose a service and a date to see free times.</div>
            ) : stylistOff ? (
              <Field f={`team.stylists.${f.stylist}.off`} className="rounded-xl bg-sand px-4 py-3 text-[13.5px] text-cocoa">
                {stylistName(content, f.stylist)} is not working on {fmtDate(f.date)}. Choose another day or “Anyone free”.
              </Field>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 @3xl:grid-cols-6">
                {times.map((t) => (
                  <button
                    key={t.time}
                    data-demo={`s:time:${t.time}`}
                    disabled={!t.free}
                    onClick={() => setBookingForm('time', t.time)}
                    className={`rounded-lg border py-1.5 text-[13px] font-medium ${
                      f.time === t.time ? 'border-cocoa bg-cocoa text-gold' : t.free ? 'border-cocoa/20 text-cocoa-dark' : 'border-transparent text-ink/25 line-through'
                    }`}
                  >
                    {t.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section n={4} title="Your details" done={!!f.name && !!f.phone}>
          <div className="space-y-2.5">
            <input data-demo="s:name" className={input} placeholder="Your name" value={f.name} onChange={(e) => setBookingForm('name', e.target.value)} />
            <input data-demo="s:phone" className={input} placeholder="Phone (Viber)" value={f.phone} onChange={(e) => setBookingForm('phone', e.target.value)} />
            <input data-demo="s:note" className={input} placeholder="Anything we should know? (optional)" value={f.note} onChange={(e) => setBookingForm('note', e.target.value)} />
          </div>
          <button
            data-demo="s:submit"
            disabled={!svc || !f.date || !f.time || !f.name || !f.phone}
            onClick={() => submitBooking()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cocoa py-3.5 text-[14px] font-semibold tracking-[0.12em] text-gold uppercase disabled:opacity-40"
          >
            Request booking
          </button>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-ink/50">
            <MessageCircle size={13} className="text-viber" /> Confirmation is sent to your Viber
          </div>
        </Section>
      </div>
    </section>
  )
}
