import { CheckCircle2 } from 'lucide-react'
import { money } from './format'

/** A generic mobile-banking "transfer successful" screenshot — what VIPs upload with a transfer top-up. */
export function Receipt({ amount, txId, to = 'Stylist Beauty Mall', small }: { amount: number; txId: string; to?: string; small?: boolean }) {
  return (
    <div className={`flex h-full w-full flex-col items-center bg-gradient-to-b from-[#1f5fbf] to-[#1a4f9c] text-white ${small ? 'p-1.5 text-[5px]' : 'p-5 text-[13px]'}`}>
      <div className={`font-semibold opacity-90 ${small ? 'text-[5px]' : 'text-[12px]'}`}>Mobile Pay</div>
      <CheckCircle2 className={small ? 'mt-1 h-3 w-3' : 'mt-5 h-12 w-12'} />
      <div className={`font-semibold ${small ? 'mt-0.5 text-[5.5px]' : 'mt-2 text-[15px]'}`}>Transfer successful</div>
      <div className={`font-bold ${small ? 'text-[8px]' : 'mt-1 text-[28px]'}`}>{amount ? money(amount) : '— Ks'}</div>
      <div className={`w-full rounded bg-white/95 text-zinc-700 ${small ? 'mt-1 space-y-[1px] p-1' : 'mt-5 space-y-2 rounded-xl p-4'}`}>
        {[
          ['To', to],
          ['Transaction ID', txId || '0123 4567 8901'],
          ['Date', new Date().toLocaleDateString('en-GB')],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <span className="text-zinc-400">{k}</span>
            <span className="truncate font-semibold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
