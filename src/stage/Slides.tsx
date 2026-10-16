import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BellRing,
  CalendarCheck,
  CalendarX,
  Crown,
  Droplets,
  Gift,
  Globe,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Microscope,
  PenLine,
  Receipt,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { useDemo } from '../store/store'
import { Lockup, Monogram } from '../ui/Logo'
import { Photo } from '../ui/Photo'
import { CHAPTERS } from '../demo/chapters'
import { goTo } from '../demo/controller'

function Frame({ children, photo }: { children: ReactNode; photo?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[radial-gradient(120%_120%_at_0%_0%,#76432e_0%,#3a2117_45%,#160d09_100%)] text-white">
      {photo && (
        <div className="absolute inset-y-0 right-0 w-[42%]">
          <Photo photo={photo} className="h-full w-full opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a1810] via-[#2a1810]/40 to-transparent" />
        </div>
      )}
      <Monogram className="absolute -right-24 -bottom-24 h-[620px] w-[620px] opacity-[0.05]" />
      <div className="relative flex h-full flex-col justify-center px-28">{children}</div>
    </div>
  )
}

const Kicker = ({ children }: { children: ReactNode }) => <div className="mb-5 text-[20px] font-semibold tracking-[0.3em] text-gold uppercase">{children}</div>
const H = ({ children }: { children: ReactNode }) => <h1 className="font-display text-[64px] leading-[1.08]">{children}</h1>

function Welcome() {
  return (
    <Frame photo="hero-salon">
      <div className="flex items-center gap-20">
        <Lockup className="w-[330px] shrink-0" />
        <div className="max-w-[760px]">
          <Kicker>Proposal &amp; live demo</Kicker>
          <H>A digital home for Stylist Beauty Mall</H>
          <p className="mt-6 text-[28px] text-white/75">Website with online booking · VIP club with wallet &amp; cash back · Stylist Studio</p>
        </div>
      </div>
    </Frame>
  )
}

function Today() {
  const good = [
    { icon: Heart, t: '5.6K TikTok followers · 121.9K likes' },
    { icon: Microscope, t: 'Signature hair & scalp analysis' },
    { icon: Droplets, t: 'Pure water system in every wash' },
    { icon: Crown, t: 'Loyal VIP clients since 2018' },
  ]
  const bad = [
    { icon: Globe, t: 'No website — services and prices live in posts' },
    { icon: MessageCircle, t: 'Every booking is a back-and-forth in chat' },
    { icon: Wallet, t: 'VIPs can’t see their credit or rewards' },
    { icon: CalendarX, t: 'Stylist schedules are not visible to customers' },
  ]
  return (
    <Frame>
      <Kicker>Where we are today</Kicker>
      <H>A loved brand — without a home online</H>
      <div className="mt-14 grid grid-cols-2 gap-10">
        <div className="rounded-2xl bg-white/[0.06] p-8">
          <div className="mb-5 text-[22px] font-bold text-emerald-300">What customers love</div>
          {good.map((g) => (
            <div key={g.t} className="flex items-center gap-3 py-2.5 text-[24px] text-white/85">
              <g.icon size={23} className="text-emerald-300" /> {g.t}
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-8">
          <div className="mb-5 text-[22px] font-bold text-amber-300">What holds it back</div>
          {bad.map((b, i) => (
            <motion.div key={b.t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.25 }} className="flex items-center gap-3 py-2.5 text-[24px] text-white/85">
              <b.icon size={23} className="shrink-0 text-amber-300" /> {b.t}
            </motion.div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function Platform() {
  const cards = [
    { icon: Globe, t: 'Public website', u: 'stylistbeautymall.com', d: 'Services, prices, scalp analysis, pure water, team, gallery — and online booking for everyone.' },
    { icon: Crown, t: 'VIP club', u: 'vip.stylistbeautymall.com', d: 'By invitation. On the home screen with notifications: wallet top-ups, priority booking, cash back, tiers and members-only news.' },
    { icon: LayoutDashboard, t: 'Stylist Studio', u: 'staff.stylistbeautymall.com', d: 'Bookings, checkout, top-up approvals, VIP clients and every page of the website.' },
  ]
  return (
    <Frame>
      <Kicker>The proposal</Kicker>
      <H>Three doors. One system.</H>
      <div className="mt-14 grid grid-cols-3 gap-8">
        {cards.map((c, i) => (
          <motion.div key={c.t} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.2 }} className="rounded-2xl bg-white/[0.07] p-9 ring-1 ring-white/10">
            <c.icon size={44} className="text-gold" strokeWidth={1.5} />
            <div className="mt-6 font-display text-[34px]">{c.t}</div>
            <div className="mt-1 text-[17px] text-gold/70">{c.u}</div>
            <p className="mt-4 text-[21px] leading-relaxed text-white/70">{c.d}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 flex items-center gap-4 rounded-2xl bg-gold/15 px-8 py-5 text-[22px] text-gold">
        <MessageCircle size={26} /> Customers keep talking to you on Viber and Messenger — the system writes the messages for you.
      </div>
    </Frame>
  )
}

const CHAPTER_ICONS = [PenLine, CalendarCheck, Crown, BellRing, Wallet, Receipt, Gift]

function Agenda() {
  return (
    <Frame>
      <Kicker>Live demo</Kicker>
      <H>Left: your team. Right: your customers.</H>
      <div className="mt-14 grid grid-cols-7 gap-4">
        {CHAPTERS.slice(1, 8).map((c, i) => {
          const Icon = CHAPTER_ICONS[i]
          return (
            <button key={c.id} onClick={() => goTo(i + 1, 0)} className="rounded-2xl bg-white/[0.07] p-6 text-left ring-1 ring-white/10 transition hover:bg-white/[0.12] hover:ring-gold/60">
              <div className="text-[18px] font-bold text-gold">0{i + 1}</div>
              <Icon size={36} className="mt-5 text-white/90" strokeWidth={1.5} />
              <div className="mt-5 text-[22px] leading-tight font-bold">{c.title}</div>
              <div className="mt-3 text-[16px] text-white/55">{c.steps.length} steps →</div>
            </button>
          )
        })}
      </div>
    </Frame>
  )
}

function Benefits() {
  const items = [
    { icon: PenLine, t: 'Update the website yourselves', c: 1 },
    { icon: CalendarCheck, t: 'Bookings day and night', c: 2 },
    { icon: Crown, t: 'An exclusive VIP club', c: 3 },
    { icon: BellRing, t: 'On every VIP’s home screen', c: 4 },
    { icon: Wallet, t: 'Prepaid credit, cash in first', c: 5 },
    { icon: Sparkles, t: 'Cash back that brings VIPs back', c: 6 },
    { icon: Zap, t: 'Your rules, changed any time', c: 7 },
    { icon: Heart, t: 'Your brand, on every screen', c: 1 },
  ]
  return (
    <Frame>
      <Kicker>Summary</Kicker>
      <H>Easy to run. Hard to leave.</H>
      <div className="mt-14 grid grid-cols-4 gap-6">
        {items.map((it) => (
          <button key={it.t} onClick={() => goTo(it.c, 0)} className="flex items-center gap-5 rounded-2xl bg-white/[0.07] p-7 text-left ring-1 ring-white/10 transition hover:ring-gold/60">
            <it.icon size={38} className="shrink-0 text-gold" strokeWidth={1.5} />
            <span className="text-[26px] leading-tight font-bold">{it.t}</span>
          </button>
        ))}
      </div>
    </Frame>
  )
}

function NextSteps() {
  const phases = [
    { w: 'Weeks 1–2', t: 'Design & content' },
    { w: 'Weeks 3–6', t: 'Website, booking & Studio' },
    { w: 'Weeks 7–9', t: 'VIP club, wallet & rewards' },
    { w: 'Week 10', t: 'Training & launch' },
  ]
  return (
    <Frame>
      <Kicker>Next steps</Kicker>
      <H>From approval to launch</H>
      <div className="relative mt-16 grid grid-cols-4 gap-6">
        <div className="absolute top-[22px] right-10 left-10 h-px bg-gold/40" />
        {phases.map((p, i) => (
          <motion.div key={p.t} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.2 }} className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-[20px] font-bold text-cocoa-dark">{i + 1}</div>
            <div className="mt-5 text-[18px] font-semibold tracking-wide text-gold">{p.w}</div>
            <div className="mt-2 text-[28px] leading-tight font-bold">{p.t}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-14 rounded-2xl bg-white/[0.06] px-8 py-5 text-[21px] text-white/75">
        Phase 2 after launch: automatic Viber &amp; Messenger messages · scalp analysis history in the VIP area
      </div>
      <div className="mt-10 font-serif text-[60px] text-gold italic">Thank you.</div>
      <div className="mt-1 text-[16px] text-white/40">Timeline indicative — counted from the day the salon sends its content. Prices, names and numbers in this demo are samples.</div>
    </Frame>
  )
}

export function Slides() {
  const chapter = useDemo((s) => s.chapter)
  const step = useDemo((s) => s.step)
  const id = CHAPTERS[chapter].id
  const body = id === 'intro' ? [<Welcome />, <Today />, <Platform />, <Agenda />][step] : [<Benefits />, <NextSteps />][step]
  return (
    <AnimatePresence mode="wait">
      <motion.div key={`${id}-${step}`} initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full w-full">
        {body}
      </motion.div>
    </AnimatePresence>
  )
}
