// Media library: every photo is bundled from src/photos/<key>.jpg (AI-generated stand-ins until the salon's own photos arrive).

export interface PhotoInfo {
  key: string
  label: string
}

export const PHOTOS: PhotoInfo[] = [
  { key: 'hero-salon', label: 'The salon' },
  { key: 'hero-hair', label: 'Blow-dry finish' },
  { key: 'reception', label: 'Reception' },
  { key: 'vip-lounge', label: 'VIP room' },
  { key: 'scalp-analysis', label: 'Scalp analysis' },
  { key: 'scalp-closeup', label: 'Scalp under the microscope' },
  { key: 'pure-water', label: 'Pure water wash' },
  { key: 'water-system', label: 'Water purification system' },
  { key: 'hair-cut', label: 'Precision cut' },
  { key: 'hair-color', label: 'Caramel balayage' },
  { key: 'hair-treatment', label: 'Hair spa' },
  { key: 'bridal', label: 'Bridal chignon' },
  { key: 'nails', label: 'Gel manicure' },
  { key: 'nail-art', label: 'Nail art' },
  { key: 'pedicure', label: 'Spa pedicure' },
  { key: 'foot-care', label: 'Foot massage' },
  { key: 'products', label: 'Hair care' },
  { key: 'promo-festival', label: 'Festival flowers' },
  { key: 'vip-gift', label: 'VIP gift' },
  { key: 'stylist-thandar', label: 'Ma Thandar' },
  { key: 'stylist-zaw', label: 'Ko Zaw Min' },
  { key: 'stylist-hnin', label: 'Ma Hnin Ei' },
  { key: 'stylist-ei', label: 'Ma Ei Ei' },
]

export const photoLabel = (key: string) => PHOTOS.find((p) => p.key === key)?.label ?? key
