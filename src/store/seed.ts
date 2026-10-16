import type { Booking, Client, LedgerLine, SiteContent, TopupRequest } from './types'

/** ISO date `days` from today (local time). */
export const iso = (days = 0) => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Sample content for the demo: names, prices and contact details are placeholders until the salon sends theirs.
export const seedContent = (): SiteContent => ({
  home: {
    announcementOn: false,
    announcement: 'Festival Glow Week — 15% off hair spa treatments until the end of the month',
    kicker: 'Hair · Scalp · Nails · Feet',
    title: 'Beauty that starts at the roots',
    subtitle: 'Yangon’s salon for healthy hair — with professional scalp analysis and pure, filtered water in every wash.',
    heroPhoto: 'hero-salon',
  },
  services: {
    intro: 'Every service is booked online in a minute. Prices in Kyats; colour and long-hair services start from the price shown.',
    categories: [
      {
        id: 'hair',
        name: 'Hair',
        intro: 'Cuts, colour and treatments by senior stylists.',
        photo: 'hair-cut',
        items: [
          { id: 'cut', name: 'Haircut & blow-dry', desc: 'Consultation, wash with pure water, precision cut and finish.', price: 25000, minutes: 45, online: true },
          { id: 'color', name: 'Colour & balayage', desc: 'Soft, natural colour with bond protection.', price: 120000, from: true, minutes: 150, online: true },
          { id: 'keratin', name: 'Keratin smoothing', desc: 'Frizz-free, glossy hair for up to 4 months.', price: 180000, from: true, minutes: 180, online: true },
          { id: 'spa', name: 'Hair spa treatment', desc: 'Deep-conditioning mask with a relaxing head massage.', price: 60000, minutes: 60, online: true },
          { id: 'bridal', name: 'Bridal & event hair', desc: 'Trial and styling for your special day.', price: 150000, minutes: 90, online: false },
        ],
      },
      {
        id: 'scalp',
        name: 'Scalp care',
        intro: 'Our signature: see your scalp, then treat what it needs.',
        photo: 'scalp-analysis',
        items: [
          { id: 'analysis', name: 'Hair & scalp analysis', desc: 'Digital microscope check of scalp and roots, with a written care plan.', price: 35000, minutes: 45, online: true, tag: 'Signature' },
          { id: 'detox', name: 'Scalp detox treatment', desc: 'Exfoliating cleanse and serum for an oily or flaky scalp.', price: 90000, minutes: 75, online: true },
          { id: 'purewash', name: 'Pure water wash & blow-dry', desc: 'Wash with our filtered water system — no chlorine, no hard minerals.', price: 30000, minutes: 45, online: true, tag: 'Signature' },
        ],
      },
      {
        id: 'nails',
        name: 'Nails',
        intro: 'Clean, long-lasting manicures and fine nail art.',
        photo: 'nails',
        items: [
          { id: 'mani', name: 'Classic manicure', desc: 'Shape, cuticle care and polish.', price: 18000, minutes: 40, online: true },
          { id: 'gel', name: 'Gel manicure', desc: 'Glossy gel colour that lasts three weeks.', price: 30000, minutes: 60, online: true },
          { id: 'art', name: 'Nail art', desc: 'Hand-painted designs, chrome and gold details.', price: 45000, from: true, minutes: 90, online: true },
        ],
      },
      {
        id: 'feet',
        name: 'Feet',
        intro: 'Spa pedicures and foot care to slow down.',
        photo: 'pedicure',
        items: [
          { id: 'pedi', name: 'Spa pedicure', desc: 'Warm soak, scrub, nail care and massage.', price: 40000, minutes: 60, online: true },
          { id: 'gelpedi', name: 'Gel pedicure', desc: 'Spa pedicure finished with gel colour.', price: 45000, minutes: 75, online: true },
          { id: 'footmassage', name: 'Foot massage', desc: '45 minutes of reflexology with warm oil.', price: 30000, minutes: 45, online: true },
        ],
      },
    ],
  },
  signature: {
    scalp: {
      title: 'Hair & scalp analysis',
      intro: 'Healthy hair grows from a healthy scalp. Our therapist looks at your scalp under a digital microscope, shows you what she sees on screen and builds a care plan with you.',
      photo: 'scalp-analysis',
      photo2: 'scalp-closeup',
      steps: [
        { id: 's1', title: 'Talk', text: 'Your hair history, routine and what you want to change.' },
        { id: 's2', title: 'See', text: 'A 200× digital microscope shows your scalp, roots and follicles on screen.' },
        { id: 's3', title: 'Plan', text: 'A written care plan with treatments and home care that fit your scalp.' },
        { id: 's4', title: 'Track', text: 'We compare photos at every visit so you can see the progress.' },
      ],
    },
    water: {
      title: 'Pure water system',
      intro: 'Tap water carries chlorine and hard minerals that dull colour and dry the scalp. Every wash at Stylist Beauty Mall uses water from our multi-stage purification system.',
      photo: 'water-system',
      photo2: 'pure-water',
      points: [
        { id: 'w1', title: 'No chlorine', text: 'Activated carbon removes chlorine that fades colour.' },
        { id: 'w2', title: 'Soft on the scalp', text: 'Hard minerals are filtered out, so hair stays soft and the scalp calm.' },
        { id: 'w3', title: 'Colour lasts longer', text: 'Clean water keeps colour bright and treatments effective.' },
      ],
    },
  },
  team: {
    intro: 'Choose your stylist when you book — or let us pick whoever is free.',
    stylists: [
      { id: 'thandar', name: 'Ma Thandar', role: 'Senior stylist', bio: '12 years of cutting and bridal styling.', photo: 'stylist-thandar', skills: ['hair', 'scalp'], off: [] },
      { id: 'zaw', name: 'Ko Zaw Min', role: 'Colour specialist', bio: 'Balayage, colour correction and keratin.', photo: 'stylist-zaw', skills: ['hair'], off: [] },
      { id: 'hnin', name: 'Ma Hnin Ei', role: 'Scalp & hair therapist', bio: 'Certified trichology therapist, runs every scalp analysis.', photo: 'stylist-hnin', skills: ['scalp', 'hair'], off: [] },
      { id: 'ei', name: 'Ma Ei Ei', role: 'Nail & foot artist', bio: 'Gel, nail art and spa pedicures.', photo: 'stylist-ei', skills: ['nails', 'feet'], off: [] },
    ],
  },
  gallery: {
    photos: [
      { id: 'g1', photo: 'hair-color', caption: 'Caramel balayage' },
      { id: 'g2', photo: 'bridal', caption: 'Bridal chignon' },
      { id: 'g3', photo: 'nails', caption: 'Chocolate & gold gel' },
      { id: 'g4', photo: 'hero-hair', caption: 'Blow-dry finish' },
      { id: 'g5', photo: 'pedicure', caption: 'Spa pedicure' },
      { id: 'g6', photo: 'nail-art', caption: 'Hand-painted line art' },
    ],
  },
  news: {
    items: [
      {
        id: 'n1',
        date: iso(-6),
        title: 'New: gel pedicure with spa soak',
        text: 'Our spa pedicure now comes with long-lasting gel colour. Book it online.',
        photo: 'pedicure',
        audience: 'public',
      },
      {
        id: 'n2',
        date: iso(-12),
        title: 'VIP evening: keratin scalp ritual preview',
        text: 'Members are invited to try our new keratin scalp ritual before it launches. Limited to 12 guests.',
        photo: 'vip-lounge',
        audience: 'vip',
      },
    ],
  },
  rewards: {
    step: 300000,
    tiers: [
      { id: 'silver', name: 'Silver', min: 0, cashback: 15000, perk: 'Members-only offers' },
      { id: 'gold', name: 'Gold', min: 1500000, cashback: 21000, perk: 'VIP-only time slots' },
      { id: 'platinum', name: 'Platinum', min: 4000000, cashback: 30000, perk: 'Free scalp analysis every quarter' },
    ],
    bonuses: [
      { id: 'b300', amount: 300000, bonus: 15000 },
      { id: 'b500', amount: 500000, bonus: 35000 },
      { id: 'b1m', amount: 1000000, bonus: 100000 },
    ],
    birthday: 10000,
    refundRate: 80,
    accounts: [
      { id: 'kbzpay', name: 'KBZPay', holder: 'Stylist Beauty Mall', number: '09 000 000 000' },
      { id: 'ayapay', name: 'AYA Pay', holder: 'Stylist Beauty Mall', number: '09 000 000 001' },
      { id: 'bank', name: 'Bank transfer', holder: 'Stylist Beauty Mall Co., Ltd.', number: '0000 1234 5678 9012' },
    ],
  },
  contact: {
    address: 'Yangon, Myanmar',
    phone: '+95 9 000 000 000',
    viber: '+95 9 000 000 000',
    hours: 'Open daily 9:30 – 19:00',
  },
})

export const seedClients = (): Client[] => [
  { id: 'c-thiri', name: 'Daw Thiri Aung', phone: '+95 9 420 118 220', username: 'thiri.aung', status: 'active', tier: 'platinum', since: '2022', spend12m: 4620000, progress: 120000, visits: 38, app: true, push: true },
  { id: 'c-khin', name: 'Ma Khin Hnin Wai', phone: '+95 9 777 301 554', username: 'khinhninwai', status: 'active', tier: 'gold', since: '2023', spend12m: 1980000, progress: 245000, visits: 21, app: true, push: true },
  { id: 'c-nwe', name: 'Daw Nwe Nwe San', phone: '+95 9 250 664 019', username: 'nwenwe', status: 'active', tier: 'gold', since: '2023', spend12m: 1640000, progress: 60000, visits: 17, app: true },
  { id: 'c-phyu', name: 'Ma Phyu Phyu Thant', phone: '+95 9 450 112 233', username: 'phyuphyu', status: 'active', tier: 'silver', since: '2024', spend12m: 720000, progress: 190000, visits: 9 },
]

const line = (id: string, client: string, when: string, kind: LedgerLine['kind'], bucket: LedgerLine['bucket'], amount: number, note: string, by = 'Front desk'): LedgerLine => ({
  id,
  client,
  when,
  kind,
  bucket,
  amount,
  note,
  by,
})

export const seedLedger = (): LedgerLine[] => [
  line('l1', 'c-thiri', iso(-40), 'topup', 'paid', 1000000, 'Cash at counter'),
  line('l2', 'c-thiri', iso(-40), 'bonus', 'reward', 100000, 'Top-up bonus 1,000,000'),
  line('l3', 'c-thiri', iso(-18), 'payment', 'paid', -210000, 'Colour & balayage, hair spa'),
  line('l4', 'c-thiri', iso(-18), 'cashback', 'reward', 30000, 'Platinum cash back'),
  line('l5', 'c-khin', iso(-30), 'topup', 'paid', 500000, 'KBZPay transfer'),
  line('l6', 'c-khin', iso(-30), 'bonus', 'reward', 35000, 'Top-up bonus 500,000'),
  line('l7', 'c-khin', iso(-9), 'payment', 'reward', -35000, 'Gel manicure, spa pedicure'),
  line('l8', 'c-khin', iso(-9), 'payment', 'paid', -35000, 'Gel manicure, spa pedicure'),
  line('l9', 'c-nwe', iso(-21), 'topup', 'paid', 300000, 'Cash at counter'),
  line('l10', 'c-nwe', iso(-21), 'bonus', 'reward', 15000, 'Top-up bonus 300,000'),
  line('l11', 'c-phyu', iso(-15), 'topup', 'paid', 300000, 'AYA Pay transfer'),
  line('l12', 'c-phyu', iso(-15), 'bonus', 'reward', 15000, 'Top-up bonus 300,000'),
  line('l13', 'c-phyu', iso(-4), 'payment', 'reward', -15000, 'Scalp detox treatment'),
  line('l14', 'c-phyu', iso(-4), 'payment', 'paid', -75000, 'Scalp detox treatment'),
]

const bk = (b: Partial<Booking> & Pick<Booking, 'id' | 'name' | 'services' | 'stylist' | 'time' | 'minutes'>): Booking => ({
  phone: '+95 9 ··· ··· ···',
  date: iso(0),
  status: 'confirmed',
  source: 'website',
  ...b,
})

export const seedBookings = (): Booking[] => [
  bk({ id: 'b1', name: 'Daw Thiri Aung', services: ['color'], stylist: 'zaw', time: '10:00', minutes: 150, status: 'done', source: 'vip', vip: 'c-thiri' }),
  bk({ id: 'b2', name: 'Ma Yamin', services: ['cut'], stylist: 'thandar', time: '10:30', minutes: 45, status: 'done' }),
  bk({ id: 'b3', name: 'Ma Khin Hnin Wai', services: ['gel', 'pedi'], stylist: 'ei', time: '11:00', minutes: 120, status: 'arrived', source: 'vip', vip: 'c-khin' }),
  bk({ id: 'b4', name: 'Ko Htet Aung', services: ['cut'], stylist: 'thandar', time: '13:00', minutes: 45, source: 'walk-in' }),
  bk({ id: 'b5', name: 'Ma Su Wai', services: ['analysis'], stylist: 'hnin', time: '13:30', minutes: 45, source: 'phone' }),
  bk({ id: 'b6', name: 'Ma Ei Mon', services: ['spa'], stylist: 'hnin', time: '15:00', minutes: 60 }),
  bk({ id: 'b7', name: 'Daw Nwe Nwe San', services: ['keratin'], stylist: 'zaw', time: '14:00', minutes: 180, source: 'vip', vip: 'c-nwe' }),
  bk({ id: 'b8', name: 'Ma Hla Hla', services: ['art'], stylist: 'ei', time: '15:30', minutes: 90 }),
  bk({ id: 'b9', name: 'Ma Zin Mar', services: ['pedi'], stylist: 'ei', date: iso(1), time: '10:00', minutes: 60 }),
  bk({ id: 'b10', name: 'Ma Phyu Phyu Thant', services: ['detox'], stylist: 'hnin', date: iso(2), time: '11:00', minutes: 75, source: 'vip', vip: 'c-phyu' }),
  bk({ id: 'b11', name: 'Ma Thuzar', services: ['color'], stylist: 'zaw', date: iso(2), time: '13:00', minutes: 150 }),
  bk({ id: 'b12', name: 'Ma Nandar', services: ['cut'], stylist: 'thandar', date: iso(2), time: '10:00', minutes: 45, status: 'pending' }),
]

export const seedTopups = (): TopupRequest[] => [
  { id: 't0', client: 'c-khin', amount: 500000, account: 'kbzpay', txId: '0123 4567 8901', when: iso(-30), status: 'approved' },
]
