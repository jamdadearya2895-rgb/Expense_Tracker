import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/ui/navbar";
import { setAuthToken } from "./libs/api";
import AccountPage from "./pages/account-page";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/settings";
import Transactions from "./pages/transaction";
import useStore from "./store/index.js";
// RootLayout now only protects routes, doesn't auto-redirect if user exists
const RootLayout = () => {
  const { user } = useStore((state) => state);

  useEffect(() => {
    // This side effect will run only when the user object changes
    setAuthToken(user?.token || "");
  }, [user]);

  // If there is NO user, redirect to the sign-in page
  if (!user) {
    return <Navigate to='/sign-in' replace={true} />;
  }

  // If a user exists, render the main application layout
  return (
    <>
      <Navbar />
      <div className='min-h-[calc(h-screen-100px)]'>
        <Outlet />
      </div>
    </>
  );
};

function App() {
  const { theme } = useStore();

  useEffect(() => {
    const root = window.document.documentElement; // This is the <html> tag

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);
  return (
    <main>
      <div className="w-full min-h-screen px-6 bg-gray-100 md:px-20 dark:bg-slate-900">
        <Routes>
          {/* Public routes */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          {/* Protected routes */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
        </Routes>
      </div>
      <Toaster richColors position="top-center" />
    </main>
  );
}

export default App;
