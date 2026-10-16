import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ImagePlus, MessageCircle, Trash2, X } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import { getAt } from '../store/paths'
import { PHOTOS } from '../store/photos'
import { useFlash } from '../site/Field'
import { Photo } from '../ui/Photo'

export const useDraft = <T,>(path: string) => useDemo((s) => getAt(s.draft, path) as T)

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[12.5px] font-semibold text-zinc-600">{children}</span>
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </div>
  )
}

const box =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[14.5px] text-zinc-900 outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/15'

/** Text field bound to a draft content path. */
export function TextField({ path, label, multiline, rows = 3, type = 'text' }: { path: string; label?: string; multiline?: boolean; rows?: number; type?: string }) {
  const value = useDraft<string>(path) ?? ''
  const set = (v: string) => demo().setDraft(path, v)
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      {multiline ? (
        <textarea data-demo={`a:${path}`} rows={rows} className={`${box} resize-none leading-relaxed`} value={value} onChange={(e) => set(e.target.value)} />
      ) : (
        <input data-demo={`a:${path}`} type={type} className={box} value={value} onChange={(e) => set(e.target.value)} />
      )}
    </label>
  )
}

export function Toggle({ on, onChange, demoId, label }: { on: boolean; onChange: (v: boolean) => void; demoId?: string; label?: ReactNode }) {
  return (
    <button data-demo={demoId} onClick={() => onChange(!on)} className="flex items-center gap-3 text-left">
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
        <motion.span layout className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {label && <span className="text-[14px] text-zinc-800">{label}</span>}
    </button>
  )
}

export function DraftToggle({ path, label }: { path: string; label: ReactNode }) {
  const on = useDraft<boolean>(path)
  return <Toggle on={on} onChange={(v) => demo().setDraft(path, v)} demoId={`a:${path}`} label={label} />
}

/** Thumbnail with a "Change" button that opens the media library. */
export function PhotoField({ path, label = 'Photo', wide }: { path: string; label?: string; wide?: boolean }) {
  const photo = useDraft<string>(path)
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <Photo photo={photo} className={`${wide ? 'h-20 w-36' : 'h-14 w-20'} shrink-0 rounded-lg`} />
        <button
          data-demo={`a:pick:${path}`}
          onClick={() => demo().update((s) => void (s.adminUi.pickerOpen = path))}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <ImagePlus size={15} /> Change
        </button>
      </div>
    </div>
  )
}

export function MediaPicker() {
  const path = useDemo((s) => s.adminUi.pickerOpen)
  const current = useDemo((s) => (path ? (getAt(s.draft, path) as string) : null))
  const close = () => demo().update((s) => void (s.adminUi.pickerOpen = null))
  return (
    <AnimatePresence>
      {path && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-8">
          <motion.div initial={{ y: 16, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="flex max-h-full w-full max-w-[760px] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
              <div className="text-[16px] font-semibold">Media library</div>
              <button onClick={close} className="text-zinc-500">
                <X size={20} />
              </button>
            </div>
            <div className="thin-scrollbar grid grid-cols-4 gap-3 overflow-y-auto p-5" data-scroll>
              {PHOTOS.map((p) => (
                <button
                  key={p.key}
                  data-demo={`a:photo:${p.key}`}
                  onClick={() => {
                    demo().setDraft(path, p.key)
                    close()
                  }}
                  className={`overflow-hidden rounded-lg border-2 text-left ${current === p.key ? 'border-cocoa' : 'border-transparent'}`}
                >
                  <Photo photo={p.key} className="aspect-[4/3]" />
                  <div className="truncate px-1.5 py-1 text-[11.5px] text-zinc-600">{p.label}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Card({ title, children, actions, className = '' }: { title?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-zinc-200 bg-white ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
          <div className="text-[14.5px] font-semibold text-zinc-800">{title}</div>
          {actions}
        </div>
      )}
      <div className="space-y-4 p-5">{children}</div>
    </section>
  )
}

/** Collapsible row for list items (events, dishes, people…). */
export function Item({ id, title, meta, thumb, children, onDelete }: { id: string; title: ReactNode; meta?: ReactNode; thumb?: string; children: ReactNode; onDelete?: () => void }) {
  const open = useDemo((s) => s.adminUi.expanded === id)
  const toggle = () => demo().update((s) => void (s.adminUi.expanded = open ? null : id))
  return (
    <div className={`rounded-xl border bg-white transition ${open ? 'border-cocoa/40 shadow-sm' : 'border-zinc-200'}`}>
      <button data-demo={`a:item:${id}`} onClick={toggle} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
        {thumb && <Photo photo={thumb} className="h-10 w-14 shrink-0 rounded-md" />}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-medium text-zinc-900">{title || <span className="text-zinc-400">Untitled</span>}</div>
          {meta && <div className="truncate text-[12.5px] text-zinc-500">{meta}</div>}
        </div>
        <ChevronDown size={18} className={`shrink-0 text-zinc-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="space-y-3.5 border-t border-zinc-100 px-4 pt-3.5 pb-4">
              {children}
              {onDelete && (
                <button onClick={onDelete} className="flex items-center gap-1.5 text-[12.5px] text-red-600">
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AddButton({ demoId, onClick, children }: { demoId: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      data-demo={demoId}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg bg-cocoa px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-cocoa-dark"
    >
      {children}
    </button>
  )
}

export function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3.5">{children}</div>
}

/** Kyat amount bound to a draft content path. */
export function MoneyField({ path, label }: { path: string; label?: string }) {
  const value = useDraft<number>(path) ?? 0
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <input
          data-demo={`a:${path}`}
          inputMode="numeric"
          className={`${box} pr-10`}
          value={value ? value.toLocaleString('en-US') : ''}
          onChange={(e) => demo().setDraft(path, Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
        />
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-zinc-400">Ks</span>
      </div>
    </label>
  )
}

export function Stat({ label, value, sub, icon: Icon, tone = 'zinc', f }: { label: string; value: ReactNode; sub?: ReactNode; icon: typeof ChevronDown; tone?: 'zinc' | 'amber' | 'emerald' | 'cocoa'; f?: string }) {
  const tones = { zinc: 'bg-zinc-100 text-zinc-600', amber: 'bg-amber-100 text-amber-700', emerald: 'bg-emerald-100 text-emerald-700', cocoa: 'bg-cocoa/10 text-cocoa' }
  const glow = useFlash(f ?? '-')
  return (
    <div data-field={f} data-demo={f} className={`rounded-xl border border-zinc-200 bg-white p-4 ${glow ? 'flash' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-zinc-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-1.5 text-[24px] leading-tight font-bold text-zinc-900">{value}</div>
      {sub && <div className="mt-0.5 text-[12px] text-zinc-500">{sub}</div>}
    </div>
  )
}

export function Pill({ children, tone = 'zinc' }: { children: ReactNode; tone?: 'zinc' | 'amber' | 'emerald' | 'cocoa' | 'violet' | 'red' }) {
  const tones = {
    zinc: 'bg-zinc-100 text-zinc-600',
    amber: 'bg-amber-100 text-amber-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    cocoa: 'bg-cocoa text-gold',
    violet: 'bg-violet-100 text-violet-800',
    red: 'bg-red-100 text-red-700',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>
}

export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const ini = name
    .replace(/^(Daw|Ma|Ko|U)\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-gold/60 text-[12px] font-bold text-cocoa-dark ${className || 'h-9 w-9'}`}>{ini}</span>
}

export const ViberButton = ({ onClick, demoId, label = 'Send on Viber' }: { onClick: () => void; demoId: string; label?: string }) => (
  <button data-demo={demoId} onClick={onClick} className="flex items-center gap-1.5 rounded-lg bg-viber px-3.5 py-2 text-[13px] font-semibold text-white hover:brightness-110">
    <MessageCircle size={15} /> {label}
  </button>
)
