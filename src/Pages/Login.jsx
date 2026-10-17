import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateAuth } from '../Store/Redux/Login/AuthSlice'
import { login } from '../api/auth'
import logo from '../assets/logo.png'
import Icon from '../Components/Common/Icon'

const TIME_ZONE = 'Asia/Kolkata'
// The standard office day the clock ring fills through
const DAY_START = 9 * 60
const DAY_END = 18 * 60

const MODULES = ['Attendance', 'Leave & approvals', 'Recruitment', 'Exit process']

const inputClass = 'peer h-14 w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-4 pt-4 text-[15px] text-white placeholder-transparent transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/20 focus:border-[#9fb8c9]/70 focus:bg-black/35 focus:outline-none focus:ring-4 focus:ring-[#2b6485]/20'
const floatingLabel = 'pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 transition-all duration-200 peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-[#9fb8c9] peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px]'

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

// Live clock with a ring that fills through the office day
function DayClock() {
  const now = useNow()
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TIME_ZONE }).formatToParts(now).map((part) => [part.type, part.value]))
  const minutes24 = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: TIME_ZONE }).format(now)) * 60 + Number(parts.minute)
  const progress = Math.min(1, Math.max(0, (minutes24 - DAY_START) / (DAY_END - DAY_START)))
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE })
  const circumference = 2 * Math.PI * 44
  const status = minutes24 < DAY_START ? 'The office day starts at 9:00 AM' : minutes24 >= DAY_END ? 'The office day is over' : `${Math.round(progress * 100)}% of the office day done`

  return (
    <div className='inline-flex items-center gap-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 pr-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md'>
      <div className='relative h-[104px] w-[104px] shrink-0'>
        <svg viewBox='0 0 100 100' className='h-full w-full -rotate-90' aria-hidden='true'>
          <circle cx='50' cy='50' r='44' fill='none' stroke='rgb(255 255 255 / 0.08)' strokeWidth='5' strokeDasharray='2 4' />
          <circle cx='50' cy='50' r='44' fill='none' stroke='url(#login-ring)' strokeWidth='5' strokeLinecap='round' strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} className='transition-[stroke-dashoffset] duration-1000 ease-out' />
          <defs>
            <linearGradient id='login-ring' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0%' stopColor='#4a8cb0' />
              <stop offset='100%' stopColor='#1f4e6b' />
            </linearGradient>
          </defs>
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center text-white'>
          <span className='font-display text-[30px] leading-none'>{parts.hour}:{parts.minute}</span>
          <span className='mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400'>{parts.dayPeriod} IST</span>
        </div>
      </div>
      <div className='min-w-0'>
        <p className='text-[15px] font-semibold text-white'>{date}</p>
        <p className='mt-1 text-[14px] font-medium text-[#9fb8c9]'>{status}</p>
        <p className='mt-1 text-[12px] text-slate-400'>Office hours 9:00 AM – 6:00 PM</p>
      </div>
    </div>
  )
}

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!loginId.trim() || !password) {
      setError('Enter your employee ID and password.')
      return
    }

    setSubmitting(true)
    try {
      // The server sets the login cookie; we keep only who is signed in
      dispatch(updateAuth(await login(loginId.trim(), password)))
      navigate('/')
    } catch (err) {
      // e.g. "Invalid employee ID or password", "Account is inactive", too many attempts
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='smoke-dark flex min-h-dvh flex-col'>
      {/* Extra light fields for the full-page smoke */}
      <span aria-hidden='true' className='pointer-events-none absolute -left-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#2b6485]/40 blur-[110px]' />
      <span aria-hidden='true' className='pointer-events-none absolute -bottom-48 -right-40 -z-10 h-[36rem] w-[36rem] rounded-full bg-[#2b6485]/25 blur-[120px] [animation:aurora_26s_var(--ease-out)_infinite_alternate]' />

      <header className='flex items-center justify-between px-6 pt-6 sm:px-12 sm:pt-8'>
        <span className='flex items-center gap-3'>
          <img src={logo} className='h-11 w-11 rounded-2xl bg-white object-contain p-1.5 shadow-[0_10px_24px_-12px_rgb(0_0_0/0.6)]' alt='' />
          <span className='leading-tight'>
            <span className='block text-[15px] font-bold tracking-[0.16em] text-white'>HRMS</span>
            <span className='block text-[13px] text-slate-400'>Marutiflex</span>
          </span>
        </span>
        <span className='hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-slate-300 backdrop-blur sm:inline-flex'>
          <Icon className='fa-solid fa-shield-halved text-[13px] text-emerald-400' />
          Signed-in access only
        </span>
      </header>

      <main className='mx-auto grid w-full max-w-[1240px] flex-1 items-center gap-12 px-6 py-10 sm:px-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,460px)]'>
        {/* The welcome side */}
        <section aria-label='About' className='rise hidden lg:block'>
          <p className='eyebrow'>People operations</p>
          <h1 className='mt-6 font-display text-[68px] leading-[0.98] text-white'>
            Your people, attendance and approvals,{' '}
            <span className='gradient-text italic'>in one place.</span>
          </h1>
          <p className='mt-6 max-w-[46ch] text-[16px] leading-7 text-slate-300'>
            Punches, leave, work from home and every approval, with the history kept for HR.
          </p>
          <div className='mt-8'>
            <DayClock />
          </div>
          <ul className='mt-6 flex flex-wrap gap-2' aria-label='Modules'>
            {MODULES.map((name) => (
              <li key={name} className='rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-slate-300 backdrop-blur'>{name}</li>
            ))}
          </ul>
        </section>

        {/* Sign in */}
        <section aria-labelledby='sign-in-title' className='rise relative mx-auto w-full max-w-[460px]' style={{ '--i': 2 }}>
          <div className='relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-7 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-xl sm:p-9'>
            <span aria-hidden='true' className='pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#2b6485]/25 blur-3xl' />
            <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400'>Sign in</p>
            <h2 id='sign-in-title' className='mt-2 font-display text-[40px] leading-none text-white'>Welcome back</h2>
            <p className='mt-2 text-[14px] text-slate-400'>Use your employee ID. Admins without one use their email.</p>

            <form onSubmit={handleSubmit} noValidate className='mt-7 space-y-4'>
              <div className='relative'>
                <Icon className='fa-regular fa-user pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[17px] text-slate-400' />
                <input
                  id='login-id'
                  name='username'
                  type='text'
                  autoComplete='username'
                  autoCapitalize='characters'
                  spellCheck={false}
                  placeholder='Employee ID or email'
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  aria-invalid={error && !loginId.trim() ? true : undefined}
                  className={inputClass}
                />
                <label htmlFor='login-id' className={floatingLabel}>Employee ID or email</label>
              </div>

              <div className='relative'>
                <Icon className='fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[17px] text-slate-400' />
                <input
                  id='login-password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  placeholder='Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error && !password ? true : undefined}
                  className={`${inputClass} pr-14`}
                />
                <label htmlFor='login-password' className={floatingLabel}>Password</label>
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className='press absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white'
                >
                  <Icon className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[17px]`} />
                </button>
              </div>

              {error && (
                <div role='alert' className='flex items-start gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 p-3'>
                  <Icon className='fa-solid fa-circle-exclamation mt-0.5 text-[15px] text-red-300' />
                  <p className='text-[13px] text-red-200'>{error}</p>
                </div>
              )}

              <button type='submit' disabled={submitting} className='press gradient-accent flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fb8c9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e2a47] disabled:opacity-60'>
                {submitting && <Icon className='fa-solid fa-spinner animate-spin' />}
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className='mt-6 border-t border-white/10 pt-5 text-center'>
              <button type='button' onClick={() => setShowReset((open) => !open)} aria-expanded={showReset} aria-controls='reset-help' className='rounded text-[13px] font-medium text-slate-400 underline-offset-4 hover:text-[#9fb8c9] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fb8c9]'>
                Forgot your password?
              </button>
              {showReset && (
                <p id='reset-help' className='mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[13px] text-slate-300'>
                  Passwords are reset by HR. Ask your HR team or administrator to reset yours, then sign in with the new one.
                </p>
              )}
            </div>
          </div>
          <p className='mt-4 text-center text-[12px] text-slate-500'>© {new Date().getFullYear()} Marutiflex. Accounts are created by HR.</p>
        </section>
      </main>
    </div>
  )
}

export default Login
