import { AnimatePresence, motion } from 'framer-motion'
import { BellRing, CalendarDays, Check, Crown, Gift, House, Images, LayoutDashboard, Megaphone, Receipt, Scissors, Sparkles, Users, Wallet } from 'lucide-react'
import { demo, isDirty, useDemo } from '../store/store'
import type { AdminSection, ContentSection, PageId, VipPage } from '../store/types'
import { Monogram } from '../ui/Logo'
import { MediaPicker } from './ui'
import { Today } from './Today'
import { Bookings } from './Bookings'
import { Checkout } from './Checkout'
import { Clients } from './Clients'
import { WalletAdmin } from './Wallet'
import { RewardsEditor } from './Rewards'
import { NotifyAdmin } from './Notify'
import { GalleryEditor, HomeEditor, NewsEditor, ServicesEditor, SignatureEditor, TeamEditor } from './editors'

interface SectionDef {
  id: AdminSection
  label: string
  icon: typeof House
  title: string
  subtitle: string
  content?: ContentSection
  page?: PageId
  vip?: VipPage
}

export const SECTIONS: SectionDef[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard, title: 'Good afternoon', subtitle: 'Here is the salon today.' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, title: 'Bookings', subtitle: 'Every stylist’s day — website, VIP, phone and walk-in bookings in one calendar', page: 'book' },
  { id: 'checkout', label: 'Checkout', icon: Receipt, title: 'Checkout', subtitle: 'Record a VIP visit — wallet payment and cash back happen automatically' },
  { id: 'clients', label: 'VIP clients', icon: Crown, title: 'VIP clients', subtitle: 'Invite members, see balances, tiers and visits' },
  { id: 'wallet', label: 'Wallet & top-ups', icon: Wallet, title: 'Wallet & top-ups', subtitle: 'Cash at the counter, transfer approvals and every wallet line' },
  { id: 'rewards', label: 'Rewards', icon: Gift, title: 'Rewards settings', subtitle: 'Cash back, tiers and top-up bonuses — change them any time', content: 'rewards', vip: 'rewards' },
  { id: 'notify', label: 'Notifications', icon: BellRing, title: 'Notifications', subtitle: 'Reach VIPs on their phones — the VIP club works like an app on their home screen' },
  { id: 'home', label: 'Home page', icon: House, title: 'Home page', subtitle: 'The first impression of stylistbeautymall.com', content: 'home', page: 'home' },
  { id: 'services', label: 'Services & prices', icon: Scissors, title: 'Services & prices', subtitle: 'What customers can book, how long it takes and what it costs', content: 'services', page: 'services' },
  { id: 'signature', label: 'Signature care', icon: Sparkles, title: 'Signature care', subtitle: 'Hair & scalp analysis and the pure water system', content: 'signature', page: 'scalp' },
  { id: 'team', label: 'Stylists & hours', icon: Users, title: 'Stylists & schedules', subtitle: 'Profiles, skills and days off — online booking follows automatically', content: 'team', page: 'team' },
  { id: 'gallery', label: 'Gallery', icon: Images, title: 'Gallery', subtitle: 'Show your best work', content: 'gallery', page: 'gallery' },
  { id: 'news', label: 'News', icon: Megaphone, title: 'News & announcements', subtitle: 'Public news on the website, members-only news in the VIP area', content: 'news', page: 'news', vip: 'news' },
]

const GROUPS: { label: string; ids: AdminSection[] }[] = [
  { label: '', ids: ['today'] },
  { label: 'Salon', ids: ['bookings', 'checkout'] },
  { label: 'VIP club', ids: ['clients', 'wallet', 'rewards', 'notify'] },
  { label: 'Website', ids: ['home', 'services', 'signature', 'team', 'gallery', 'news'] },
]

export const openSection = (id: AdminSection) =>
  demo().update((s) => {
    s.adminSection = id
    s.adminUi.expanded = null
    s.adminUi.pickerOpen = null
    const def = SECTIONS.find((x) => x.id === id)
    // keep the customer preview on the page being edited
    if (s.guestApp === 'site' && def?.page) s.sitePage = def.page
    if (s.guestApp === 'vip' && def?.vip && s.vip.session) s.vipPage = def.vip
  })

function PublishBar({ section }: { section: ContentSection }) {
  const dirty = useDemo((s) => isDirty(s, section))
  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {dirty ? (
          <motion.span key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[13px] font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Unpublished changes
          </motion.span>
        ) : (
          <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[13px] text-emerald-700">
            <Check size={15} /> Live
          </motion.span>
        )}
      </AnimatePresence>
      {dirty && (
        <button onClick={() => demo().discard(section)} className="text-[13px] text-zinc-500 hover:text-zinc-800">
          Discard
        </button>
      )}
      <button
        data-demo="a:publish"
        disabled={!dirty}
        onClick={() => demo().publish(section)}
        className="rounded-lg bg-cocoa px-5 py-2 text-[14px] font-semibold text-gold shadow-sm transition hover:bg-cocoa-dark disabled:bg-zinc-300 disabled:text-white disabled:shadow-none"
      >
        Publish
      </button>
    </div>
  )
}

export function Admin() {
  const active = useDemo((s) => s.adminSection)
  const toasts = useDemo((s) => s.toasts)
  const pending = useDemo((s) => s.bookings.filter((b) => b.status === 'pending').length)
  const topups = useDemo((s) => s.topups.filter((t) => t.status === 'pending').length)
  const def = SECTIONS.find((s) => s.id === active)!

  return (
    <div className="@container flex h-full w-full bg-zinc-100 font-sans text-zinc-900">
      <aside className="flex w-[64px] shrink-0 flex-col bg-cocoa-deep @4xl:w-[220px]">
        <div className="flex items-center gap-2.5 px-3.5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cocoa">
            <Monogram className="h-8 w-8" />
          </div>
          <div className="hidden leading-tight @4xl:block">
            <div className="text-[15px] font-bold text-gold">Stylist Studio</div>
            <div className="text-[11.5px] text-white/45">Salon · VIP · Website</div>
          </div>
        </div>
        <nav className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-2.5 pb-4">
          {GROUPS.map((g) => (
            <div key={g.label || 'top'}>
              {g.label && <div className="mb-1 hidden px-2.5 text-[11px] font-semibold tracking-wider text-white/35 uppercase @4xl:block">{g.label}</div>}
              {g.ids.map((id) => {
                const s = SECTIONS.find((x) => x.id === id)!
                const Icon = s.icon
                const on = id === active
                const badge = id === 'bookings' ? pending : id === 'wallet' ? topups : 0
                return (
                  <button
                    key={id}
                    data-demo={`a:nav:${id}`}
                    onClick={() => openSection(id)}
                    title={s.label}
                    className={`relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] ${on ? 'bg-gold font-semibold text-cocoa-dark' : 'text-white/70 hover:bg-white/10'}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="hidden @4xl:inline">{s.label}</span>
                    <AnimatePresence>
                      {badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1 right-1 rounded-full bg-red-500 px-1.5 text-[10.5px] font-bold text-white @4xl:static @4xl:ml-auto"
                        >
                          {badge}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-3.5">
          <div className="min-w-0">
            <div className="truncate text-[19px] font-bold">{def.title}</div>
            <div className="truncate text-[13px] text-zinc-500">{def.subtitle}</div>
          </div>
          {def.content && <PublishBar section={def.content} />}
        </header>

        <main data-scroll className="thin-scrollbar flex-1 overflow-y-auto">
          {/* fade in only: an exit animation can get stuck when a step jump switches sections twice in a row */}
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="mx-auto max-w-[1000px] space-y-4 p-5">
              {active === 'today' && <Today />}
              {active === 'bookings' && <Bookings />}
              {active === 'checkout' && <Checkout />}
              {active === 'clients' && <Clients />}
              {active === 'wallet' && <WalletAdmin />}
              {active === 'rewards' && <RewardsEditor />}
              {active === 'notify' && <NotifyAdmin />}
              {active === 'home' && <HomeEditor />}
              {active === 'services' && <ServicesEditor />}
              {active === 'signature' && <SignatureEditor />}
              {active === 'team' && <TeamEditor />}
              {active === 'gallery' && <GalleryEditor />}
              {active === 'news' && <NewsEditor />}
          </motion.div>
        </main>

        <div className="pointer-events-none absolute right-5 bottom-5 z-50 space-y-2">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-[14px] font-medium text-white shadow-xl"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={13} strokeWidth={3} />
                </span>
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <MediaPicker />
      </div>
    </div>
  )
}
