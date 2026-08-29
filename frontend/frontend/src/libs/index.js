export const formatCurrency = (value) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (isNaN(value)) {
        return "Invalid input";
    }

    const numberValue = typeof value === "string" ? parseFloat(value) : value;

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: user?.currency || "USD",
        minimumFractionDigits: 2,
    }).format(numberValue);
};

export const maskAccountNumber = (accountNumber) => {
    if (typeof accountNumber !== "string" || accountNumber.length < 8) {
        return accountNumber; // Return original if it's not a long string
    }

    const firstFour = accountNumber.substring(0, 4);
    const lastFour = accountNumber.substring(accountNumber.length - 4);
    const maskedSection = "*".repeat(accountNumber.length - 8);

    return `${firstFour}${maskedSection}${lastFour}`;
};

export const getSevenDaysAgo = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split("T")[0];
};

export const fetchCountriesData = async () => {
    try {
        // Specify only the fields you need
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,currencies");
        const data = await response.json();

        if (response.ok) {
            const formattedCountries = data
                .map((country) => {
                    const currencyCode = Object.keys(country.currencies || {})[0];
                    return {
                        name: country.name.common,
                        flag: country.flags.svg,
                        currency: currencyCode || "USD", // Default to USD if currency not found
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

            return formattedCountries;
        } else {
            console.error("Failed to fetch countries:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching countries:", error);
        return [];
    }
};
