import { demo } from '../store/store'
import { CHAPTERS, type View } from './chapters'
import { Cancelled, releaseCursor, run, type Token } from './runner'

let token: Token = { cancelled: false }

function applyView(v: View) {
  demo().update((s) => {
    if (v.admin) {
      s.adminSection = v.admin
      s.adminUi.expanded = null
      s.adminUi.pickerOpen = null
    }
    if (v.site) s.sitePage = v.site
    if (v.vip) s.vipPage = v.vip
    if (v.app) s.guestApp = v.app
    if (v.device) s.device = v.device
    if (v.phone) s.phone.screen = v.phone
  })
}

/**
 * Jump to any step: reset the data, replay the earlier steps of the chapter instantly,
 * then (optionally) play this step with the presenter cursor.
 */
export async function goTo(chapter: number, step: number, play = true) {
  token.cancelled = true
  const my: Token = { cancelled: false }
  token = my

  chapter = Math.max(0, Math.min(CHAPTERS.length - 1, chapter))
  const ch = CHAPTERS[chapter]
  step = Math.max(0, Math.min(ch.steps.length - 1, step))

  releaseCursor()
  const s = demo()
  s.resetData()
  s.update((st) => {
    st.chapter = chapter
    st.step = step
    st.cursor.visible = false
  })
  ch.setup?.()
  applyView(ch.view)
  for (let i = 0; i < step; i++) {
    applyView(ch.steps[i].view ?? {})
    await run(ch.steps[i].script, my, true).catch(() => undefined)
  }
  applyView(ch.steps[step].view ?? {})
  // earlier steps should not glow or toast again
  demo().update((st) => {
    st.flash = { ...st.flash, at: 0 }
    st.toasts = []
    st.adminUi.expanded = null
  })

  const hash = `#/${chapter}/${step + 1}`
  if (location.hash !== hash) history.replaceState(null, '', hash)

  if (play && ch.steps[step].script.length) await playCurrent(my)
}

async function playCurrent(my: Token) {
  const { chapter, step } = demo()
  const script = CHAPTERS[chapter].steps[step].script
  demo().update((s) => void (s.playing = true))
  try {
    await new Promise((r) => setTimeout(r, 650))
    if (my.cancelled) return
    await run(script, my, false)
    setTimeout(() => token === my && demo().update((s) => void (s.cursor.visible = false)), 1600)
    if (demo().autoTour) {
      await new Promise((r) => setTimeout(r, 3200))
      if (!my.cancelled) next()
    }
  } catch (e) {
    if (!(e instanceof Cancelled)) console.error(e)
  } finally {
    if (token === my) demo().update((s) => void (s.playing = false))
  }
}

export const replay = () => goTo(demo().chapter, demo().step)

export function next() {
  const { chapter, step } = demo()
  if (step < CHAPTERS[chapter].steps.length - 1) goTo(chapter, step + 1)
  else if (chapter < CHAPTERS.length - 1) goTo(chapter + 1, 0)
}

export function prev() {
  const { chapter, step } = demo()
  if (step > 0) goTo(chapter, step - 1)
  else if (chapter > 0) goTo(chapter - 1, CHAPTERS[chapter - 1].steps.length - 1)
}

export function stop() {
  token.cancelled = true
  releaseCursor()
  demo().update((s) => {
    s.playing = false
    s.cursor.visible = false
  })
}

export function fromHash() {
  const m = location.hash.match(/^#\/(\d+)\/(\d+)/)
  if (m) goTo(Number(m[1]), Number(m[2]) - 1, false)
  else goTo(0, 0, false)
}
