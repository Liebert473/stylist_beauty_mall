import { ChevronLeft, ChevronRight, Lock, RotateCw } from 'lucide-react'
import { Site } from '../site/Site'
import { Vip } from '../vip/Vip'
import { useDemo } from '../store/store'
import { host } from './Phone'
import { Measure } from './Fit'

const SITE_W = 1440

/** Desktop browser window showing the website (or the VIP area) at a true 1440px layout, scaled to fit. */
export function Browser() {
  const app = useDemo((s) => s.guestApp)
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/40">
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-4">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex gap-1 text-zinc-400">
          <ChevronLeft size={18} />
          <ChevronRight size={18} />
          <RotateCw size={15} className="mt-0.5 ml-1" />
        </div>
        <div className="mx-auto flex w-[46%] items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-[13px] text-zinc-600 ring-1 ring-zinc-200">
          <Lock size={12} /> {host(app)}
        </div>
        <div className="w-24" />
      </div>
      <div className="min-h-0 flex-1">
        <Measure>
          {(w, h) => {
            const scale = w / SITE_W
            return (
              <div style={{ width: SITE_W, height: h / scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                {app === 'vip' ? <Vip /> : <Site />}
              </div>
            )
          }}
        </Measure>
      </div>
    </div>
  )
}
