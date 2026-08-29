import { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useSearchParams } from "react-router-dom";
import DateRange from "../components/DateRange";
import Loader from "../components/ui/Loader";
import Title from "../components/ui/title.jsx";
import { formatCurrency, getSevenDaysAgo } from "../libs";
import api from "../libs/api";

const Transactions = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState(getSevenDaysAgo());
  const [dateTo, setDateTo] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams(searchParams);
      if (dateFrom) params.set("df", new Date(dateFrom).toISOString().split("T")[0]);
      if (dateTo) params.set("dt", new Date(dateTo).toISOString().split("T")[0]);
      if (searchTerm) params.set("s", searchTerm);

      console.log("Fetching transactions with params:", params.toString());

      const res = await api.get(`/transactions?${params.toString()}`);
      console.log("API raw response:", res.data);

      // Handle different response structures
      let fetchedData = [];
      if (Array.isArray(res.data)) {
        fetchedData = res.data;
      } else if (Array.isArray(res.data.data)) {
        fetchedData = res.data.data;
      } else if (Array.isArray(res.data.transactions)) {
        fetchedData = res.data.transactions;
      } else {
        console.warn("Unknown API response structure, defaulting to empty array");
      }

      console.log("Transactions to render:", fetchedData);

      // Static fallback for testing rendering
      // fetchedData = [{ id: 1, createdat: new Date(), description: "Test", status: "done", source: "cash", amount: 100, type: "income" }];

      setData(fetchedData);

      if (fetchedData.length === 0) {
        console.warn("No transactions found for given filters.");
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchParams, dateFrom, dateTo]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ s: searchTerm });
  };

  return (
    <div className="w-full px-4 md:px-8 py-10">
      {/* HEADER & FILTERS */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <Title title="Transactions Activity" />
        <div className="flex items-center flex-wrap gap-4 mt-4 md:mt-0">
          <DateRange setDateFrom={setDateFrom} setDateTo={setDateTo} />
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-48 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900"
              />
            </div>
          </form>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      {isLoading ? (
        <Loader />
      ) : data.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-4">
          No transactions found.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Source</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((trx) => (
                <tr key={trx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-sm">{new Date(trx.createdat).toLocaleDateString()}</td>
                  <td className="p-3 text-sm">{trx.description}</td>
                  <td className="p-3 text-sm">
                    <span className="flex items-center gap-2 text-emerald-600">
                      <IoMdCheckmarkCircleOutline /> {trx.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{trx.source}</td>
                  <td className={`p-3 text-sm font-bold ${trx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {trx.type === "income" ? "+" : "-"} {formatCurrency(trx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
