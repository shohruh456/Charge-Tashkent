import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, BatteryCharging, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../services/toast'

const userSchema = z.object({
  name: z.string().trim().min(2, 'Введите минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  consent: z.boolean().refine(Boolean, { message: 'Подтвердите согласие' }),
})

const adminSchema = z.object({ email: z.string().email('Введите email'), password: z.string().min(1, 'Введите пароль') })

export function Register() {
  const [mode, setMode] = useState('register')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const registerUser = useAuthStore((state) => state.register)
  const loginAdmin = useAuthStore((state) => state.loginAdmin)
  const userForm = useForm({ resolver: zodResolver(userSchema), defaultValues: { name: '', email: '', password: '', consent: false } })
  const adminForm = useForm({ resolver: zodResolver(adminSchema), defaultValues: { email: 'admin@charge.uz', password: 'admin123' } })
  const requestedPath = searchParams.get('next')
  const nextPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/manage'

  const submitRegistration = ({ name, email }) => {
    registerUser({ name, email })
    toast('Регистрация завершена')
    navigate(nextPath, { replace: true })
  }

  const submitAdmin = (values) => {
    if (!loginAdmin(values)) {
      adminForm.setError('password', { message: 'Неверный email или пароль' })
      return
    }
    toast('Вход администратора выполнен')
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,.16),transparent_30%)] px-3 py-8 sm:min-h-[calc(100dvh-4.5rem)] sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0b1712] lg:grid-cols-[.85fr_1.15fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-800 p-10 text-white lg:block"><div className="absolute -right-20 -top-20 size-64 rounded-full border-[40px] border-white/5" /><BatteryCharging size={40} /><h1 className="mt-10 text-4xl font-black leading-tight">Добавляйте зарядные станции Ташкента</h1><p className="mt-4 text-sm leading-relaxed text-emerald-50">Зарегистрируйтесь, отправьте станцию на проверку и следите за решением администратора.</p><div className="mt-10 space-y-4">{['Безопасная отправка заявки', 'Проверка администратором', 'Публикация на общей карте'].map((text) => <p key={text} className="flex items-center gap-3 text-sm font-bold"><ShieldCheck size={19} />{text}</p>)}</div></aside>
        <main className="p-5 sm:p-9">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5"><button onClick={() => setMode('register')} className={`min-h-11 flex-1 rounded-lg text-sm font-extrabold transition ${mode === 'register' ? 'bg-white shadow-sm dark:bg-white/10' : 'text-slate-500'}`}>Регистрация</button><button onClick={() => setMode('admin')} className={`min-h-11 flex-1 rounded-lg text-sm font-extrabold transition ${mode === 'admin' ? 'bg-white shadow-sm dark:bg-white/10' : 'text-slate-500'}`}>Администратор</button></div>

          {mode === 'register' ? <form onSubmit={userForm.handleSubmit(submitRegistration)} className="mt-7 space-y-5"><div><p className="eyebrow">Новый аккаунт</p><h2 className="mt-2 text-2xl font-black">Создать аккаунт</h2><p className="mt-1 text-sm text-slate-500">Регистрация нужна для отправки станции.</p></div><AuthField label="Ваше имя" error={userForm.formState.errors.name}><input {...userForm.register('name')} className="field" autoComplete="name" placeholder="Например, Шохрух" /></AuthField><AuthField label="Email" error={userForm.formState.errors.email}><input {...userForm.register('email')} className="field" type="email" autoComplete="email" placeholder="you@example.com" /></AuthField><AuthField label="Пароль" error={userForm.formState.errors.password}><input {...userForm.register('password')} className="field" type="password" autoComplete="new-password" placeholder="Минимум 6 символов" /></AuthField><label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-slate-500"><input {...userForm.register('consent')} type="checkbox" className="mt-0.5 size-4 accent-emerald-500" /><span>Я подтверждаю корректность данных и согласен с правилами публикации станций.</span></label>{userForm.formState.errors.consent && <p className="text-xs font-semibold text-rose-500">{userForm.formState.errors.consent.message}</p>}<button className="primary-button min-h-12 w-full justify-center"><UserPlus size={18} />Зарегистрироваться <ArrowRight size={17} /></button></form>
          : <form onSubmit={adminForm.handleSubmit(submitAdmin)} className="mt-7 space-y-5"><div><p className="eyebrow">Закрытая зона</p><h2 className="mt-2 text-2xl font-black">Вход администратора</h2><p className="mt-1 text-sm text-slate-500">Демо-доступ уже заполнен для презентации.</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"><b>Демо:</b> admin@charge.uz / admin123</div><AuthField label="Admin email" error={adminForm.formState.errors.email}><input {...adminForm.register('email')} className="field" type="email" autoComplete="username" /></AuthField><AuthField label="Пароль" error={adminForm.formState.errors.password}><input {...adminForm.register('password')} className="field" type="password" autoComplete="current-password" /></AuthField><button className="primary-button min-h-12 w-full justify-center"><LockKeyhole size={18} />Войти в админ-панель</button></form>}
        </main>
      </div>
    </div>
  )
}

function AuthField({ label, error, children }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold">{label}</span>{children}{error && <span className="mt-1.5 block text-xs font-semibold text-rose-500">{error.message}</span>}</label> }
