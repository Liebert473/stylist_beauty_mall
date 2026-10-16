import { useRef } from 'react'
import { CalendarOff, Crown, Globe, Plus, Upload } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import { iso } from '../store/seed'
import { addNews, addService, toggleDayOff, uploadFiles } from '../store/ops'
import { Photo } from '../ui/Photo'
import { fmtParts, fmtShort, money } from '../ui/format'
import { AddButton, Card, DraftToggle, Grid2, Item, Label, MoneyField, PhotoField, TextField, Toggle, useDraft } from './ui'

export function HomeEditor() {
  return (
    <>
      <Card title="Hero">
        <TextField path="home.kicker" label="Small line above the headline" />
        <TextField path="home.title" label="Headline" />
        <TextField path="home.subtitle" label="Intro" multiline rows={2} />
        <PhotoField path="home.heroPhoto" label="Hero photo" wide />
      </Card>
      <Card title="Announcement bar">
        <DraftToggle path="home.announcementOn" label="Show the announcement at the top of every page" />
        <TextField path="home.announcement" label="Text" />
      </Card>
    </>
  )
}

export function ServicesEditor() {
  const cats = useDemo((s) => s.draft.services.categories)
  return (
    <>
      <Card title="Intro">
        <TextField path="services.intro" multiline rows={2} />
      </Card>
      {cats.map((c) => (
        <Card key={c.id} title={c.name} actions={<AddButton demoId={`a:add-service:${c.id}`} onClick={() => addService(c.id)}><Plus size={15} /> Add service</AddButton>}>
          <div className="space-y-2">
            {c.items.map((i) => (
              <Item
                key={i.id}
                id={i.id}
                title={i.name}
                meta={`${money(i.price)} · ${i.minutes} min${i.online ? '' : ' · not bookable online'}`}
                onDelete={() => demo().editDraft((d) => void (d.services.categories.find((x) => x.id === c.id)!.items = d.services.categories.find((x) => x.id === c.id)!.items.filter((x) => x.id !== i.id)))}
              >
                <TextField path={`services.categories.${c.id}.items.${i.id}.name`} label="Name" />
                <TextField path={`services.categories.${c.id}.items.${i.id}.desc`} label="Description" />
                <Grid2>
                  <MoneyField path={`services.categories.${c.id}.items.${i.id}.price`} label="Price" />
                  <MinutesField path={`services.categories.${c.id}.items.${i.id}.minutes`} />
                </Grid2>
                <DraftToggle path={`services.categories.${c.id}.items.${i.id}.online`} label="Customers can book this online" />
              </Item>
            ))}
          </div>
        </Card>
      ))}
    </>
  )
}

function MinutesField({ path }: { path: string }) {
  const v = useDraft<number>(path)
  return (
    <div>
      <Label>Duration</Label>
      <div className="flex gap-1.5">
        {[30, 45, 60, 75, 90, 120, 150, 180].map((m) => (
          <button key={m} data-demo={`a:${path}:${m}`} onClick={() => demo().setDraft(path, m)} className={`flex-1 rounded-md border py-1.5 text-[12px] ${v === m ? 'border-cocoa bg-cocoa text-gold' : 'border-zinc-300 text-zinc-600'}`}>
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SignatureEditor() {
  const scalp = useDemo((s) => s.draft.signature.scalp)
  const water = useDemo((s) => s.draft.signature.water)
  return (
    <>
      <Card title="Hair & scalp analysis page">
        <TextField path="signature.scalp.title" label="Title" />
        <TextField path="signature.scalp.intro" label="Introduction" multiline rows={3} />
        <Grid2>
          <PhotoField path="signature.scalp.photo" label="Main photo" />
          <PhotoField path="signature.scalp.photo2" label="Microscope photo" />
        </Grid2>
        <Label>The four steps</Label>
        <div className="space-y-2">
          {scalp.steps.map((st, i) => (
            <Item key={st.id} id={st.id} title={`${i + 1}. ${st.title}`} meta={st.text}>
              <TextField path={`signature.scalp.steps.${st.id}.title`} label="Step" />
              <TextField path={`signature.scalp.steps.${st.id}.text`} label="Text" multiline rows={2} />
            </Item>
          ))}
        </div>
      </Card>
      <Card title="Pure water system page">
        <TextField path="signature.water.title" label="Title" />
        <TextField path="signature.water.intro" label="Introduction" multiline rows={3} />
        <Grid2>
          <PhotoField path="signature.water.photo" label="System photo" />
          <PhotoField path="signature.water.photo2" label="Header photo" />
        </Grid2>
        <div className="space-y-2">
          {water.points.map((p) => (
            <Item key={p.id} id={p.id} title={p.title} meta={p.text}>
              <TextField path={`signature.water.points.${p.id}.title`} label="Benefit" />
              <TextField path={`signature.water.points.${p.id}.text`} label="Text" multiline rows={2} />
            </Item>
          ))}
        </div>
      </Card>
    </>
  )
}

export function TeamEditor() {
  const team = useDemo((s) => s.draft.team.stylists)
  const days = Array.from({ length: 10 }, (_, i) => iso(i))
  return (
    <>
      <Card title={<span className="flex items-center gap-2"><CalendarOff size={17} /> Days off — the next 10 days</span>}>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid border-b border-zinc-200 bg-zinc-50" style={{ gridTemplateColumns: '170px repeat(10, 1fr)' }}>
            <span />
            {days.map((d) => (
              <span key={d} className="py-1.5 text-center text-[11px] leading-tight text-zinc-500">
                {fmtParts(d).dow}
                <br />
                <b className="text-[13px] text-zinc-800">{fmtParts(d).day}</b>
              </span>
            ))}
          </div>
          {team.map((t) => (
            <div key={t.id} className="grid items-center border-b border-zinc-100 last:border-0" style={{ gridTemplateColumns: '170px repeat(10, 1fr)' }}>
              <span className="flex items-center gap-2 px-2.5 py-1.5">
                <Photo photo={t.photo} position="center 20%" className="h-7 w-7 shrink-0 rounded-full" />
                <span className="truncate text-[13px] font-medium">{t.name}</span>
              </span>
              {days.map((d) => {
                const off = t.off.includes(d)
                return (
                  <button
                    key={d}
                    data-demo={`a:off:${t.id}:${d}`}
                    onClick={() => toggleDayOff(t.id, d)}
                    className={`m-0.5 h-8 rounded text-[11px] font-semibold ${off ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {off ? 'Off' : 'In'}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="text-[12.5px] text-zinc-500">Online booking only offers times when the stylist is working and free. Working hours 9:30 – 19:00.</div>
      </Card>
      <Card title="Profiles">
        <div className="space-y-2">
          {team.map((t) => (
            <Item key={t.id} id={t.id} title={t.name} meta={t.role} thumb={t.photo}>
              <Grid2>
                <TextField path={`team.stylists.${t.id}.name`} label="Name" />
                <TextField path={`team.stylists.${t.id}.role`} label="Role" />
              </Grid2>
              <TextField path={`team.stylists.${t.id}.bio`} label="About" />
              <PhotoField path={`team.stylists.${t.id}.photo`} />
              {t.off.length > 0 && <div className="text-[12.5px] text-zinc-500">Off: {t.off.map(fmtShort).join(', ')}</div>}
            </Item>
          ))}
        </div>
      </Card>
    </>
  )
}

export function GalleryEditor() {
  const photos = useDemo((s) => s.draft.gallery.photos)
  const input = useRef<HTMLInputElement>(null)
  return (
    <Card
      title={`${photos.length} photos`}
      actions={
        <AddButton demoId="a:upload" onClick={() => input.current?.click()}>
          <Upload size={15} /> Upload photos
        </AddButton>
      }
    >
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
      <div className="grid grid-cols-3 gap-3 @4xl:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Photo photo={p.photo} className="aspect-square" />
            <input
              data-demo={`a:gallery.photos.${p.id}.caption`}
              className="w-full px-2 py-1.5 text-[12.5px] outline-none"
              placeholder="Caption"
              value={p.caption}
              onChange={(e) => demo().setDraft(`gallery.photos.${p.id}.caption`, e.target.value)}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function NewsEditor() {
  const items = useDemo((s) => s.draft.news.items)
  return (
    <Card
      title="Posts"
      actions={
        <div className="flex gap-2">
          <AddButton demoId="a:add-news" onClick={() => addNews(undefined, 'public')}>
            <Plus size={15} /> Public post
          </AddButton>
          <AddButton demoId="a:add-news-vip" onClick={() => addNews(undefined, 'vip')}>
            <Crown size={15} /> Members-only post
          </AddButton>
        </div>
      }
    >
      <div className="space-y-2">
        {items.map((n) => (
          <Item
            key={n.id}
            id={n.id}
            title={n.title}
            thumb={n.photo}
            meta={
              <span className="flex items-center gap-1.5">
                {n.audience === 'vip' ? <Crown size={12} className="text-gold-deep" /> : <Globe size={12} />}
                {n.audience === 'vip' ? 'Members only (VIP area)' : 'Website and VIP area'} · {fmtShort(n.date)}
              </span>
            }
            onDelete={() => demo().editDraft((d) => void (d.news.items = d.news.items.filter((x) => x.id !== n.id)))}
          >
            <TextField path={`news.items.${n.id}.title`} label="Title" />
            <TextField path={`news.items.${n.id}.text`} label="Text" multiline rows={2} />
            <PhotoField path={`news.items.${n.id}.photo`} />
            <Toggle
              on={n.audience === 'vip'}
              onChange={(v) => demo().setDraft(`news.items.${n.id}.audience`, v ? 'vip' : 'public')}
              demoId={`a:news.items.${n.id}.audience`}
              label="Members only — show in the VIP area, not on the public website"
            />
          </Item>
        ))}
      </div>
    </Card>
  )
}
