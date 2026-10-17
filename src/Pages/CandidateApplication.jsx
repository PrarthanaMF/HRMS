import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchableSelect from '../Components/Common/SearchableSelect'
import { DatePicker } from '../Components/Common/DateTimePicker'
import PageHeader, { primaryButton } from '../Components/Common/PageHeader'

import Icon from '../Components/Common/Icon'
const EMPTY_FORM = {
  name: '', email: '', mobile: '', altPhone: '', dob: '', gender: '',
  positionApplied: '', department: '', location: '', hrName: '',
  presentAddress: '', permanentAddress: '',
  qualification: '', specialization: '', institution: '', yearOfPassing: '',
  totalExperience: '', previousCompany: '', previousDesignation: '',
  lastSalary: '', noticePeriod: '', expectedSalary: '',
  declaration: false,
}

// Maps a form field to the URL query param that can pre-fill it.
const PREFILL_PARAM_MAP = {
  positionApplied: 'position',
  department: 'department',
  location: 'location',
  hrName: 'hrName',
}

const FILE_FIELDS = [
  { key: 'photo', label: 'Passport size photo', hint: 'JPG or PNG', icon: 'fa-image' },
  { key: 'resume', label: 'Resume / CV', hint: 'PDF or DOC', icon: 'fa-file-lines' },
  { key: 'idProof', label: 'ID proof (Aadhaar / PAN)', hint: 'Clear, coloured scan', icon: 'fa-id-card' },
  { key: 'tenthCertificate', label: '10th certificate', hint: 'PDF or image', icon: 'fa-graduation-cap' },
  { key: 'twelfthCertificate', label: '12th certificate', hint: 'PDF or image', icon: 'fa-graduation-cap' },
  { key: 'degreeCertificate', label: 'Degree certificate', hint: 'PDF or image', icon: 'fa-graduation-cap' },
]

const SectionTitle = ({ icon, children }) => (
  <div className='flex items-center gap-2.5 mb-5'>
    <span aria-hidden='true' className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60'>
      <Icon className={`fa-solid ${icon} text-[13px]`} />
    </span>
    <h2 className='text-[15px] font-semibold text-[var(--ink)]'>{children}</h2>
    <span className='flex-1 h-px bg-slate-200/70'></span>
  </div>
)

const Field = ({ label, required, error, prefilled, children }) => (
  <div>
    <label className='block text-[13px] font-medium text-slate-700 mb-1.5'>
      {label}{required && <span className='text-red-500 ml-0.5'>*</span>}
    </label>
    {children}
    {prefilled && (
      <span className='inline-block mt-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200'>
        Filled in from your invite link
      </span>
    )}
    {error && <p className='text-[12px] text-red-600 mt-1'>{error}</p>}
  </div>
)

const inputClass = (hasError) =>
  `w-full h-10 px-3 bg-white/80 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2b6485] ${
    hasError ? 'border-red-300' : 'border-slate-200/80'
  }`

// Textareas share the input look without the fixed height
const textareaClass = 'w-full px-3 py-2.5 bg-white/80 border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2b6485]'

const panelClass = 'glass-panel rounded-2xl p-5 md:p-6'

const CandidateApplicationForm = () => {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(EMPTY_FORM)
  const [prefilledFields, setPrefilledFields] = useState({})
  const [files, setFiles] = useState({})
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [topError, setTopError] = useState('')

  useEffect(() => {
    const updates = {}
    const marked = {}
    Object.entries(PREFILL_PARAM_MAP).forEach(([field, param]) => {
      const value = searchParams.get(param)
      if (value) {
        updates[field] = value
        marked[field] = true
      }
    })
    if (Object.keys(updates).length) {
      setForm((prev) => ({ ...prev, ...updates }))
      setPrefilledFields(marked)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    // Once the candidate edits a pre-filled field, stop showing the badge for it.
    if (prefilledFields[name]) {
      setPrefilledFields((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleFile = (key, e) => {
    const file = e.target.files[0] || null
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please enter your full name.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email.'
    if (!form.mobile.trim()) next.mobile = 'Please enter a valid mobile number.'
    if (!form.positionApplied.trim()) next.positionApplied = 'Please enter the position applied for.'
    setErrors(next)
    if (!form.declaration) {
      setTopError('Please accept the declaration before submitting.')
      return false
    }
    setTopError('')
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      // TODO: replace with your actual submit call, e.g.
      // await api.post('/candidates/apply', { ...form, files })
      await new Promise((res) => setTimeout(res, 800))
      setSubmitted(true)
    } catch (err) {
      setTopError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center px-4 py-10'>
        <div className='rise glass-panel max-w-md w-full rounded-2xl p-8 sm:p-10 text-center'>
          <div aria-hidden='true' className='w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200 flex items-center justify-center text-2xl mx-auto mb-5'>
            <Icon className='fa-solid fa-check' />
          </div>
          <h2 className='text-xl font-semibold text-[var(--ink)] mb-2'>Application submitted</h2>
          <p className='text-sm text-slate-500 leading-relaxed'>
            Thank you for applying to Maruti Flex Traders LLP. Our HR team will review your
            details and reach out if your profile matches an open position.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full'>
      <div className='w-full max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12'>

        {/* Company mark */}
        <div className='mb-6 flex items-center gap-3'>
          <div aria-hidden='true' className='glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-[var(--brand-600)]'>
            MF
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-semibold leading-tight text-[var(--ink)]'>Maruti Flex Traders LLP</p>
            <p className='text-xs text-slate-500'>Candidate application portal</p>
          </div>
        </div>

        <PageHeader
          icon='fa-solid fa-file-lines'
          title='Candidate details'
          description='Please share the relevant details and attach the required documents. Kindly upload clear and coloured documents.'
        />

        {topError && (
          <div role='alert' className='flex items-start gap-2 rounded-xl bg-red-50 ring-1 ring-inset ring-red-200 p-3 mb-5'>
            <Icon className='fa-solid fa-circle-exclamation text-red-500 text-sm mt-0.5' />
            <p className='text-red-700 text-[13px]'>{topError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>

          <div className={`${panelClass} rise`} style={{ '--i': 1 }}>
            <SectionTitle icon='fa-user'>Personal information</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div className='md:col-span-2'>
                <Field label='Name' required error={errors.name}>
                  <input name='name' value={form.name} onChange={handleChange}
                    placeholder='Full name as per official documents' className={inputClass(errors.name)} />
                </Field>
              </div>
              <Field label='E-mail ID' required error={errors.email}>
                <input name='email' type='email' value={form.email} onChange={handleChange}
                  placeholder='email@example.com' className={inputClass(errors.email)} />
              </Field>
              <Field label='Mobile number' required error={errors.mobile}>
                <input name='mobile' type='tel' value={form.mobile} onChange={handleChange}
                  placeholder='eg. 9633******' className={inputClass(errors.mobile)} />
              </Field>
              <Field label='Alternative phone number'>
                <input name='altPhone' type='tel' value={form.altPhone} onChange={handleChange}
                  placeholder='Optional' className={inputClass(false)} />
              </Field>
              <Field label='Date of birth'>
                <DatePicker value={form.dob} onChange={(value) => handleChange({ target: { name: 'dob', value } })} placeholder='Date of birth' />
              </Field>
              <Field label='Gender'>
                <SearchableSelect name='gender' value={form.gender} onChange={handleChange}
                  options={['Male', 'Female', 'Other']} bare />
              </Field>
            </div>
          </div>

          <div className={panelClass}>
            <SectionTitle icon='fa-briefcase'>Position applied for</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <Field label='Position / designation' required error={errors.positionApplied} prefilled={prefilledFields.positionApplied}>
                <input name='positionApplied' value={form.positionApplied} onChange={handleChange}
                  placeholder='eg. Sales Executive' className={inputClass(errors.positionApplied)} />
              </Field>
              <Field label='Preferred department' prefilled={prefilledFields.department}>
                <input name='department' value={form.department} onChange={handleChange}
                  placeholder='eg. Sales, Accounts, HR' className={inputClass(false)} />
              </Field>
              <Field label='Location' required prefilled={prefilledFields.location}>
                <input name='location' value={form.location} onChange={handleChange}
                  placeholder='eg. Bangalore' className={inputClass(false)} />
              </Field>
              <Field label='HR name' required prefilled={prefilledFields.hrName}>
                <input name='hrName' value={form.hrName} onChange={handleChange}
                  placeholder='Point of contact from HR' className={inputClass(false)} />
              </Field>
            </div>
          </div>

          <div className={panelClass}>
            <SectionTitle icon='fa-location-dot'>Address details</SectionTitle>
            <div className='grid grid-cols-1 gap-5'>
              <Field label='Present address'>
                <textarea name='presentAddress' rows={2} value={form.presentAddress} onChange={handleChange}
                  placeholder='Current residential address' className={textareaClass} />
              </Field>
              <Field label='Permanent address'>
                <textarea name='permanentAddress' rows={2} value={form.permanentAddress} onChange={handleChange}
                  placeholder='Permanent address (if different)' className={textareaClass} />
              </Field>
            </div>
          </div>

          <div className={panelClass}>
            <SectionTitle icon='fa-graduation-cap'>Education details</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <Field label='Highest qualification'>
                <input name='qualification' value={form.qualification} onChange={handleChange}
                  placeholder='eg. B.Com, MBA' className={inputClass(false)} />
              </Field>
              <Field label='Specialization'>
                <input name='specialization' value={form.specialization} onChange={handleChange}
                  placeholder='eg. Finance, Marketing' className={inputClass(false)} />
              </Field>
              <Field label='Institution / university'>
                <input name='institution' value={form.institution} onChange={handleChange}
                  placeholder='Name of institution' className={inputClass(false)} />
              </Field>
              <Field label='Year of passing'>
                <input name='yearOfPassing' type='number' value={form.yearOfPassing} onChange={handleChange}
                  placeholder='eg. 2023' className={inputClass(false)} />
              </Field>
            </div>
          </div>

          <div className={panelClass}>
            <SectionTitle icon='fa-building'>Work experience</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <Field label='Total experience'>
                <input name='totalExperience' value={form.totalExperience} onChange={handleChange}
                  placeholder='eg. 2.5 years / Fresher' className={inputClass(false)} />
              </Field>
              <Field label='Previous company'>
                <input name='previousCompany' value={form.previousCompany} onChange={handleChange}
                  placeholder='Most recent employer' className={inputClass(false)} />
              </Field>
              <Field label='Previous designation'>
                <input name='previousDesignation' value={form.previousDesignation} onChange={handleChange}
                  placeholder='Your last role' className={inputClass(false)} />
              </Field>
              <Field label='Notice period'>
                <input name='noticePeriod' value={form.noticePeriod} onChange={handleChange}
                  placeholder='eg. Immediate, 30 days' className={inputClass(false)} />
              </Field>
              <Field label='Last drawn salary'>
                <input name='lastSalary' value={form.lastSalary} onChange={handleChange}
                  placeholder='eg. ₹25,000/month' className={inputClass(false)} />
              </Field>
              <Field label='Expected salary'>
                <input name='expectedSalary' value={form.expectedSalary} onChange={handleChange}
                  placeholder='eg. ₹30,000/month' className={inputClass(false)} />
              </Field>
            </div>
          </div>

          <div className={panelClass}>
            <SectionTitle icon='fa-cloud-arrow-up'>Document upload</SectionTitle>
            <div className='flex items-start gap-2 rounded-xl bg-[#f2f5f7] ring-1 ring-inset ring-[#cfdce5]/60 p-3 mb-5'>
              <Icon className='fa-solid fa-circle-info text-[var(--brand-600)] text-sm mt-0.5' />
              <p className='text-slate-700 text-[13px]'>Please upload clear, coloured scans or photos. Accepted formats: JPG, PNG, PDF.</p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5'>
              {FILE_FIELDS.map(({ key, label, hint, icon }) => (
                <div key={key}>
                  <label className='block text-[13px] font-medium text-slate-700 mb-1.5'>{label}</label>
                  <label className={`relative flex flex-col items-center justify-center text-center border border-dashed rounded-xl py-5 px-3 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${files[key] ? 'border-[#cfdce5] bg-[#f2f5f7]/70' : 'border-slate-300 bg-white/60 hover:border-[#cfdce5] hover:bg-[#f2f5f7]/60'}`}>
                    <input type='file' aria-label={label} className='absolute inset-0 opacity-0 cursor-pointer'
                      onChange={(e) => handleFile(key, e)} />
                    <Icon className={`fa-solid ${files[key] ? 'fa-circle-check text-emerald-600' : `${icon} text-[var(--brand-600)]`} text-lg mb-1.5`} />
                    <span className='max-w-full truncate text-[13px] font-semibold text-slate-700'>
                      {files[key] ? files[key].name : 'Click to upload'}
                    </span>
                    <span className='text-xs text-slate-500 mt-0.5'>{hint}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className={panelClass}>
            <label className='flex items-start gap-2.5 text-sm text-slate-600 mb-5 cursor-pointer'>
              <input type='checkbox' name='declaration' checked={form.declaration} onChange={handleChange}
                className='mt-0.5 h-4 w-4 shrink-0 accent-[#1f4e6b]' />
              I hereby declare that the information provided above is true and correct to the best of my knowledge.
            </label>
            <div className='flex justify-end'>
              <button type='submit' disabled={submitting} className={`${primaryButton} w-full sm:w-auto`}>
                <Icon className='fa-solid fa-paper-plane text-xs' />
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CandidateApplicationForm
