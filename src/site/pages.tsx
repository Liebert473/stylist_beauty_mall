import { useShallow } from 'zustand/react/shallow'
import type { ReactNode } from 'react'
import { ArrowRight, Clock, Droplets, MapPin, MessageCircle, Microscope, Phone, Sparkles } from 'lucide-react'
import { useDemo } from '../store/store'
import { Photo } from '../ui/Photo'
import { Monogram } from '../ui/Logo'
import { fmtLong, money } from '../ui/format'
import { setBookingForm } from '../store/ops'
import { Field } from './Field'
import { go } from './Site'

// ——— building blocks ———

export const Kicker = ({ children, light, center }: { children: ReactNode; light?: boolean; center?: boolean }) => (
  <div className={`mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.3em] uppercase @3xl:text-[13px] ${center ? 'justify-center' : ''} ${light ? 'text-gold' : 'text-gold-deep'}`}>
    <span className={`h-px w-6 ${light ? 'bg-gold' : 'bg-gold-deep'}`} />
    {children}
    {center && <span className={`h-px w-6 ${light ? 'bg-gold' : 'bg-gold-deep'}`} />}
  </div>
)

export const H2 = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2 className={`font-display text-[28px] leading-tight text-cocoa-dark @3xl:text-[44px] ${className}`}>{children}</h2>
)

function PageHero({ photo, kicker, title, f, position }: { photo: string; kicker: string; title: string; f?: string; position?: string }) {
  return (
    <section className="relative h-[220px] @3xl:h-[400px]">
      <Photo photo={photo} position={position} className="absolute! inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-cocoa-deep/85 via-cocoa-deep/30 to-transparent" />
      <div className="absolute bottom-6 left-5 @3xl:bottom-12 @3xl:left-16">
        <Kicker light>{kicker}</Kicker>
        <Field f={f ?? 'x'} as="h1" className="font-display text-[34px] leading-none text-white @3xl:text-[64px]">
          {title}
        </Field>
      </div>
    </section>
  )
}

const BookButton = ({ label = 'Book now', service, demo }: { label?: string; service?: { category: string; id: string }; demo?: string }) => (
  <button
    data-demo={demo}
    onClick={() => {
      if (service) {
        setBookingForm('category', service.category)
        setBookingForm('service', service.id)
      }
      go('book')
    }}
    className="inline-flex items-center gap-2 rounded-full bg-cocoa px-6 py-3 text-[13px] font-semibold tracking-[0.12em] text-gold uppercase @3xl:text-[14px]"
  >
    {label} <ArrowRight size={16} />
  </button>
)

// ——— home ———

export function HomePage() {
  const h = useDemo((s) => s.content.home)
  const sig = useDemo((s) => s.content.signature)
  const cats = useDemo((s) => s.content.services.categories)
  const team = useDemo((s) => s.content.team.stylists)
  const news = useDemo(useShallow((s) => s.content.news.items.filter((n) => n.audience === 'public')))
  return (
    <>
      <section className="relative h-[520px] @3xl:h-[700px]">
        <Field f="home.heroPhoto" className="absolute! inset-0">
          <Photo photo={h.heroPhoto} className="h-full w-full" />
        </Field>
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa-deep/90 via-cocoa-deep/55 to-transparent" />
        <div className="absolute inset-x-6 bottom-12 @3xl:top-1/2 @3xl:bottom-auto @3xl:left-20 @3xl:w-[640px] @3xl:-translate-y-1/2">
          <Field f="home.kicker">
            <Kicker light>{h.kicker}</Kicker>
          </Field>
          <Field f="home.title" as="h1" className="font-display text-[40px] leading-[1.05] text-white @3xl:text-[72px]">
            {h.title}
          </Field>
          <Field f="home.subtitle" as="p" className="mt-4 text-[15px] leading-relaxed text-white/80 @3xl:mt-6 @3xl:text-[19px]">
            {h.subtitle}
          </Field>
          <div className="mt-6 flex flex-wrap gap-3 @3xl:mt-9">
            <button onClick={() => go('book')} className="rounded-full bg-gold px-6 py-3 text-[13px] font-semibold tracking-[0.12em] text-cocoa-dark uppercase @3xl:text-[14px]">
              Book online
            </button>
            <button onClick={() => go('scalp')} className="rounded-full border border-white/50 px-6 py-3 text-[13px] font-semibold tracking-[0.12em] text-white uppercase @3xl:text-[14px]">
              Scalp analysis
            </button>
          </div>
        </div>
      </section>

      {/* signature */}
      <section className="px-5 py-12 @3xl:px-16 @3xl:py-20">
        <div className="text-center">
          <Kicker center>What makes us different</Kicker>
          <H2>Our signature care</H2>
        </div>
        <div className="mt-8 grid gap-5 @3xl:mt-12 @3xl:grid-cols-2 @3xl:gap-8">
          {[
            { id: 'scalp' as const, icon: Microscope, d: sig.scalp, f: 'signature.scalp' },
            { id: 'water' as const, icon: Droplets, d: sig.water, f: 'signature.water' },
          ].map((x) => (
            <Field key={x.id} f={x.f} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <button onClick={() => go(x.id)} className="block w-full text-left">
                <Photo photo={x.d.photo} className="aspect-[16/10]" />
                <div className="p-5 @3xl:p-8">
                  <div className="flex items-center gap-2 text-gold-deep">
                    <x.icon size={20} />
                    <span className="font-display text-[22px] text-cocoa-dark @3xl:text-[28px]">{x.d.title}</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-ink/70 @3xl:text-[16px]">{x.d.intro}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.12em] text-cocoa uppercase">
                    Learn more <ArrowRight size={15} />
                  </div>
                </div>
              </button>
            </Field>
          ))}
        </div>
      </section>

      {/* services */}
      <section className="bg-sand px-5 py-12 @3xl:px-16 @3xl:py-20">
        <Kicker>Services</Kicker>
        <H2>Hair, scalp, nails &amp; feet</H2>
        <div className="mt-8 grid grid-cols-2 gap-3 @3xl:grid-cols-4 @3xl:gap-6">
          {cats.map((c) => (
            <button key={c.id} onClick={() => go('services')} className="group relative aspect-[3/4] overflow-hidden rounded-2xl text-left">
              <Photo photo={c.photo} className="absolute! inset-0 transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa-deep/85 to-transparent" />
              <div className="absolute inset-x-4 bottom-4">
                <div className="font-display text-[22px] text-white @3xl:text-[28px]">{c.name}</div>
                <div className="text-[12px] text-white/70 @3xl:text-[14px]">from {money(Math.min(...c.items.map((i) => i.price)))}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* team */}
      <section className="px-5 py-12 @3xl:px-16 @3xl:py-20">
        <Kicker>Our team</Kicker>
        <H2>Book the stylist you trust</H2>
        <div className="mt-8 grid grid-cols-2 gap-4 @3xl:grid-cols-4 @3xl:gap-6">
          {team.map((t) => (
            <button key={t.id} onClick={() => go('team')} className="text-left">
              <Photo photo={t.photo} className="aspect-[4/5] rounded-2xl" position="center 20%" />
              <div className="mt-3 font-display text-[18px] text-cocoa-dark @3xl:text-[22px]">{t.name}</div>
              <div className="text-[12.5px] text-ink/60 @3xl:text-[14px]">{t.role}</div>
            </button>
          ))}
        </div>
      </section>

      {news.length > 0 && (
        <section className="bg-cocoa px-5 py-12 text-white @3xl:px-16 @3xl:py-16">
          <Kicker light>Latest news</Kicker>
          <Field f={`news.items.${news[0].id}`} className="grid items-center gap-6 @3xl:grid-cols-[1fr_1.2fr] @3xl:gap-12">
            <Photo photo={news[0].photo} className="aspect-[16/10] rounded-2xl" />
            <div>
              <div className="text-[13px] text-gold/80">{fmtLong(news[0].date)}</div>
              <div className="mt-2 font-display text-[26px] leading-tight text-gold @3xl:text-[40px]">{news[0].title}</div>
              <p className="mt-3 text-[15px] leading-relaxed text-white/75 @3xl:text-[18px]">{news[0].text}</p>
              <button onClick={() => go('news')} className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.12em] text-gold uppercase">
                All news <ArrowRight size={15} />
              </button>
            </div>
          </Field>
        </section>
      )}
    </>
  )
}

// ——— services ———

export function ServicesPage() {
  const sv = useDemo((s) => s.content.services)
  return (
    <>
      <PageHero photo="hero-hair" kicker="Menu & prices" title="Services" />
      <section className="px-5 py-10 @3xl:px-16 @3xl:py-16">
        <Field f="services.intro" as="p" className="max-w-3xl text-[15px] leading-relaxed text-ink/70 @3xl:text-[18px]">
          {sv.intro}
        </Field>
        <div className="mt-8 space-y-10 @3xl:mt-12 @3xl:space-y-14">
          {sv.categories.map((c) => (
            <Field key={c.id} f={`services.categories.${c.id}`} className="@3xl:grid @3xl:grid-cols-[320px_1fr] @3xl:gap-12">
              <div>
                <Photo photo={c.photo} className="hidden aspect-[4/5] rounded-2xl @3xl:block" />
                <h3 className="font-display text-[28px] text-cocoa-dark @3xl:mt-5 @3xl:text-[36px]">{c.name}</h3>
                <p className="text-[14px] text-ink/60 @3xl:text-[16px]">{c.intro}</p>
              </div>
              <div className="mt-4 divide-y divide-cocoa/10 @3xl:mt-0">
                {c.items.map((i) => (
                  <Field key={i.id} f={`services.categories.${c.id}.items.${i.id}`} className="flex items-start gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[16px] font-semibold text-cocoa-dark @3xl:text-[19px]">{i.name || 'New service'}</span>
                        {i.tag && <span className="rounded-full bg-gold/50 px-2 py-0.5 text-[10.5px] font-semibold tracking-wider text-cocoa-dark uppercase">{i.tag}</span>}
                      </div>
                      <div className="mt-0.5 text-[13px] leading-snug text-ink/60 @3xl:text-[15px]">{i.desc}</div>
                      <div className="mt-1 flex items-center gap-1 text-[12px] text-ink/45 @3xl:text-[13px]">
                        <Clock size={12} /> {i.minutes} min {!i.online && '· booked after a consultation'}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Field f={`services.categories.${c.id}.items.${i.id}.price`} className="text-[15px] font-semibold whitespace-nowrap text-cocoa @3xl:text-[18px]">
                        {i.from && <span className="mr-1 text-[11px] font-normal text-ink/50">from</span>}
                        {money(i.price)}
                      </Field>
                      {i.online && (
                        <button
                          onClick={() => {
                            setBookingForm('category', c.id)
                            setBookingForm('service', i.id)
                            go('book')
                          }}
                          className="mt-1.5 text-[12px] font-semibold tracking-wider text-gold-deep uppercase"
                        >
                          Book →
                        </button>
                      )}
                    </div>
                  </Field>
                ))}
              </div>
            </Field>
          ))}
        </div>
      </section>
    </>
  )
}

// ——— signature pages ———

export function ScalpPage() {
  const d = useDemo((s) => s.content.signature.scalp)
  const price = useDemo((s) => s.content.services.categories.find((c) => c.id === 'scalp')?.items.find((i) => i.id === 'analysis')?.price ?? 0)
  return (
    <>
      <PageHero photo={d.photo} kicker="Our signature" title={d.title} f="signature.scalp.title" />
      <section className="px-5 py-10 @3xl:px-16 @3xl:py-16">
        <div className="grid gap-8 @3xl:grid-cols-[1.2fr_1fr] @3xl:gap-14">
          <div>
            <Field f="signature.scalp.intro" as="p" className="font-serif text-[21px] leading-snug text-cocoa-dark @3xl:text-[30px]">
              {d.intro}
            </Field>
            <div className="mt-8 grid gap-4 @3xl:grid-cols-2">
              {d.steps.map((st, i) => (
                <Field key={st.id} f={`signature.scalp.steps.${st.id}`} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="font-display text-[30px] leading-none text-gold-deep">0{i + 1}</div>
                  <div className="mt-2 text-[17px] font-semibold text-cocoa-dark">{st.title}</div>
                  <div className="mt-1 text-[14px] leading-relaxed text-ink/65">{st.text}</div>
                </Field>
              ))}
            </div>
          </div>
          <div>
            <div className="relative">
              <Field f="signature.scalp.photo2">
                <Photo photo={d.photo2} className="aspect-square rounded-full ring-8 ring-white" />
              </Field>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-cocoa px-4 py-1.5 text-[12px] tracking-[0.15em] whitespace-nowrap text-gold uppercase">
                200× scalp view
              </div>
            </div>
            <div className="mt-10 rounded-2xl bg-sand p-6 text-center">
              <div className="text-[13px] tracking-[0.2em] text-ink/50 uppercase">Hair &amp; scalp analysis</div>
              <div className="mt-1 font-display text-[32px] text-cocoa-dark">{money(price)}</div>
              <div className="mt-1 text-[13px] text-ink/55">45 minutes · with Ma Hnin Ei</div>
              <div className="mt-4">
                <BookButton label="Book an analysis" service={{ category: 'scalp', id: 'analysis' }} demo="s:book-analysis" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export function WaterPage() {
  const d = useDemo((s) => s.content.signature.water)
  return (
    <>
      <PageHero photo={d.photo2} kicker="Our signature" title={d.title} f="signature.water.title" />
      <section className="px-5 py-10 @3xl:px-16 @3xl:py-16">
        <div className="grid gap-8 @3xl:grid-cols-2 @3xl:gap-14">
          <div>
            <Field f="signature.water.intro" as="p" className="font-serif text-[21px] leading-snug text-cocoa-dark @3xl:text-[30px]">
              {d.intro}
            </Field>
            <div className="mt-8 space-y-4">
              {d.points.map((p) => (
                <Field key={p.id} f={`signature.water.points.${p.id}`} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-cocoa">
                    <Droplets size={20} />
                  </span>
                  <div>
                    <div className="text-[17px] font-semibold text-cocoa-dark">{p.title}</div>
                    <div className="text-[14px] leading-relaxed text-ink/65">{p.text}</div>
                  </div>
                </Field>
              ))}
            </div>
          </div>
          <Field f="signature.water.photo">
            <Photo photo={d.photo} className="aspect-[4/5] rounded-2xl" />
          </Field>
        </div>
      </section>
    </>
  )
}

// ——— team, gallery, news, contact ———

export function TeamPage() {
  const t = useDemo((s) => s.content.team)
  return (
    <>
      <PageHero photo="reception" kicker="Meet the team" title="Our stylists" />
      <section className="px-5 py-10 @3xl:px-16 @3xl:py-16">
        <Field f="team.intro" as="p" className="text-[15px] text-ink/70 @3xl:text-[18px]">
          {t.intro}
        </Field>
        <div className="mt-8 grid grid-cols-2 gap-4 @3xl:grid-cols-4 @3xl:gap-8">
          {t.stylists.map((st) => (
            <Field key={st.id} f={`team.stylists.${st.id}`}>
              <Photo photo={st.photo} className="aspect-[4/5] rounded-2xl" position="center 20%" />
              <div className="mt-3 font-display text-[19px] text-cocoa-dark @3xl:text-[24px]">{st.name}</div>
              <div className="text-[12px] font-semibold tracking-wider text-gold-deep uppercase">{st.role}</div>
              <p className="mt-1 text-[13px] leading-snug text-ink/60 @3xl:text-[15px]">{st.bio}</p>
            </Field>
          ))}
        </div>
      </section>
    </>
  )
}

export function GalleryPage() {
  const photos = useDemo((s) => s.content.gallery.photos)
  return (
    <>
      <PageHero photo="hair-color" kicker="Our work" title="Gallery" />
      <section className="grid grid-cols-2 gap-2 p-2 @3xl:grid-cols-3 @3xl:gap-4 @3xl:p-12">
        {photos.map((p) => (
          <Field key={p.id} f={`gallery.photos.${p.id}`} className="group relative overflow-hidden rounded-xl">
            <Photo photo={p.photo} className="aspect-square" />
            {p.caption && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pt-8 pb-2 text-[12px] text-white @3xl:text-[14px]">{p.caption}</div>}
          </Field>
        ))}
      </section>
    </>
  )
}

export function NewsPage() {
  const items = useDemo(useShallow((s) => s.content.news.items.filter((n) => n.audience === 'public')))
  return (
    <>
      <PageHero photo="promo-festival" kicker="News & promotions" title="What’s new" />
      <section className="space-y-6 px-5 py-10 @3xl:px-16 @3xl:py-16">
        {items.map((n) => (
          <Field key={n.id} f={`news.items.${n.id}`} className="grid gap-4 overflow-hidden rounded-2xl bg-white shadow-sm @3xl:grid-cols-[360px_1fr]">
            <Photo photo={n.photo} className="aspect-[16/10] @3xl:aspect-auto @3xl:h-full" />
            <div className="p-5 @3xl:p-8">
              <div className="text-[12.5px] text-gold-deep">{fmtLong(n.date)}</div>
              <div className="mt-1 font-display text-[24px] leading-tight text-cocoa-dark @3xl:text-[32px]">{n.title || 'Untitled'}</div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink/70 @3xl:text-[17px]">{n.text}</p>
            </div>
          </Field>
        ))}
      </section>
    </>
  )
}

export function ContactPage() {
  const c = useDemo((s) => s.content.contact)
  return (
    <>
      <PageHero photo="reception" kicker="Visit us" title="Contact" />
      <section className="grid gap-8 px-5 py-10 @3xl:grid-cols-2 @3xl:px-16 @3xl:py-16">
        <div className="space-y-4 text-[16px]">
          {[
            { icon: MapPin, t: c.address },
            { icon: Clock, t: c.hours },
            { icon: Phone, t: c.phone },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-cocoa">
                <x.icon size={18} />
              </span>
              {x.t}
            </div>
          ))}
          <div className="flex flex-wrap gap-3 pt-3">
            <span className="flex items-center gap-2 rounded-full bg-viber px-5 py-2.5 text-[14px] font-semibold text-white">
              <MessageCircle size={17} /> Chat on Viber
            </span>
            <span className="flex items-center gap-2 rounded-full bg-[#0866ff] px-5 py-2.5 text-[14px] font-semibold text-white">
              <MessageCircle size={17} /> Messenger
            </span>
          </div>
        </div>
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#ede3d4_25%,#e6d9c6_25%,#e6d9c6_50%,#ede3d4_50%,#ede3d4_75%,#e6d9c6_75%)] bg-[length:40px_40px]">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cocoa shadow-lg">
              <Monogram className="h-9 w-9" />
            </div>
            <div className="mt-2 rounded-full bg-white px-3 py-1 text-[12px] font-semibold shadow">Stylist Beauty Mall</div>
          </div>
          <Sparkles className="absolute top-4 right-4 text-gold-deep" size={18} />
        </div>
      </section>
    </>
  )
}
