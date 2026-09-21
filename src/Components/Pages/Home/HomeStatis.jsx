import React from 'react'

const HomeStatis = () => {
    return (
        // Removed max-w-350 to let it fill the screen, added w-full
        <div className='px-4 py-4 w-full'>

            {/* 
              RESPONSIVE GRID:
              - Mobile (default): 1 column (100% width)
              - Small Screens (sm): 2 columns (each 50% width)
              - Large Screens (lg): 4 columns (each 25% width)
            */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>

                <StatisticCont data={{ icon: 'fa-solid fa-users', static: '12 this month', value: '249', name: 'Total Employees', color: 'orange' }} />
                <StatisticCont data={{ icon: 'fa-solid fa-indian-rupee-sign', static: '8% vs last Month', value: '28.45L', name: 'Payroll This Month', color: 'slate' }} />
                <StatisticCont data={{ icon: 'fa-solid fa-calendar-days', static: '80% of Total', value: '198 Person', name: 'Present Today', color: 'blue' }} />
                <StatisticCont data={{ icon: 'fa-solid fa-plane', static: '13% of Total', value: '32 Person', name: 'On Leave', color: 'gray' }} />

            </div>
        </div>
    )
}

function StatisticCont({ data }) {
    // 1. We create a color map so Tailwind can safely apply the dynamic colors
    const colorMap = {
        orange: {
            bg: 'bg-orange-100',
            border: 'border-orange-400/30',
            text: 'text-orange-800'
        },
        slate: {
            bg: 'bg-slate-100',
            border: 'border-slate-400/30',
            text: 'text-slate-800'
        },
        blue: {
            bg: 'bg-blue-100',
            border: 'border-blue-400/30',
            text: 'text-blue-800'
        },
        gray: {
            bg: 'bg-gray-100',
            border: 'border-gray-400/30',
            text: 'text-gray-800'
        }
    }

    // 2. Safely select the colors, fallback to orange if an invalid color is passed
    const selectedColor = colorMap[data.color] || colorMap.orange

    return (
        // Added w-full, changed hover:scale-110 to hover:scale-105 (less aggressive)
        <div className='bg-white shadow p-4 cursor-pointer transform hover:scale-105 duration-200 rounded-xl flex gap-4 items-center w-full'>

            {/* Dynamic Icon Container */}
            <div className={`${selectedColor.bg} ${selectedColor.border} flex justify-center items-center text-center w-12 h-12 shrink-0 border rounded-[50%]`}>
                <i className={`${data.icon} ${selectedColor.text} text-lg`}></i>
            </div>

            <div className='flex flex-col'>
                <p className='text-[11px] text-gray-600 font-medium'>{data.name}</p>
                <h3 className='font-bold text-[18px] text-blue-700 leading-tight'>{data.value}</h3>
                <p className='text-[10px] text-blue-500 font-semibold mt-0.5'>
                    <i className='fa-solid fa-arrow-up text-green-900 mr-1'></i>
                    {data.static}
                </p>
            </div>

        </div>
    )
}

export default HomeStatis