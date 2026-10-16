import { useShallow } from 'zustand/react/shallow'
import { motion } from 'framer-motion'
import { Check, Crown, Sparkles, Wallet } from 'lucide-react'
import { demo, useDemo } from '../store/store'
import type { CheckoutState } from '../store/types'
import { balance, payCheckout, servicesTotal, tierById } from '../store/ops'
import { money } from '../ui/format'
import { Avatar, Card, Pill, Toggle } from './ui'

export const setCheckout = <K extends keyof CheckoutState>(key: K, value: CheckoutState[K]) => demo().update((s) => void (s.checkout[key] = value))

export const toggleCheckoutService = (id: string) =>
  demo().update((s) => {
    const l = s.checkout.services
    s.checkout.services = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]
  })

export function Checkout() {
  const co = useDemo((s) => s.checkout)
  const content = useDemo((s) => s.content)
  const clients = useDemo(useShallow((s) => s.clients.filter((c) => c.status === 'active')))
  const ledger = useDemo((s) => s.ledger)
  const client = clients.find((c) => c.id === co.client)
  const total = servicesTotal(content, co.services)
  const bal = client ? balance(ledger, client.id) : { paid: 0, reward: 0, total: 0 }
  const wallet = co.payWallet ? Math.min(total, bal.total) : 0
  const rewardUsed = Math.min(wallet, Math.max(0, bal.reward))
  const cash = total - wallet
  const tier = client ? tierById(content, client.tier) : null
  const step = content.rewards.step
  const after = client ? client.progress + total - rewardUsed : 0
  const earns = tier ? Math.floor(after / step) * tier.cashback : 0

  if (co.done && client) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[560px] rounded-2xl border border-zinc-200 bg-white p-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check size={28} strokeWidth={3} />
        </div>
        <div className="mt-3 text-[22px] font-bold">Paid · {money(co.done.total)}</div>
        <div className="text-[14px] text-zinc-500">{client.name}</div>
        <div className="mt-5 space-y-2 rounded-xl bg-zinc-50 p-4 text-left text-[14px]">
          <div className="flex justify-between">
            <span>From wallet</span>
            <b>{money(co.done.wallet)}</b>
          </div>
          {co.done.total - co.done.wallet > 0 && (
            <div className="flex justify-between">
              <span>Cash / transfer</span>
              <b>{money(co.done.total - co.done.wallet)}</b>
            </div>
          )}
          {co.done.cashback > 0 && (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex justify-between rounded-lg bg-gold/40 px-3 py-2 text-cocoa-dark">
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles size={16} /> Cash back added
              </span>
              <b>+{money(co.done.cashback)}</b>
            </motion.div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-zinc-600">
            <span>New wallet balance</span>
            <b className="text-zinc-900">{money(balance(ledger, client.id).total)}</b>
          </div>
        </div>
        <div className="mt-3 text-[12.5px] text-zinc-500">The VIP sees the payment and cash back in their wallet right away.</div>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-4 @4xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <Card title="VIP client">
          <div className="grid grid-cols-2 gap-2">
            {clients.slice(0, 6).map((c) => (
              <button
                key={c.id}
                data-demo={`a:co-client:${c.id}`}
                onClick={() => setCheckout('client', c.id)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left ${co.client === c.id ? 'border-cocoa bg-cocoa/5' : 'border-zinc-200'}`}
              >
                <Avatar name={c.name} className="h-8 w-8 text-[11px]" />
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold">{c.name}</div>
                  <div className="text-[11.5px] text-zinc-500">{money(balance(ledger, c.id).total)}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        <Card title="Services">
          {content.services.categories.map((cat) => (
            <div key={cat.id}>
              <div className="mb-1.5 text-[12px] font-semibold text-zinc-500">{cat.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((i) => (
                  <button
                    key={i.id}
                    data-demo={`a:co-svc:${i.id}`}
                    onClick={() => toggleCheckoutService(i.id)}
                    className={`rounded-full border px-3 py-1 text-[12.5px] ${co.services.includes(i.id) ? 'border-cocoa bg-cocoa text-gold' : 'border-zinc-300 text-zinc-700'}`}
                  >
                    {i.name} · {(i.price / 1000).toLocaleString('en-US')}K
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Payment">
        {client ? (
          <div className="flex items-center gap-3">
            <Avatar name={client.name} />
            <div className="flex-1">
              <div className="text-[15px] font-semibold">{client.name}</div>
              <Pill tone="cocoa">
                <Crown size={10} /> {tier?.name}
              </Pill>
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-zinc-500">Choose a VIP client.</div>
        )}
        <div className="space-y-1.5 text-[14px]">
          <div className="flex justify-between text-[18px] font-bold">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3">
          <Toggle on={co.payWallet} onChange={(v) => setCheckout('payWallet', v)} demoId="a:co-wallet" label={<span className="flex items-center gap-1.5"><Wallet size={15} /> Pay from wallet</span>} />
          {client && (
            <div className="mt-2 space-y-1 text-[12.5px] text-zinc-600">
              <div className="flex justify-between">
                <span>Balance</span>
                <span>
                  {money(bal.total)} <span className="text-zinc-400">({money(bal.reward)} rewards)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>From wallet</span>
                <b className="text-zinc-900">{money(wallet)}</b>
              </div>
              <div className="flex justify-between">
                <span>Cash / transfer</span>
                <b className="text-zinc-900">{money(cash)}</b>
              </div>
            </div>
          )}
        </div>
        {client && tier && (
          <div className="rounded-lg border border-gold-deep/30 bg-gold/15 p-3 text-[12.5px] text-cocoa-dark">
            <div className="flex items-center gap-1.5 font-semibold">
              <Sparkles size={14} /> Cash back
            </div>
            <div className="mt-1">
              Progress {money(client.progress)} + {money(total - rewardUsed)} this visit
              {rewardUsed > 0 && <span className="text-zinc-500"> (reward credit doesn’t count)</span>}
            </div>
            <div className="mt-0.5 font-semibold">{earns ? `→ ${money(earns)} cash back today` : `→ ${money(step - after)} to the next ${money(tier.cashback)}`}</div>
          </div>
        )}
        <button
          data-demo="a:pay"
          disabled={!client || !co.services.length}
          onClick={payCheckout}
          className="w-full rounded-lg bg-cocoa py-3 text-[15px] font-semibold text-gold disabled:bg-zinc-300 disabled:text-white"
        >
          Complete payment
        </button>
      </Card>
    </div>
  )
}
