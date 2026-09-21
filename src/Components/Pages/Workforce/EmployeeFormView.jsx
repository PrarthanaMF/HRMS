import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { addEmployee, updateEmployee, selectAllEmployees } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { FORM_STEPS, STEP_FIELD_MAP } from '../../../Utils/employeeSchema'
import { validateEmployeeForm } from '../../../Utils/validation'
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
    company: '', branch: '', location: '', department: '', division: '',
    designation: '', reportingManager: '', divisionHead: '', applicationApprover: '',
    dateOfJoining: '', employeeType: '',
    emergencyContactName: '', emergencyContactRelation: '', emergencyContactNumber: '',
    presentAddress: '', permanentAddress: '',
    monthlySalary: '', nextIncrement: '', salaryTerms: '',
    bankName: '', accountNumber: '', ifscCode: '',
    panNumber: '', panPhoto: null, aadhaarNumber: '', aadhaarPhoto: null,
    tenthCertificate: null, twelfthCertificate: null, degreeCertificate: null, mastersCertificate: null,
    previousCompanyName: '', previousCompanyManager: '', previousCompanyContact: '',
    relievingLetter: null, experienceLetter: null,
    lastPaySlip1: null, lastPaySlip2: null, lastPaySlip3: null,
    resume: null, offerLetter: null, appointmentLetter: null,
    officialEmail: '', companyNumber: '',
    lastWorkingDate: '', removalType: '', exitRemarks: '',
}

const EmployeeFormView = ({ mode = 'add' }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { empId } = useParams()
    const employees = useSelector(selectAllEmployees)

    const isEdit = mode === 'edit'

    const [activeStep, setActiveStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState([])
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isEdit) {
            const emp = employees.find(e => e.empId === empId)
            if (emp) {
                setFormData({ ...EMPTY_FORM, ...emp })
                setCompletedSteps([0, 1, 2, 3, 4, 5])
            }
        }
    }, [isEdit, empId, employees])

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
        const allErrors = validateEmployeeForm(formData)
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

    const handleSubmit = () => {
        const allErrors = validateEmployeeForm(formData)
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

        if (isEdit) {
            dispatch(updateEmployee(formData))
        } else {
            dispatch(addEmployee(formData))
        }
        navigate('/workforce')
    }

    const renderStep = () => {
        const props = { form: formData, errors, onChange: handleChange }
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
                            {isEdit ? `Employee ID: ${formData.empId}` : 'Fill in the details and click submit at the end'}
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
                            className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm'
                        >
                            <i className="fa-solid fa-check text-xs"></i>
                            {isEdit ? 'Save Changes' : 'Create Employee'}
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