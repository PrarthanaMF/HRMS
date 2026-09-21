import { useContext } from "react"
import logo from '../../assets/logo.png'
import { useDispatch, useSelector } from "react-redux"
import { removeAuth } from "../../Store/Redux/Login/AuthSlice"
import HeaderData from "../../Store/Context/Header"
import { Link, useNavigate } from "react-router-dom"
import { LINK_ACCESS } from "../../Utils/roleAccess"

// Maps sidebar link names → route paths
const ROUTES = {
    'Dashboard': '/',
    'Workforce': '/workforce',
    'Payroll': '/',
    'Attendance': '/',
    'Recruitment': '/',
    'Onboarding': '/',
    'Exit Process': '/',
    'MIS Reports': '/',
    'Expenses': '/',
    'Assets': '/',
    'Helpdesk': '/',
    'Master': '/',
}

const Header = ({ isOpen, onClose }) => {
    const { data } = useContext(HeaderData)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.value)

    const handleLogout = () => {
        dispatch(removeAuth())
        navigate('/login')
    }

    const filteredData = data.filter((item) => {
        const allowedRoles = LINK_ACCESS[item.name]
        if (!allowedRoles) return true
        return allowedRoles.includes(user.role)
    })

    return (
        <>
            {/* Dark backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[55] md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <header
                className={`
                    w-64 bg-[#062139] h-screen p-2.5
                    fixed md:sticky top-0 shrink-0
                    z-[60] md:z-50
                    transition-transform duration-300 ease-in-out
                    flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Top: Logo + Close */}
                <div className="flex gap-1 items-center justify-between shrink-0">
                    <div className="flex gap-1 items-center">
                        <img src={logo} className="w-6 h-6" alt="logo" />
                        <h3 className="text-start text-[18px] ml-1.5 text-slate-100 mb-1">Marutiflex</h3>
                    </div>

                    <button
                        onClick={onClose}
                        className="md:hidden text-slate-400 hover:text-white p-1"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Links */}
                <ul className="flex flex-col gap-1 mt-3 flex-1 overflow-y-auto">
                    {filteredData.map((icon, index) => (
                        <li
                            key={index}
                            className={`relative group cursor-pointer transform duration-200 hover:bg-[#05325a] py-1.5 px-2 rounded ${index === 0 ? 'bg-[#21537e]' : ''}`}
                        >
                            <Link
                                to={ROUTES[icon.name] || '/'}
                                onClick={onClose}
                                className="flex items-center"
                            >
                                <i className={`${icon.icon} w-6 text-[15px] text-slate-50 duration-200 transform hover:translate-y-0.5`}></i>
                                <span className="text-slate-50 ml-1 text-[13px]">{icon.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Logout */}
                <div className="border-t border-slate-700/50 pt-3 mt-3 shrink-0">
                    <div
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-2 py-1.5 cursor-pointer hover:bg-[#05325a] rounded transition-colors"
                    >
                        <i className="fa-solid fa-right-from-bracket text-slate-300 text-[14px]"></i>
                        <span className="text-slate-200 text-[13px]">Logout</span>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header