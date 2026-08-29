import { Menu } from "@headlessui/react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaPaypal, FaRegCreditCard, FaRegMoneyBillAlt } from "react-icons/fa";
import { GrBitcoin } from "react-icons/gr";
import { formatCurrency, maskAccountNumber } from "../../libs";
import TransitionWrapper from "../ui/wrapper/Transitionwrapper.jsx";

// Menu for "Add Money" and "Transfer" options
const AccountMenu = ({ account, onAddMoney, onTransfer }) => {
    return (
        <Menu as='div' className='relative inline-block text-left'>
            <Menu.Button className='inline-flex w-full justify-center rounded-md p-2 text-sm font-medium text-black dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'>
                <BiDotsVerticalRounded size={20} />
            </Menu.Button>
            <TransitionWrapper>
                <Menu.Items className='absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none z-10'>
                    <div className='p-1'>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => onAddMoney(account)}
                                    className={`${active ? "bg-violet-500/10" : ""} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                >
                                    Add Money
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => onTransfer(account)}
                                    className={`${active ? "bg-violet-500/10" : ""} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                >
                                    Transfer
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </TransitionWrapper>
        </Menu>
    );
};

// Icon mapping
const Icons = {
    cash: <FaRegMoneyBillAlt />,
    crypto: <GrBitcoin />,
    paypal: <FaPaypal />,
    "debit card": <FaRegCreditCard />,
};

const AccountCard = ({ account, onAddMoney, onTransfer }) => {
    const iconKey = account.account_name?.toLowerCase() || "cash";

    return (
        <div className='w-full h-48 flex flex-col justify-between bg-white dark:bg-slate-900 p-5 rounded-lg shadow-md'>
            {/* TOP SECTION: ICON & MENU */}
            <div className='flex items-center justify-between'>
                <div className='text-2xl text-gray-600 dark:text-gray-400'>
                    {Icons[iconKey] || <FaRegMoneyBillAlt />}
                </div>
                <AccountMenu account={account} onAddMoney={onAddMoney} onTransfer={onTransfer} />
            </div>

            {/* BOTTOM SECTION: BALANCE & DATE */}
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                        {formatCurrency(account.account_balance || 0)}
                    </p>
                    <span className="text-gray-500 dark:text-gray-600 text-sm">
                        {maskAccountNumber(account.account_number || "")}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-gray-500 dark:text-gray-600 text-xs">Created</span>
                    <p className="text-sm text-black dark:text-white">
                        {account.createdat ? new Date(account.createdat).toLocaleDateString() : "-"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccountCard;