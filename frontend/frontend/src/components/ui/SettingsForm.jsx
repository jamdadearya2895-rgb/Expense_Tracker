import { Combobox, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { BsChevronExpand } from "react-icons/bs";
import { RiCheckLine } from "react-icons/ri";
import { toast } from "sonner";
import * as z from "zod";
import api from "../../libs/api.jsx";
import { fetchCountriesData } from "../../libs/index.js";
import useStore from "../../store/index.js";
import { Button } from "./button.jsx";
import Input from "./input.jsx";
import ThemeSwitch from "./switch.jsx";

// --- Zod Schema for form validation ---
const FormSchema = z.object({
  firstname: z.string().min(2, { message: "First name is required." }),
  lastname: z.string().optional(),
  contact: z.string().optional(),
});

// --- CountryCombobox component ---
const CountryCombobox = ({ selected, setSelected, countries, query, setQuery }) => {
  const filteredCountries =
    query === ""
      ? countries
      : countries.filter((country) =>
          country.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white dark:bg-slate-800 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm border dark:border-gray-800 dark:bg-transparent">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-400 focus:ring-0 dark:bg-transparent dark:placeholder:text-gray-700 dark:outline-none"
            displayValue={(country) => country?.name}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Select Country"
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <BsChevronExpand className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filteredCountries.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-400">
                Nothing found.
              </div>
            ) : (
              filteredCountries.map((country) => (
                <Combobox.Option
                  key={country.name}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? "bg-violet-500/10 text-gray-900 dark:text-white"
                        : "text-gray-900 dark:text-gray-500"
                    }`
                  }
                  value={country}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        <img
                          src={country.flag}
                          alt={country.name}
                          className="inline-block w-5 h-4 mr-2"
                        />
                        {country.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-violet-600" : "text-violet-600"
                          }`}
                        >
                          <RiCheckLine className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};
// --- End CountryCombobox ---

const SettingsForm = () => {
  const { user, setCredentials } = useStore();

  const [selectedCountry, setSelectedCountry] = useState(
    user?.country ? { name: user.country, currency: user.currency } : null
  );
  const [query, setQuery] = useState("");
  const [countriesData, setCountriesData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      contact: user?.contact || "",
    },
  });

  // Fetch countries
  useEffect(() => {
    const getCountries = async () => {
      const data = await fetchCountriesData();
      setCountriesData(data);

      if (user?.country) {
        const defaultCountry = data.find(
          (c) => c.name === user.country || c.currency === user.currency
        );
        setSelectedCountry(defaultCountry || null);
      }
    };
    getCountries();
  }, [user?.country, user?.currency]);

  // --- Form Submission Handler ---
  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const newData = {
        firstname: values.firstname,
        lastname: values.lastname,
        contact: values.contact,
        country: selectedCountry?.name || user?.country || "",
        currency: selectedCountry?.currency || user?.currency || "",
      };

      const { data: res } = await api.put(`/user/${user.id}`, newData);

      if (res?.user) {
        toast.success(res?.message);
        const userToSave = { ...res?.user, token: user?.token };
        localStorage.setItem("user", JSON.stringify(userToSave));
        setCredentials(userToSave);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* --- Personal Information --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...form.register("firstname")}
          label="First Name"
          placeholder="John"
          error={form.formState.errors.firstname?.message}
          disabled={isLoading}
        />
        <Input
          {...form.register("lastname")}
          label="Last Name"
          placeholder="Doe"
          error={form.formState.errors.lastname?.message}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email Address"
          placeholder={user?.email}
          disabled={true}
        />
        <Input
          {...form.register("contact")}
          label="Contact"
          placeholder="(123) 456-7890"
          error={form.formState.errors.contact?.message}
          disabled={isLoading}
        />
      </div>

      {/* --- Country and Currency --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country
          </label>
          <CountryCombobox
            selected={selectedCountry}
            setSelected={setSelectedCountry}
            countries={countriesData}
            query={query}
            setQuery={setQuery}
            disabled={isLoading}
          />
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Currency
          </label>
          <Input
            value={selectedCountry?.currency || user?.currency || "USD"}
            disabled={true}
          />
        </div>
      </div>

      {/* --- Appearance --- */}
      <div className="w-full flex items-center justify-between py-10 border-t border-t-gray-200 dark:border-t-gray-700">
        <div className="flex flex-col">
          <p className="text-black dark:text-white font-semibold">Appearance</p>
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            Customize how your app looks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Dark Mode</p>
          <ThemeSwitch />
        </div>
      </div>

      {/* --- Language --- */}
      <div className="w-full flex items-center justify-between py-6 border-t border-t-gray-200 dark:border-t-gray-700">
        <div className="flex flex-col">
          <p className="text-black dark:text-white font-semibold">Language</p>
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            Set your preferred language
          </span>
        </div>
        <select
          disabled={isLoading}
          className="w-[120px] p-2 rounded-md bg-white dark:bg-slate-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-violet-500 focus:border-violet-500"
        >
          <option value="en">English</option>
        </select>
      </div>

      {/* --- Actions --- */}
      <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-800 pt-8">
        <Button
          type="reset"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <BiLoaderAlt className="animate-spin" /> Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SettingsForm;
