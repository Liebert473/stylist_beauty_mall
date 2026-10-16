import { motion } from 'framer-motion'
import { BellRing, Send, Smartphone, Users } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import type { AutoPushKey, PushAudience, VipPage } from '../store/types'
import { audienceLabel, recipients, sendPush, setPush } from '../store/ops'
import { Badge } from '../ui/Logo'
import { Card, Label, Stat, Toggle } from './ui'

const box = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[14.5px] outline-none focus:border-cocoa focus:ring-2 focus:ring-cocoa/15'

const PAGES: { id: VipPage; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'news', label: 'News' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'book', label: 'Book' },
  { id: 'wallet', label: 'Wallet' },
]

const AUTO: { key: AutoPushKey; label: string; example: string }[] = [
  { key: 'booking', label: 'Booking confirmed', example: 'Booking confirmed · Scalp detox treatment, Mon 10:00' },
  { key: 'reminder', label: 'Reminder the day before', example: 'See you tomorrow at 10:00 with Ma Hnin Ei' },
  { key: 'topup', label: 'Top-up approved', example: '335,000 Ks added (incl. 35,000 Ks bonus)' },
  { key: 'cashback', label: 'Cash back earned', example: 'You earned 15,000 Ks cash back' },
  { key: 'birthday', label: 'Birthday gift', example: 'Your birthday gift is here — 10,000 Ks credit' },
]

export function NotifyAdmin() {
  const s = useDemo((x) => x)
  const p = s.push
  const members = s.clients.filter((c) => c.status === 'active')
  const withApp = members.filter((c) => c.app).length
  const withPush = members.filter((c) => c.push).length
  const opened = s.sent.reduce((n, x) => n + x.opened, 0)
  const delivered = s.sent.reduce((n, x) => n + x.delivered, 0)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 @4xl:grid-cols-4">
        <Stat label="VIP app on home screen" value={`${withApp} / ${members.length}`} sub="members" icon={Smartphone} tone="cocoa" f="admin.app" />
        <Stat label="Notifications on" value={`${withPush} / ${members.length}`} sub="can be reached instantly" icon={BellRing} tone="emerald" f="admin.push" />
        <Stat label="Sent" value={s.sent.length} sub="last 30 days" icon={Send} />
        <Stat label="Opened" value={delivered ? `${Math.round((opened / delivered) * 100)}%` : '—'} sub={`${opened} of ${delivered} delivered`} icon={Users} />
      </div>

      <div className="grid gap-4 @4xl:grid-cols-[1.35fr_1fr]">
        <Card title="New notification">
          <label className="block">
            <Label hint={`${p.title.length}/50`}>Title</Label>
            <input data-demo="a:push-title" className={box} value={p.title} onChange={(e) => setPush('title', e.target.value)} />
          </label>
          <label className="block">
            <Label hint={`${p.body.length}/150`}>Message</Label>
            <textarea data-demo="a:push-body" rows={2} className={`${box} resize-none leading-relaxed`} value={p.body} onChange={(e) => setPush('body', e.target.value)} />
          </label>
          <div>
            <Label>Send to</Label>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'gold', 'one'] as PushAudience[]).map((a) => (
                <button
                  key={a}
                  data-demo={`a:push-aud:${a}`}
                  onClick={() => setPush('audience', a)}
                  className={`rounded-lg border px-3 py-1.5 text-[13px] ${p.audience === a ? 'border-cocoa bg-cocoa text-gold' : 'border-zinc-300 text-zinc-700'}`}
                >
                  {audienceLabel(a)} <span className="opacity-60">· {recipients(s, a).length}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Tapping it opens</Label>
            <div className="flex flex-wrap gap-1.5">
              {PAGES.map((pg) => (
                <button
                  key={pg.id}
                  data-demo={`a:push-page:${pg.id}`}
                  onClick={() => setPush('page', pg.id)}
                  className={`rounded-lg border px-3 py-1.5 text-[13px] ${p.page === pg.id ? 'border-cocoa bg-cocoa text-gold' : 'border-zinc-300 text-zinc-700'}`}
                >
                  {pg.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-[12.5px] text-zinc-500">Only members who allowed notifications receive it.</span>
            <button
              data-demo="a:push-send"
              disabled={!p.title || !p.body}
              onClick={() => sendPush()}
              className="flex items-center gap-1.5 rounded-lg bg-cocoa px-4 py-2 text-[13.5px] font-semibold text-gold disabled:bg-zinc-300 disabled:text-white"
            >
              <Send size={15} /> Send to {recipients(s, p.audience).length}
            </button>
          </div>
        </Card>

        <Card title="Preview">
          <div className="rounded-2xl bg-[radial-gradient(120%_80%_at_20%_10%,#c99a6b_0%,#76432e_45%,#1f120c_100%)] p-4">
            <div className="flex gap-3 rounded-[18px] bg-white/80 p-3 backdrop-blur">
              <Badge className="h-9 w-9 shrink-0 rounded-[9px]" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[11.5px] text-zinc-500">
                  <span className="font-semibold text-zinc-700">STYLIST VIP</span> now
                </div>
                <div className="text-[13px] font-semibold text-zinc-900">{p.title || 'Title'}</div>
                <div className="text-[13px] leading-snug text-zinc-700">{p.body || 'Your message'}</div>
              </div>
            </div>
          </div>
          <div className="text-[12px] text-zinc-500">Arrives on the lock screen like any app — iPhone and Android, no app store needed.</div>
        </Card>
      </div>

      <Card title="Automatic notifications">
        {AUTO.map((a) => (
          <div key={a.key} className="flex items-center gap-3">
            <Toggle on={s.autoPush[a.key]} onChange={(v) => demo().update((x) => void (x.autoPush[a.key] = v))} demoId={`a:auto:${a.key}`} />
            <div className="min-w-0">
              <div className="text-[14px] font-medium">{a.label}</div>
              <div className="truncate text-[12px] text-zinc-500">“{a.example}”</div>
            </div>
          </div>
        ))}
      </Card>

      <Card title="Sent">
        {s.sent.map((x) => (
          <motion.div key={x.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-[13px]">
            <BellRing size={15} className="shrink-0 text-gold-deep" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{x.title}</div>
              <div className="truncate text-[12px] text-zinc-500">
                {x.audience} · {x.when}
              </div>
            </div>
            <span className="text-[12px] text-zinc-500">
              {x.delivered} delivered · {x.opened} opened
            </span>
          </motion.div>
        ))}
      </Card>
    </>
  )
}
