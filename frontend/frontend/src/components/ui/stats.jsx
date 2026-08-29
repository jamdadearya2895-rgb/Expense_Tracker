import {
    MdArrowDownward,
    MdArrowUpward,
    MdOutlineAccountBalanceWallet,
} from "react-icons/md";
import { formatCurrency } from "../../libs";

// A small, reusable Card component for displaying each statistic
const Card = ({ item }) => {
    return (
        <div className='w-full p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex items-center gap-4'>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${item.style}`}>
                {item.icon}
            </div>
            <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>{item.label}</p>
                <span className='text-xl font-bold text-black dark:text-white'>
                    {formatCurrency(item.amount)}
                </span>
                {/* THIS IS THE NEW LINE YOU NEED TO ADD */}
                <p className='text-xs text-gray-500'>Overall {item.label}</p>
            </div>
        </div>
    );
};

// The main Stats component
const Stats = ({ dt }) => {
    const stats = [
        {
            label: "Total Balance",
            amount: dt?.balance || 0,
            icon: <MdOutlineAccountBalanceWallet size={24} className='text-blue-800' />,
            style: "bg-blue-200",
        },
        {
            label: "Total Income",
            amount: dt?.income || 0,
            icon: <MdArrowUpward size={24} className='text-emerald-800' />,
            style: "bg-emerald-200",
        },
        {
            label: "Total Expense",
            amount: dt?.expense || 0,
            icon: <MdArrowDownward size={24} className='text-rose-800' />,
            style: "bg-rose-200",
        },
    ];

    return (
        <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-6'>
            {stats.map((item, index) => (
                <Card key={index} item={item} />
            ))}
        </div>
    );
};

export default Stats;