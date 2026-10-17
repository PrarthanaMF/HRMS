import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import HeaderData from '../../../Store/Context/Header'
import { LINK_ACCESS } from '../../../Utils/roleAccess'
import { ROUTES } from '../../../Utils/routes'
import Icon from '../../Common/Icon'

// Module cards. `exclude` = names already offered as shortcuts above, so nothing shows twice
const QuickAccess = ({ exclude = [] }) => {
    const { data } = useContext(HeaderData)
    const user = useSelector(state => state.auth.value)

    const visibleCards = data.filter((item) => {
        if (item.name === 'Dashboard' || exclude.includes(item.name)) return false
        const allowedRoles = LINK_ACCESS[item.name]
        if (!allowedRoles) return true
        return allowedRoles.includes(user.role)
    })

    return (
        <section aria-labelledby='quick-access-title' className='min-w-0'>
            <h2 id='quick-access-title' className='mb-3 text-[16px] font-semibold text-[var(--ink)]'>Modules</h2>
            <div className='grid grid-cols-2 gap-3 lg:grid-cols-3'>
                {visibleCards.map((item, index) => (
                    <ManageHomeAccount key={item.name} data={item} to={ROUTES[item.name] || '/'} index={index} />
                ))}
            </div>
        </section>
    )
}

// A link, so the whole card is keyboard reachable and Ctrl/Cmd-click opens a new tab
function ManageHomeAccount({ data, to, index }) {
    return (
        <Link
            to={to}
            style={{ '--i': index + 4 }}
            className='group glass-panel rise lift press flex min-h-[64px] min-w-0 items-center gap-3 rounded-2xl p-3 sm:min-h-[76px] sm:p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
        >
            <span aria-hidden='true' className='flex h-10 w-10 shrink-0 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-[#f2f5f7] text-[#1f4e6b] ring-1 ring-[#dce6ed] transition-[background-color,color,box-shadow] duration-200 group-hover:bg-[#1f4e6b] group-hover:text-white group-hover:shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)] group-hover:ring-transparent'>
                <Icon className={`${data.icon} text-[19px]`} />
            </span>
            <span className='min-w-0 flex-1'>
                <span className='line-clamp-2 block text-[14px] font-semibold leading-tight text-[var(--ink)]'>{data.name}</span>
                <span className='mt-0.5 line-clamp-2 hidden text-[12px] leading-4 text-slate-500 min-[460px]:block'>{data.description}</span>
            </span>
            <Icon aria-hidden='true' className='fa-solid fa-arrow-right hidden text-[13px] text-slate-300 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[#1f4e6b] sm:block' />
        </Link>
    )
}

export default QuickAccess
