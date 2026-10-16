import { demo } from '../store/store'
import { iso } from '../store/seed'
import type { AdminSection, ContentSection, Device, GuestApp, LedgerLine, PageId, PhoneScreen, VipPage } from '../store/types'
import {
  activateVip,
  addNews,
  addService,
  approveTopup,
  cashTopup,
  confirmBooking,
  createInvite,
  bookingMessage,
  expand,
  inviteMessage,
  openViber,
  openVipLink,
  payCheckout,
  sendViber,
  setBookingForm,
  setTopupForm,
  submitBooking,
  submitTopup,
  submitVipBooking,
  toggleDayOff,
} from '../store/ops'
import { goVip, setPassword, setVipBooking, toggleVipService } from '../vip/Vip'
import { selectBooking, startCheckout } from '../admin/Bookings'
import { openInvite, setInvite } from '../admin/Clients'
import { setCash } from '../admin/Wallet'
import type { Action } from './runner'

export interface View {
  admin?: AdminSection
  site?: PageId
  vip?: VipPage
  app?: GuestApp
  device?: Device
  phone?: PhoneScreen
}

export interface Step {
  title: string
  /** One line shown to the audience at the bottom of the screen. */
  caption: string
  /** Talking points, visible only when presenter notes are open (N). */
  notes: string[]
  view?: View
  script: Action[]
}

export interface Chapter {
  id: string
  title: string
  short: string
  kind: 'slides' | 'demo'
  view: View
  setup?: () => void
  steps: Step[]
}

// ——— script helpers ———

const wait = (ms: number): Action => ({ t: 'wait', ms })
const type = (path: string, text: string): Action => ({ t: 'type', target: `a:${path}`, text, set: (v) => demo().setDraft(path, v) })
const typeMoney = (path: string, text: string): Action => ({
  t: 'type',
  target: `a:${path}`,
  text,
  set: (v) => demo().setDraft(path, Number(v.replace(/\D/g, '')) || 0),
})
const field = (target: string, text: string, set: (v: string) => void): Action => ({ t: 'type', target, text, set })
const open = (id: string): Action => ({ t: 'click', target: `a:item:${id}`, run: () => expand(id) })
const toggle = (path: string, value: boolean): Action => ({ t: 'click', target: `a:${path}`, run: () => demo().setDraft(path, value) })
const publish = (section: ContentSection): Action => ({ t: 'click', target: 'a:publish', run: () => demo().publish(section) })
const pick = (path: string, key: string): Action[] => [
  { t: 'click', target: `a:pick:${path}`, run: () => demo().update((s) => void (s.adminUi.pickerOpen = path)) },
  wait(350),
  {
    t: 'click',
    target: `a:photo:${key}`,
    run: () => {
      demo().setDraft(path, key)
      demo().update((s) => void (s.adminUi.pickerOpen = null))
    },
  },
]
const tap = (target: string, run: () => void): Action => ({ t: 'click', target, run })
const point = (target: string): Action => ({ t: 'point', target })
const act = (run: () => void, instant?: () => void): Action => ({ t: 'do', run, instant })

// ——— the story ———

const TOMORROW = iso(1)
const IN_2 = iso(2)
const IN_3 = iso(3)
const SUMON = 'c-sumon'

/** Ma Su Mon Kyaw — the VIP we follow from invitation to her first cash back. */
function addSuMon(lines: Omit<LedgerLine, 'id' | 'client'>[] = [], extra: { progress?: number; spend12m?: number; visits?: number } = {}) {
  demo().update((s) => {
    s.clients.unshift({
      id: SUMON,
      name: 'Ma Su Mon Kyaw',
      phone: '+95 9 765 432 100',
      username: 'sumon.kyaw',
      status: 'active',
      tier: 'silver',
      since: String(new Date().getFullYear()),
      spend12m: extra.spend12m ?? 0,
      progress: extra.progress ?? 0,
      visits: extra.visits ?? 0,
    })
    lines.forEach((l, i) => s.ledger.unshift({ ...l, id: `su${i}`, client: SUMON }))
    s.vip.session = SUMON
    s.guestApp = 'vip'
    s.vipPage = 'home'
    s.adminUi.selectedClient = SUMON
  })
}

const L = (when: number, kind: LedgerLine['kind'], bucket: LedgerLine['bucket'], amount: number, note: string, by = 'Front desk') => ({ when: iso(when), kind, bucket, amount, note, by })

/** Two weeks into membership: two top-ups and one visit. */
const SUMON_HISTORY = [
  L(-15, 'topup', 'paid', 500000, 'Cash at counter'),
  L(-15, 'bonus', 'reward', 35000, 'Top-up bonus 500,000 Ks', 'Automatic'),
  L(-15, 'topup', 'paid', 300000, 'KBZPay transfer · 0912 3344 5566'),
  L(-15, 'bonus', 'reward', 15000, 'Top-up bonus 300,000 Ks', 'Automatic'),
  L(-8, 'payment', 'reward', -50000, 'Colour & balayage, Hair spa, Pure water wash'),
  L(-8, 'payment', 'paid', -160000, 'Colour & balayage, Hair spa, Pure water wash'),
]

export const CHAPTERS: Chapter[] = [
  {
    id: 'intro',
    title: 'Why',
    short: 'Intro',
    kind: 'slides',
    view: {},
    steps: [
      { title: 'Welcome', caption: 'A digital home for Stylist Beauty Mall', notes: ['Thank the owners for their time.', 'Goal today: show — not tell — how the salon, the VIPs and the website work together.'], script: [] },
      {
        title: 'Today',
        caption: 'A brand customers love — but no home online',
        notes: ['5.6K TikTok followers and 121.9K likes: the audience is already there.', 'Bookings, prices and VIP credit all happen in chat or on paper today.'],
        script: [],
      },
      {
        title: 'Three doors',
        caption: 'Public website · VIP club · Stylist Studio — one system',
        notes: ['Every change in the Studio shows on the website and in the VIP area at once.', 'The point-of-sale system stays for accounting — we do not replace it.'],
        script: [],
      },
      { title: 'Agenda', caption: 'What we will see live today', notes: ['Each chapter: an action in the Studio (left) and what the customer sees (right).', 'Any chapter can be replayed.'], script: [] },
    ],
  },

  {
    id: 'website',
    title: 'Your website',
    short: 'Website',
    kind: 'demo',
    view: { admin: 'home', site: 'home', app: 'site', device: 'desktop', phone: 'browser' },
    steps: [
      {
        title: 'Headline & photo',
        caption: 'Change the headline and photo — press Publish — it is live',
        notes: ['No developer, no waiting.', 'Everything stays a draft until you press Publish.'],
        view: { admin: 'home', site: 'home' },
        script: [type('home.title', 'Healthy hair starts at the scalp'), ...pick('home.heroPhoto', 'hero-hair'), publish('home')],
      },
      {
        title: 'Announcement',
        caption: 'Switch on an announcement for a promotion',
        notes: ['Perfect for festival offers, holidays or a new service.'],
        view: { admin: 'home', site: 'home' },
        script: [toggle('home.announcementOn', true), type('home.announcement', 'Festival Glow Week — 15% off hair spa & scalp detox until the end of the month'), publish('home')],
      },
      {
        title: 'Scalp analysis page',
        caption: 'Your signature services get their own pages',
        notes: ['Scalp analysis and the pure water system are what make the salon different — now they are explained properly.', 'Texts, steps and photos are all editable.'],
        view: { admin: 'signature', site: 'scalp' },
        script: [open('s2'), type('signature.scalp.steps.s2.text', 'A 200× digital microscope shows your scalp and roots live on screen — you see exactly what we see.'), publish('signature')],
      },
      {
        title: 'Prices & new service',
        caption: 'Change a price, add a new service — bookable online right away',
        notes: ['Price, duration and “bookable online” for every service.', 'Durations drive the free time slots in online booking.'],
        view: { admin: 'services', site: 'services' },
        script: [
          open('spa'),
          typeMoney('services.categories.hair.items.spa.price', '65000'),
          tap('a:add-service:scalp', () => addService('scalp', 's-ritual')),
          wait(300),
          type('services.categories.scalp.items.s-ritual.name', 'Keratin scalp ritual'),
          type('services.categories.scalp.items.s-ritual.desc', 'Analysis, detox and a keratin serum massage in one visit.'),
          typeMoney('services.categories.scalp.items.s-ritual.price', '120000'),
          tap('a:services.categories.scalp.items.s-ritual.minutes:90', () => demo().setDraft('services.categories.scalp.items.s-ritual.minutes', 90)),
          publish('services'),
        ],
      },
      {
        title: 'News',
        caption: 'Post news and promotions in seconds',
        notes: ['Public posts appear on the website; members-only posts appear in the VIP area (chapter 6).'],
        view: { admin: 'news', site: 'news' },
        script: [
          tap('a:add-news', () => addNews('n-glow', 'public')),
          wait(300),
          type('news.items.n-glow.title', 'Festival Glow Week'),
          type('news.items.n-glow.text', '15% off hair spa and scalp detox treatments. Book online and mention “Glow”.'),
          ...pick('news.items.n-glow.photo', 'hair-treatment'),
          publish('news'),
        ],
      },
    ],
  },

  {
    id: 'booking',
    title: 'Online booking',
    short: 'Booking',
    kind: 'demo',
    view: { admin: 'bookings', site: 'book', app: 'site', device: 'phone', phone: 'browser' },
    steps: [
      {
        title: 'A customer books',
        caption: 'Anyone can book: service, stylist, a free time — done',
        notes: ['No account needed for the public — name and Viber number only.', 'Only free times are offered: stylist schedules and service durations are checked automatically.'],
        view: { admin: 'bookings', site: 'book' },
        script: [
          tap('s:cat:scalp', () => setBookingForm('category', 'scalp')),
          tap('s:svc:analysis', () => setBookingForm('service', 'analysis')),
          tap('s:stylist:hnin', () => setBookingForm('stylist', 'hnin')),
          tap(`s:date:${TOMORROW}`, () => setBookingForm('date', TOMORROW)),
          tap('s:time:11:00', () => setBookingForm('time', '11:00')),
          field('s:name', 'Ma Thin Thin', (v) => setBookingForm('name', v)),
          field('s:phone', '09 450 778 812', (v) => setBookingForm('phone', v)),
          tap('s:submit', () => submitBooking('b-web')),
          wait(800),
        ],
      },
      {
        title: 'Confirm & send on Viber',
        caption: 'It lands in the calendar — confirm, and send a ready-made Viber message',
        notes: ['The message is written for you: service, stylist, date and time.', 'Phase 2 sends it automatically once the Viber business account is approved.'],
        view: { admin: 'bookings', site: 'book' },
        script: [
          act(() => demo().update((s) => void (s.adminUi.day = TOMORROW))),
          tap('a:booking:b-web', () => selectBooking('b-web')),
          tap('a:confirm', () => confirmBooking('b-web')),
          tap('a:viber-booking', () => {
            const b = demo().bookings.find((x) => x.id === 'b-web')
            if (b) sendViber(bookingMessage(demo().content, b))
          }),
          wait(1300),
          tap('p:viber-banner', openViber),
          wait(1200),
        ],
      },
      {
        title: 'Stylist day off',
        caption: 'Ma Hnin Ei takes a day off — online booking follows',
        notes: ['Each stylist has their own schedule.', 'Customers simply cannot pick a day the stylist is away.'],
        view: { admin: 'team', site: 'book', phone: 'browser' },
        script: [
          act(() =>
            demo().update((s) => {
              s.booking = { ...s.booking, category: 'scalp', service: 'analysis', stylist: 'hnin', date: '', time: '', submitted: false }
              s.phone.banner = null
            }),
          ),
          tap(`a:off:hnin:${IN_2}`, () => toggleDayOff('hnin', IN_2)),
          publish('team'),
          wait(500),
          tap(`s:date:${IN_2}`, () => setBookingForm('date', IN_2)),
          wait(800),
        ],
      },
    ],
  },

  {
    id: 'invite',
    title: 'VIP invitation',
    short: 'Invite',
    kind: 'demo',
    view: { admin: 'clients', site: 'home', app: 'site', device: 'phone', phone: 'browser' },
    steps: [
      {
        title: 'Create the VIP',
        caption: 'VIP membership is by invitation — the salon creates the account',
        notes: ['Name, Viber number, username and starting tier.', 'The salon never sets or sees the password.'],
        view: { admin: 'clients' },
        script: [
          tap('a:invite-open', openInvite),
          wait(300),
          field('a:inv-name', 'Ma Su Mon Kyaw', (v) => setInvite('name', v)),
          field('a:inv-phone', '09 765 432 100', (v) => setInvite('phone', v)),
          field('a:inv-user', 'sumon.kyaw', (v) => setInvite('username', v)),
          tap('a:inv-create', () => createInvite(SUMON)),
        ],
      },
      {
        title: 'Invitation on Viber',
        caption: 'One click sends a personal invitation link on Viber',
        notes: ['The link works once and expires after 7 days.', 'It can also be pasted into Messenger.'],
        view: { admin: 'clients' },
        script: [
          tap('a:viber-invite', () => {
            const c = demo().clients.find((x) => x.id === SUMON)
            if (c) sendViber(inviteMessage(c.name), { label: 'Set up your VIP account', url: c.invite ?? '', vip: 'setup' })
          }),
          wait(1300),
          tap('p:viber-banner', openViber),
          wait(1000),
        ],
      },
      {
        title: 'She sets her password',
        caption: 'Su Mon opens the link, chooses her own password — and she is in',
        notes: ['vip.stylistbeautymall.com works like an app on her phone.', 'Her status in the Studio switches from Invited to Active.'],
        view: { admin: 'clients' },
        script: [
          tap('p:viber-link', () => openVipLink('setup')),
          wait(600),
          field('v:pw', 'sumon2025!', (v) => setPassword('password', v)),
          field('v:pw2', 'sumon2025!', (v) => setPassword('password2', v)),
          tap('v:setup-submit', () => activateVip(SUMON)),
          wait(1200),
        ],
      },
    ],
  },

  {
    id: 'wallet',
    title: 'Wallet top-up',
    short: 'Top-up',
    kind: 'demo',
    view: { admin: 'wallet', app: 'vip', vip: 'home', device: 'phone', phone: 'browser' },
    setup: () => addSuMon(),
    steps: [
      {
        title: 'Cash at the counter',
        caption: 'Cash at the counter: one click — credit and bonus appear on her phone',
        notes: ['Top up 500,000 Ks → 535,000 Ks of credit. The bonus is added automatically.', 'Paid credit and bonus credit are tracked separately for refunds.'],
        view: { admin: 'wallet', vip: 'home' },
        script: [
          tap(`a:cash-client:${SUMON}`, () => setCash(SUMON)),
          tap('a:cash-amount:500000', () => setCash(null, 500000)),
          tap('a:cash-submit', () => {
            cashTopup(SUMON, 500000)
            setCash(null, 0)
          }),
          wait(1500),
        ],
      },
      {
        title: 'Transfer + screenshot',
        caption: 'Or she transfers from her phone and uploads the screenshot',
        notes: ['The salon’s KBZPay, AYA Pay and bank accounts are shown in the VIP area.', 'Screenshot and transaction ID go to the Studio for approval.'],
        view: { admin: 'wallet', vip: 'home' },
        script: [
          tap('v:topup', () => goVip('topup')),
          tap('v:amount:300000', () => setTopupForm('amount', 300000)),
          tap('v:upload', () => demo().update((s) => void (s.phone.overlay = 'photos'))),
          wait(500),
          tap('p:photo-receipt', () => {
            setTopupForm('screenshot', true)
            demo().update((s) => void (s.phone.overlay = null))
          }),
          field('v:txid', '0912 3344 5566', (v) => setTopupForm('txId', v)),
          tap('v:topup-submit', () => submitTopup('t-sumon')),
          wait(800),
        ],
      },
      {
        title: 'Approve',
        caption: 'The front desk checks the money arrived — approve — done',
        notes: ['Each transaction ID can only be used once.', 'Every wallet line is permanent and shows who did it.'],
        view: { admin: 'wallet', vip: 'topup' },
        script: [
          point('a:approve'),
          wait(500),
          tap('a:approve', () => approveTopup('t-sumon')),
          act(() => goVip('home')),
          wait(1800),
        ],
      },
    ],
  },

  {
    id: 'cashback',
    title: 'Book & cash back',
    short: 'Cash back',
    kind: 'demo',
    view: { admin: 'bookings', app: 'vip', vip: 'book', device: 'phone', phone: 'browser' },
    setup: () => addSuMon(SUMON_HISTORY, { progress: 160000, spend12m: 210000, visits: 1 }),
    steps: [
      {
        title: 'VIP books in seconds',
        caption: 'Two weeks later: Su Mon books from her VIP area — confirmed instantly',
        notes: ['VIP bookings skip the confirmation step and can be paid from the wallet.', 'Priority times can be reserved for VIPs.'],
        view: { admin: 'bookings', vip: 'book' },
        script: [
          act(() => demo().update((s) => void (s.adminUi.day = IN_3))),
          tap('v:svc:detox', () => toggleVipService('detox')),
          tap('v:svc:analysis', () => toggleVipService('analysis')),
          tap('v:svc:purewash', () => toggleVipService('purewash')),
          tap('v:stylist:hnin', () => setVipBooking('stylist', 'hnin')),
          tap(`v:date:${IN_3}`, () => setVipBooking('date', IN_3)),
          tap('v:time:10:00', () => setVipBooking('time', '10:00')),
          tap('v:book-submit', () => submitVipBooking('b-vip')),
          wait(1200),
        ],
      },
      {
        title: 'Visit & checkout',
        caption: 'On the day: open her booking and check out',
        notes: ['Checkout pre-fills the client and services from the booking.'],
        view: { admin: 'bookings', vip: 'home' },
        script: [
          act(() => demo().update((s) => void (s.adminUi.day = IN_3))),
          tap('a:booking:b-vip', () => selectBooking('b-vip')),
          tap('a:to-checkout', () => {
            const b = demo().bookings.find((x) => x.id === 'b-vip')
            if (b) startCheckout(b)
          }),
          wait(600),
        ],
      },
      {
        title: 'Pay from wallet — cash back',
        caption: 'Paid from her wallet — she crosses 300,000 Ks and gets cash back',
        notes: ['Reward credit is used first; only money she paid counts towards cash back.', 'Silver: 15,000 Ks back every 300,000 Ks. Gold 21,000, Platinum 30,000.'],
        view: { admin: 'checkout', vip: 'home' },
        script: [point('a:co-wallet'), wait(600), tap('a:pay', payCheckout), wait(3200)],
      },
      {
        title: 'Her rewards',
        caption: 'She always sees her progress to the next reward',
        notes: ['Progress bars bring VIPs back sooner.', 'Tiers are reviewed automatically on 12-month spending.'],
        view: { admin: 'checkout', vip: 'home' },
        script: [tap('v:tab:rewards', () => goVip('rewards')), wait(1500)],
      },
    ],
  },

  {
    id: 'rules',
    title: 'Your rules',
    short: 'Rules',
    kind: 'demo',
    view: { admin: 'news', app: 'vip', vip: 'home', device: 'phone', phone: 'browser' },
    setup: () => addSuMon(SUMON_HISTORY, { progress: 160000, spend12m: 210000, visits: 1 }),
    steps: [
      {
        title: 'Members-only news',
        caption: 'Post news only VIPs can see',
        notes: ['Members-only posts never appear on the public website.', 'Great for previews, events and VIP-only offers.'],
        view: { admin: 'news', vip: 'home' },
        script: [
          tap('a:add-news-vip', () => addNews('n-vip', 'vip')),
          wait(300),
          type('news.items.n-vip.title', 'Members’ evening: scalp care & tea'),
          type('news.items.n-vip.text', 'Bring a friend for a free scalp analysis and tea in our VIP room this Saturday from 4 pm. Reply on Viber to reserve.'),
          ...pick('news.items.n-vip.photo', 'vip-lounge'),
          publish('news'),
          wait(800),
        ],
      },
      {
        title: 'Change a reward',
        caption: 'Festival bonus? Change the top-up bonus — VIPs see it at once',
        notes: ['Cash back, tiers, top-up bonuses, birthday gift and refund rate are all settings.', 'Changes apply from the moment you publish.'],
        view: { admin: 'rewards', vip: 'topup' },
        script: [typeMoney('rewards.bonuses.b500.bonus', '50000'), publish('rewards'), wait(800)],
      },
      {
        title: 'Your numbers',
        caption: 'Bookings, top-ups and credit held — at a glance',
        notes: ['Credit in VIP wallets is money already received.', 'Reports grow with phase 2.'],
        view: { admin: 'today', vip: 'home' },
        script: [point('admin.wallet'), wait(1200)],
      },
    ],
  },

  {
    id: 'summary',
    title: 'Summary',
    short: 'Summary',
    kind: 'slides',
    view: {},
    steps: [
      { title: 'What the salon gets', caption: 'Easy to run — and a reason for VIPs to come back', notes: ['Click any card to replay that chapter.'], script: [] },
      { title: 'Next steps', caption: 'From approval to launch in about 10 weeks', notes: ['Timeline counted from the day the salon sends content.'], script: [] },
    ],
  },
]
