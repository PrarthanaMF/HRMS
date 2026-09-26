import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import HeaderData from '../../../Store/Context/Header'
import { LINK_ACCESS } from '../../../Utils/roleAccess'
import { ROUTES } from '../../../Utils/routes'

const QuickAccess = () => {
    const { data } = useContext(HeaderData)
    const user = useSelector(state => state.auth.value)
    const navigate = useNavigate()

    // Skip Dashboard (index 0) + filter by role
    const visibleCards = data.filter((item, index) => {
        if (index === 0) return false
        const allowedRoles = LINK_ACCESS[item.name]
        if (!allowedRoles) return true
        return allowedRoles.includes(user.role)
    })

    return (
        <div className='mt-1 w-full max-w-350 mx-auto'>
            <h3 className='font-sans text-[17px] px-4 md:px-0 ml-0 md:ml-10 text-shadow-2xs text-shadow-amber-600 text-slate-700 font-bold'>
                Quick Access
            </h3>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center gap-3 md:gap-6 mt-2 px-4 md:px-6'>
                {visibleCards.map((item) => (
                    <ManageHomeAccount
                        key={item.name}
                        data={item}
                        onClick={() => navigate(ROUTES[item.name] || '/')}
                    />
                ))}
            </div>
        </div>
    )
}

function ManageHomeAccount({ data, onClick }) {
    return (
        <div
            onClick={onClick}
            className='bg-white border border-gray-200/80 rounded-xl px-2 py-3 md:px-4 flex flex-col items-center justify-between duration-300 transform hover:translate-y-1 cursor-pointer w-full'
        >
            <p className={`w-10 h-10 flex justify-center items-center ${data.bgIconColor} ${data.IconColor} rounded-[50%]`}>
                <i className={`${data.icon} text-[16px]`}></i>
            </p>

            <h3 className={`text-[12px] md:text-[13px] ${data.IconColor} font-bold mt-2 text-center`}>
                {data.name}
            </h3>

            <p className='hidden sm:block text-[11px] text-gray-500 px-1 md:px-3 text-center line-clamp-2 mt-1'>
                {data.description}
            </p>

            <button className={`text-[12px] md:text-[13px] ${data.bgIconColor} ${data.IconColor} px-3 md:px-4 py-0.5 mt-3 rounded shadow-xl cursor-pointer transform duration-300 hover:translate-y-1 flex items-center justify-center gap-1`}>
                <i className="fa-solid fa-pen-to-square text-[10px] md:text-[11px]"></i>
                <span>{data.btnText}</span>
            </button>
        </div>
    )
}

export default QuickAccess