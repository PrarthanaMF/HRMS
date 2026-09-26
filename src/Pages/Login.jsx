import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateAuth } from '../Store/Redux/Login/AuthSlice'
import { MOCK_USERS } from '../Utils/mockUsers'
import logo from '../assets/logo.png'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [empId, setEmpId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!empId || !password) {
      setError('Please enter both Employee ID and Password')
      return
    }

    const user = MOCK_USERS[empId.trim()]

    // Check user exists AND password matches
    if (!user || user.password !== password) {
      setError('Invalid Employee ID or Password')
      return
    }

    dispatch(updateAuth({
      empId: user.empId,
      name: user.name,
      role: user.role,
      branches: user.branches,
      designation: user.designation,
      department: user.department,
      email: user.email,
      phone: user.phone,
      _id: user._id,
      token: user.token,
    }))

    navigate('/')
  }

  return (
    <div className='min-h-screen flex bg-slate-50'>

      {/* LEFT: Branding Panel */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#062139] relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl'></div>
        </div>

        <div className='relative z-10 flex flex-col justify-between p-12 w-full'>
          <div className='flex items-center gap-3'>
            <img src={logo} className='w-10 h-10 object-contain' alt='Marutiflex logo' />
            <h1 className='text-white text-xl font-bold'>Marutiflex</h1>
          </div>

          <div>
            <h2 className='text-white text-4xl font-bold leading-tight mb-4'>
              Manage your workforce,<br />effortlessly.
            </h2>
            <p className='text-slate-300 text-base mb-8 max-w-md'>
              Everything you need to run HR, payroll, attendance and more — in one powerful dashboard.
            </p>

            <div className='space-y-3'>
              {['Manage 1000+ employees easily', 'Real-time attendance & payroll', 'Role-based access control'].map((item, i) => (
                <div key={i} className='flex items-center gap-3 text-slate-200'>
                  <div className='w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center'>
                    <i className="fa-solid fa-check text-emerald-400 text-xs"></i>
                  </div>
                  <span className='text-sm'>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className='text-slate-400 text-xs'>© 2025 Marutiflex. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center px-6 py-10'>
        <div className='w-full max-w-md'>

          {/* Mobile logo */}
          <div className='lg:hidden flex items-center justify-center gap-3 mb-8'>
            <img src={logo} className='w-10 h-10 object-contain' alt='Marutiflex logo' />
            <h1 className='text-[#062139] text-xl font-bold'>Marutiflex</h1>
          </div>

          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-slate-800 mb-1'>Welcome back</h2>
            <p className='text-sm text-slate-500'>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>

            {/* Employee ID */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>Employee ID</label>
              <div className='relative'>
                <i className="fa-solid fa-id-badge absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder='e.g. 1001'
                  className='w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-[#062139] focus:ring-4 focus:ring-slate-100 transition'
                />
              </div>
            </div>

            {/* Password */}
            {/* Password */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>
                Password
              </label>
              <div className='relative'>
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  maxLength={4}
                  className='w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-[#062139] focus:ring-4 focus:ring-slate-100 transition'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>

              {/* Forgot password — right-aligned, below the input */}
              <div className='flex justify-end mt-2'>
                <button type='button' className='text-xs text-[#062139] hover:underline font-medium'>
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className='flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3'>
                <i className="fa-solid fa-circle-exclamation text-red-500 text-sm mt-0.5"></i>
                <p className='text-red-600 text-xs'>{error}</p>
              </div>
            )}

            <button
              type='submit'
              className='w-full bg-[#062139] hover:bg-[#0a2f52] text-white py-3 rounded-lg font-semibold text-sm transition shadow-sm hover:shadow-md'
            >
              Sign in
            </button>
          </form>

          <p className='text-center text-xs text-slate-400 mt-8'>
            Contact your administrator if you don't have login credentials.
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login