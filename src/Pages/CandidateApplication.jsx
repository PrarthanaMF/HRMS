import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchableSelect from '../Components/Common/SearchableSelect'

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
  { key: 'photo', label: 'Passport Size Photo', hint: 'JPG or PNG', icon: 'fa-image' },
  { key: 'resume', label: 'Resume / CV', hint: 'PDF or DOC', icon: 'fa-file-lines' },
  { key: 'idProof', label: 'ID Proof (Aadhaar / PAN)', hint: 'Clear, coloured scan', icon: 'fa-id-card' },
  { key: 'tenthCertificate', label: '10th Certificate', hint: 'PDF or image', icon: 'fa-graduation-cap' },
  { key: 'twelfthCertificate', label: '12th Certificate', hint: 'PDF or image', icon: 'fa-graduation-cap' },
  { key: 'degreeCertificate', label: 'Degree Certificate', hint: 'PDF or image', icon: 'fa-graduation-cap' },
]

const SectionTitle = ({ children }) => (
  <div className='flex items-center gap-3 mb-5'>
    <span className='text-[11px] font-bold tracking-wider text-[#062139] uppercase'>{children}</span>
    <span className='flex-1 h-px bg-slate-100'></span>
  </div>
)

const Field = ({ label, required, error, prefilled, children }) => (
  <div>
    <label className='block text-sm font-semibold text-slate-700 mb-1.5'>
      {label}{required && <span className='text-red-500 ml-0.5'>*</span>}
    </label>
    {children}
    {prefilled && (
      <span className='inline-block mt-1.5 text-[11px] font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full'>
        
      </span>
    )}
    {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
  </div>
)

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm outline-none transition focus:ring-4 focus:ring-slate-100 ${
    hasError ? 'border-red-300' : 'border-slate-200 focus:border-[#062139]'
  }`

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
      <div className='min-h-screen w-full bg-slate-50 flex items-center justify-center px-6'>
        <div className='max-w-md w-full bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center'>
          <div className='w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-5'>
            <i className='fa-solid fa-check'></i>
          </div>
          <h2 className='text-xl font-bold text-slate-800 mb-2'>Application Submitted</h2>
          <p className='text-sm text-slate-500 leading-relaxed'>
            Thank you for applying to Maruti Flex Traders LLP. Our HR team will review your
            details and reach out if your profile matches an open position.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-slate-50'>
      <div className='w-full max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12'>

        <div className='bg-[#062139] border border-orange-400/60 rounded-2xl p-6 md:p-8 text-white mb-6'>
          <div className='flex items-center gap-3 pb-5 mb-5 border-b border-white/15'>
            <div className='w-11 h-11 rounded-xl bg-white flex items-center justify-center text-orange-500 font-bold'>
              MF
            </div>
            <div>
              <h1 className='font-bold text-lg leading-tight'>Maruti Flex Traders LLP</h1>
              <p className='text-[11px] tracking-widest text-slate-300'>CANDIDATE APPLICATION PORTAL</p>
            </div>
          </div>
          <h2 className='text-2xl md:text-3xl font-bold text-orange-400 mb-2'>Candidates Detail</h2>
          <p className='text-sm text-slate-300 max-w-xl'>
            Please share the relevant details and attach the required documents. Kindly upload
            clear and coloured documents.
          </p>
        </div>

        {topError && (
          <div className='flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-6'>
            <i className='fa-solid fa-circle-exclamation text-red-500 text-sm mt-0.5'></i>
            <p className='text-red-600 text-xs'>{topError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>

          <div className='bg-white border border-slate-100 rounded-xl shadow-sm p-5 md:p-6'>
            <SectionTitle>Personal Information</SectionTitle>
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
              <Field label='Mobile Number' required error={errors.mobile}>
                <input name='mobile' type='tel' value={form.mobile} onChange={handleChange}
                  placeholder='eg. 9633******' className={inputClass(errors.mobile)} />
              </Field>
              <Field label='Alternative Phone Number'>
                <input name='altPhone' type='tel' value={form.altPhone} onChange={handleChange}
                  placeholder='Optional' className={inputClass(false)} />
              </Field>
              <Field label='Date of Birth'>
                <input name='dob' type='date' value={form.dob} onChange={handleChange}
                  className={inputClass(false)} />
              </Field>
              <Field label='Gender'>
                <SearchableSelect name='gender' value={form.gender} onChange={handleChange}
                  options={['Male', 'Female', 'Other']} bare />
              </Field>
            </div>
          </div>

          <div className='bg-white border border-slate-100 rounded-xl shadow-sm p-5 md:p-6'>
            <SectionTitle>Position Applied For</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <Field label='Position / Designation' required error={errors.positionApplied} prefilled={prefilledFields.positionApplied}>
                <input name='positionApplied' value={form.positionApplied} onChange={handleChange}
                  placeholder='eg. Sales Executive' className={inputClass(errors.positionApplied)} />
              </Field>
              <Field label='Preferred Department' prefilled={prefilledFields.department}>
                <input name='department' value={form.department} onChange={handleChange}
                  placeholder='eg. Sales, Accounts, HR' className={inputClass(false)} />
              </Field>
              <Field label='Location' required prefilled={prefilledFields.location}>
                <input name='location' value={form.location} onChange={handleChange}
                  placeholder='eg. Bangalore' className={inputClass(false)} />
              </Field>
              <Field label='HR Name' required prefilled={prefilledFields.hrName}>
                <input name='hrName' value={form.hrName} onChange={handleChange}
                  placeholder='Point of contact from HR' className={inputClass(false)} />
              </Field>
            </div>
          </div>

          <div className='bg-white border border-slate-100 rounded-xl shadow-sm p-5 md:p-6'>
            <SectionTitle>Address Details</SectionTitle>
            <div className='grid grid-cols-1 gap-5'>
              <Field label='Present Address'>
                <textarea name='presentAddress' rows={2} value={form.presentAddress} onChange={handleChange}
                  placeholder='Current residential address' className={inputClass(false)} />
              </Field>
              <Field label='Permanent Address'>
                <textarea name='permanentAddress' rows={2} value={form.permanentAddress} onChange={handleChange}
                  placeholder='Permanent address (if different)' className={inputClass(false)} />
              </Field>
            </div>
          </div>

          <div className='bg-white border border-slate-100 rounded-xl shadow-sm p-5 md:p-6'>
            <SectionTitle>Education Details</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <Field label='Highest Qualification'>
                <input name='qualification' value={form.qualification} onChange={handleChange}
                  placeholder='eg. B.Com, MBA' className={inputClass(false)} />
              </Field>
              <Field label='Specialization'>
                <input name='specialization' value={form.specialization} onChange={handleChange}
                  placeholder='eg. Finance, Marketing' className={inputClass(false)} />
              </Field>
              <Field label='Institution / University'>
                <input name='institution' value={form.institution} onChange={handleChange}
                  placeholder='Name of institution' className={inputClass(false)} />
              </Field>
              <Field label='Year of Passing'>
                <input name='yearOfPassing' type='number' value={form.yearOfPassing} onChange={handleChange}
                  placeholder='eg. 2023' className={inputClass(false)} />
              </Field>
            </div>
          </div>

          <div className='bg-white border border-slate-100 rounded-xl shadow-sm p-5 md:p-6'>
            <SectionTitle>Work Experience</SectionTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <Field label='Total Experience'>
                <input name='totalExperience' value={form.totalExperience} onChange={handleChange}
                  placeholder='eg. 2.5 years / Fresher' className={inputClass(false)} />
              </Field>
              <Field label='Previous Company'>
                <input name='previousCompany' value={form.previousCompany} onChange={handleChange}
                  placeholder='Most recent employer' className={inputClass(false)} />
              </Field>
              <Field label='Previous Designation'>
                <input name='previousDesignation' value={form.previousDesignation} onChange={handleChange}
                  placeholder='Your last role' className={inputClass(false)} />
              </Field>
              <Field label='Notice Period'>
                <input name='noticePeriod' value={form.noticePeriod} onChange={handleChange}
                  placeholder='eg. Immediate, 30 days' className={inputClass(false)} />
              </Field>
              <Field label='Last Drawn Salary'>
                <input name='lastSalary' value={form.lastSalary} onChange={handleChange}
                  placeholder='eg. ₹25,000/month' className={inputClass(false)} />
              </Field>
              <Field label='Expected Salary'>
                <input name='expectedSalary' value={form.expectedSalary} onChange={handleChange}
                  placeholder='eg. ₹30,000/month' className={inputClass(false)} />
              </Field>
            </div>
          </div>

          <div className='bg-white border border-slate-100 rounded-xl shadow-sm p-5 md:p-6'>
            <SectionTitle>Document Upload</SectionTitle>
            <div className='flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg p-3 mb-5'>
              <i className='fa-solid fa-circle-info text-orange-500 text-sm mt-0.5'></i>
              <p className='text-orange-800 text-xs'>Please upload clear, coloured scans or photos. Accepted formats: JPG, PNG, PDF.</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {FILE_FIELDS.map(({ key, label, hint, icon }) => (
                <div key={key}>
                  <label className='block text-sm font-semibold text-slate-700 mb-1.5'>{label}</label>
                  <label className='relative flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 rounded-xl py-5 cursor-pointer transition'>
                    <input type='file' className='absolute inset-0 opacity-0 cursor-pointer'
                      onChange={(e) => handleFile(key, e)} />
                    <i className={`fa-solid ${icon} text-orange-500 text-lg mb-1.5`}></i>
                    <span className='text-xs font-semibold text-slate-700'>
                      {files[key] ? files[key].name : 'Click to upload'}
                    </span>
                    <span className='text-[11px] text-slate-400 mt-0.5'>{hint}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white border border-slate-100 rounded-xl shadow-sm p-5 md:p-6'>
            <label className='flex items-start gap-2.5 text-sm text-slate-600 mb-5'>
              <input type='checkbox' name='declaration' checked={form.declaration} onChange={handleChange}
                className='mt-0.5' />
              I hereby declare that the information provided above is true and correct to the best of my knowledge.
            </label>
            <div className='flex justify-end'>
              <button type='submit' disabled={submitting}
                className='bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-3 rounded-lg font-semibold text-sm transition shadow-sm'>
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CandidateApplicationForm