import React from 'react'
import SearchableSelect from './SearchableSelect'

const FormField = ({
    label, name, value, onChange,
    type = 'text', placeholder = '',
    required = false, error = '',
    options = null, textarea = false, accept = null, min = undefined,
}) => {
    const baseClass = `w-full px-3 py-2 text-sm border rounded-lg outline-none transition bg-white ${error
        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-slate-200 focus:border-[#062139] focus:ring-2 focus:ring-slate-100'
        }`

    // File inputs get no border/padding — just the browser's native picker
    const fileClass = `w-full text-sm outline-none bg-transparent ${error ? 'text-red-600' : 'text-slate-600'
        } file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer`

    return (
        <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-medium text-slate-700'>
                {label} {required && <span className='text-red-500'>*</span>}
                {!required && <span className='text-slate-400 text-[10px] ml-1 font-normal'>(optional)</span>}
            </label>

            {options ? (
                <SearchableSelect
                    name={name} value={value} onChange={onChange}
                    options={options} error={error} bare
                />
            ) : textarea ? (
                <textarea
                    name={name} value={value || ''} onChange={onChange}
                    placeholder={placeholder} rows={3}
                    className={`${baseClass} resize-none`}
                />
            ) : type === 'file' ? (
                <input
                    type='file'
                    name={name}
                    onChange={onChange}
                    accept={accept || undefined}
                    className={fileClass}
                />
            ) : (
                <input
                    type={type} name={name}
                    min={min}
                    value={value || ''}
                    onChange={onChange} placeholder={placeholder}
                    className={baseClass}
                />
            )}

            {error && (
                <p className='text-[11px] text-red-600 flex items-center gap-1'>
                    <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                    {error}
                </p>
            )}
        </div>
    )
}

export default FormField