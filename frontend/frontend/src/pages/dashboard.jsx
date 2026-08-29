import { useEffect, useState } from "react";
import Stats from "../components/ui/stats.jsx";
import Info from "../components/ui/wrapper/info.jsx";
import api, { setAuthToken } from "../libs/api";
import useStore from "../store";

const Dashboard = () => {
  const user = useStore((state) => state.user);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  if (!user?.token) return; // safe check

  setAuthToken(user.token);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/transactions/dashboard");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setData({
        availableBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  fetchDashboardData();
}, [user?.token]);


  if (!user?.token || isLoading) {
    return <div>Please Sign in again..</div>;
  }

  return (
    <div className="w-full px-0 md:px-5 2xl:px-20">
      <Info title="Dashboard" subTitle="Monitor your financial activities" />
      <Stats
        dt={{
          balance: data?.availableBalance,
          income: data?.totalIncome,
          expense: data?.totalExpense,
        }}
      />
    </div>
  );
};

export default Dashboard;
