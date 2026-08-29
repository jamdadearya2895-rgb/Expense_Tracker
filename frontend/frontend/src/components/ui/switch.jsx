import { FiMoon, FiSun } from "react-icons/fi";
import useStore from "../../store";

const ThemeSwitch = () => {
  const { theme, setTheme } = useStore();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <button onClick={toggleTheme} className='p-2 rounded-full'>
      {theme === "dark" ? (
        <FiSun className='text-white text-2xl' />
      ) : (
        <FiMoon className='text-slate-800 text-2xl' />
      )}
    </button>
  );
};

export default ThemeSwitch;