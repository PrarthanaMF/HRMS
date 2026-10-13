import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { employeesChanged } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { FORM_STEPS, STEP_FIELD_MAP, REQUIRED_FIELDS, EDIT_REQUIRED_FIELDS } from '../../../Utils/employeeSchema'
import { validateEmployeeForm } from '../../../Utils/validation'
import { getEmployee, listDocuments, saveEmployee, DOCUMENT_FIELDS, SALARY_ROLES } from '../../../api/employees'
import { useEmployeeOptions } from '../../../Hooks/useEmployees'
import ProgressStepper from './Form/ProgressStepper'

import Step1Personal from './Form/steps/Step1Personal';
import Step2Employment from './Form/steps/Step2Employment'
import Step3Contact from './Form/steps/Step3Contact'
import Step4Financial from './Form/steps/Step4Financial'
import Step5Identity from './Form/steps/Step5Identity'
import Step6Background from './Form/steps/Step6Background'

const EMPTY_FORM = {
    name: '', gender: '', personalNumber: '', personalEmail: '',
    dateOfBirth: '', dateOfAnniversary: '', bloodGroup: '', photo: null,
    company: '', branchId: '', location: '', department: '', division: '',
    designation: '', reportingManagerId: '',
    dateOfJoining: '', employeeType: '', employmentStatus: '',
    biometricCode: '', shiftStart: '09:00', shiftEnd: '18:00', weekOffPolicyId: '', category: '',
    emergencyContactName: '', emergencyContactRelation: '', emergencyContactNumber: '',
    presentAddress: '', permanentAddress: '',
    monthlySalary: '',
    bankName: '', accountNumber: '', ifscCode: '',
    panNumber: '', panPhoto: null, aadhaarNumber: '', aadhaarPhoto: null,
    tenthCertificate: null, twelfthCertificate: null, degreeCertificate: null, mastersCertificate: null,
    previousCompanyName: '', previousCompanyManager: '', previousCompanyContact: '',
    relievingLetter: null, experienceLetter: null,
    lastPaySlip1: null, lastPaySlip2: null, lastPaySlip3: null,
    resume: null, offerLetter: null, appointmentLetter: null,
    officialEmail: '', companyNumber: '',
}

const EmployeeFormView = ({ mode = 'add' }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { empId: employeeId } = useParams()
    const user = useSelector(state => state.auth.value)
    const { options } = useEmployeeOptions()

    const isEdit = mode === 'edit'
    const canSalary = SALARY_ROLES.includes(user?.role)
    const requiredFields = isEdit ? EDIT_REQUIRED_FIELDS : REQUIRED_FIELDS

    const [activeStep, setActiveStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState([])
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [existing, setExisting] = useState(null)
    const [documents, setDocuments] = useState([])
    const [errors, setErrors] = useState({})
    const [loadError, setLoadError] = useState('')
    const [saveError, setSaveError] = useState('')
    const [saving, setSaving] = useState(false)

    // Editing: load the employee and the documents already uploaded
    useEffect(() => {
        if (!isEdit) return undefined
        let active = true
        Promise.all([getEmployee(employeeId), listDocuments(employeeId)]).then(
            ([employee, docs]) => {
                if (!active) return
                setExisting(employee)
                setFormData({ ...EMPTY_FORM, ...employee })
                setDocuments(docs)
                setCompletedSteps([0, 1, 2, 3, 4, 5])
            },
            (error) => { if (active) setLoadError(error.message || 'Unable to load the employee.') },
        )
        return () => { active = false }
    }, [isEdit, employeeId])

    // "Uploaded: cv.pdf" under a file input when that document already exists
    const fileHint = (field) => {
        const doc = documents.find((item) => item.type === DOCUMENT_FIELDS[field])
        return doc ? `Uploaded: ${doc.originalName} (choose a file to replace it)` : null
    }

    const handleChange = (e) => {
        const { name, value, type, files } = e.target
        const newValue = type === 'file' ? (files[0] || null) : value
        setFormData(prev => ({ ...prev, [name]: newValue }))
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev }
                delete next[name]
                return next
            })
        }
    }

    const validateCurrentStep = () => {
        const allErrors = validateEmployeeForm(formData, requiredFields)
        const stepFields = STEP_FIELD_MAP[FORM_STEPS[activeStep].key] || []
        const stepErrors = {}
        stepFields.forEach((field) => {
            if (allErrors[field]) stepErrors[field] = allErrors[field]
        })
        return stepErrors
    }

    const handleNext = () => {
        const stepErrors = validateCurrentStep()
        if (Object.keys(stepErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...stepErrors }))
            return
        }
        if (!completedSteps.includes(activeStep)) {
            setCompletedSteps([...completedSteps, activeStep])
        }
        setActiveStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleBack = () => {
        setActiveStep(prev => Math.max(prev - 1, 0))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async () => {
        const allErrors = validateEmployeeForm(formData, requiredFields)
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors)
            for (let i = 0; i < FORM_STEPS.length; i++) {
                const stepFields = STEP_FIELD_MAP[FORM_STEPS[i].key] || []
                const hasError = stepFields.some(f => allErrors[f])
                if (hasError) {
                    setActiveStep(i)
                    break
                }
            }
            return
        }

        setSaving(true)
        setSaveError('')
        try {
            const { warnings } = await saveEmployee(formData, { canSalary, existing })
            dispatch(employeesChanged())
            if (warnings.length) {
                window.alert(`The employee was saved, but some files were not uploaded:\n\n${warnings.join('\n')}`)
            }
            navigate('/workforce')
        } catch (error) {
            // e.g. "biometricCode already exists", "Phone number must contain exactly 10 digits"
            setSaveError(error.message || 'Unable to save the employee.')
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setSaving(false)
        }
    }

    const renderStep = () => {
        const props = { form: formData, errors, onChange: handleChange, requiredFields, options, canSalary, fileHint }
        switch (activeStep) {
            case 0: return <Step1Personal {...props} />
            case 1: return <Step2Employment {...props} />
            case 2: return <Step3Contact {...props} />
            case 3: return <Step4Financial {...props} />
            case 4: return <Step5Identity {...props} />
            case 5: return <Step6Background {...props} />
            default: return null
        }
    }

    if (loadError) {
        return (
            <div role='alert' className='bg-red-50 rounded-xl border border-red-200 p-6 text-sm text-red-800'>
                {loadError}
                <button type='button' onClick={() => navigate('/workforce')} className='ml-3 underline'>Back to list</button>
            </div>
        )
    }

    if (isEdit && !existing) {
        return <div role='status' className='bg-white rounded-xl border border-slate-100 p-12 text-center text-sm text-slate-500'>Loading employee…</div>
    }

    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

            <div className='flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100'>
                <div className='flex items-center gap-3 min-w-0'>
                    <button
                        onClick={() => navigate('/workforce')}
                        className='w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition shrink-0'
                        title='Back to list'
                    >
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </button>
                    <div className='min-w-0'>
                        <h2 className='text-base md:text-lg font-bold text-slate-800 truncate'>
                            {isEdit ? `Edit Employee — ${formData.name}` : 'Add New Employee'}
                        </h2>
                        <p className='text-[11px] md:text-xs text-slate-500 truncate'>
                            {isEdit ? `Employee ID: ${formData.empId}` : 'Fill in the details and click submit at the end. The Employee ID is assigned automatically.'}
                        </p>
                    </div>
                </div>
            </div>

            <ProgressStepper
                steps={FORM_STEPS}
                activeStep={activeStep}
                completedSteps={completedSteps}
                onStepClick={setActiveStep}
            />

            {saveError && (
                <div role='alert' className='mx-4 md:mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                    {saveError}
                </div>
            )}

            <div className='p-4 md:p-6'>
                {renderStep()}
            </div>

            <div className='flex flex-col-reverse sm:flex-row justify-between items-center gap-3 px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50'>

                <button
                    type='button'
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    className='w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                    Back
                </button>

                <div className='w-full sm:w-auto flex flex-col-reverse sm:flex-row gap-2 sm:gap-3'>
                    <button
                        type='button'
                        onClick={() => navigate('/workforce')}
                        className='w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition'
                    >
                        Cancel
                    </button>

                    {activeStep === FORM_STEPS.length - 1 ? (
                        <button
                            type='button'
                            onClick={handleSubmit}
                            disabled={saving}
                            className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg transition shadow-sm'
                        >
                            <i className="fa-solid fa-check text-xs"></i>
                            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Employee'}
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={handleNext}
                            className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm'
                        >
                            Next
                            <i className="fa-solid fa-arrow-right text-xs"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmployeeFormView
