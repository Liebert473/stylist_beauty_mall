// Dotted-path helpers. A path segment addresses an array item by its `id` when it has one,
// otherwise by index — e.g. "events.items.e2.title" or "home.highlights.0.text".

type Obj = Record<string, unknown>

const step = (node: unknown, seg: string): unknown => {
  if (Array.isArray(node)) {
    const byId = node.find((x) => x && typeof x === 'object' && (x as Obj).id === seg)
    return byId ?? node[Number(seg)]
  }
  return node && typeof node === 'object' ? (node as Obj)[seg] : undefined
}

export const getAt = (root: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((n, s) => step(n, s), root)

export const setAt = (root: unknown, path: string, value: unknown) => {
  const segs = path.split('.')
  const last = segs.pop()!
  const parent = segs.reduce<unknown>((n, s) => step(n, s), root)
  if (Array.isArray(parent)) {
    const i = parent.findIndex((x) => x && typeof x === 'object' && (x as Obj).id === last)
    parent[i >= 0 ? i : Number(last)] = value
  } else if (parent && typeof parent === 'object') {
    ;(parent as Obj)[last] = value
  }
}

const keyOf = (x: unknown, i: number) =>
  x && typeof x === 'object' && 'id' in (x as Obj) ? String((x as Obj).id) : String(i)

/** Leaf paths that differ between a and b (array items matched by id). */
export const diffPaths = (a: unknown, b: unknown, prefix: string): string[] => {
  if (a === b) return []
  if (Array.isArray(a) && Array.isArray(b)) {
    const out: string[] = []
    const aKeys = a.map(keyOf)
    b.forEach((item, i) => {
      const k = keyOf(item, i)
      const j = aKeys.indexOf(k)
      if (j < 0) out.push(`${prefix}.${k}`)
      else out.push(...diffPaths(a[j], item, `${prefix}.${k}`))
    })
    // pure re-ordering counts as a change of the list itself
    if (!out.length && JSON.stringify(a) !== JSON.stringify(b)) out.push(prefix)
    return out
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a as Obj), ...Object.keys(b as Obj)])
    return [...keys].flatMap((k) => diffPaths((a as Obj)[k], (b as Obj)[k], `${prefix}.${k}`))
  }
  return [prefix]
}

/** True when a published change at `changed` touches the region marked `field`. */
export const touches = (field: string, changed: string) =>
  field === changed || changed.startsWith(field + '.') || field.startsWith(changed + '.')
