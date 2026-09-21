import React from 'react'
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const RecentActivity = () => {
    return (
        <div className='w-full max-w-350 mx-auto px-4 md:px-6 pb-7 pt-3.5'>
            {/* 3-column on desktop, 1-column on mobile */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <ActivityTable />
                <MyPieChart />
                <ActivityTable />
            </div>
        </div>
    )
}

const MyPieChart = () => {
    const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#6b7280"];
    const data = [
        { name: "Completed", value: 200 },
        { name: "Pending", value: 120 },
        { name: "Rejected", value: 100 },
        { name: "Testing", value: 80 },
    ];

    return (
        <div className="bg-white shadow rounded-md w-full h-70">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={20}
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

function ActivityTable() {
    return (
        <div className='shadow-lg rounded-[10px] overflow-hidden bg-white flex flex-col'>
            <div className='flex justify-between bg-slate-800 px-3 py-2'>
                <h4 className='text-[13px] font-semibold text-gray-100'>Today Assigned</h4>
                <button className='text-[11px] bg-slate-700 text-slate-100 px-3 py-1 rounded cursor-pointer'>
                    View All
                </button>
            </div>

            <ul className='px-4 flex-1'>
                {[1, 2, 3, 4].map((item) => (
                    <li key={item} className='flex gap-3 sm:gap-5 mt-2 border-0 border-b pb-1.5 border-gray-300 last:border-0'>
                        <p className='bg-slate-100 w-8 h-8 shrink-0 flex flex-col justify-center items-center shadow rounded'>
                            <span className='text-[11px] text-slate-700 font-semibold'>Jun</span>
                            <span className='text-[10px] font-bold text-orange-800'>05</span>
                        </p>

                        <div className='flex flex-1 justify-between items-start min-w-0'>
                            <div className='flex min-w-0'>
                                <span className='w-2 h-2 shrink-0 rounded-[50%] bg-green-700 block mt-2.5 mr-2.5'></span>
                                <div className='min-w-0'>
                                    <p className='text-[14px] text-gray-800 truncate'>Team Meeting</p>
                                    <p className='text-[11px] text-gray-500 truncate'>10:00 AM to 11:00 AM</p>
                                </div>
                            </div>
                            <span className='text-[10px] text-gray-500 font-bold mt-2.5 ml-2 shrink-0 text-right'>
                                IT Department
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default RecentActivity