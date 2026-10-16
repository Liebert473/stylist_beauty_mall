import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { iso, seedBookings, seedClients, seedContent, seedLedger, seedTopups } from './seed'
import { diffPaths, setAt } from './paths'
import type {
  AdminSection,
  Booking,
  BookingForm,
  CheckoutState,
  Client,
  ContentSection,
  Device,
  Focus,
  GuestApp,
  InviteForm,
  LedgerLine,
  PageId,
  PhoneOverlay,
  PhoneScreen,
  SiteContent,
  TopupForm,
  TopupRequest,
  AutoPushKey,
  PhoneNotification,
  PushDraft,
  SentPush,
  ViberMessage,
  VipBookingForm,
  VipNotice,
  VipPage,
} from './types'

export interface Toast {
  id: number
  text: string
}

export interface DemoState {
  /** What the website and VIP area show. */
  content: SiteContent
  /** What the dashboard is editing; becomes `content` on Publish. */
  draft: SiteContent
  /** Regions that just changed glow for a moment (website, VIP area and dashboard). */
  flash: { paths: string[]; nonce: number; at: number }
  uploads: Record<string, string>

  // presentation
  chapter: number
  step: number
  notesOpen: boolean
  autoTour: boolean
  playing: boolean

  // views
  adminSection: AdminSection
  sitePage: PageId
  vipPage: VipPage
  guestApp: GuestApp
  device: Device
  focus: Focus

  phone: {
    screen: PhoneScreen
    overlay: PhoneOverlay
    /** a notification dropping in from the top (Viber message or VIP app push) */
    banner: PhoneNotification | null
    buzz: number
    viber: ViberMessage[]
    /** the VIP club was added to the home screen */
    installed: boolean
    permission: 'default' | 'granted'
    /** the "add to home screen" invitation inside the VIP area */
    installPrompt: boolean
    /** notifications waiting on the lock screen */
    notifications: PhoneNotification[]
    iconPop: number
  }

  push: PushDraft
  sent: SentPush[]
  autoPush: Record<AutoPushKey, boolean>

  vip: {
    /** logged-in client */
    session: string | null
    notices: VipNotice[]
    password: string
    password2: string
    celebrate: number
  }

  // salon data
  bookings: Booking[]
  clients: Client[]
  ledger: LedgerLine[]
  topups: TopupRequest[]

  // forms
  booking: BookingForm
  vipBooking: VipBookingForm
  topup: TopupForm
  checkout: CheckoutState
  invite: InviteForm

  adminUi: {
    expanded: string | null
    pickerOpen: string | null
    day: string
    selectedBooking: string | null
    selectedClient: string | null
    selectedTopup: string | null
    cashAmount: number
    inviteOpen: boolean
  }
  toasts: Toast[]
  cursor: { x: number; y: number; visible: boolean; click: number }
}

export const emptyBooking = (): BookingForm => ({
  category: 'scalp',
  service: '',
  stylist: '',
  date: '',
  time: '',
  name: '',
  phone: '',
  note: '',
  submitted: false,
})

export const initialState = (): Omit<DemoState, 'chapter' | 'step' | 'notesOpen' | 'autoTour'> => ({
  content: seedContent(),
  draft: seedContent(),
  flash: { paths: [], nonce: 0, at: 0 },
  uploads: {},
  playing: false,
  adminSection: 'today',
  sitePage: 'home',
  vipPage: 'home',
  guestApp: 'site',
  device: 'desktop',
  focus: 'split',
  phone: {
    screen: 'browser',
    overlay: null,
    banner: null,
    buzz: 0,
    viber: [],
    installed: false,
    permission: 'default',
    installPrompt: false,
    notifications: [],
    iconPop: 0,
  },
  push: { title: '', body: '', page: 'news', audience: 'all' },
  sent: [
    { id: 'p0', title: 'Your birthday gift is here 🎁', body: '10,000 Ks credit added for your birthday month.', audience: 'Ma Khin Hnin Wai', when: 'Last week', delivered: 1, opened: 1 },
  ],
  autoPush: { booking: true, reminder: true, topup: true, cashback: true, birthday: true },
  vip: { session: null, notices: [], password: '', password2: '', celebrate: 0 },
  bookings: seedBookings(),
  clients: seedClients(),
  ledger: seedLedger(),
  topups: seedTopups(),
  booking: emptyBooking(),
  vipBooking: { services: [], stylist: '', date: '', time: '', payWallet: true, submitted: false },
  topup: { amount: 0, account: 'kbzpay', screenshot: false, txId: '', submitted: false },
  checkout: { client: '', booking: null, services: [], stylist: '', payWallet: true, done: null },
  invite: { name: '', phone: '', username: '', tier: 'silver', created: null },
  adminUi: {
    expanded: null,
    pickerOpen: null,
    day: iso(0),
    selectedBooking: null,
    selectedClient: null,
    selectedTopup: null,
    cashAmount: 0,
    inviteOpen: false,
  },
  toasts: [],
  cursor: { x: 1500, y: 900, visible: false, click: 0 },
})

interface Actions {
  update: (fn: (s: DemoState) => void) => void
  setDraft: (path: string, value: unknown) => void
  editDraft: (fn: (d: SiteContent) => void) => void
  publish: (section: ContentSection, message?: string) => void
  discard: (section: ContentSection) => void
  /** make regions glow, e.g. ['vip.balance'] */
  glow: (paths: string[]) => void
  toast: (text: string) => void
  resetData: () => void
}

let toastId = 1

export const useDemo = create<DemoState & Actions>()(
  immer((set, get) => ({
    ...initialState(),
    chapter: 0,
    step: 0,
    notesOpen: false,
    autoTour: false,

    update: (fn) => set(fn),

    setDraft: (path, value) =>
      set((s) => {
        setAt(s.draft, path, value)
      }),

    editDraft: (fn) =>
      set((s) => {
        fn(s.draft)
      }),

    publish: (section, message) => {
      const { content, draft } = get()
      const paths = diffPaths(content[section], draft[section], section)
      set((s) => {
        // immutable snapshots, so draft and content can share the same object
        ;(s.content as Record<string, unknown>)[section] = draft[section]
        s.flash = { paths, nonce: s.flash.nonce + 1, at: Date.now() }
      })
      get().toast(message ?? 'Published — live now')
    },

    discard: (section) =>
      set((s) => {
        ;(s.draft as Record<string, unknown>)[section] = get().content[section]
      }),

    glow: (paths) =>
      set((s) => {
        s.flash = { paths, nonce: s.flash.nonce + 1, at: Date.now() }
      }),

    toast: (text) => {
      const id = toastId++
      set((s) => {
        s.toasts.push({ id, text })
      })
      setTimeout(
        () =>
          set((s) => {
            s.toasts = s.toasts.filter((t) => t.id !== id)
          }),
        3200,
      )
    },

    resetData: () =>
      set((s) => {
        // keep presenter preferences and real uploads across resets
        Object.assign(s, initialState(), { uploads: s.uploads, focus: s.focus })
      }),
  })),
)

export const demo = () => useDemo.getState()
export const isDirty = (s: DemoState, section: ContentSection) =>
  JSON.stringify(s.draft[section]) !== JSON.stringify(s.content[section])
