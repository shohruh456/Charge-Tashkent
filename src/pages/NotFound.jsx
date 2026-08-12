import { Link } from 'react-router-dom'
import { Map, ArrowLeft } from 'lucide-react'

export function NotFound() { return <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center px-5 text-center"><div><div className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-500 dark:bg-emerald-400/10"><Map size={36} /></div><p className="mt-7 text-sm font-black uppercase tracking-[.3em] text-emerald-500">404 error</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">Road not found.</h1><p className="mx-auto mt-4 max-w-md text-slate-500">This route isn’t connected to the Charge Tashkent network yet.</p><Link to="/" className="primary-button mt-7 inline-flex"><ArrowLeft size={17} /> Return to map</Link></div></div> }
