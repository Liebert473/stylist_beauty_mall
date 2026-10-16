import { demo } from '../store/store'

/**
 * A step's script is a list of actions. The same script runs two ways:
 *  - animated: a presenter cursor moves to each target, types and clicks;
 *  - instant: only the state changes are applied (used to rebuild earlier steps when jumping around).
 */
export type Action =
  | { t: 'wait'; ms: number }
  | { t: 'point'; target: string }
  | { t: 'click'; target: string; run?: () => void }
  | { t: 'type'; target: string; text: string; get?: () => string; set: (v: string) => void; append?: boolean }
  | { t: 'do'; run: () => void; instant?: () => void }

export class Cancelled extends Error {}

export interface Token {
  cancelled: boolean
}

let stageEl: HTMLElement | null = null
export const registerStage = (el: HTMLElement | null) => {
  stageEl = el
}

const sleep = (ms: number, token: Token) =>
  new Promise<void>((resolve, reject) => {
    setTimeout(() => (token.cancelled ? reject(new Cancelled()) : resolve()), ms)
  })

const query = (target: string) => document.querySelector<HTMLElement>(`[data-demo="${CSS.escape(target)}"]`)

const find = async (target: string, token: Token): Promise<HTMLElement | null> => {
  for (let i = 0; i < 30; i++) {
    const el = query(target)
    if (el) return el
    await sleep(60, token)
  }
  console.warn('[demo] target not found:', target)
  return null
}

/** Scroll the nearest scroll container (dashboard, website or media picker) so `el` is in view. */
const reveal = (el: HTMLElement) => {
  let box = el.parentElement
  while (box && !box.matches('[data-scroll],[data-site-scroll]')) box = box.parentElement
  if (!box) return
  const boxRect = box.getBoundingClientRect()
  const scale = boxRect.height / box.offsetHeight || 1
  const r = el.getBoundingClientRect()
  const top = (r.top - boxRect.top) / scale
  const bottom = (r.bottom - boxRect.top) / scale
  const margin = 80
  if (top < margin || bottom > box.clientHeight - margin) {
    box.scrollTo({ top: box.scrollTop + top - box.clientHeight / 2 + (bottom - top) / 2, behavior: 'smooth' })
  }
}

/** Where the cursor tip should sit on `el`, in stage coordinates. */
const aim = (el: HTMLElement) => {
  if (!stageEl) return null
  const stage = stageEl.getBoundingClientRect()
  const scale = stage.width / stageEl.offsetWidth || 1
  const r = el.getBoundingClientRect()
  return {
    x: (r.left + Math.min(r.width / 2, 60) - stage.left) / scale,
    y: (r.top + r.height / 2 - stage.top) / scale,
  }
}

/** Resolves once `el` has stopped moving (smooth scroll, expanding rows, page transitions). */
const settle = async (el: HTMLElement, token: Token) => {
  let last = ''
  for (let i = 0, still = 0; i < 24 && still < 2; i++) {
    await sleep(50, token)
    const r = el.getBoundingClientRect()
    const key = `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}`
    still = key === last ? still + 1 : 0
    last = key
  }
}

// The cursor keeps following its current target, so it stays on it even if the layout shifts later.
let tracked: HTMLElement | null = null
let trackedTarget = ''
const follow = () => {
  // the element can be replaced (e.g. a copy that was still fading out on replay): pick up the live one
  if (tracked && !tracked.isConnected) tracked = query(trackedTarget)
  if (tracked) {
    const p = aim(tracked)
    const c = demo().cursor
    if (p && (Math.abs(p.x - c.x) > 1 || Math.abs(p.y - c.y) > 1))
      demo().update((s) => {
        s.cursor.x = p.x
        s.cursor.y = p.y
      })
  }
  requestAnimationFrame(follow)
}
requestAnimationFrame(follow)

export const releaseCursor = () => {
  tracked = null
}

const moveTo = async (el: HTMLElement, target: string, token: Token) => {
  reveal(el)
  await settle(el, token)
  tracked = el
  trackedTarget = target
  demo().update((s) => void (s.cursor.visible = true))
  await sleep(650, token)
  // target was swapped while moving: give the cursor time to reach the new one
  if (!el.isConnected) await sleep(500, token)
}

const pulse = () =>
  demo().update((s) => {
    s.cursor.click += 1
  })

export async function run(actions: Action[], token: Token, instant: boolean) {
  for (const a of actions) {
    if (token.cancelled) throw new Cancelled()
    if (instant) {
      if (a.t === 'click') a.run?.()
      else if (a.t === 'type') a.set(a.append && a.get ? a.get() + a.text : a.text)
      else if (a.t === 'do') (a.instant ?? a.run)()
      continue
    }
    switch (a.t) {
      case 'wait':
        await sleep(a.ms, token)
        break
      case 'point': {
        const el = await find(a.target, token)
        if (el) await moveTo(el, a.target, token)
        break
      }
      case 'click': {
        const el = await find(a.target, token)
        if (el) await moveTo(el, a.target, token)
        pulse()
        await sleep(160, token)
        if (a.run) a.run()
        else el?.click()
        await sleep(450, token)
        break
      }
      case 'type': {
        const el = await find(a.target, token)
        if (el) {
          await moveTo(el, a.target, token)
          pulse()
          // no real focus: keyboard shortcuts must keep working while the demo types
          el.classList.add('demo-target')
        }
        const base = a.append && a.get ? a.get() : ''
        if (!a.append) {
          a.set('')
          await sleep(220, token)
        }
        const step = Math.max(14, Math.min(48, 1700 / a.text.length))
        const chars = [...a.text]
        for (let i = 1; i <= chars.length; i++) {
          a.set(base + chars.slice(0, i).join(''))
          await sleep(step, token)
        }
        el?.classList.remove('demo-target')
        await sleep(250, token)
        break
      }
      case 'do':
        a.run()
        break
    }
  }
}
