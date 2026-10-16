import monoGold from '../brand/mono-gold.png'
import monoBrown from '../brand/mono-brown.png'
import lockupGold from '../brand/lockup-gold.png'
import lockupBrown from '../brand/lockup-brown.png'
import wordGold from '../brand/wordmark-gold.png'

// The salon's own logo, cut out of the supplied artwork (src/brand/*.png).

/** The SS monogram with the two sparkles. */
export function Monogram({ tone = 'gold', className = '' }: { tone?: 'gold' | 'brown'; className?: string }) {
  return <img src={tone === 'gold' ? monoGold : monoBrown} alt="Stylist Beauty Mall" className={`object-contain ${className}`} draggable={false} />
}

/** Monogram + STYLIST / BEAUTY MALL. */
export function Lockup({ tone = 'gold', className = '' }: { tone?: 'gold' | 'brown'; className?: string }) {
  return <img src={tone === 'gold' ? lockupGold : lockupBrown} alt="Stylist Beauty Mall" className={`object-contain ${className}`} draggable={false} />
}

export function Wordmark({ className = '' }: { className?: string }) {
  return <img src={wordGold} alt="Stylist Beauty Mall" className={`object-contain ${className}`} draggable={false} />
}

/** Round cocoa badge with the gold monogram — app icon, chat avatar, favicon. */
export function Badge({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-cocoa ${className}`}>
      <Monogram className="h-[62%] w-[62%]" />
    </div>
  )
}
