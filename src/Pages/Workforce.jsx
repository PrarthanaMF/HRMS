import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Header from '../Components/Common/Header'

const TABS = [
    { key: 'employees', label: 'Employees List', icon: 'fa-users', path: '/workforce' },
    { key: 'mis', label: 'MIS Reports', icon: 'fa-chart-pie', path: '/workforce/mis' },
]

const Workforce = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const isMis = location.pathname.startsWith('/workforce/mis')

    return (
        <main className='flex w-full min-h-screen bg-gray-50'>
            <Header />

            <section className='bg-gray-100/40 flex-1 min-w-0 flex flex-col relative'>
                <div className='w-full max-w-7xl mx-auto px-4 md:px-6 py-6'>

                    {/* Tabs + Add button */}
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5'>

                        <div className='flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm w-fit'>
                            {TABS.map((tab) => {
                                const active = tab.key === 'mis' ? isMis : !isMis
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => navigate(tab.path)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${active ? 'bg-[#062139] text-white' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <i className={`fa-solid ${tab.icon} mr-2 text-xs`}></i>
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>

                        {!isMis && (
                            <button
                                onClick={() => navigate('/workforce/add')}
                                className='flex items-center justify-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md'
                            >
                                <i className="fa-solid fa-plus text-xs"></i>
                                Add Employee
                            </button>
                        )}
                    </div>

                    {/* Child route renders here */}
                    <Outlet />

                </div>
            </section>
        </main>
    )
}

export default Workforce