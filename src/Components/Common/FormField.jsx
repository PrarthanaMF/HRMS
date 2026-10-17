import React, { useId } from 'react'
import SearchableSelect from './SearchableSelect'
import { DatePicker } from './DateTimePicker'
import Icon from './Icon'

export const fieldClass = (error) => `w-full rounded-xl border bg-white/80 px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-[border-color,box-shadow,background-color] duration-150 focus:bg-white focus:outline-none focus:ring-2 ${error
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-slate-200/80 hover:border-slate-300 focus:border-[#2b6485] focus:ring-[#2b6485]/25'}`

const FormField = ({
    label, name, value, onChange,
    type = 'text', placeholder = '',
    required = false, error = '',
    options = null, textarea = false, accept = null, min = undefined,
    // Optional note under the input (e.g. the file already uploaded)
    hint = null,
}) => {
    // The label is tied to its control, so clicking it focuses the field and screen readers name it
    const id = useId()
    const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
    const shared = { id, name, onChange, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined }

    return (
        <div className='flex min-w-0 flex-col gap-1.5'>
            <label htmlFor={id} className='text-[13px] font-medium text-slate-700'>
                {label} {required && <span aria-hidden='true' className='text-red-500'>*</span>}
                {!required && <span className='ml-1 text-[11px] font-normal text-slate-400'>(optional)</span>}
            </label>

            {options ? (
                <SearchableSelect
                    id={id} name={name} value={value} onChange={onChange}
                    options={options} error={error} bare
                />
            ) : type === 'date' ? (
                <DatePicker
                    id={id}
                    value={value || ''}
                    min={min}
                    onChange={(next) => onChange({ target: { name, value: next } })}
                    placeholder={placeholder || 'Select date'}
                />
            ) : textarea ? (
                <textarea
                    {...shared}
                    value={value || ''}
                    placeholder={placeholder} rows={3}
                    className={`${fieldClass(error)} resize-y py-2.5`}
                />
            ) : type === 'file' ? (
                <input
                    {...shared}
                    type='file'
                    accept={accept || undefined}
                    className={`w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white/60 p-1.5 text-sm text-slate-600 outline-none transition-colors hover:border-[#cfdce5] focus-visible:ring-2 focus-visible:ring-[#2b6485] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#f2f5f7] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#1f4e6b] hover:file:bg-[#dce6ed] ${error ? 'border-red-300 text-red-600' : ''}`}
                />
            ) : (
                <input
                    {...shared}
                    type={type}
                    min={min}
                    value={value || ''}
                    placeholder={placeholder}
                    className={`${fieldClass(error)} h-10`}
                />
            )}

            {hint && <p id={`${id}-hint`} className='break-all text-[12px] text-slate-500'>{hint}</p>}

            {error && (
                <p id={`${id}-error`} className='flex items-center gap-1 text-[12px] text-red-600'>
                    <Icon className='fa-solid fa-circle-exclamation text-[11px]' />
                    {error}
                </p>
            )}
        </div>
    )
}

export default FormField
