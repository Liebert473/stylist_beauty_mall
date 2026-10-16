import { Crown, Gift, Landmark, Sparkles } from 'lucide-react'
import { useDemo } from '../store/store'
import { money } from '../ui/format'
import { Card, Grid2, MoneyField, TextField } from './ui'

export function RewardsEditor() {
  const r = useDemo((s) => s.draft.rewards)
  return (
    <>
      <Card title={<span className="flex items-center gap-2"><Sparkles size={17} /> Cash back</span>}>
        <div className="grid grid-cols-[1fr_2fr] items-end gap-4">
          <MoneyField path="rewards.step" label="Every time a VIP spends" />
          <div className="pb-2 text-[13px] text-zinc-500">…their tier’s cash back is added to the wallet automatically at checkout. Spending paid with reward credit doesn’t count.</div>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[1fr_1.3fr_1.3fr_2fr] gap-3 bg-zinc-50 px-3 py-2 text-[11.5px] font-semibold tracking-wide text-zinc-500 uppercase">
            <span>Tier</span>
            <span>Reached at (12 months)</span>
            <span>Cash back</span>
            <span>Perk</span>
          </div>
          {r.tiers.map((t) => (
            <div key={t.id} className="grid grid-cols-[1fr_1.3fr_1.3fr_2fr] items-center gap-3 border-t border-zinc-100 px-3 py-2">
              <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                <Crown size={15} className="text-gold-deep" /> {t.name}
              </span>
              {t.min === 0 ? <span className="text-[13px] text-zinc-500">On invitation</span> : <MoneyField path={`rewards.tiers.${t.id}.min`} />}
              <MoneyField path={`rewards.tiers.${t.id}.cashback`} />
              <TextField path={`rewards.tiers.${t.id}.perk`} />
            </div>
          ))}
        </div>
        <div className="text-[12.5px] text-zinc-500">
          Example: a Gold member who spends {money(r.step)} gets {money(r.tiers[1]?.cashback ?? 0)} back ({(((r.tiers[1]?.cashback ?? 0) / (r.step || 1)) * 100).toFixed(0)}%).
        </div>
      </Card>

      <Card title={<span className="flex items-center gap-2"><Gift size={17} /> Top-up bonus &amp; gifts</span>}>
        {r.bonuses.map((b) => (
          <div key={b.id} className="grid grid-cols-[1fr_1fr_1fr] items-end gap-3">
            <MoneyField path={`rewards.bonuses.${b.id}.amount`} label="Top up" />
            <MoneyField path={`rewards.bonuses.${b.id}.bonus`} label="Bonus credit" />
            <div className="pb-2 text-[13px] text-zinc-500">
              = {money(b.amount + b.bonus)} credit ({((b.bonus / (b.amount || 1)) * 100).toFixed(0)}%)
            </div>
          </div>
        ))}
        <Grid2>
          <MoneyField path="rewards.birthday" label="Birthday gift (credit in birthday month)" />
          <TextField path="rewards.refundRate" label="Refund rate of paid credit (%)" />
        </Grid2>
      </Card>

      <Card title={<span className="flex items-center gap-2"><Landmark size={17} /> Payment accounts shown to VIPs</span>}>
        {r.accounts.map((a) => (
          <div key={a.id} className="grid grid-cols-[0.8fr_1.4fr_1.2fr] gap-3">
            <TextField path={`rewards.accounts.${a.id}.name`} />
            <TextField path={`rewards.accounts.${a.id}.holder`} />
            <TextField path={`rewards.accounts.${a.id}.number`} />
          </div>
        ))}
      </Card>
    </>
  )
}
