import { useDemo } from '../store/store'
import { photoLabel } from '../store/photos'

// Photos in src/photos/<key>.jpg are bundled (and embedded in the single-file presentation).
const BUNDLED: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob<string>('../photos/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })).map(
    ([path, url]) => [path.replace(/^.*\/|\.[^.]+$/g, ''), url],
  ),
)

export function Photo({ photo, className = '', position }: { photo: string; className?: string; position?: string }) {
  const upload = useDemo((s) => s.uploads[photo])
  const src = upload ?? BUNDLED[photo]
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {src && <img src={src} alt={photoLabel(photo)} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />}
    </div>
  )
}
