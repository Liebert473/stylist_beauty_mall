import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Globe,
  Keyboard,
  LayoutDashboard,
  Maximize,
  Monitor,
  Repeat,
  RotateCcw,
  Smartphone,
  StickyNote,
  Zap,
} from 'lucide-react'
import { demo, useDemo } from '../store/store'
import type { Focus } from '../store/types'
import { CHAPTERS } from '../demo/chapters'
import { goTo, next, prev, replay, stop } from '../demo/controller'
import { registerStage } from '../demo/runner'
import { Admin } from '../admin/Admin'
import { Browser } from '../device/Browser'
import { Fit } from '../device/Fit'
import { Phone, PHONE_H, PHONE_W } from '../device/Phone'
import { Monogram } from '../ui/Logo'
import { Slides } from './Slides'

export const STAGE_W = 1920
export const STAGE_H = 1080

function useStageScale() {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return scale
}

const setFocus = (f: Focus) => demo().update((s) => void (s.focus = f))
const toggleDevice = () => demo().update((s) => void (s.device = s.device === 'phone' ? 'desktop' : 'phone'))
const toggleFullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.matches('input, textarea, select, [contenteditable]')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') next()
      else if (k === 'ArrowLeft' || k === 'PageUp') prev()
      else if (k === 'r' || k === 'R' || k === 'Enter') replay()
      else if (k === 'Escape') stop()
      else if (/^[0-8]$/.test(k)) goTo(Number(k), 0)
      else if (k === 'd' || k === 'D') toggleDevice()
      else if (k === 's' || k === 'S') setFocus('split')
      else if (k === 'a' || k === 'A') setFocus('admin')
      else if (k === 'w' || k === 'W') setFocus('site')
      else if (k === 'n' || k === 'N') demo().update((s) => void (s.notesOpen = !s.notesOpen))
      else if (k === 'p' || k === 'P') demo().update((s) => void (s.autoTour = !s.autoTour))
      else if (k === 'f' || k === 'F') toggleFullscreen()
      else if (k === '?') demo().update((s) => void (s.notesOpen = !s.notesOpen))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function IconBtn({ on, onClick, title, children }: { on?: boolean; onClick: () => void; title: string; children: ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-11 items-center gap-2 rounded-xl px-3 text-[15px] font-medium transition ${
        on ? 'bg-gold text-cocoa-dark' : 'bg-white/[0.07] text-white/80 hover:bg-white/15'
      }`}
    >
      {children}
    </button>
  )
}

function TopBar() {
  const chapter = useDemo((s) => s.chapter)
  const device = useDemo((s) => s.device)
  const focus = useDemo((s) => s.focus)
  const notes = useDemo((s) => s.notesOpen)
  const isDemo = CHAPTERS[chapter].kind === 'demo'
  return (
    <div className="flex h-[76px] shrink-0 items-center gap-6 px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cocoa">
          <Monogram className="h-9 w-9" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[19px] tracking-[0.12em] text-gold">STYLIST</div>
          <div className="text-[12px] tracking-wider text-white/45 uppercase">Platform demo</div>
        </div>
      </div>

      <nav className="flex flex-1 justify-center gap-1.5">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => goTo(i, 0)}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[16px] font-semibold transition ${
              i === chapter ? 'bg-white text-ink' : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className={`text-[13px] ${i === chapter ? 'text-cocoa' : 'text-gold/80'}`}>{i}</span>
            {c.title}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {isDemo && (
          <>
            <IconBtn on={device === 'phone'} onClick={toggleDevice} title="Phone / desktop website (D)">
              {device === 'phone' ? <Smartphone size={19} /> : <Monitor size={19} />}
            </IconBtn>
            <div className="flex rounded-xl bg-white/[0.07] p-1">
              {(
                [
                  ['split', Columns2, 'Side by side (S)'],
                  ['admin', LayoutDashboard, 'Dashboard only (A)'],
                  ['site', Globe, 'Guest view only (W)'],
                ] as const
              ).map(([f, Icon, title]) => (
                <button
                  key={f}
                  title={title}
                  onClick={() => setFocus(f)}
                  className={`flex h-9 w-10 items-center justify-center rounded-lg ${focus === f ? 'bg-white text-ink' : 'text-white/70'}`}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </>
        )}
        <IconBtn on={notes} onClick={() => demo().update((s) => void (s.notesOpen = !s.notesOpen))} title="Presenter notes (N)">
          <StickyNote size={19} />
        </IconBtn>
        <IconBtn onClick={toggleFullscreen} title="Full screen (F)">
          <Maximize size={19} />
        </IconBtn>
      </div>
    </div>
  )
}

function BottomBar() {
  const chapter = useDemo((s) => s.chapter)
  const step = useDemo((s) => s.step)
  const playing = useDemo((s) => s.playing)
  const auto = useDemo((s) => s.autoTour)
  const ch = CHAPTERS[chapter]
  const st = ch.steps[step]
  const last = chapter === CHAPTERS.length - 1 && step === ch.steps.length - 1
  return (
    <div className="flex h-[104px] shrink-0 items-center gap-6 px-6">
      <div className="flex w-[560px] shrink-0 gap-1.5 overflow-hidden">
        {ch.steps.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(chapter, i)}
            title={s.title}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition ${
              i === step ? 'bg-gold text-cocoa-dark' : i < step ? 'bg-white/15 text-white/80' : 'bg-white/[0.06] text-white/50 hover:text-white'
            }`}
          >
            <span className="font-bold">{i + 1}</span>
            {i === step && <span className="max-w-[220px] truncate">{s.title}</span>}
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1 text-center">
        <AnimatePresence mode="wait">
          <motion.div key={`${chapter}-${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="truncate text-[27px] font-semibold text-white">
            {st.caption}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <IconBtn on={auto} onClick={() => demo().update((s) => void (s.autoTour = !s.autoTour))} title="Auto-advance (P)">
          <Repeat size={18} /> Auto
        </IconBtn>
        <IconBtn onClick={prev} title="Previous (←)">
          <ChevronLeft size={22} />
        </IconBtn>
        {st.script.length > 0 && (
          <IconBtn onClick={replay} title="Play / replay this step (R)">
            {playing ? <Zap size={19} className="animate-pulse" /> : <RotateCcw size={19} />} {playing ? 'Playing' : 'Replay'}
          </IconBtn>
        )}
        <button
          onClick={next}
          disabled={last}
          className="flex h-12 items-center gap-2 rounded-xl bg-gold px-5 text-[17px] font-bold text-cocoa-dark disabled:opacity-30"
          title="Next (→ or Space)"
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

function Notes() {
  const open = useDemo((s) => s.notesOpen)
  const chapter = useDemo((s) => s.chapter)
  const step = useDemo((s) => s.step)
  const st = CHAPTERS[chapter].steps[step]
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute right-6 bottom-[116px] z-[80] w-[520px] rounded-2xl bg-[#21150f]/95 p-6 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
        >
          <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold tracking-widest text-gold uppercase">
            <StickyNote size={15} /> Presenter notes · {st.title}
          </div>
          <ul className="space-y-2 text-[17px] leading-snug text-white/85">
            {st.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="text-gold">•</span>
                {n}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-[13px] leading-relaxed text-white/50">
            <Keyboard size={15} className="mt-0.5 shrink-0" />
            <span>
              → / Space next · ← back · R replay · 0–8 chapters · D phone/desktop · S / A / W layout · P auto · F full screen · Esc stop
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Cursor() {
  const c = useDemo((s) => s.cursor)
  return (
    <motion.div
      className="pointer-events-none absolute top-0 left-0 z-[90]"
      animate={{ x: c.x, y: c.y, opacity: c.visible ? 1 : 0 }}
      transition={{ x: { type: 'spring', damping: 26, stiffness: 120 }, y: { type: 'spring', damping: 26, stiffness: 120 }, opacity: { duration: 0.3 } }}
    >
      <AnimatePresence>
        <motion.span
          key={c.click}
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute -top-5 -left-5 h-10 w-10 rounded-full bg-gold/80"
        />
      </AnimatePresence>
      <svg width="34" height="34" viewBox="0 0 24 24" className="-mt-1 -ml-1 drop-shadow-[0_3px_6px_rgb(0_0_0/0.5)]">
        <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.7 L11.6 14 L18 14 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}

/** "Live" pulse between the two panels whenever something is published. */
function SyncPulse() {
  const nonce = useDemo((s) => s.flash.nonce)
  const at = useDemo((s) => s.flash.at)
  const [fresh, setFresh] = useState(false)
  useEffect(() => {
    if (!at || Date.now() - at > 2500) return setFresh(false)
    setFresh(true)
    const t = setTimeout(() => setFresh(false), 2200)
    return () => clearTimeout(t)
  }, [at])
  return (
    <div className="pointer-events-none absolute top-1/2 left-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center">
      <AnimatePresence>
        {fresh && (
          <motion.div
            key={nonce}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-[15px] font-bold text-cocoa-dark shadow-[0_0_30px_rgb(252_214_159/0.6)]"
          >
            <Zap size={17} fill="currentColor" /> Live
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PanelLabel({ children }: { children: ReactNode }) {
  return <div className="mb-2.5 flex items-center gap-2 text-[14px] font-semibold tracking-[0.18em] text-white/50 uppercase">{children}</div>
}

function AdminWindow() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/40">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-4">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto rounded-md bg-white px-4 py-0.5 text-[13px] text-zinc-500 ring-1 ring-zinc-200">staff.stylistbeautymall.com</div>
        <div className="w-12" />
      </div>
      <div className="min-h-0 flex-1">
        <Admin />
      </div>
    </div>
  )
}

function DemoView() {
  const device = useDemo((s) => s.device)
  const app = useDemo((s) => s.guestApp)
  const screen = useDemo((s) => s.phone.screen)
  const focus = useDemo((s) => s.focus)
  const showAdmin = focus !== 'site'
  const showSite = focus !== 'admin'
  const siteW = focus === 'site' ? '100%' : device === 'phone' ? 540 : 1040

  return (
    <div className="flex h-full gap-6 px-6">
      {showAdmin && (
        <div className="flex min-w-0 flex-1 flex-col">
          <PanelLabel>
            <LayoutDashboard size={16} /> Your team · Stylist Studio
          </PanelLabel>
          <div className="min-h-0 flex-1">
            <AdminWindow />
          </div>
        </div>
      )}
      {showSite && (
        <div className="relative flex shrink-0 flex-col" style={{ width: siteW }}>
          {showAdmin && <SyncPulse />}
          <PanelLabel>
            {device === 'phone' ? <Smartphone size={16} /> : <Monitor size={16} />}{' '}
            {device === 'phone' && screen === 'viber'
              ? 'Your customer · Viber'
              : device === 'phone' && (screen === 'home' || screen === 'lock' || screen === 'splash' || screen === 'app')
                ? 'Your VIP · Stylist VIP app'
                : app === 'vip'
                  ? 'Your VIP · vip.stylistbeautymall.com'
                  : 'Your customers · stylistbeautymall.com'}
          </PanelLabel>
          <div className="min-h-0 flex-1">
            {device === 'phone' ? (
              <Fit w={PHONE_W + 26} h={PHONE_H + 26} max={1.15}>
                <Phone />
              </Fit>
            ) : (
              <Browser />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function Stage() {
  const scale = useStageScale()
  const chapter = useDemo((s) => s.chapter)
  const ref = useRef<HTMLDivElement>(null)
  useKeyboard()
  useEffect(() => registerStage(ref.current), [])

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <div
        ref={ref}
        className="relative flex shrink-0 flex-col bg-stage font-sans"
        style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        <TopBar />
        <div className="min-h-0 flex-1">
          {CHAPTERS[chapter].kind === 'slides' ? (
            <div className="h-full px-6">
              <Slides />
            </div>
          ) : (
            <DemoView />
          )}
        </div>
        <BottomBar />
        <Notes />
        <Cursor />
      </div>
    </div>
  )
}
