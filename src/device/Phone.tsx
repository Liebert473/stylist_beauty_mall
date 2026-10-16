import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import {
  BatteryFull,
  Bookmark,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Flashlight,
  Images,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Phone as PhoneIcon,
  Plus,
  Settings,
  Share,
  Signal,
  Smile,
  SquarePlus,
  StickyNote,
  Sun,
  Video,
  Wallet,
  Wifi,
} from 'lucide-react'
import { demo, useDemo } from '../store/store'
import { NOW, allowNotifications, confirmAdd, openAddDialog, openApp, openShare, openViber, openVipLink, setTopupForm, tapNotification } from '../store/ops'
import { Site } from '../site/Site'
import { Vip } from '../vip/Vip'
import { Badge, Monogram, Wordmark } from '../ui/Logo'
import { Photo } from '../ui/Photo'
import { Receipt } from '../ui/Receipt'

export const PHONE_W = 390
export const PHONE_H = 844

export const host = (app: 'site' | 'vip') => (app === 'vip' ? 'vip.stylistbeautymall.com' : 'stylistbeautymall.com')

function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={`relative z-20 flex h-[54px] shrink-0 items-center justify-between px-8 pt-1 text-[16px] font-semibold ${dark ? 'text-white' : 'text-black'}`}>
      <span>{NOW}</span>
      <span className="flex items-center gap-1.5">
        <Signal size={17} strokeWidth={2.5} />
        <Wifi size={17} strokeWidth={2.5} />
        <BatteryFull size={24} strokeWidth={1.8} />
      </span>
    </div>
  )
}

function SafariBar() {
  const app = useDemo((s) => s.guestApp)
  return (
    <div className="shrink-0 border-t border-zinc-200 bg-zinc-50/95 px-4 pt-2 pb-7 backdrop-blur">
      <div className="mx-auto flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[15px] text-zinc-800 shadow-sm ring-1 ring-zinc-200">
        <Lock size={13} /> {host(app)}
      </div>
      <div className="mt-2.5 flex items-center justify-between px-3 text-[#0a84ff]">
        <ChevronLeft size={26} />
        <ChevronRight size={26} className="opacity-40" />
        <button data-demo="p:share" onClick={openShare}>
          <Share size={23} />
        </button>
        <BookOpen size={23} />
        <Copy size={22} />
      </div>
    </div>
  )
}

/** The salon's Viber chat, as the customer sees it. */
function ViberChat() {
  const msgs = useDemo((s) => s.phone.viber)
  return (
    <div className="absolute inset-0 flex flex-col bg-[#efeef4]">
      <div className="bg-white">
        <StatusBar />
        <div className="flex items-center gap-3 border-b border-zinc-200 px-3 pb-2.5">
          <ChevronLeft size={26} className="text-viber" />
          <Badge className="h-10 w-10 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-semibold">Stylist Beauty Mall</div>
            <div className="text-[12px] text-zinc-500">Business account</div>
          </div>
          <Video size={22} className="text-viber" />
          <PhoneIcon size={20} className="text-viber" />
        </div>
      </div>
      <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-3 py-4">
        <div className="text-center text-[11.5px] text-zinc-400">Today</div>
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex items-end gap-2">
              <Badge className="h-7 w-7 shrink-0 rounded-full" />
              <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14.5px] leading-snug text-zinc-900 shadow-sm">
                {m.text}
                {m.link && (
                  <button
                    data-demo="p:viber-link"
                    onClick={() => openVipLink(m.link!.vip)}
                    className="mt-2 block w-full overflow-hidden rounded-xl bg-[#f6f2ec] text-left ring-1 ring-zinc-200"
                  >
                    <div className="flex items-center gap-2.5 p-2.5">
                      <Badge className="h-10 w-10 shrink-0 rounded-lg" />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold">{m.link.label}</div>
                        <div className="truncate text-[12px] text-viber">{m.link.url}</div>
                      </div>
                    </div>
                  </button>
                )}
                <div className="mt-1 text-right text-[10.5px] text-zinc-400">{m.time}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-200 bg-white px-3 pt-2 pb-8">
        <Plus size={24} className="text-viber" />
        <div className="flex-1 rounded-full bg-zinc-100 px-4 py-2 text-[14px] text-zinc-400">Type a message…</div>
        <Smile size={22} className="text-zinc-400" />
      </div>
    </div>
  )
}

/** The iOS photo picker, used to attach the transfer screenshot. */
function PhotoPicker() {
  const amount = useDemo((s) => s.topup.amount)
  const pick = () => {
    setTopupForm('screenshot', true)
    demo().update((s) => void (s.phone.overlay = null))
  }
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/35" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="absolute inset-x-0 bottom-0 z-50 h-[70%] rounded-t-[14px] bg-white"
      >
        <div className="flex items-center justify-between px-4 py-3.5 text-[16px]">
          <button onClick={() => demo().update((s) => void (s.phone.overlay = null))} className="text-[#0a84ff]">
            Cancel
          </button>
          <span className="font-semibold">Recents</span>
          <span className="w-12" />
        </div>
        <div className="grid grid-cols-3 gap-0.5">
          <button data-demo="p:photo-receipt" onClick={pick} className="relative aspect-square overflow-hidden">
            <div className="absolute inset-0 origin-top scale-[1] p-0">
              <Receipt amount={amount} txId="0123 4567 8901" small />
            </div>
          </button>
          {['hair-color', 'nails', 'promo-festival', 'hero-hair', 'pedicure', 'vip-gift', 'bridal', 'products'].map((p) => (
            <Photo key={p} photo={p} className="aspect-square" />
          ))}
        </div>
      </motion.div>
    </>
  )
}

// ——— add to home screen ———

/** "Keep the VIP club on your home screen" — shown in Safari after the first login. */
function InstallBanner() {
  const show = useDemo((s) => s.phone.installPrompt && !s.phone.installed && s.phone.screen === 'browser' && s.guestApp === 'vip' && !!s.vip.session && s.vipPage !== 'setup')
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 160, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 160, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220, delay: 0.6 }}
          className="absolute inset-x-3 bottom-[118px] z-30 rounded-2xl bg-white p-3.5 shadow-[0_10px_40px_rgb(0_0_0/0.35)]"
        >
          <div className="flex items-center gap-3">
            <Badge className="h-14 w-14 shrink-0 rounded-[14px]" />
            <div className="min-w-0 flex-1">
              <div className="text-[15.5px] font-semibold text-zinc-900">Keep the VIP club on your phone</div>
              <div className="text-[12.5px] leading-snug text-zinc-500">Open your wallet in one tap and get notified about top-ups, bookings and cash back.</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-[12px] text-zinc-500">
              Tap <Share size={13} className="text-[#0a84ff]" /> then “Add to Home Screen”
            </span>
            <button data-demo="p:banner-add" onClick={openShare} className="rounded-full bg-cocoa px-4 py-1.5 text-[13.5px] font-semibold text-gold">
              Add
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Sheet({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/35" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="absolute inset-x-0 bottom-0 z-50 rounded-t-[14px] bg-[#f2f2f7] pb-8"
      >
        {children}
      </motion.div>
    </>
  )
}

function ShareSheet() {
  const rows = [
    { label: 'Copy', icon: Copy },
    { label: 'Add to Reading List', icon: BookOpen },
    { label: 'Add Bookmark', icon: Bookmark },
    { label: 'Add to Home Screen', icon: SquarePlus, demo: 'p:a2hs' },
  ]
  return (
    <Sheet>
      <div className="flex items-center gap-3 border-b border-zinc-300/70 px-4 py-3.5">
        <Badge className="h-11 w-11 rounded-[10px]" />
        <div>
          <div className="text-[15px] font-semibold">Stylist VIP Club</div>
          <div className="text-[13px] text-zinc-500">vip.stylistbeautymall.com</div>
        </div>
      </div>
      <div className="flex gap-5 px-5 py-4">
        {[
          { label: 'AirDrop', c: 'bg-sky-500' },
          { label: 'Messages', c: 'bg-green-500' },
          { label: 'Viber', c: 'bg-viber' },
          { label: 'Messenger', c: 'bg-[#0866ff]' },
        ].map((a) => (
          <div key={a.label} className="flex flex-col items-center gap-1.5">
            <div className={`h-14 w-14 rounded-full ${a.c}`} />
            <span className="text-[11px] text-zinc-600">{a.label}</span>
          </div>
        ))}
      </div>
      <div className="mx-4 overflow-hidden rounded-xl bg-white">
        {rows.map((r) => (
          <button
            key={r.label}
            data-demo={r.demo}
            onClick={r.demo ? openAddDialog : undefined}
            className="flex w-full items-center justify-between border-b border-zinc-200 px-4 py-3 text-left text-[16px] last:border-0"
          >
            {r.label}
            <r.icon size={21} className="text-zinc-800" />
          </button>
        ))}
      </div>
    </Sheet>
  )
}

function AddDialog() {
  return (
    <Sheet>
      <div className="flex items-center justify-between px-4 py-3.5 text-[16px]">
        <button onClick={() => demo().update((s) => void (s.phone.overlay = null))} className="text-[#0a84ff]">
          Cancel
        </button>
        <span className="font-semibold">Add to Home Screen</span>
        <button data-demo="p:add-confirm" onClick={confirmAdd} className="font-semibold text-[#0a84ff]">
          Add
        </button>
      </div>
      <div className="mx-4 flex items-center gap-4 rounded-xl bg-white p-4">
        <Badge className="h-16 w-16 shrink-0 rounded-[15px]" />
        <div className="flex-1 border-b border-zinc-200 pb-2">
          <div className="text-[17px]">Stylist VIP</div>
          <div className="mt-1 text-[13px] text-zinc-400">https://vip.stylistbeautymall.com</div>
        </div>
      </div>
      <p className="mx-5 mt-3 text-[12.5px] text-zinc-500">An icon will be added to your Home Screen so you can quickly access this website.</p>
      <div className="h-24" />
    </Sheet>
  )
}

const wallpaper = 'bg-[radial-gradient(120%_80%_at_20%_10%,#c99a6b_0%,#76432e_45%,#1f120c_100%)]'

const HOME_APPS = [
  { label: 'Calendar', icon: CalendarDays, c: 'bg-white text-red-500' },
  { label: 'Photos', icon: Images, c: 'bg-white text-orange-500' },
  { label: 'Camera', icon: Camera, c: 'bg-zinc-300 text-zinc-800' },
  { label: 'Maps', icon: MapPin, c: 'bg-emerald-100 text-emerald-600' },
  { label: 'Weather', icon: Sun, c: 'bg-sky-500 text-yellow-200' },
  { label: 'Clock', icon: Clock, c: 'bg-black text-white' },
  { label: 'Notes', icon: StickyNote, c: 'bg-yellow-100 text-yellow-600' },
  { label: 'Wallet', icon: Wallet, c: 'bg-black text-amber-300' },
  { label: 'Mail', icon: Mail, c: 'bg-sky-500 text-white' },
  { label: 'Settings', icon: Settings, c: 'bg-zinc-400 text-zinc-800' },
  { label: 'Viber', icon: MessageCircle, c: 'bg-viber text-white' },
]

function HomeScreen() {
  const installed = useDemo((s) => s.phone.installed)
  const pop = useDemo((s) => s.phone.iconPop)
  return (
    <div className={`absolute inset-0 flex flex-col ${wallpaper}`}>
      <StatusBar dark />
      <div className="grid grid-cols-4 gap-x-4 gap-y-6 px-6 pt-5">
        {HOME_APPS.map((a) => (
          <div key={a.label} className="flex flex-col items-center gap-1.5">
            <div className={`flex h-[62px] w-[62px] items-center justify-center rounded-[16px] ${a.c}`}>
              <a.icon size={30} />
            </div>
            <span className="text-[12px] text-white">{a.label}</span>
          </div>
        ))}
        {installed && (
          <motion.button
            key={pop}
            data-demo="p:icon"
            onClick={() => openApp()}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.25, 1], opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-col items-center gap-1.5"
          >
            <Badge className="h-[62px] w-[62px] rounded-[16px] ring-1 ring-gold/40" />
            <span className="text-[12px] text-white">Stylist VIP</span>
          </motion.button>
        )}
      </div>
      <div className="mx-3 mt-auto mb-6 flex justify-around rounded-[30px] bg-white/25 py-3 backdrop-blur">
        {[
          { icon: PhoneIcon, c: 'bg-green-500' },
          { icon: Compass, c: 'bg-sky-500' },
          { icon: MessageCircle, c: 'bg-green-500' },
          { icon: Music, c: 'bg-rose-500' },
        ].map((d, i) => (
          <div key={i} className={`flex h-[60px] w-[60px] items-center justify-center rounded-[16px] text-white ${d.c}`}>
            <d.icon size={30} />
          </div>
        ))}
      </div>
    </div>
  )
}

function NoteIcon({ app }: { app: 'viber' | 'vip' }) {
  return app === 'viber' ? (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-viber text-[18px] font-black text-white">V</span>
  ) : (
    <Badge className="h-10 w-10 shrink-0 rounded-[10px]" />
  )
}

function LockScreen() {
  const notes = useDemo((s) => s.phone.notifications)
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div className={`absolute inset-0 flex flex-col ${wallpaper}`}>
      <StatusBar dark />
      <div className="mt-6 text-center text-white">
        <Lock size={18} className="mx-auto opacity-80" />
        <div className="mt-2 text-[19px] font-medium opacity-90">{today}</div>
        <div className="text-[96px] leading-none font-semibold tracking-tight">{NOW}</div>
      </div>
      <div className="mt-auto space-y-2 px-3 pb-3">
        <AnimatePresence>
          {notes.map((n) => (
            <motion.button
              key={n.id}
              layout
              data-demo="p:notif"
              onClick={() => tapNotification(n.id)}
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
              className="flex w-full gap-3 rounded-[22px] bg-white/75 p-3.5 text-left backdrop-blur-xl"
            >
              <NoteIcon app={n.app} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-[13px]">
                  <span className="font-semibold text-zinc-900">{n.app === 'vip' ? 'STYLIST VIP' : 'VIBER'}</span>
                  <span className="text-zinc-500">{n.time}</span>
                </div>
                <div className="text-[14px] font-semibold text-zinc-900">{n.title}</div>
                <div className="text-[14px] leading-snug text-zinc-800">{n.text}</div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between px-12 pb-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white">
          <Flashlight size={20} />
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white">
          <Camera size={20} />
        </span>
      </div>
    </div>
  )
}

function PermissionAlert() {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/40" />
      <motion.div
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-1/2 left-1/2 z-50 w-[272px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[14px] bg-[#f2f2f7]/95 text-center backdrop-blur"
      >
        <div className="px-4 pt-5 pb-4">
          <div className="text-[16.5px] leading-snug font-semibold">“Stylist VIP” Would Like to Send You Notifications</div>
          <div className="mt-1.5 text-[13px] leading-snug text-zinc-700">Notifications may include alerts, sounds and icon badges. These can be configured in Settings.</div>
        </div>
        <div className="grid grid-cols-2 border-t border-zinc-300 text-[16.5px] text-[#0a84ff]">
          <button onClick={() => demo().update((s) => void (s.phone.overlay = null))} className="border-r border-zinc-300 py-3">
            Don’t Allow
          </button>
          <button data-demo="p:allow" onClick={allowNotifications} className="py-3 font-semibold">
            Allow
          </button>
        </div>
      </motion.div>
    </>
  )
}

/** A notification dropping in from the top while the phone is unlocked (Viber message or VIP app push). */
function Banner() {
  const banner = useDemo((s) => s.phone.banner)
  const screen = useDemo((s) => s.phone.screen)
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!banner || screen === 'lock' || (banner.app === 'viber' && screen === 'viber')) return setShow(false)
    setShow(true)
    if (banner.app === 'vip') {
      const t = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(t)
    }
  }, [banner, screen])
  return (
    <AnimatePresence>
      {show && banner && (
        <motion.button
          key={banner.id}
          data-demo={banner.app === 'viber' ? 'p:viber-banner' : 'p:push-banner'}
          initial={{ y: -140 }}
          animate={{ y: 0 }}
          exit={{ y: -140 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          onClick={() => (banner.app === 'viber' ? openViber() : tapNotification(banner.id))}
          className="absolute inset-x-2.5 top-12 z-[60] flex gap-3 rounded-[22px] bg-white/90 p-3.5 text-left shadow-xl backdrop-blur-xl"
        >
          <NoteIcon app={banner.app} />
          <div className="min-w-0">
            <div className="flex justify-between gap-2 text-[13px]">
              <span className="font-semibold">{banner.app === 'vip' ? banner.title : 'Stylist Beauty Mall'}</span>
              <span className="text-zinc-500">now</span>
            </div>
            <div className="line-clamp-2 text-[13.5px] leading-snug text-zinc-700">{banner.text}</div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function Phone() {
  const screen = useDemo((s) => s.phone.screen)
  const overlay = useDemo((s) => s.phone.overlay)
  const app = useDemo((s) => s.guestApp)
  const buzz = useDemo((s) => s.phone.buzz)
  const shake = useAnimationControls()

  useEffect(() => {
    if (buzz) shake.start({ x: [0, -7, 7, -6, 6, -3, 3, 0], transition: { duration: 0.55 } })
  }, [buzz, shake])

  const light = screen === 'browser' || screen === 'app' || screen === 'viber'
  return (
    <motion.div animate={shake} className="relative rounded-[62px] bg-[#1b1b1d] p-[13px] shadow-[0_30px_80px_rgb(0_0_0/0.6),inset_0_0_0_2px_#3a3a3c]" style={{ width: PHONE_W + 26, height: PHONE_H + 26 }}>
      <div className="relative h-full w-full overflow-hidden rounded-[50px] bg-black">
        <div className="absolute top-[11px] left-1/2 z-[70] h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-black" />

        {screen === 'browser' && (
          <div className="absolute inset-0 flex flex-col bg-white">
            <div className="bg-cocoa">
              <StatusBar dark />
            </div>
            <div className="relative min-h-0 flex-1">{app === 'vip' ? <Vip /> : <Site />}</div>
            <SafariBar />
            <InstallBanner />
          </div>
        )}
        {/* opened from the home screen: full screen, no browser bars */}
        {screen === 'app' && (
          <div className="absolute inset-0 flex flex-col bg-cocoa">
            <StatusBar dark />
            <div className="relative min-h-0 flex-1">
              <Vip />
            </div>
            <div className="h-5 shrink-0 bg-white" />
          </div>
        )}
        {screen === 'viber' && <ViberChat />}
        {screen === 'home' && <HomeScreen />}
        {screen === 'lock' && <LockScreen />}

        <AnimatePresence>
          {screen === 'splash' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, borderRadius: 60 }}
              animate={{ opacity: 1, scale: 1, borderRadius: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-cocoa"
            >
              <Monogram className="h-28 w-28" />
              <Wordmark className="mt-4 h-8" />
              <div className="mt-2 text-[11px] tracking-[0.35em] text-gold/70 uppercase">VIP club</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {overlay === 'photos' && <PhotoPicker key="photos" />}
          {overlay === 'share' && <ShareSheet key="share" />}
          {overlay === 'add' && <AddDialog key="add" />}
          {overlay === 'permission' && <PermissionAlert key="perm" />}
        </AnimatePresence>
        <Banner />
        <div className={`absolute bottom-2 left-1/2 z-[70] h-[5px] w-[134px] -translate-x-1/2 rounded-full ${light ? 'bg-black' : 'bg-white'}`} />
      </div>
    </motion.div>
  )
}
