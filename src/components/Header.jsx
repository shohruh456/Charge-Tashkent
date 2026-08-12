import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BatteryCharging, Globe2, Menu, Moon, Plus, Sun, X } from 'lucide-react'

export function Header() {
  const { t, i18n } = useTranslation()
  const [dark, setDark] = useState(() => localStorage.getItem('charge-theme') === 'dark')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('charge-theme', dark ? 'dark' : 'light')
  }, [dark])

  const changeLanguage = (language) => {
    i18n.changeLanguage(language)
    localStorage.setItem('charge-language', language)
  }

  return (
    <header className="sticky top-0 z-50 h-18 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1712]/90">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-8 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Charge Tashkent home">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:rotate-3"><BatteryCharging size={22} /></span>
          <span className="text-lg font-extrabold tracking-tight">Charge <span className="text-emerald-500">Tashkent</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{t('map')}</NavLink>
          <NavLink to="/manage" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{t('manage')}</NavLink>
        </nav>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-white/10">
            <Globe2 className="ml-1 text-slate-400" size={15} />
            {['en', 'ru', 'uz'].map((language) => <button key={language} onClick={() => changeLanguage(language)} className={`rounded-lg px-2 py-1 text-[11px] font-bold uppercase ${i18n.language === language ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}>{language}</button>)}
          </div>
          <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label="Toggle color theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link to="/manage" className="primary-button"><Plus size={17} /> {t('addStation')}</Link>
        </div>
        <button onClick={() => setMobileOpen((value) => !value)} className="icon-button ml-auto sm:hidden" aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      {mobileOpen && <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#0b1712] sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="secondary-button justify-center">{t('map')}</Link>
          <Link to="/manage" onClick={() => setMobileOpen(false)} className="primary-button justify-center">{t('addStation')}</Link>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>{['en', 'ru', 'uz'].map((language) => <button key={language} onClick={() => changeLanguage(language)} className="px-3 py-2 text-xs font-bold uppercase">{language}</button>)}</div>
          <button onClick={() => setDark((value) => !value)} className="icon-button">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>}
    </header>
  )
}
