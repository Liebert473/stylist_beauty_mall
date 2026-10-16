// ——— views ———

/** Pages of the public website (stylistbeautymall.com). */
export type PageId = 'home' | 'services' | 'scalp' | 'water' | 'team' | 'gallery' | 'news' | 'book' | 'contact'

/** Screens of the VIP members area (vip.stylistbeautymall.com). */
export type VipPage = 'login' | 'setup' | 'home' | 'wallet' | 'topup' | 'book' | 'rewards' | 'news'

export type AdminSection =
  | 'today'
  | 'bookings'
  | 'checkout'
  | 'clients'
  | 'wallet'
  | 'rewards'
  | 'notify'
  | 'home'
  | 'services'
  | 'signature'
  | 'team'
  | 'gallery'
  | 'news'

/** Which product the customer panel shows. */
export type GuestApp = 'site' | 'vip'
export type Device = 'phone' | 'desktop'
export type Focus = 'split' | 'admin' | 'site'
/** browser = Safari · app = the VIP club opened from the home screen (full screen) */
export type PhoneScreen = 'browser' | 'viber' | 'home' | 'splash' | 'app' | 'lock'
export type PhoneOverlay = null | 'photos' | 'share' | 'add' | 'permission'

// ——— website content (edited as a draft, live on Publish) ———

export interface Service {
  id: string
  name: string
  desc: string
  /** Kyats */
  price: number
  /** "from" price: final price depends on hair length etc. */
  from?: boolean
  minutes: number
  online: boolean
  tag?: string
}

export interface ServiceCategory {
  id: string
  name: string
  intro: string
  photo: string
  items: Service[]
}

export interface Stylist {
  id: string
  name: string
  role: string
  bio: string
  photo: string
  /** category ids this stylist can be booked for */
  skills: string[]
  /** ISO dates the stylist is off (leave, training) */
  off: string[]
}

export interface Step {
  id: string
  title: string
  text: string
}

export interface GalleryPhoto {
  id: string
  photo: string
  caption: string
}

export interface NewsItem {
  id: string
  date: string
  title: string
  text: string
  photo: string
  audience: 'public' | 'vip'
}

export interface Tier {
  id: 'silver' | 'gold' | 'platinum'
  name: string
  /** Kyats spent in the last 12 months to reach this tier */
  min: number
  /** cash back per completed spending step */
  cashback: number
  perk: string
}

export interface TopupBonus {
  id: string
  amount: number
  bonus: number
}

export interface SiteContent {
  home: {
    announcementOn: boolean
    announcement: string
    kicker: string
    title: string
    subtitle: string
    heroPhoto: string
  }
  services: { intro: string; categories: ServiceCategory[] }
  signature: {
    scalp: { title: string; intro: string; photo: string; photo2: string; steps: Step[] }
    water: { title: string; intro: string; photo: string; photo2: string; points: Step[] }
  }
  team: { intro: string; stylists: Stylist[] }
  gallery: { photos: GalleryPhoto[] }
  news: { items: NewsItem[] }
  rewards: {
    /** every time this much is spent, the tier's cash back is added to the wallet */
    step: number
    tiers: Tier[]
    bonuses: TopupBonus[]
    birthday: number
    refundRate: number
    accounts: { id: string; name: string; holder: string; number: string }[]
  }
  contact: { address: string; phone: string; viber: string; hours: string }
}

export type ContentSection = keyof SiteContent

// ——— salon operations (live data, not drafts) ———

export type BookingStatus = 'pending' | 'confirmed' | 'arrived' | 'done' | 'noshow'

export interface Booking {
  id: string
  name: string
  phone: string
  services: string[]
  stylist: string
  date: string
  time: string
  minutes: number
  status: BookingStatus
  source: 'website' | 'vip' | 'walk-in' | 'phone'
  vip?: string
  payWallet?: boolean
  note?: string
}

export type TierId = Tier['id']

export interface Client {
  id: string
  name: string
  phone: string
  username: string
  status: 'invited' | 'active'
  tier: TierId
  since: string
  /** spent in the last 12 months (drives the tier) */
  spend12m: number
  /** spend counted towards the next cash back */
  progress: number
  visits: number
  invite?: string
  /** added the VIP club to the home screen */
  app?: boolean
  /** allowed notifications */
  push?: boolean
}

export type LedgerKind = 'topup' | 'bonus' | 'payment' | 'cashback' | 'refund' | 'birthday' | 'adjust'

/** One permanent line of a wallet's history. Balances are always the sum of these lines. */
export interface LedgerLine {
  id: string
  client: string
  when: string
  kind: LedgerKind
  /** money the client put in (refundable) or reward credit (bonus, cash back) */
  bucket: 'paid' | 'reward'
  amount: number
  note: string
  by: string
}

export interface TopupRequest {
  id: string
  client: string
  amount: number
  account: string
  txId: string
  when: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface ViberMessage {
  id: string
  text: string
  time: string
  link?: { label: string; url: string; vip: VipPage }
}

export interface VipNotice {
  id: string
  title: string
  text: string
  time: string
  kind: 'topup' | 'cashback' | 'booking' | 'news' | 'welcome'
}

export interface BookingForm {
  category: string
  service: string
  stylist: string
  date: string
  time: string
  name: string
  phone: string
  note: string
  submitted: boolean
}

export interface VipBookingForm {
  services: string[]
  stylist: string
  date: string
  time: string
  payWallet: boolean
  submitted: boolean
}

export interface TopupForm {
  amount: number
  account: string
  screenshot: boolean
  txId: string
  submitted: boolean
}

export interface CheckoutState {
  client: string
  booking: string | null
  services: string[]
  stylist: string
  payWallet: boolean
  done: null | { total: number; wallet: number; cashback: number; reward: number }
}

export interface InviteForm {
  name: string
  phone: string
  username: string
  tier: TierId
  created: string | null
}

/** A notification shown on the phone: a Viber message or a push from the VIP app. */
export interface PhoneNotification {
  id: string
  app: 'viber' | 'vip'
  title: string
  text: string
  time: string
  /** VIP app page the notification opens */
  page?: VipPage
}

export type PushAudience = 'all' | 'gold' | 'one'

export interface PushDraft {
  title: string
  body: string
  page: VipPage
  audience: PushAudience
}

export interface SentPush {
  id: string
  title: string
  body: string
  audience: string
  when: string
  delivered: number
  opened: number
}

export type AutoPushKey = 'booking' | 'reminder' | 'topup' | 'cashback' | 'birthday'
