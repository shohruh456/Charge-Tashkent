import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, BatteryCharging, BriefcaseBusiness, CarFront, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../services/toast'
import { useTranslation } from 'react-i18next'

const createUserSchema = (t) => z.object({
  role: z.enum(['user', 'business']),
  name: z.string().trim().min(2, t('validationMin2')),
  email: z.string().email(t('validationEmail')),
  password: z.string().min(6, t('validationPassword6')),
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  consent: z.boolean().refine(Boolean, { message: t('validationConsent') }),
}).superRefine((values, context) => {
  if (values.role === 'business' && (!values.company || values.company.length < 2)) context.addIssue({ code: 'custom', path: ['company'], message: t('validationCompany') })
  if (values.role === 'business' && (!values.phone || values.phone.length < 7)) context.addIssue({ code: 'custom', path: ['phone'], message: t('validationPhone') })
})

const createAdminSchema = (t) => z.object({ email: z.string().email(t('validationEmail')), password: z.string().min(1, t('validationRequiredPassword')) })

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type') === 'business' ? 'business' : 'user'
  const [mode, setMode] = useState('register')
  const [accountType, setAccountType] = useState(requestedType)
  const registerUser = useAuthStore((state) => state.register)
  const loginAdmin = useAuthStore((state) => state.loginAdmin)
  const userForm = useForm({ resolver: zodResolver(createUserSchema(t)), defaultValues: { role: requestedType, name: '', email: '', password: '', company: '', phone: '', consent: false } })
  const adminForm = useForm({ resolver: zodResolver(createAdminSchema(t)), defaultValues: { email: '', password: '' } })
  const requestedPath = searchParams.get('next')
  const nextPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/'

  const chooseAccountType = (role) => {
    setAccountType(role)
    userForm.setValue('role', role, { shouldValidate: true })
  }

  const submitRegistration = ({ name, email, role, company, phone }) => {
    registerUser({ name, email, role, company, phone })
    toast(t(role === 'business' ? 'businessAccountCreated' : 'registrationComplete'))
    const destination = role === 'business' ? '/business' : ['/manage', '/business', '/admin'].includes(nextPath) ? '/' : nextPath
    navigate(destination, { replace: true })
  }

  const submitAdmin = (values) => {
    if (!loginAdmin(values)) {
      adminForm.setError('password', { message: t('invalidCredentials') })
      return
    }
    toast(t('adminSignedIn'))
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,.16),transparent_30%)] px-3 py-8 sm:min-h-[calc(100dvh-4.5rem)] sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0b1712] lg:grid-cols-[.85fr_1.15fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-800 p-10 text-white lg:block"><div className="absolute -right-20 -top-20 size-64 rounded-full border-[40px] border-white/5" /><BatteryCharging size={40} /><h1 className="mt-10 text-4xl font-black leading-tight">{t('registerHero')}</h1><p className="mt-4 text-sm leading-relaxed text-emerald-50">{t('registerHeroText')}</p><div className="mt-10 space-y-4">{['featureBooking', 'featureOwner', 'featureModeration'].map((key) => <p key={key} className="flex items-center gap-3 text-sm font-bold"><ShieldCheck size={19} />{t(key)}</p>)}</div></aside>
        <main className="p-5 sm:p-9">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5"><button onClick={() => setMode('register')} className={`min-h-11 flex-1 rounded-lg text-sm font-extrabold transition ${mode === 'register' ? 'bg-white shadow-sm dark:bg-white/10' : 'text-slate-500'}`}>{t('registration')}</button><button onClick={() => setMode('admin')} className={`min-h-11 flex-1 rounded-lg text-sm font-extrabold transition ${mode === 'admin' ? 'bg-white shadow-sm dark:bg-white/10' : 'text-slate-500'}`}>{t('admin')}</button></div>
          {mode === 'register' ? <RegistrationForm t={t} form={userForm} accountType={accountType} chooseAccountType={chooseAccountType} onSubmit={submitRegistration} /> : <AdminLogin t={t} form={adminForm} onSubmit={submitAdmin} />}
        </main>
      </div>
    </div>
  )
}

function RegistrationForm({ t, form, accountType, chooseAccountType, onSubmit }) {
  return <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-5"><div><p className="eyebrow">{t('newAccount')}</p><h2 className="mt-2 text-2xl font-black">{t('chooseAccountType')}</h2><p className="mt-1 text-sm text-slate-500">{t('accountTypeHint')}</p></div><div className="grid grid-cols-2 gap-2"><AccountTypeButton active={accountType === 'user'} onClick={() => chooseAccountType('user')} icon={CarFront} title={t('driver')} text={t('driverHint')} color="emerald" /><AccountTypeButton active={accountType === 'business'} onClick={() => chooseAccountType('business')} icon={BriefcaseBusiness} title={t('business')} text={t('businessHint')} color="violet" /></div><AuthField label={t(accountType === 'business' ? 'ownerName' : 'yourName')} error={form.formState.errors.name}><input {...form.register('name')} className="field" autoComplete="name" placeholder={t('nameExample')} /></AuthField>{accountType === 'business' && <div className="grid gap-4 sm:grid-cols-2"><AuthField label={t('companyName')} error={form.formState.errors.company}><input {...form.register('company')} className="field" placeholder="Green Charge" /></AuthField><AuthField label={t('phone')} error={form.formState.errors.phone}><input {...form.register('phone')} className="field" type="tel" autoComplete="tel" placeholder="+998 90 123 45 67" /></AuthField></div>}<AuthField label={t('email')} error={form.formState.errors.email}><input {...form.register('email')} className="field" type="email" autoComplete="email" placeholder="you@example.com" /></AuthField><AuthField label={t('password')} error={form.formState.errors.password}><input {...form.register('password')} className="field" type="password" autoComplete="new-password" placeholder={t('passwordMinPlaceholder')} /></AuthField><label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-slate-500"><input {...form.register('consent')} type="checkbox" className="mt-0.5 size-4 accent-emerald-500" /><span>{t('consent')}</span></label>{form.formState.errors.consent && <p className="text-xs font-semibold text-rose-500">{form.formState.errors.consent.message}</p>}<button className="primary-button min-h-12 w-full justify-center"><UserPlus size={18} />{t(accountType === 'business' ? 'createBusinessAccount' : 'createAccount')} <ArrowRight size={17} /></button></form>
}

function AdminLogin({ t, form, onSubmit }) { return <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-5"><div><p className="eyebrow">{t('closedArea')}</p><h2 className="mt-2 text-2xl font-black">{t('adminLogin')}</h2><p className="mt-1 text-sm text-slate-500">{t('adminLoginHint')}</p></div><AuthField label={`Admin ${t('email')}`} error={form.formState.errors.email}><input {...form.register('email')} className="field" type="email" autoComplete="username" placeholder="admin@example.com" /></AuthField><AuthField label={t('password')} error={form.formState.errors.password}><input {...form.register('password')} className="field" type="password" autoComplete="current-password" placeholder={t('enterPassword')} /></AuthField><button className="primary-button min-h-12 w-full justify-center"><LockKeyhole size={18} />{t('signInAdmin')}</button></form> }
function AccountTypeButton({ active, onClick, icon: Icon, title, text, color }) { const activeClass = color === 'violet' ? 'border-violet-500 bg-violet-50 ring-violet-500/10 dark:bg-violet-400/10' : 'border-emerald-500 bg-emerald-50 ring-emerald-500/10 dark:bg-emerald-400/10'; return <button type="button" onClick={onClick} className={`rounded-2xl border p-3 text-left transition sm:p-4 ${active ? `${activeClass} ring-4` : 'border-slate-200 dark:border-white/10'}`}><Icon size={22} className={color === 'violet' ? 'text-violet-500' : 'text-emerald-500'} /><b className="mt-3 block text-sm">{title}</b><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">{text}</span></button> }
function AuthField({ label, error, children }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold">{label}</span>{children}{error && <span className="mt-1.5 block text-xs font-semibold text-rose-500">{error.message}</span>}</label> }
