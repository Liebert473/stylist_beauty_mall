import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Scales a fixed-size child (w × h) to fit its parent box, centred. Layout sizes ignore transforms. */
export function Fit({ w, h, max = 1.4, children }: { w: number; h: number; max?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(Math.min(max, el.clientWidth / w, el.clientHeight / h))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w, h, max])
  return (
    <div ref={ref} className="relative h-full w-full">
      <div
        className="absolute top-1/2 left-1/2"
        style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: 'center' }}
      >
        {children}
      </div>
    </div>
  )
}

/** Measures the parent and renders `children(width, height)`. */
export function Measure({ children }: { children: (w: number, h: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="relative h-full w-full">
      {size.w > 0 && children(size.w, size.h)}
    </div>
  )
}
