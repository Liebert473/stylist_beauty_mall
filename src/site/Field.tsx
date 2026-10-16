import { createElement, useEffect, useState, type ReactNode } from 'react'
import { useDemo } from '../store/store'
import { touches } from '../store/paths'

/** True for ~2.6s after a published change touches `field` (also when the region mounts just after). */
export function useFlash(field: string) {
  const flash = useDemo((s) => s.flash)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const fresh = flash.nonce > 0 && Date.now() - flash.at < 2500
    if (!fresh || !flash.paths.some((p) => touches(field, p))) {
      setOn(false)
      return
    }
    setOn(true)
    const t = setTimeout(() => setOn(false), 2600)
    return () => clearTimeout(t)
  }, [flash, field])
  return on
}

/** A website region bound to a content path; glows when that content is published. */
export function Field({
  f,
  as = 'div',
  className = '',
  children,
}: {
  f: string
  as?: string
  className?: string
  children: ReactNode
}) {
  const on = useFlash(f)
  return createElement(as, { 'data-field': f, className: `${className} ${on ? 'flash' : ''}` }, children)
}
