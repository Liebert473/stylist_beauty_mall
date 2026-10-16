import { demo, emptyBooking, type DemoState } from './store'
import type { AutoPushKey, Booking, Client, LedgerLine, PushAudience, Service, ServiceCategory, SiteContent, Tier, VipNotice, VipPage } from './types'
import { iso } from './seed'
import { money, fmtDate } from '../ui/format'

// Salon rules shared by the website, the VIP area, the dashboard and the scripted demo.

/** The demo clock: bookings before this time today are done, later ones are coming. */
export const NOW = '12:40'
export const OPEN = '09:30'
export const CLOSE = '19:00'

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
export const endTime = (time: string, minutes: number) => toTime(toMin(time) + minutes)

// ——— services ———

export const allServices = (c: SiteContent) => c.services.categories.flatMap((cat) => cat.items.map((s) => ({ ...s, category: cat.id })))

export const findService = (c: SiteContent, id: string): (Service & { category: string }) | undefined => allServices(c).find((s) => s.id === id)

export const categoryOf = (c: SiteContent, serviceId: string): ServiceCategory | undefined =>
  c.services.categories.find((cat) => cat.items.some((s) => s.id === serviceId))

export const servicesTotal = (c: SiteContent, ids: string[]) => ids.reduce((sum, id) => sum + (findService(c, id)?.price ?? 0), 0)
export const servicesMinutes = (c: SiteContent, ids: string[]) => ids.reduce((sum, id) => sum + (findService(c, id)?.minutes ?? 0), 0)
export const servicesLabel = (c: SiteContent, ids: string[]) => ids.map((id) => findService(c, id)?.name ?? id).join(', ')

export const stylistName = (c: SiteContent, id: string) => c.team.stylists.find((s) => s.id === id)?.name ?? 'Any stylist'

// ——— availability ———

export interface Slot {
  time: string
  free: boolean
  /** the stylist who would take it when "any stylist" was chosen */
  stylist?: string
}

const busy = (bookings: Booking[], stylist: string, date: string, start: number, minutes: number) =>
  bookings.some(
    (b) =>
      b.stylist === stylist &&
      b.date === date &&
      b.status !== 'noshow' &&
      toMin(b.time) < start + minutes &&
      start < toMin(b.time) + b.minutes,
  )

export const isOff = (c: SiteContent, stylist: string, date: string) => !!c.team.stylists.find((s) => s.id === stylist)?.off.includes(date)

/** Start times on `date` for a service of `minutes`, with or without a chosen stylist. */
export function slots(c: SiteContent, bookings: Booking[], date: string, minutes: number, stylist: string, category: string): Slot[] {
  if (!date || !minutes) return []
  const candidates = stylist ? [stylist] : c.team.stylists.filter((s) => s.skills.includes(category)).map((s) => s.id)
  const out: Slot[] = []
  for (let m = toMin(OPEN); m + minutes <= toMin(CLOSE); m += 30) {
    const past = date === iso(0) && m <= toMin(NOW)
    const who = past ? undefined : candidates.find((id) => !isOff(c, id, date) && !busy(bookings, id, date, m, minutes))
    out.push({ time: toTime(m), free: !!who, stylist: who })
  }
  return out
}

// ——— wallet & rewards ———

export const balance = (ledger: LedgerLine[], client: string) => {
  const lines = ledger.filter((l) => l.client === client)
  const paid = lines.filter((l) => l.bucket === 'paid').reduce((s, l) => s + l.amount, 0)
  const reward = lines.filter((l) => l.bucket === 'reward').reduce((s, l) => s + l.amount, 0)
  return { paid, reward, total: paid + reward }
}

export const tierFor = (c: SiteContent, spend12m: number): Tier =>
  [...c.rewards.tiers].reverse().find((t) => spend12m >= t.min) ?? c.rewards.tiers[0]

export const tierById = (c: SiteContent, id: Client['tier']) => c.rewards.tiers.find((t) => t.id === id) ?? c.rewards.tiers[0]

export const nextTier = (c: SiteContent, id: Client['tier']) => {
  const i = c.rewards.tiers.findIndex((t) => t.id === id)
  return c.rewards.tiers[i + 1]
}

/** Bonus for a top-up: the best bonus row the amount reaches. */
export const bonusFor = (c: SiteContent, amount: number) =>
  [...c.rewards.bonuses].sort((a, b) => b.amount - a.amount).find((b) => amount >= b.amount)?.bonus ?? 0

export const clientById = (s: DemoState, id: string | null) => s.clients.find((c) => c.id === id)

const clock = () => NOW
let seq = 1
const uid = (p: string) => `${p}${Date.now().toString(36)}${seq++}`

function addLine(s: DemoState, l: Omit<LedgerLine, 'id' | 'when'>) {
  s.ledger.unshift({ ...l, id: uid('l'), when: iso(0) })
}

const PUSH_KIND: Partial<Record<VipNotice['kind'], { key: AutoPushKey; page: VipPage }>> = {
  booking: { key: 'booking', page: 'home' },
  topup: { key: 'topup', page: 'wallet' },
  cashback: { key: 'cashback', page: 'rewards' },
}

/** A notice in the VIP area — and, once she allowed notifications, a push on her phone. */
function notify(s: DemoState, n: Omit<VipNotice, 'id' | 'time'>) {
  s.vip.notices.unshift({ ...n, id: uid('n'), time: clock() })
  const auto = PUSH_KIND[n.kind]
  if (auto && s.autoPush[auto.key]) pushToPhone(s, n.title, n.text, auto.page)
}

/** Deliver a VIP app notification to the demo phone (only after "Allow"). */
function pushToPhone(s: DemoState, title: string, text: string, page: VipPage) {
  if (s.phone.permission !== 'granted') return
  const note = { id: uid('p'), app: 'vip' as const, title, text, time: 'now', page }
  if (s.phone.screen === 'lock') s.phone.notifications.unshift(note)
  else s.phone.banner = note
  s.phone.buzz += 1
}

// ——— Viber (the salon's messages to customers) ———

export function sendViber(text: string, link?: { label: string; url: string; vip: VipPage }) {
  demo().update((s) => {
    const msg = { id: uid('v'), text, time: clock(), link }
    s.phone.viber.push(msg)
    s.phone.banner = { id: msg.id, app: 'viber', title: 'Stylist Beauty Mall', text, time: 'now' }
    s.phone.buzz += 1
  })
  demo().toast('Sent on Viber')
}

export function openViber() {
  demo().update((s) => {
    s.phone.screen = 'viber'
    s.phone.banner = null
  })
}

/** Tap a link in a Viber message: the phone browser opens the VIP area. */
export function openVipLink(page: VipPage) {
  demo().update((s) => {
    s.phone.screen = 'browser'
    s.phone.banner = null
    s.guestApp = 'vip'
    s.vipPage = page
  })
}

export const bookingMessage = (c: SiteContent, b: Booking) =>
  `Mingalaba ${b.name.split(' ').slice(-2).join(' ')} 🌸 Your booking is confirmed: ${servicesLabel(c, b.services)} with ${stylistName(c, b.stylist)}, ${fmtDate(b.date)} at ${b.time}. See you at Stylist Beauty Mall!`

// ——— public booking ———

export const setBookingForm = <K extends keyof DemoState['booking']>(key: K, value: DemoState['booking'][K]) =>
  demo().update((s) => void (s.booking[key] = value))

export function submitBooking(id = uid('b')) {
  demo().update((s) => {
    const f = s.booking
    const svc = findService(s.content, f.service)
    if (!svc) return
    const free = slots(s.content, s.bookings, f.date, svc.minutes, f.stylist, svc.category).find((x) => x.time === f.time)
    s.bookings.push({
      id,
      name: f.name || 'Website guest',
      phone: f.phone,
      services: [svc.id],
      stylist: f.stylist || free?.stylist || s.content.team.stylists[0].id,
      date: f.date,
      time: f.time,
      minutes: svc.minutes,
      status: 'pending',
      source: 'website',
      note: f.note,
    })
    f.submitted = true
    s.adminUi.selectedBooking = id
    s.adminUi.day = f.date
  })
  demo().toast('New booking request from the website')
}

export const resetBookingForm = () => demo().update((s) => void (s.booking = emptyBooking()))

export function confirmBooking(id: string) {
  demo().update((s) => {
    const b = s.bookings.find((x) => x.id === id)
    if (b) b.status = 'confirmed'
  })
  demo().toast('Booking confirmed')
}

export function setBookingStatus(id: string, status: Booking['status']) {
  demo().update((s) => {
    const b = s.bookings.find((x) => x.id === id)
    if (b) b.status = status
  })
}

// ——— VIP invitation ———

export function createInvite(id = uid('c')) {
  demo().update((s) => {
    const f = s.invite
    s.clients.unshift({
      id,
      name: f.name,
      phone: f.phone,
      username: f.username,
      status: 'invited',
      tier: f.tier,
      since: String(new Date().getFullYear()),
      spend12m: 0,
      progress: 0,
      visits: 0,
      invite: `vip.stylistbeautymall.com/i/${id.slice(-6).toUpperCase()}7Q`,
    })
    f.created = id
    s.adminUi.selectedClient = id
  })
  demo().toast('VIP account created — invitation link ready')
  return id
}

export const inviteMessage = (name: string) =>
  `Dear ${name}, you are invited to the Stylist Beauty Mall VIP club ✨ Tap the link to set your own password. The link works for 7 days.`

export function activateVip(clientId: string) {
  demo().update((s) => {
    const c = s.clients.find((x) => x.id === clientId)
    if (c) c.status = 'active'
    s.vip.session = clientId
    s.vipPage = 'home'
    s.phone.installPrompt = true
    notify(s, { kind: 'welcome', title: 'Welcome to the VIP club', text: 'Top up your wallet, book in seconds and earn cash back on every visit.' })
  })
  demo().toast('VIP joined — account active')
}

// ——— wallet ———

export function cashTopup(clientId: string, amount: number) {
  demo().update((s) => {
    const bonus = bonusFor(s.content, amount)
    addLine(s, { client: clientId, kind: 'topup', bucket: 'paid', amount, note: 'Cash at counter', by: 'Front desk' })
    if (bonus) addLine(s, { client: clientId, kind: 'bonus', bucket: 'reward', amount: bonus, note: `Top-up bonus ${money(amount)}`, by: 'Automatic' })
    notify(s, { kind: 'topup', title: `${money(amount + bonus)} added to your wallet`, text: bonus ? `${money(amount)} top-up + ${money(bonus)} bonus` : 'Cash top-up at the counter' })
    s.flash = { paths: ['vip.balance', 'admin.wallet'], nonce: s.flash.nonce + 1, at: Date.now() }
  })
  demo().toast('Top-up recorded')
}

export const setTopupForm = <K extends keyof DemoState['topup']>(key: K, value: DemoState['topup'][K]) =>
  demo().update((s) => void (s.topup[key] = value))

export function submitTopup(id = uid('t')) {
  demo().update((s) => {
    const f = s.topup
    if (!s.vip.session) return
    s.topups.unshift({ id, client: s.vip.session, amount: f.amount, account: f.account, note: f.note.trim(), when: iso(0), status: 'pending' })
    f.submitted = true
    s.adminUi.selectedTopup = id
  })
  demo().toast('Top-up waiting for approval')
}

export function approveTopup(id: string) {
  demo().update((s) => {
    const t = s.topups.find((x) => x.id === id)
    if (!t || t.status !== 'pending') return
    t.status = 'approved'
    const acc = s.content.rewards.accounts.find((a) => a.id === t.account)?.name ?? 'Transfer'
    const bonus = bonusFor(s.content, t.amount)
    addLine(s, { client: t.client, kind: 'topup', bucket: 'paid', amount: t.amount, note: t.note ? `${acc} transfer · “${t.note}”` : `${acc} transfer`, by: 'Front desk' })
    if (bonus) addLine(s, { client: t.client, kind: 'bonus', bucket: 'reward', amount: bonus, note: `Top-up bonus ${money(t.amount)}`, by: 'Automatic' })
    notify(s, { kind: 'topup', title: 'Top-up approved', text: `${money(t.amount + bonus)} added${bonus ? ` (incl. ${money(bonus)} bonus)` : ''}` })
    s.flash = { paths: ['vip.balance', 'vip.notices'], nonce: s.flash.nonce + 1, at: Date.now() }
  })
  demo().toast('Top-up approved — wallet updated')
}

// ——— VIP booking ———

export function submitVipBooking(id = uid('b')) {
  demo().update((s) => {
    const f = s.vipBooking
    const c = s.clients.find((x) => x.id === s.vip.session)
    if (!c || !f.services.length) return
    s.bookings.push({
      id,
      name: c.name,
      phone: c.phone,
      services: [...f.services],
      stylist: f.stylist,
      date: f.date,
      time: f.time,
      minutes: servicesMinutes(s.content, f.services),
      status: 'confirmed',
      source: 'vip',
      vip: c.id,
      payWallet: f.payWallet,
    })
    f.submitted = true
    notify(s, { kind: 'booking', title: 'Booking confirmed', text: `${servicesLabel(s.content, f.services)} · ${fmtDate(f.date)} ${f.time}` })
    s.adminUi.selectedBooking = id
    s.adminUi.day = f.date
  })
  demo().toast('VIP booking — confirmed automatically')
}

// ——— checkout & cash back ———

/** Pay for a visit: wallet first (reward credit before paid credit), then cash back on eligible spend. */
export function payCheckout() {
  demo().update((s) => {
    const co = s.checkout
    const c = s.clients.find((x) => x.id === co.client)
    if (!c || co.done) return
    const total = servicesTotal(s.content, co.services)
    const bal = balance(s.ledger, c.id)
    let wallet = 0
    let rewardUsed = 0
    const label = servicesLabel(s.content, co.services)
    if (co.payWallet) {
      wallet = Math.min(total, bal.total)
      rewardUsed = Math.min(wallet, Math.max(0, bal.reward))
      const paidUsed = wallet - rewardUsed
      if (rewardUsed) addLine(s, { client: c.id, kind: 'payment', bucket: 'reward', amount: -rewardUsed, note: label, by: 'Front desk' })
      if (paidUsed) addLine(s, { client: c.id, kind: 'payment', bucket: 'paid', amount: -paidUsed, note: label, by: 'Front desk' })
    }
    // rewards do not earn rewards: only money the client paid counts
    const eligible = total - rewardUsed
    c.progress += eligible
    c.spend12m += total
    c.visits += 1
    const tier = tierById(s.content, c.tier)
    let cashback = 0
    while (c.progress >= s.content.rewards.step) {
      c.progress -= s.content.rewards.step
      cashback += tier.cashback
    }
    if (cashback) {
      addLine(s, { client: c.id, kind: 'cashback', bucket: 'reward', amount: cashback, note: `${tier.name} cash back`, by: 'Automatic' })
      notify(s, { kind: 'cashback', title: `You earned ${money(cashback)} cash back`, text: `Added to your wallet after today’s visit. Thank you!` })
    }
    const up = tierFor(s.content, c.spend12m)
    if (s.content.rewards.tiers.indexOf(up) > s.content.rewards.tiers.findIndex((t) => t.id === c.tier)) c.tier = up.id
    if (co.booking) {
      const b = s.bookings.find((x) => x.id === co.booking)
      if (b) b.status = 'done'
    }
    co.done = { total, wallet, cashback, reward: rewardUsed }
    s.vip.celebrate += cashback ? 1 : 0
    s.flash = { paths: ['vip.balance', 'vip.progress', 'vip.notices'], nonce: s.flash.nonce + 1, at: Date.now() }
  })
  const done = demo().checkout.done
  demo().toast(done?.cashback ? `Paid — ${money(done.cashback)} cash back added` : 'Paid')
}

// ——— dashboard helpers ———

export const expand = (id: string | null) => demo().update((s) => void (s.adminUi.expanded = id))

export function addNews(id = uid('n'), audience: 'public' | 'vip' = 'public') {
  demo().editDraft((d) => {
    d.news.items.unshift({ id, date: iso(0), title: '', text: '', photo: 'promo-festival', audience })
  })
  expand(id)
  return id
}

export function addService(categoryId: string, id = uid('s')) {
  demo().editDraft((d) => {
    d.services.categories.find((c) => c.id === categoryId)?.items.push({ id, name: '', desc: '', price: 0, minutes: 60, online: true, tag: 'New' })
  })
  expand(id)
  return id
}

export function toggleDayOff(stylist: string, date: string) {
  demo().editDraft((d) => {
    const st = d.team.stylists.find((x) => x.id === stylist)
    if (!st) return
    st.off = st.off.includes(date) ? st.off.filter((x) => x !== date) : [...st.off, date].sort()
  })
}

/** Simulated upload: the photo joins the gallery draft after a short progress bar. */
export function uploadPhoto(photo: string, id = uid('g'), caption = '') {
  demo().editDraft((d) => {
    d.gallery.photos.unshift({ id, photo, caption })
  })
  expand(id)
}

/** Real upload from the presenter's computer (free mode). */
export function uploadFiles(files: FileList) {
  ;[...files].forEach((file, i) => {
    const key = `upload-${Date.now()}-${i}`
    demo().update((s) => {
      s.uploads[key] = URL.createObjectURL(file)
    })
    uploadPhoto(key, uid('g'), file.name.replace(/\.[^.]+$/, ''))
  })
}

export const walletTotalHeld = (s: DemoState) => s.clients.reduce((sum, c) => sum + balance(s.ledger, c.id).total, 0)

// ——— the VIP club on the home screen & notifications ———

const sessionClient = (s: DemoState) => s.clients.find((c) => c.id === s.vip.session)

export const openShare = () => demo().update((s) => void (s.phone.overlay = 'share'))
export const openAddDialog = () => demo().update((s) => void (s.phone.overlay = 'add'))

export function confirmAdd() {
  demo().update((s) => {
    s.phone.overlay = null
    s.phone.installed = true
    s.phone.installPrompt = false
    s.phone.screen = 'home'
    s.phone.banner = null
    s.phone.iconPop += 1
    const c = sessionClient(s)
    if (c) c.app = true
  })
  demo().toast('VIP app added to a home screen')
}

/** Tap the home-screen icon: splash, then the VIP club full screen. */
export function openApp(instant = false, page: VipPage = 'home') {
  demo().update((s) => {
    s.phone.screen = instant ? 'app' : 'splash'
    s.phone.overlay = null
    s.guestApp = 'vip'
    s.vipPage = page
  })
  if (!instant) setTimeout(() => demo().phone.screen === 'splash' && demo().update((s) => void (s.phone.screen = 'app')), 1300)
}

export const askPermission = () => demo().update((s) => void (s.phone.overlay = 'permission'))

export function allowNotifications() {
  demo().update((s) => {
    s.phone.overlay = null
    s.phone.permission = 'granted'
    const c = sessionClient(s)
    if (c) c.push = true
  })
  demo().toast('Notifications on for a VIP')
}

export const lockPhone = () =>
  demo().update((s) => {
    s.phone.screen = 'lock'
    s.phone.overlay = null
    s.phone.banner = null
  })

/** Tap a notification: Viber opens the chat, a VIP push opens the app on its page. */
export function tapNotification(id: string) {
  const n = demo().phone.notifications.find((x) => x.id === id) ?? demo().phone.banner
  demo().update((s) => {
    s.phone.notifications = s.phone.notifications.filter((x) => x.id !== id)
    s.phone.banner = null
    if (n?.app === 'viber') {
      s.phone.screen = 'viber'
      return
    }
    s.phone.screen = 'app'
    s.guestApp = 'vip'
    s.vipPage = n?.page ?? 'home'
    const last = s.sent[0]
    if (last) last.opened += 1
  })
}

export const setPush = <K extends keyof DemoState['push']>(key: K, value: DemoState['push'][K]) => demo().update((s) => void (s.push[key] = value))

const AUDIENCE: Record<PushAudience, string> = { all: 'All VIP members', gold: 'Gold & Platinum', one: 'Ma Su Mon Kyaw' }
export const audienceLabel = (a: PushAudience) => AUDIENCE[a]

export const recipients = (s: DemoState, a: PushAudience) =>
  s.clients.filter((c) => c.push && (a === 'all' || (a === 'gold' ? c.tier !== 'silver' : c.id === 'c-sumon')))

/** Send the composed notification to every member in the audience who allowed notifications. */
export function sendPush(id = uid('s')) {
  demo().update((s) => {
    const to = recipients(s, s.push.audience)
    s.sent.unshift({ id, title: s.push.title, body: s.push.body, audience: AUDIENCE[s.push.audience], when: `Today ${clock()}`, delivered: to.length, opened: 0 })
    if (to.some((c) => c.id === s.vip.session)) pushToPhone(s, s.push.title, s.push.body, s.push.page)
  })
  demo().toast(`Sent to ${demo().sent[0].delivered} members`)
}
