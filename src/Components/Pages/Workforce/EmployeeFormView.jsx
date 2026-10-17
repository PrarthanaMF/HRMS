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

import Icon from '../../Common/Icon';
import PageHeader, { primaryButton, secondaryButton } from '../../Common/PageHeader'
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
            <div role='alert' className='glass-panel flex flex-col items-start gap-3 rounded-2xl border-red-200/80 p-5 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between'>
                <p className='flex items-start gap-2'>
                    <Icon aria-hidden='true' className='fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-red-600' />
                    {loadError}
                </p>
                <button type='button' onClick={() => navigate('/workforce')} className={secondaryButton}>
                    <Icon aria-hidden='true' className='fa-solid fa-arrow-left text-xs' />
                    Back to list
                </button>
            </div>
        )
    }

    if (isEdit && !existing) {
        return (
            <div role='status' aria-label='Loading employee' className='space-y-4'>
                <div className='flex items-start gap-3.5'>
                    <div className='skeleton h-11 w-11 shrink-0 rounded-2xl' />
                    <div className='flex-1 space-y-2 pt-1'>
                        <div className='skeleton h-5 w-48 max-w-full' />
                        <div className='skeleton h-3 w-72 max-w-full' />
                    </div>
                </div>
                <div className='skeleton h-14 w-full rounded-2xl' />
                <div className='glass-panel rounded-2xl p-4 md:p-5'>
                    <div className='skeleton mb-5 h-4 w-40' />
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={index} className='space-y-2'>
                                <div className='skeleton h-3 w-24' />
                                <div className='skeleton h-10 w-full rounded-xl' />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const isLast = activeStep === FORM_STEPS.length - 1

    return (
        <div>
            <PageHeader
                icon={isEdit ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-user-plus'}
                title={isEdit ? `Edit ${formData.name || 'employee'}` : 'Add employee'}
                description={isEdit
                    ? `Employee ID ${formData.empId}. Review each step, then save your changes on the last one.`
                    : 'Fill in each step, then create the employee on the last one. The employee ID is assigned automatically.'}
                actions={(
                    <button type='button' onClick={() => navigate('/workforce')} className={secondaryButton}>
                        <Icon aria-hidden='true' className='fa-solid fa-arrow-left text-xs' />
                        Back to list
                    </button>
                )}
            />

            <div className='rise space-y-4' style={{ '--i': 1 }}>
                <ProgressStepper
                    steps={FORM_STEPS}
                    activeStep={activeStep}
                    completedSteps={completedSteps}
                    onStepClick={setActiveStep}
                />

                {saveError && (
                    <div role='alert' className='flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/90 p-3 text-[13px] text-red-800'>
                        <Icon aria-hidden='true' className='fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-red-600' />
                        {saveError}
                    </div>
                )}

                {renderStep()}
            </div>

            {/* Sticky action bar: stays in reach on long steps and on phones */}
            <div className='glass-strong sticky bottom-3 z-10 mt-4 flex flex-wrap items-center gap-2 rounded-2xl p-2.5 shadow-[var(--shadow-lift)] sm:p-3'>
                <button
                    type='button'
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    className={secondaryButton}
                >
                    <Icon aria-hidden='true' className='fa-solid fa-arrow-left text-xs' />
                    Back
                </button>

                <p className='hidden flex-1 text-center text-xs tabular-nums text-slate-500 sm:block'>
                    Step {activeStep + 1} of {FORM_STEPS.length}
                </p>

                <div className='ml-auto flex items-center gap-2 sm:ml-0'>
                    <button
                        type='button'
                        onClick={() => navigate('/workforce')}
                        className={secondaryButton}
                    >
                        Cancel
                    </button>

                    {isLast ? (
                        <button
                            type='button'
                            onClick={handleSubmit}
                            disabled={saving}
                            className={primaryButton}
                        >
                            <Icon aria-hidden='true' className='fa-solid fa-check text-xs' />
                            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create employee'}
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={handleNext}
                            className={primaryButton}
                        >
                            Next
                            <Icon aria-hidden='true' className='fa-solid fa-arrow-right text-xs' />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmployeeFormView
