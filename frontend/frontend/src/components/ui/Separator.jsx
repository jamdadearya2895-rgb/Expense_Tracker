const Separator = ({ label }) => {
  return (
    <div className="relative flex items-center justify-center w-full mt-6 border-t border-gray-300 dark:border-gray-600">
      <p className="absolute -top-3 px-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        {label}
      </p>
    </div>
  );
};

export default Separator;
