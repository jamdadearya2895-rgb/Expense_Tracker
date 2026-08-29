import { Menu } from "@headlessui/react";
import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaPaypal, FaRegCreditCard, FaRegMoneyBillAlt } from "react-icons/fa";
import { GrBitcoin } from "react-icons/gr";
import AddMoney from "../components/AddMoney.jsx";
import TransferMoney from "../components/TransferMoney.jsx";
import AddAccount from "../components/ui/AddAccount.jsx";
import { Button } from "../components/ui/button";
import Loader from "../components/ui/Loader";
import Title from "../components/ui/title.jsx";
import TransitionWrapper from "../components/ui/wrapper/Transitionwrapper.jsx";
import { formatCurrency, maskAccountNumber } from "../libs";
import api from "../libs/api";

// --- AccountMenu sub-component ---
const AccountMenu = ({ account, onAddMoney, onTransfer }) => {
  return (
    <Menu as='div' className='relative inline-block text-left'>
      <Menu.Button className='inline-flex w-full justify-center rounded-md p-2 text-sm font-medium text-black dark:text-gray-400'>
        <BiDotsVerticalRounded size={24} />
      </Menu.Button>
      <TransitionWrapper>
        <Menu.Items className='absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none'>
          <div className='p-1'>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onAddMoney(account)}
                  className={`${
                    active ? "bg-violet-500/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-400"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  Add Money
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onTransfer(account)}
                  className={`${
                    active ? "bg-violet-500/10 text-black dark:text-white" : "text-gray-700 dark:text-gray-400"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
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

const Icons = {
  cash: <FaRegMoneyBillAlt />,
  crypto: <GrBitcoin />,
  paypal: <FaPaypal />,
  "debit card": <FaRegCreditCard />,
};

const AccountPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/account");
      // Ensure we always have an array
      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddMoney = (account) => {
    setSelectedAccount(account);
    setIsAddMoneyOpen(true);
  };

  const handleTransferMoney = (account) => {
    setSelectedAccount(account);
    setIsTransferOpen(true);
  };

  if (isLoading) {
    return (
      <div className='w-full flex items-center justify-center h-full'>
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className='w-full px-4 md:px-8 py-10'>
        <div className='w-full flex items-center justify-between mb-8'>
          <Title title='Accounts' />
          <Button onClick={() => setIsAddAccountOpen(true)} className='flex items-center gap-2'>
            <AiOutlinePlus />
            Add Account
          </Button>
        </div>

        {data.length === 0 ? (
          <div className='w-full text-center py-10'>
            <p className='text-gray-500'>No accounts found. Add one to get started!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6'>
            {data.map((account) => {
              const iconKey = account.accountname?.toLowerCase() || "cash";
              return (
                <div key={account.id} className='w-full h-48 flex flex-col justify-between bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md'>
                  <div className='flex items-center justify-between'>
                    <div className='text-2xl text-black dark:text-white'>
                      {Icons[iconKey] || <FaRegMoneyBillAlt />}
                    </div>
                    <AccountMenu account={account} onAddMoney={handleAddMoney} onTransfer={handleTransferMoney} />
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {maskAccountNumber(account.accountnumber || "")}
                      </span>
                      <p className="text-xl font-bold text-black dark:text-white">
                        {formatCurrency(account.account_balance || 0)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Created</span>
                      <p className="text-black dark:text-white">
                        {account.createdat ? new Date(account.createdat).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddAccount isOpen={isAddAccountOpen} setIsOpen={setIsAddAccountOpen} refetch={fetchAccounts} />
      <AddMoney isOpen={isAddMoneyOpen} setIsOpen={setIsAddMoneyOpen} refetch={fetchAccounts} account={selectedAccount} />
      <TransferMoney
        isOpen={isTransferOpen}
        setIsOpen={setIsTransferOpen}
        refetch={fetchAccounts}
        accounts={data}
        fromAccount={selectedAccount}
      />
    </>
  );
};

export default AccountPage;
