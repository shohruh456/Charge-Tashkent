import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { BatteryCharging, Edit3, MapPin, Plus, Trash2, X } from 'lucide-react'
import { stationApi } from '../services/stationApi'
import { useStations } from '../hooks/useStations'
import { useStationStore } from '../store/useStationStore'
import { StatusBadge } from '../components/StatusBadge'
import { toast } from '../services/toast'

const districts = ['Chilonzor', 'Yunusobod', 'Mirzo Ulugbek', 'Shaykhontohur', 'Yakkasaroy', 'Mirobod', 'Sergeli', 'Uchtepa']
const districtCoordinates = {
  Chilonzor: [41.275, 69.204], Yunusobod: [41.36, 69.275], 'Mirzo Ulugbek': [41.326, 69.335],
  Shaykhontohur: [41.316, 69.235], Yakkasaroy: [41.285, 69.255], Mirobod: [41.29, 69.285],
  Sergeli: [41.235, 69.225], Uchtepa: [41.295, 69.18],
}
const schema = z.object({
  name: z.string().min(3, 'Enter at least 3 characters'), district: z.string().min(1, 'Choose a district'), address: z.string().min(5, 'Enter a complete address'), network: z.string().min(1, 'Choose a network'), connector: z.string().min(1, 'Choose a connector'), status: z.enum(['available', 'in_use', 'offline']), power: z.coerce.number().min(3).max(350),
})

export function ManageStation() {
  const queryClient = useQueryClient()
  const { isLoading } = useStations()
  const stations = useStationStore((state) => state.stations)
  const addStation = useStationStore((state) => state.addStation)
  const removeStation = useStationStore((state) => state.removeStation)
  const [formOpen, setFormOpen] = useState(true)
  const [deletingStation, setDeletingStation] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status: 'available', power: 60 } })
  const createMutation = useMutation({ mutationFn: stationApi.create, onSuccess: (station) => { addStation(station); queryClient.invalidateQueries({ queryKey: ['stations'] }); reset(); toast(`${station.name} added to the map`) }, onError: () => toast('Could not add station', 'error') })
  const deleteMutation = useMutation({ mutationFn: stationApi.remove, onSuccess: (id) => { removeStation(id); setDeletingStation(null); queryClient.invalidateQueries({ queryKey: ['stations'] }); toast('Station deleted') }, onError: () => toast('Could not delete station', 'error') })
  const onSubmit = (values) => {
    const [lat, lng] = districtCoordinates[values.district] || [41.2995, 69.2401]
    createMutation.mutate({ ...values, connectors: [values.connector], lat, lng, totalPorts: 4, availablePorts: values.status === 'available' ? 3 : 0, price: 1800, hours: '24/7', rating: 5, distance: 2.5 })
  }

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Network operations</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Charging station manager</h1><p className="mt-2 text-sm text-slate-500">Add and maintain public EV infrastructure across Tashkent.</p></div><button onClick={() => setFormOpen((value) => !value)} className="primary-button">{formOpen ? <X size={17} /> : <Plus size={17} />}{formOpen ? 'Close form' : 'Add station'}</button></div>
      <div className={`grid transition-all duration-300 ${formOpen ? 'mt-8 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 overflow-hidden"><form onSubmit={handleSubmit(onSubmit)} className="panel grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-7">
        <Field label="Station name" error={errors.name}><input {...register('name')} className="field" placeholder="e.g. Compass Mall Fast Charge" /></Field>
        <Field label="District" error={errors.district}><select {...register('district')} className="field"><option value="">Select district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></Field>
        <Field label="Street address" error={errors.address}><input {...register('address')} className="field" placeholder="e.g. Kichik Halqa Yo'li 17" /></Field>
        <Field label="Charging network" error={errors.network}><select {...register('network')} className="field"><option value="">Select network</option>{['Tokbor', 'Voltauto', 'K Watt', 'NRG'].map((network) => <option key={network}>{network}</option>)}</select></Field>
        <Field label="Connector type" error={errors.connector}><select {...register('connector')} className="field"><option value="">Select connector</option>{['GB/T', 'CCS2', 'GIBRID', 'Type 2'].map((connector) => <option key={connector}>{connector}</option>)}</select></Field>
        <Field label="Maximum power (kW)" error={errors.power}><input {...register('power')} className="field" type="number" /></Field>
        <Field label="Current status" error={errors.status}><select {...register('status')} className="field"><option value="available">Available</option><option value="in_use">In use</option><option value="offline">Offline</option></select></Field>
        <div className="flex items-end sm:col-span-2"><button disabled={createMutation.isPending} className="primary-button h-12 w-full justify-center lg:w-auto lg:px-8">{createMutation.isPending ? <span className="spinner" /> : <Plus size={18} />} {createMutation.isPending ? 'Adding station…' : 'Add to Tashkent map'}</button></div>
      </form></div></div>
      <section className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">All stations</h2><span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold dark:bg-white/10">{stations.length} total</span></div>
        <div className="panel overflow-hidden"><div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/[.03] md:grid"><span>Station</span><span>Network</span><span>Connector</span><span>Status</span><span>Actions</span></div>
          {isLoading ? <div className="h-40 animate-pulse bg-slate-100 dark:bg-white/5" /> : stations.map((station) => <div key={station.id} className="grid items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-white/5 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:gap-4"><div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10"><BatteryCharging size={17} /></div><div className="min-w-0"><p className="truncate text-sm font-extrabold">{station.name}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><MapPin size={11} /> {station.district}</p></div></div><span className="text-xs font-bold text-slate-500">{station.network}</span><span className="text-xs font-bold">{station.connectors.join(', ')}</span><StatusBadge status={station.status} compact /><div className="flex gap-1"><a href={`/stations/${station.id}`} className="icon-button" aria-label="Edit station"><Edit3 size={15} /></a><button disabled={deleteMutation.isPending} onClick={() => setDeletingStation(station)} className="icon-button hover:text-rose-500" aria-label="Delete station"><Trash2 size={15} /></button></div></div>)}</div>
      </section>

      <Dialog open={Boolean(deletingStation)} onClose={() => !deleteMutation.isPending && setDeletingStation(null)} className="relative z-[1200]">
        <DialogBackdrop transition className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm duration-200 ease-out data-closed:opacity-0" />
        <div className="fixed inset-0 grid place-items-center overflow-y-auto p-4">
          <DialogPanel transition className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl duration-200 ease-out data-closed:translate-y-4 data-closed:scale-95 data-closed:opacity-0 dark:border-white/10 dark:bg-[#102019]">
            <div className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-400/10"><Trash2 size={22} /></div>
            <DialogTitle className="mt-5 text-xl font-black">Delete charging station?</DialogTitle>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{deletingStation?.name} will be removed from the map and station manager. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button disabled={deleteMutation.isPending} onClick={() => setDeletingStation(null)} className="secondary-button">Cancel</button>
              <button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingStation.id)} className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-rose-600">{deleteMutation.isPending ? <span className="spinner" /> : <Trash2 size={16} />} Delete</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

function Field({ label, error, children }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold">{label}</span>{children}{error && <span className="mt-1.5 block text-xs font-semibold text-rose-500">{error.message}</span>}</label> }
