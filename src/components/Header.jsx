import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BatteryCharging, BriefcaseBusiness, Globe2, LogOut, Menu, Moon, Plus, ShieldCheck, Sun, UserRound, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export function Header() {
  const { t, i18n } = useTranslation()
  const [dark, setDark] = useState(() => localStorage.getItem('charge-theme') === 'dark')
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('charge-theme', dark ? 'dark' : 'light')
  }, [dark])

  const changeLanguage = (language) => i18n.changeLanguage(language)
  const activeLanguage = i18n.resolvedLanguage?.split('-')[0] || i18n.language.split('-')[0]

  return (
    <header className="sticky top-0 z-[900] h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1712]/95 sm:h-18">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-4 px-3 sm:gap-8 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" aria-label={t('homeLabel')}>
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:rotate-3 sm:size-10"><BatteryCharging size={21} /></span>
          <span className="text-base font-extrabold tracking-tight sm:text-lg">Charge <span className="text-emerald-500 max-[360px]:hidden">Tashkent</span></span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{t('map')}</NavLink>
          {(user?.role === 'business' || user?.role === 'admin') && <NavLink to="/business" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{t('myBusiness')}</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{t('admin')}</NavLink>}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-white/10">
            <Globe2 className="ml-1 text-slate-400" size={15} />
            {['en', 'ru', 'uz'].map((language) => <button type="button" key={language} onClick={() => changeLanguage(language)} aria-pressed={activeLanguage === language} className={`rounded-lg px-2 py-1 text-[11px] font-bold uppercase ${activeLanguage === language ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}>{language}</button>)}
          </div>
          <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label={t('toggleTheme')}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          {user ? <div className="flex items-center gap-2 rounded-xl border border-slate-200 py-1 pl-2.5 pr-1 dark:border-white/10"><div className="min-w-0"><p className="max-w-24 truncate text-[11px] font-extrabold">{user.name}</p><p className="text-[9px] uppercase text-slate-400">{t(`role${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`)}</p></div><button onClick={logout} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-400/10" aria-label={t('logout')}><LogOut size={15} /></button></div> : <Link to="/register" className="icon-button" aria-label={t('registration')}><UserRound size={17} /></Link>}
          {(user?.role === 'business' || user?.role === 'admin') ? <Link to="/business" className="primary-button"><Plus size={17} /> {t('addStation')}</Link> : <Link to="/register?type=business" className="secondary-button"><BriefcaseBusiness size={17} />{t('forBusiness')}</Link>}
        </div>
        <button onClick={() => setMobileOpen((value) => !value)} className="icon-button ml-auto size-11 lg:hidden" aria-label={t('toggleMenu')} aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      {mobileOpen && <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#0b1712] lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="secondary-button justify-center">{t('map')}</Link>
          {(user?.role === 'business' || user?.role === 'admin') ? <Link to="/business" onClick={() => setMobileOpen(false)} className="primary-button justify-center">{t('addStation')}</Link> : <Link to="/register?type=business" onClick={() => setMobileOpen(false)} className="primary-button justify-center"><BriefcaseBusiness size={16} />{t('forBusiness')}</Link>}
        </div>
        {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="secondary-button mt-2 w-full justify-center"><ShieldCheck size={17} />{t('adminPanel')}</Link>}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">{['en', 'ru', 'uz'].map((language) => <button type="button" key={language} onClick={() => changeLanguage(language)} aria-pressed={activeLanguage === language} className={`min-h-10 rounded-lg px-3 text-xs font-bold uppercase ${activeLanguage === language ? 'bg-white shadow dark:bg-white/10' : ''}`}>{language}</button>)}</div>
          <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label={t('toggleTheme')}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">{user ? <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10"><UserRound size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{user.name}</p><p className="truncate text-[11px] text-slate-400">{user.email}</p></div><button onClick={() => { logout(); setMobileOpen(false) }} className="icon-button text-rose-500" aria-label={t('logout')}><LogOut size={17} /></button></div> : <Link to="/register" onClick={() => setMobileOpen(false)} className="secondary-button w-full justify-center"><UserRound size={17} />{t('registration')}</Link>}</div>
      </div>}
    </header>
  )
}
