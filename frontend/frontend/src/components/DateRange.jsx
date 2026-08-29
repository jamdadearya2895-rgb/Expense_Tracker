import { getSevenDaysAgo } from "../libs";

const DateRange = ({ setDateFrom, setDateTo }) => {
    const sevenDaysAgo = getSevenDaysAgo();

    const handleDateChange = (e, type) => {
        const newDate = new Date(e.target.value);
        if (type === "from") {
            setDateFrom(newDate);
        } else {
            setDateTo(newDate);
        }
    };

    return (
        <div className='flex items-center gap-4 text-sm'>
            <span className="text-gray-500">Filter</span>
            <input
                type='date'
                onChange={(e) => handleDateChange(e, "from")}
                className='px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900'
            />
            <span className="text-gray-500">To</span>
            <input
                type='date'
                onChange={(e) => handleDateChange(e, "to")}
                className='px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900'
            />
        </div>
    );
};

export default DateRange;