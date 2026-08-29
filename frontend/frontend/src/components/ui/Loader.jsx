import { ImSpinner9 } from "react-icons/im";

const Loader = () => {
  return (
    <div className='w-full h-full flex items-center justify-center'>
      <ImSpinner9 className='animate-spin text-4xl text-violet-600' />
    </div>
  );
};

export default Loader;