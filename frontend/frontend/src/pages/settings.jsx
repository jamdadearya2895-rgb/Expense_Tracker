import ChangePassword from "../components/ui/changepassword.jsx";
import SettingsForm from "../components/ui/SettingsForm.jsx";
import Title from "../components/ui/title.jsx";
import useStore from "../store";
const Settings = () => {
  const { user } = useStore((state) => state);

  return (
    <div className='w-full flex flex-col items-center'>
      <div className='w-full max-w-4xl px-4 py-6 shadow-lg bg-gray-50 dark:bg-black/20 md:px-10 md:my-10'>
        <div className='w-full border-b-2 border-gray-200 dark:border-gray-800'>
          <Title title='General Settings' />
        </div>

        <div className='py-10'>
          <p className='text-lg font-bold text-black dark:text-white'>
            Profile Information
          </p>
          <div className='flex items-center gap-4 my-8'>
            <div className='flex items-center justify-center w-12 h-12 text-white rounded-full cursor-pointer bg-violet-600'>
              <span className='text-2xl font-bold'>
                {user?.firstname?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className='text-xl font-semibold text-black dark:text-gray-400'>
                {user?.firstname} {user?.lastname}
              </p>
            </div>
          </div>
        </div>

        <SettingsForm />

        {/* Conditionally render ChangePassword if user didn't sign up with a social provider */}
        {!user?.provider && <ChangePassword />}
      </div>
    </div>
  );
};

export default Settings;