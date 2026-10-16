import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { BatteryFull, BookOpen, ChevronLeft, ChevronRight, Copy, Lock, Phone as PhoneIcon, Plus, Share, Signal, Smile, Video, Wifi } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import { NOW, openViber, openVipLink, setTopupForm } from '../store/ops'
import { Site } from '../site/Site'
import { Vip } from '../vip/Vip'
import { Badge } from '../ui/Logo'
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
        <Share size={23} />
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

/** Viber notification dropping in from the top. */
function Banner() {
  const banner = useDemo((s) => s.phone.banner)
  const screen = useDemo((s) => s.phone.screen)
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!banner || screen === 'viber') return setShow(false)
    setShow(true)
  }, [banner, screen])
  return (
    <AnimatePresence>
      {show && banner && (
        <motion.button
          data-demo="p:viber-banner"
          initial={{ y: -140 }}
          animate={{ y: 0 }}
          exit={{ y: -140 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          onClick={openViber}
          className="absolute inset-x-2.5 top-12 z-[60] flex gap-3 rounded-[22px] bg-white/90 p-3.5 text-left shadow-xl backdrop-blur-xl"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-viber text-[18px] font-black text-white">V</span>
          <div className="min-w-0">
            <div className="flex justify-between text-[13px]">
              <span className="font-semibold">Stylist Beauty Mall</span>
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

  return (
    <motion.div animate={shake} className="relative rounded-[62px] bg-[#1b1b1d] p-[13px] shadow-[0_30px_80px_rgb(0_0_0/0.6),inset_0_0_0_2px_#3a3a3c]" style={{ width: PHONE_W + 26, height: PHONE_H + 26 }}>
      <div className="relative h-full w-full overflow-hidden rounded-[50px] bg-black">
        <div className="absolute top-[11px] left-1/2 z-[70] h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-black" />

        {screen === 'browser' && (
          <div className="absolute inset-0 flex flex-col bg-white">
            <div className={app === 'vip' ? 'bg-cocoa' : 'bg-cocoa'}>
              <StatusBar dark />
            </div>
            <div className="relative min-h-0 flex-1">{app === 'vip' ? <Vip /> : <Site />}</div>
            <SafariBar />
          </div>
        )}
        {screen === 'viber' && <ViberChat />}

        <AnimatePresence>{overlay === 'photos' && <PhotoPicker key="photos" />}</AnimatePresence>
        <Banner />
        <div className="absolute bottom-2 left-1/2 z-[70] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </motion.div>
  )
}
