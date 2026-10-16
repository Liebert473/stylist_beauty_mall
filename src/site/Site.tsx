import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Crown, Menu as MenuIcon, X } from 'lucide-react'
import { useDemo } from '../store/store'
import type { PageId } from '../store/types'
import { Monogram, Wordmark } from '../ui/Logo'
import { Field } from './Field'
import { ContactPage, GalleryPage, HomePage, NewsPage, ScalpPage, ServicesPage, TeamPage, WaterPage } from './pages'
import { BookPage } from './BookPage'

export const NAV: { id: PageId; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'scalp', label: 'Scalp analysis' },
  { id: 'water', label: 'Pure water' },
  { id: 'team', label: 'Team' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'news', label: 'News' },
  { id: 'contact', label: 'Contact' },
]

export const go = (page: PageId) =>
  useDemo.getState().update((s) => {
    s.sitePage = page
  })

/** Scroll the glowing region of a scroll box into view after a publish. */
export function useScrollToFlash(ref: React.RefObject<HTMLDivElement | null>) {
  const flash = useDemo((s) => s.flash)
  useEffect(() => {
    if (!flash.nonce) return
    const t = setTimeout(() => {
      const root = ref.current
      const el = root?.querySelector<HTMLElement>('.flash')
      if (!root || !el) return
      // rendered inside scaled frames: convert screen pixels back to layout pixels
      const rootRect = root.getBoundingClientRect()
      const scale = rootRect.height / root.offsetHeight || 1
      const top = (el.getBoundingClientRect().top - rootRect.top) / scale + root.scrollTop
      const target = top - root.clientHeight / 2 + Math.min(el.offsetHeight, root.clientHeight) / 2
      root.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
    }, 420)
    return () => clearTimeout(t)
  }, [flash, ref])
}

/** The public Stylist Beauty Mall website. Layout adapts to the frame width through container queries. */
export function Site() {
  const page = useDemo((s) => s.sitePage)
  const booked = useDemo((s) => s.booking.submitted)
  const home = useDemo((s) => s.content.home)
  const scroller = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    setMenuOpen(false)
  }, [page, booked])
  useScrollToFlash(scroller)

  return (
    <div className="@container relative h-full w-full bg-cream text-ink">
      <div ref={scroller} data-site-scroll className="no-scrollbar relative h-full overflow-y-auto">
        <AnimatePresence initial={false}>
          {home.announcementOn && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              <Field f="home.announcement" className="bg-gold px-4 py-2 text-center text-[12px] font-semibold text-cocoa-dark @3xl:text-[14px]">
                ✦ {home.announcement}
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="sticky top-0 z-30 bg-cocoa text-gold shadow-[0_1px_0_rgb(252_214_159/0.2)]">
          <div className="flex h-[58px] items-center gap-3 px-4 @5xl:h-[76px] @5xl:px-12">
            <button onClick={() => go('home')} className="flex items-center gap-2.5" data-demo="site-logo">
              <Monogram className="h-9 w-9 @5xl:h-12 @5xl:w-12" />
              <Wordmark className="h-7 @5xl:h-9" />
            </button>
            <nav className="ml-auto hidden items-center gap-7 @5xl:flex">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  className={`text-[14px] tracking-[0.12em] uppercase transition ${page === n.id ? 'text-gold' : 'text-white/80 hover:text-gold'}`}
                >
                  {n.label}
                </button>
              ))}
              <span className="flex items-center gap-1.5 text-[13px] tracking-[0.12em] text-gold/80 uppercase">
                <Crown size={15} /> VIP
              </span>
            </nav>
            <button
              onClick={() => go('book')}
              data-demo="s:book-now"
              className="ml-auto rounded-full bg-gold px-4 py-1.5 text-[13px] font-semibold tracking-wide text-cocoa-dark uppercase @5xl:ml-4 @5xl:px-6 @5xl:py-2.5 @5xl:text-[14px]"
            >
              Book now
            </button>
            <button className="p-1 text-gold @5xl:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
              {menuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-cocoa-dark @5xl:hidden">
                {[{ id: 'home' as PageId, label: 'Home' }, ...NAV, { id: 'book' as PageId, label: 'Book online' }].map((n) => (
                  <button key={n.id} onClick={() => go(n.id)} className="block w-full border-b border-white/10 px-6 py-3 text-left text-[14px] tracking-[0.12em] text-white uppercase">
                    {n.label}
                  </button>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <AnimatePresence mode="wait">
          <motion.main key={page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            {page === 'home' && <HomePage />}
            {page === 'services' && <ServicesPage />}
            {page === 'scalp' && <ScalpPage />}
            {page === 'water' && <WaterPage />}
            {page === 'team' && <TeamPage />}
            {page === 'gallery' && <GalleryPage />}
            {page === 'news' && <NewsPage />}
            {page === 'contact' && <ContactPage />}
            {page === 'book' && <BookPage />}
          </motion.main>
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  )
}

function Footer() {
  const c = useDemo((s) => s.content.contact)
  return (
    <footer className="bg-cocoa-deep px-6 py-10 text-[13px] text-white/60 @3xl:px-16">
      <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
        <div className="flex items-center gap-3">
          <Monogram className="h-12 w-12" />
          <div>
            <Wordmark className="h-6" />
            <div className="mt-1 text-[12px] tracking-[0.2em] text-gold/60 uppercase">Est. 2018 · Yangon</div>
          </div>
        </div>
        <div className="space-y-1">
          <div>{c.address}</div>
          <div>{c.hours}</div>
          <div>Viber {c.viber}</div>
        </div>
        <div className="flex gap-3 text-[12px]">
          <span className="rounded-full border border-white/20 px-3 py-1.5">Facebook</span>
          <span className="rounded-full border border-white/20 px-3 py-1.5">TikTok</span>
          <span className="flex items-center gap-1 rounded-full border border-gold/40 px-3 py-1.5 text-gold">
            <Crown size={12} /> VIP login
          </span>
        </div>
      </div>
      <div className="mt-8 border-t border-white/10 pt-5 text-[12px] text-white/35">© {new Date().getFullYear()} Stylist Beauty Mall. All rights reserved.</div>
    </footer>
  )
}
