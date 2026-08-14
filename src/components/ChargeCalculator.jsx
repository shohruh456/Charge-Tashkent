import { useMemo, useState } from 'react'
import { BatteryCharging, Clock3, Coins, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ChargeCalculator({ station }) {
  const { t } = useTranslation()
  const [batteryCapacity, setBatteryCapacity] = useState(60)
  const [currentCharge, setCurrentCharge] = useState(25)
  const [targetCharge, setTargetCharge] = useState(80)

  const estimate = useMemo(() => {
    const energy = Math.max(0, batteryCapacity * (targetCharge - currentCharge) / 100)
    const effectivePower = Math.min(station.power, 120)
    const minutes = Math.ceil((energy / effectivePower) * 60 * 1.12)
    return { energy, minutes, price: energy * station.price }
  }, [batteryCapacity, currentCharge, targetCharge, station.power, station.price])

  return (
    <div className="panel overflow-hidden">
      <div className="bg-gradient-to-br from-slate-950 to-emerald-950 p-6 text-white">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300"><BatteryCharging size={22} /></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-emerald-300">{t('smartEstimate')}</p><h2 className="text-lg font-black">{t('chargeCalculator')}</h2></div></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center"><Result icon={Zap} value={`${estimate.energy.toFixed(1)}`} unit="kWh" /><Result icon={Clock3} value={`${estimate.minutes}`} unit={t('minutes')} /><Result icon={Coins} value={`${Math.round(estimate.price / 1000)}k`} unit="UZS" /></div>
      </div>
      <div className="space-y-5 p-6">
        <Control label={t('batteryCapacity')} value={`${batteryCapacity} kWh`} min={30} max={120} step={5} current={batteryCapacity} onChange={setBatteryCapacity} />
        <Control label={t('currentBattery')} value={`${currentCharge}%`} min={5} max={Math.max(5, targetCharge - 5)} step={5} current={currentCharge} onChange={setCurrentCharge} />
        <Control label={t('targetBattery')} value={`${targetCharge}%`} min={Math.min(100, currentCharge + 5)} max={100} step={5} current={targetCharge} onChange={setTargetCharge} />
      </div>
    </div>
  )
}

function Result({ icon: Icon, value, unit }) { return <div className="rounded-2xl bg-white/10 p-3"><Icon className="mx-auto text-emerald-300" size={16} /><b className="mt-2 block text-lg font-black">{value}</b><span className="text-[9px] font-bold uppercase text-white/50">{unit}</span></div> }
function Control({ label, value, current, onChange, ...props }) { return <label className="block"><span className="mb-2 flex justify-between text-xs font-extrabold"><span>{label}</span><b className="text-emerald-500">{value}</b></span><input type="range" value={current} onChange={(event) => onChange(Number(event.target.value))} className="charge-range w-full" {...props} /></label> }
