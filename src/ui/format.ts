const parse = (iso: string) => new Date(`${iso}T12:00:00`)

/** 350000 → "350,000 Ks" */
export const money = (n: number) => `${Math.round(n).toLocaleString('en-US')} Ks`
export const num = (n: number) => Math.round(n).toLocaleString('en-US')

export const fmtParts = (iso: string) => {
  const d = parse(iso)
  return {
    dow: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    day: d.toLocaleDateString('en-GB', { day: 'numeric' }),
    mon: d.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

export const fmtDate = (iso: string) =>
  iso ? parse(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'

export const fmtLong = (iso: string) =>
  iso ? parse(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'

export const fmtShort = (iso: string) => (iso ? parse(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—')

export const initials = (name: string) =>
  name
    .replace(/^(Daw|Ma|Ko|U)\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
