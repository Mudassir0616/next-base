import { Checkbox, Pagination, Slider, Tooltip, styled } from "@mui/material";

const Swal = require("sweetalert2");

export const buildParams = (params) => {
  return params;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const sweetalert_default_error = () => {
  Swal.fire({
    icon: "error", // sets the icon of the modal to 'error'
    title: "Oops...", // title of the modal
    text: "Something went wrong!", // main text displayed in the modal
    footer: '<a href="#">Why do I have this issue?</a>', // footer containing a link for more info
  });
};

export const sweetalert_foundation_error = () => {
  Swal.fire({
    icon: "error", // sets the icon of the modal to 'error'
    title: "Foundation Round Incomplete", // title of the modal
    text: "Please complete your Foundation Round!", // main text displayed in the modal
  });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 2) {
    return parts[0];
  }
  return null; // Return null for the main domain without a subdomain
};

export const TooltipErrorMessage = ({ name, errors }) => {
  return errors[name] ? (
    <Tooltip
      title={errors[name]}
      open={true}
      placement="top-start"
      arrow
    ></Tooltip>
  ) : null;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////// Date Formate Utils //////////////////////////////////////////////////////////////////////

const today = new Date();
export const formattedTodayDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

export function formatDate(dateString) {
  // Parse the original date string into a Date object
  const date = new Date(dateString);

  // Extract the year, month, and day, adjusting the month for 1-indexing
  const year = date.getFullYear();
  // Adding 1 to get 1-12 for months and padStart to ensure two digits
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Concatenate into the desired format
  return `${year}-${month}-${day}`;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function formatWebsiteUrl(url) {
  if (!url?.startsWith("http://") && !url?.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

////////////////////////////////////////////////////////// Currency Utils //////////////////////////////////////////////////////////////////////////

export const company_currency_data = [
  { "id": 0, "text": "USD - United States Dollar ($)" },
  { "id": 1, "text": "EUR - European Euro (€)" },
  { "id": 2, "text": "GBP - British Pound (£)" },
  { "id": 3, "text": "ALL - Albanian Lek (Lek)" },
  { "id": 4, "text": "ARS - Argentine Peso ($)" },
  { "id": 5, "text": "AWG - Aruban Florin (ƒ)" },
  { "id": 6, "text": "AUD - Australian Dollar ($)" },
  { "id": 7, "text": "BSD - Bahamian Dollar ($)" },
  { "id": 8, "text": "BHD - Bahraini Dinar (د.ب.‏)" },
  { "id": 9, "text": "BBD - Barbadian Dollar ($)" },
  { "id": 10, "text": "BMD - Bermudian Dollar ($)" },
  { "id": 11, "text": "BOB - Bolivian Boliviano ($b)" },
  { "id": 12, "text": "BAM - Bosnia and Herzegovina Convertible Mark (KM)" },
  { "id": 13, "text": "BRL - Brazilian Real (R$)" },
  { "id": 14, "text": "BGN - Bulgarian Lev (лв.)" },
  { "id": 15, "text": "CAD - Canadian Dollar ($)" },
  { "id": 16, "text": "KYD - Cayman Islands Dollar ($)" },
  { "id": 17, "text": "CLP - Chilean Peso ($)" },
  { "id": 18, "text": "CNY - Chinese Yuan Renminbi (¥)" },
  { "id": 19, "text": "COP - Colombian Peso ($)" },
  { "id": 20, "text": "CRC - Costa Rican Colón (₡)" },
  { "id": 21, "text": "HRK - Croatian Kuna (kn)" },
  { "id": 22, "text": "CZK - Czech Koruna (Kč)" },
  { "id": 23, "text": "DKK - Danish Krone (kr.)" },
  { "id": 24, "text": "DOP - Dominican Peso (RD$)" },
  { "id": 25, "text": "EGP - Egyptian Pound (ج.م.‏)" },
  { "id": 26, "text": "GIP - Gibraltar Pound (£)" },
  { "id": 27, "text": "HKD - Hong Kong Dollar (HK$)" },
  { "id": 28, "text": "HUF - Hungarian Forint (Ft)" },
  { "id": 29, "text": "ISK - Icelandic Krona (kr.)" },
  { "id": 30, "text": "INR - Indian Rupee (रु)" },
  { "id": 31, "text": "IDR - Indonesian Rupiah (Rp)" },
  { "id": 32, "text": "ILS - Israeli New Shekel (₪)" },
  { "id": 33, "text": "JMD - Jamaican Dollar (J$)" },
  { "id": 34, "text": "JPY - Japanese Yen (¥)" },
  { "id": 35, "text": "JOD - Jordan Dinar (JOD)" },
  { "id": 36, "text": "KES - Kenyan Shilling (KSh)" },
  { "id": 37, "text": "KWD - Kuwaiti Dinar (د.ك.‏)" },
  { "id": 38, "text": "MYR - Malaysian Ringgit (RM)" },
  { "id": 39, "text": "IMP - Manx Pound (£)" },
  { "id": 40, "text": "MUR - Mauritian Rupee (₨)" },
  { "id": 41, "text": "MXN - Mexican Peso ($)" },
  { "id": 42, "text": "NZD - New Zealand Dollar ($)" },
  { "id": 43, "text": "NGN - Nigerian Naira (₦)" },
  { "id": 44, "text": "NOK - Norwegian Krone (kr)" },
  { "id": 45, "text": "PYG - Paraguayan Guarani (Gs)" },
  { "id": 46, "text": "PEN - Peruvian Sol (S/.)" },
  { "id": 47, "text": "PHP - Philippine Peso (PhP)" },
  { "id": 48, "text": "PLN - Polish Zloty (zł)" },
  { "id": 49, "text": "QAR - Qatari Riyal (ر.ق.‏)" },
  { "id": 50, "text": "RON - Romanian Leu (lei)" },
  { "id": 51, "text": "RUB - Russian Ruble (р.)" },
  { "id": 52, "text": "SAR - Saudi Arabian Riyal (ر.س.‏)" },
  { "id": 53, "text": "RSD - Serbian Dinar (Din.)" },
  { "id": 54, "text": "SGD - Singapore Dollar (S$)" },
  { "id": 55, "text": "ZAR - South African Rand (R)" },
  { "id": 56, "text": "KRW - South Korean Won (₩)" },
  { "id": 57, "text": "SEK - Swedish Krona (kr)" },
  { "id": 58, "text": "CHF - Swiss Franc (fr.)" },
  { "id": 59, "text": "TTD - Trinidad and Tobago Dollar (TT$)" },
  { "id": 60, "text": "TWD - New Taiwan Dollar (NT$)" },
  { "id": 61, "text": "TND - Tunisian Dinar (د.ت.‏)" },
  { "id": 62, "text": "TRY - Turkish Lira (TL)" },
  { "id": 63, "text": "UAH - Ukrainian Hryvnia (₴)" },
  { "id": 64, "text": "AED - UAE Dirham (د.إ.‏)" },
  { "id": 65, "text": "UYU - Uruguayan Peso ($U)" },
  { "id": 66, "text": "XOF - West African CFA Franc (CFA)" }
]

export function getCurrencySymbol(currencyId) {
  const currency = company_currency_data.find(
    (c) => c.id === Number(currencyId)
  );
  if (currency) {
    const match = currency.text.match(/\((.*?)\)$/); // Matches the content inside the last parentheses
    return match ? match[1] : "--"; // Returns the matched group which is the currency symbol
  }
  return "";
}

export function getCurrencyShortName(currencyId) {
  const currency = company_currency_data.find(
    (c) => c.id === Number(currencyId)
  );
  if (currency) {
    const curr_text = currency?.text?.split('-')?.[0]?.trim()
    return curr_text
  }
  return "";
}

export function formatNumberAsMoney(number) {
  if (number) {
    const format = new Intl.NumberFormat("en-US", { style: "decimal" }).format(number);
    return format
  } else {
    return "0";
  }
}

export const formatNumberWithCommas = (value) => {
  // Remove all non-numeric characters except commas and periods
  const cleanedValue = value.replace(/[^0-9.,]/g, "");

  // Convert to a number then back to localized string to format with commas
  const parts = cleanedValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export function formatNumberToMillions(value) {
  // Check if the value is falsy or not a finite number
  if (!value || !Number.isFinite(value)) {
    return '0';
  }

  // Convert value to a number to avoid type coercion issues later
  value = Number(value);

  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    return Math.round(value).toString();
  }
}

export function formatNegativeNumberToMillions(value) {
  // Check if the value is falsy or not a finite number
  if (!value || !Number.isFinite(value)) {
    return '0';
  }

  // Convert value to a number to avoid type coercion issues later
  value = Number(value);

  // Determine if the number is negative
  const isNegative = value < 0;

  // Use the absolute value for calculation to simplify logic
  const absoluteValue = Math.abs(value);

  let formattedNumber;

  if (absoluteValue >= 1000000000) {
    formattedNumber = (absoluteValue / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (absoluteValue >= 1000000) {
    formattedNumber = (absoluteValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (absoluteValue >= 1000) {
    formattedNumber = (absoluteValue / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    formattedNumber = Math.round(absoluteValue).toString();
  }

  // Prepend the negative sign if the original value was negative
  return isNegative ? '-' + formattedNumber : formattedNumber;
}

/////////////////////////////////////////////////////// Date Utils /////////////////////////////////////////////////////////////////////////////

function formatMonthName(date) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[date.getMonth()];
}

function generateMonthArrays(startDate, endDate) {
  const monthNames = [];
  const monthNumbers = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    monthNames.push(formatMonthName(currentDate));
    monthNumbers.push(currentDate.getMonth() + 1); // +1 because getMonth() is zero-indexed
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return { monthNames, monthNumbers };
}

export function getPreviousSixMonths() {
  const now = new Date();
  // Calculate the date six months ago and ensure it's correctly handled
  const six_months_ago = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const current_month = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Generate arrays for the month names and numbers
  const { monthNames, monthNumbers } = generateMonthArrays(six_months_ago, current_month);

  // Track each previous month's year correctly
  const previous_months = [];
  for (let i = 5; i >= 0; i--) {
    // Adjust the loop index to subtract months starting from the current month
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    previous_months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }

  return {
    year_min: six_months_ago.getFullYear(),
    month_min: six_months_ago.getMonth() + 1,
    year_max: current_month.getFullYear(),
    month_max: current_month.getMonth() + 1,
    monthNames,
    monthNumbers,
    previous_months,
  };
}

export function getNextSixMonths() {
  const now = new Date();
  const next_month_start = new Date(now.getFullYear(), now.getMonth(), 1);
  const six_months_later = new Date(now.getFullYear(), now.getMonth() + 6, 0);

  // Generate arrays for the month names and numbers
  const { monthNames, monthNumbers } = generateMonthArrays(next_month_start, six_months_later);

  // Track future months' year correctly
  const next_months = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    next_months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }

  return {
    year_min: next_month_start.getFullYear(),
    month_min: next_month_start.getMonth() + 1,
    year_max: six_months_later.getFullYear(),
    month_max: six_months_later.getMonth() + 1,
    monthNames,
    monthNumbers,
    next_months,
  };
}

export function getMonthName(monthNumber) {
  const months = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  // Check if the monthNumber is within the 1-12 range
  if (monthNumber >= 1 && monthNumber <= 12) {
    // Arrays are zero-indexed, subtract 1 to get correct month
    return months[monthNumber - 1];
  } else {
    return 'Invalid month number'; // Handle invalid input
  }
}

// Convert month number to string
const monthToString = (monthNumber) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1; // Handles December to January transition

  if (monthNumber === currentMonth) {
    return "This Month";
  } else if (monthNumber === nextMonth) {
    return "Next Month";
  } else if (
    monthNumber === currentMonth - 1 ||
    (currentMonth === 0 && monthNumber === 11)
  ) {
    return "Last Month";
  } else {
    // Fallback for any other month
    const date = new Date();
    date.setMonth(monthNumber);
    return date.toLocaleString("default", { month: "long" });
  }
};

export const getMonthOptions = () => {
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  return [
    { value: lastMonth + 1, label: monthToString(lastMonth) },
    { value: currentMonth + 1, label: monthToString(currentMonth) },
    { value: currentMonth + 2, label: monthToString(currentMonth + 1) },
  ];
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const handleWheel = (event) => {
  // Prevent scrolling inside input from changing the number
  event.target.blur();
};

// Function to capitalize only the first word
export function capitalizeFirstWord(str) {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


// Helper function to parse CSV-like data into JSON
export function parseCSVToJSON(csvString) {
  const lines = csvString.split("\n"); // Split into rows
  const headers = lines[0].split(","); // Extract headers from the first row

  // Parse rows into objects
  const records = lines.slice(1).map((line) => {
    const values = line.split(","); // Split each row into values
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim() || ""; // Map headers to values
      return obj;
    }, {});
  });

  return records;
}


const contact_form_json = [
  {
    type: "text",
    name: "first_name",
    label: "First Name",
    fullWidth: true,
    xs: 12,
    sm: 6,
    md: 6,
    lg: 6,
    validation_message: "Please enter your First Name",
    required: true,
  },
  {
    type: "text",
    name: "last_name",
    label: "Last Name",
    fullWidth: true,
    xs: 12,
    sm: 6,
    md: 6,
    lg: 6,
    validation_message: "Please enter your Last Name",
    required: true,
  },
  {
    type: "email",
    name: "email",
    label: "Email",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    validation_message: "Please enter your Email",
    required: true,
  },
  {
    type: "number",
    name: "phone",
    label: "Phone Number",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    validation_message: "Please enter your Phone Number",
    required: true,
  },
  {
    type: "number",
    name: "age",
    label: "Age",
    fullWidth: true,
    min: 18,
    max: 65,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    validation_message: "Please enter your age between 18 and 65",
    required: true,
  },
  {
    type: "time",
    name: "appointment_time",
    label: "Appointment Time",
    validation_message: "Please select a time",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 6,
    required: true,
  },
  {
    type: "date-time",
    name: "event_datetime",
    label: "Event Date & Time",
    validation_message: "Please select a date and time",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 6,
    required: true,
  },
  {
    type: "checkbox",
    name: "terms",
    label: "I accept the terms and conditions",
    validation_message: "You must accept the terms and conditions",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 6,
    required: true,
  },
  {
    type: "switch",
    name: "newsletter",
    label: "Subscribe to newsletter",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 6,
    required: true,
  },
  {
    type: "file",
    name: "resume",
    label: "Upload Resume",
    validation_message: "Please upload your resume",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 6,
    required: true,
  },
  {
    type: "text",
    name: "username",
    label: "Username",
    pattern: "^[a-zA-Z0-9_]{5,15}$",
    pattern_message:
      "Username must be 5-15 characters and contain only letters, numbers, and underscores",
    validation_message: "Please enter a username",
    fullWidth: true,
    xs: 12,
    sm: 12,
    md: 12,
    lg: 6,
    required: true,
  },
  {
    type: "hidden",
    name: "user_id",
    initialValue: "12345",
  },
  {
    type: "url",
    name: "website",
    label: "Website",
    validation_message: "Please enter a valid URL",
    fullWidth: true,
    xs: 12,
    required: true,
  },
  {
    type: "tel",
    name: "phone",
    label: "Phone Number",
    validation_message: "Please enter a valid phone number",
    fullWidth: true,
    xs: 12,
    required: true,
  },
  {
    type: "slider",
    name: "satisfaction",
    label: "Satisfaction Level",
    min: 0,
    max: 10,
    step: 1,
    validation_message: "Please select a value",
    required: true,
  },
  {
    type: "rating",
    name: "rating",
    label: "Rate our service",
    validation_message: "Please provide a rating",
    required: true,
  },
  {
    type: "chips",
    name: "rating",
    label: "Rate our service",
    validation_message: "Please provide a rating",
    required: true,
    fullWidth: true,
    xs: 12,
    max_items: 8,
  },
];

export const products = [
  {
    name: "Cross CR SP 85",
    stock: 10,
    image: "/images/speaker.png",
    category: "xyz",
    price: "255.00",
    slug: "123",
  },
  {
    name: "Cross CR SP uuuu",
    stock: 10,
    image: "/images/speaker.png",
    category: "xyz",
    price: "255.00",
    slug: "123",
  },
  {
    name: "Cross CR SP 8fdsf5",
    stock: 10,
    image: "/images/speaker.png",
    category: "xyz",
    price: "255.00",
    slug: "123",
  },
  {
    name: "Cross CR SP 86545",
    stock: 10,
    image: "/images/speaker.png",
    category: "xyz",
    price: "255.00",
    slug: "123",
  },
  {
    name: "Cross CR SP hgh4",
    stock: 10,
    image: "/images/speaker.png",
    category: "xyz",
    price: "255.00",
    slug: "123",
  },
];

export const productDetail = {
  name: "CROSS CR-226 4 W Bluetooth Speaker  (Black, Stereo Channel)",
  category: "Speakers",
  price: "500.00",
  striked_price: "600.00",
  stock: 10,
  image: "/images/img-5.png",
  short_description:
    "Horem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
  product_images: [
    "/images/img-1.png",
    "/images/img-2.png",
    "/images/img-3.png",
    "/images/img-4.png",
  ],
  variants: [
    {
      id: 224,
      name: "Water Lily Stick - Colors: Orange",
      product: 81,
      price: 995,
      is_available: true,
      quantity: 80,
      api_variant_option: [
        {
          id: 51,
          variant_type: "Colors",
          variant: "Orange",
          variant_image: ["/media/product_images/AF935_1.jpg"],
        },
      ],
    },
    {
      id: 225,
      name: "Water Lily Stick - Colors: white, Colors: Grey",
      product: 81,
      price: 995,
      is_available: true,
      quantity: 20,
      api_variant_option: [
        {
          id: 14,
          variant_type: "Colors",
          variant: "white",
          variant_image: ["/media/product_images/AF935_2.jpg"],
        },
        {
          id: 65,
          variant_type: "Colors",
          variant: "Grey",
          variant_image: ["/media/product_images/AF935_2.jpg"],
        },
      ],
    },
    {
      id: 226,
      name: "Water Lily Stick - Colors: Brown Grey, Colors: Dark Pink",
      product: 81,
      price: 995,
      is_available: true,
      quantity: 80,
      api_variant_option: [
        {
          id: 18,
          variant_type: "Colors",
          variant: "Brown Grey",
          variant_image: ["/media/product_images/AF935_3.jpg"],
        },
        {
          id: 47,
          variant_type: "Colors",
          variant: "Dark Pink",
          variant_image: ["/media/product_images/AF935_3.jpg"],
        },
      ],
    },
    {
      id: 227,
      name: "Water Lily Stick - Colors: Brown Grey, Colors: Exotic Green",
      product: 81,
      price: 995,
      is_available: true,
      quantity: 50,
      api_variant_option: [
        {
          id: 18,
          variant_type: "Colors",
          variant: "Brown Grey",
          variant_image: ["/media/product_images/AF935_4.jpg"],
        },
        {
          id: 55,
          variant_type: "Colors",
          variant: "Exotic Green",
          variant_image: ["/media/product_images/AF935_4.jpg"],
        },
      ],
    },
  ],

  feature_text: `<div style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0 auto;">
  <p>
    <strong>It is normal for USB flash drives to get a little hot.</strong> When the USB flash drive is powered on, it will transfer data, causing the electronic components inside the drive to give off heat. The chip generates heat according to factors such as the length of power-on time, the frequency of read and write operations, and the speed of read and write. Because metal has good thermal conductivity and heat dissipation, heating of the metal USB flash drive is a normal phenomenon, which is not a quality problem. The USB flash drive chip can withstand a high temperature of 85°C and the USB flash drive will not be damaged by the heat. Please rest assured use.
  </p>
  
  <h3 style="margin-top: 20px; margin-bottom: 0; color: #333; font-size: 16px;">Broad Compatibility</h3>
  <p>Works with iOS 8 and above, Android systems, and more.</p>
  
  <h3 style="margin-top: 20px; margin-bottom: 0; color: #333; font-size: 16px;">App Requirement for iOS</h3>
  <p>Use the 'Y DISK' app, available for free on the App Store, to enable functionality on iPhone/iPad devices.</p>
  
  <h3 style="margin-top: 20px; margin-bottom: 0; color: #333; font-size: 16px;">No App Needed for Android</h3>
  <p>Simply turn on the OTG function to use on Android devices—no app installation required.</p>
  
  <h3 style="margin-top: 20px; margin-bottom: 0; color: #333; font-size: 16px;">Multi-Interface Design</h3>
  <p>Supports seamless connection between multiple devices for efficient data sharing.</p>
  
  <h3 style="margin-top: 20px; margin-bottom: 0; color: #333; font-size: 16px;">Efficient Heat Dissipation</h3>
  <p>Engineered for excellent performance and high-speed data transmission, even under heavy use.</p>
</div>

`
};


export const cities = [
  { value: "mumbai", label: "Mumbai" },
  { value: "delhi", label: "Delhi" },
  { value: "bengaluru", label: "Bengaluru" },
  { value: "chennai", label: "Chennai" },
  { value: "kolkata", label: "Kolkata" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "ahmedabad", label: "Ahmedabad" },
  { value: "pune", label: "Pune" },
  { value: "jaipur", label: "Jaipur" },
  { value: "surat", label: "Surat" },
  { value: "lucknow", label: "Lucknow" },
  { value: "kanpur", label: "Kanpur" },
  { value: "nagpur", label: "Nagpur" },
  { value: "indore", label: "Indore" },
  { value: "thane", label: "Thane" },
  { value: "bhopal", label: "Bhopal" },
  { value: "visakhapatnam", label: "Visakhapatnam" },
  { value: "patna", label: "Patna" },
  { value: "vadodara", label: "Vadodara" },
  { value: "ghaziabad", label: "Ghaziabad" },
  { value: "ludhiana", label: "Ludhiana" },
  { value: "agra", label: "Agra" },
  { value: "nashik", label: "Nashik" },
  { value: "faridabad", label: "Faridabad" },
  { value: "meerut", label: "Meerut" },
  { value: "rajkot", label: "Rajkot" },
  { value: "kalyan", label: "Kalyan" },
  { value: "vasai-virar", label: "Vasai-Virar" },
  { value: "varanasi", label: "Varanasi" },
  { value: "srinagar", label: "Srinagar" },
  { value: "aurangabad", label: "Aurangabad" },
  { value: "dhanbad", label: "Dhanbad" },
  { value: "amritsar", label: "Amritsar" },
  { value: "navi-mumbai", label: "Navi Mumbai" },
  { value: "allahabad", label: "Allahabad" },
  { value: "ranchi", label: "Ranchi" },
  { value: "howrah", label: "Howrah" },
  { value: "coimbatore", label: "Coimbatore" },
  { value: "jabalpur", label: "Jabalpur" },
  { value: "gwalior", label: "Gwalior" },
  { value: "vijayawada", label: "Vijayawada" },
  { value: "jodhpur", label: "Jodhpur" },
  { value: "madurai", label: "Madurai" },
  { value: "raipur", label: "Raipur" },
  { value: "kota", label: "Kota" },
  { value: "guwahati", label: "Guwahati" },
  { value: "chandigarh", label: "Chandigarh" },
  { value: "solapur", label: "Solapur" },
  { value: "hubli", label: "Hubli" },
];


export const CustomSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': {
    border: 'none !important',
    backgroundColor: '#E10600 !important',
    height: '6px !important',
  },
  '& .MuiSlider-thumb': {
    backgroundColor: '#E10600 !important',
  },
  '& .MuiSlider-rail': {
    backgroundColor: '#F4F4F4 !important',
    opacity: '1 !important',
    height: '6px !important',
  },
}));

export const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
  "&.Mui-checked": {
    color: "#E10600 !important",
  },
}));

export const CustomPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    color: theme.palette.common.white, // White text color for pagination items
    backgroundColor: "#b6b6b6", // Dark background for pagination items
    borderRadius: "8px", // Rounded corners for items
    margin: "0 4px", // Slight spacing between items
    "&:hover": {
      backgroundColor: "#E10600", // Darker shade on hover
    },
    "&.Mui-selected": {
      backgroundColor: "#E10600", // Primary color for selected page
      color: theme.palette.common.white, // White text color for selected item
      fontWeight: "bold",
    },

    //change arrow colors to red
    "&.Mui-ArrowIcon": {
      color: "#E10600",
    },
  },
}));


/* <style jsx global>{`
  html {
    font-family: ${poppinsExpanded.style.fontFamily};
    font-optical-sizing: auto;
    font-weight: 400; /* or any specific weight you want */
// font-style: normal;
// font-variation-settings: "wdth" 150;
// }
// h1,
// h2,
// h3,
// h4,
// h5,
// h6 {
//   font-family: ${poppinsExpanded.style.fontFamily};
//   font-optical-sizing: auto;
//   font-style: normal;
// }
// `}</style> */}
