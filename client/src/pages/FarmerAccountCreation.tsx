import React, { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import leafImage from "@assets/entypo_leaf_1756517515112.png";
import { api } from "@/utils/api";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  // Home Address
  homeHouseNumber: string;
  homeStreet: string;
  homeBusStop: string;
  homeAdditionalDesc: string;
  homeCountry: string;
  homeState: string;
  homeLocalGov: string;
  homePostcode: string;
  // Farm Address
  farmHouseNumber: string;
  farmStreet: string;
  farmBusStop: string;
  farmAdditionalDesc: string;
  farmCountry: string;
  farmState: string;
  farmLocalGov: string;
  farmPostcode: string;
}

export const FarmerAccountCreation = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { isLoading } = useLoading({ minimumLoadTime: 600 });

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    // Home Address
    homeHouseNumber: "",
    homeStreet: "",
    homeBusStop: "",
    homeAdditionalDesc: "",
    homeCountry: "",
    homeState: "",
    homeLocalGov: "",
    homePostcode: "",
    // Farm Address
    farmHouseNumber: "",
    farmStreet: "",
    farmBusStop: "",
    farmAdditionalDesc: "",
    farmCountry: "",
    farmState: "",
    farmLocalGov: "",
    farmPostcode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading account creation..." />;
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when country or state changes for home address
      if (field === "homeCountry") {
        newData.homeState = "";
        newData.homeLocalGov = "";
      } else if (field === "homeState") {
        newData.homeLocalGov = "";
      }

      // Reset dependent fields when country or state changes for farm address
      if (field === "farmCountry") {
        newData.farmState = "";
        newData.farmLocalGov = "";
      } else if (field === "farmState") {
        newData.farmLocalGov = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Transform form data to match backend format
      const backendData = {
        userType: "farmer",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        homeStreet: formData.homeStreet,
        homeHouseNumber: formData.homeHouseNumber,
        homeAdditionalDesc: formData.homeAdditionalDesc,
        homeBusStop: formData.homeBusStop,
        homeLocalGov: formData.homeLocalGov,
        homePostcode: formData.homePostcode,
        homeState: formData.homeState,
        homeCountry: formData.homeCountry,
        farmStreet: formData.farmStreet,
        farmHouseNumber: formData.farmHouseNumber,
        farmAdditionalDesc: formData.farmAdditionalDesc,
        farmBusStop: formData.farmBusStop,
        farmLocalGov: formData.farmLocalGov,
        farmPostcode: formData.farmPostcode,
        farmState: formData.farmState,
        farmCountry: formData.farmCountry,
      };

      // Call your backend API
      const response = await api.farmers.register(backendData);
      console.log("Registration successful:", response);

      // Navigate to verification page
      setLocation("/farmer-verification");
    } catch (error) {
      console.error("Error creating account:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error creating account. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    // Navigate to login page
    alert("Navigate to login page");
  };

  // Nigerian states for dropdown
  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  // Ghanaian regions for dropdown
  const ghanaianRegions = [
    "Ashanti",
    "Brong-Ahafo",
    "Central",
    "Eastern",
    "Greater Accra",
    "Northern",
    "Upper East",
    "Upper West",
    "Volta",
    "Western",
    "Western North",
    "Ahafo",
    "Bono",
    "Bono East",
    "North East",
    "Savannah",
    "Oti",
  ];

  // Get states/regions based on selected country
  const getStatesForCountry = (country: string): string[] => {
    switch (country) {
      case "Nigeria":
        return nigerianStates;
      case "Ghana":
        return ghanaianRegions;
      default:
        return [];
    }
  };

  // Sample LGAs for Lagos (can be expanded based on selected state)
  const lagosLGAs = [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ];

  // Sample LGAs for Nigerian states
  const getStateLGAs = (state: string, country: string): string[] => {
    if (country === "Nigeria") {
      switch (state) {
        case "Lagos":
          return lagosLGAs;
        case "Ogun":
          return [
            "Abeokuta North",
            "Abeokuta South",
            "Ado-Odo/Ota",
            "Ewekoro",
            "Ifo",
            "Ijebu East",
            "Ijebu North",
            "Ijebu North East",
            "Ijebu Ode",
            "Ikenne",
            "Imeko Afon",
            "Ipokia",
            "Obafemi Owode",
            "Odeda",
            "Odogbolu",
            "Ogun Waterside",
            "Remo North",
            "Sagamu",
            "Yewa North",
            "Yewa South",
          ];
        case "Kano":
          return [
            "Ajingi",
            "Albasu",
            "Bagwai",
            "Bebeji",
            "Bichi",
            "Bunkure",
            "Dala",
            "Dambatta",
            "Dawakin Kudu",
            "Dawakin Tofa",
            "Doguwa",
            "Fagge",
            "Gabasawa",
            "Garko",
            "Garun Mallam",
            "Gaya",
            "Gezawa",
            "Gwale",
            "Gwarzo",
            "Kabo",
            "Kano Municipal",
            "Karaye",
            "Kibiya",
            "Kiru",
            "Kumbotso",
            "Kunchi",
            "Kura",
            "Madobi",
            "Makoda",
            "Minjibir",
            "Nasarawa",
            "Rano",
            "Rimin Gado",
            "Rogo",
            "Shanono",
            "Sumaila",
            "Takai",
            "Tarauni",
            "Tofa",
            "Tsanyawa",
            "Tudun Wada",
            "Ungogo",
            "Warawa",
            "Wudil",
          ];
        case "FCT":
          return [
            "Abaji",
            "Bwari",
            "Gwagwalada",
            "Kuje",
            "Municipal Area Council",
            "Kwali",
          ];
        case "Rivers":
          return [
            "Abua/Odual",
            "Ahoada East",
            "Ahoada West",
            "Akuku-Toru",
            "Andoni",
            "Asari-Toru",
            "Bonny",
            "Degema",
            "Eleme",
            "Emuoha",
            "Etche",
            "Gokana",
            "Ikwerre",
            "Khana",
            "Obio/Akpor",
            "Ogba/Egbema/Ndoni",
            "Ogu/Bolo",
            "Okrika",
            "Omuma",
            "Opobo/Nkoro",
            "Oyigbo",
            "Port Harcourt",
            "Tai",
          ];
        default:
          return ["Municipal", "Central", "North", "South", "East", "West"];
      }
    } else if (country === "Ghana") {
      // Ghana uses districts instead of LGAs
      switch (state) {
        case "Greater Accra":
          return [
            "Accra Metropolitan",
            "Tema Metropolitan",
            "Adenta Municipal",
            "Ashaiman Municipal",
            "Ga East Municipal",
            "Ga South Municipal",
            "Ga West Municipal",
            "Kpone-Katamanso",
            "Ledzokuku-Krowor Municipal",
            "Weija-Gbawe Municipal",
          ];
        case "Ashanti":
          return [
            "Kumasi Metropolitan",
            "Obuasi Municipal",
            "Ejisu Municipal",
            "Juaben Municipal",
            "Bekwai Municipal",
            "Asante Akim North Municipal",
            "Asante Akim South Municipal",
            "Kwabre East Municipal",
          ];
        case "Northern":
          return [
            "Tamale Metropolitan",
            "Yendi Municipal",
            "Zabzugu",
            "Tatale-Sanguli",
            "Gushegu Municipal",
            "Karaga",
            "Kumbungu",
            "Nanton",
            "Savelugu Municipal",
            "Sagnarigu Municipal",
            "Tolon",
          ];
        default:
          return [
            "Metropolitan",
            "Municipal",
            "District A",
            "District B",
            "District C",
          ];
      }
    }
    return [];
  };

  // Get cities/towns based on state and country
  const getStateCities = (state: string, country: string): string[] => {
    if (country === "Nigeria") {
      switch (state) {
        case "Lagos":
          return [
            "Lagos",
            "Ikeja",
            "Victoria Island",
            "Ikoyi",
            "Lekki",
            "Surulere",
            "Yaba",
            "Maryland",
            "Magodo",
            "Gbagada",
            "Ajah",
            "Ikorodu",
            "Badagry",
            "Epe",
          ];
        case "Ogun":
          return [
            "Abeokuta",
            "Sagamu",
            "Ijebu Ode",
            "Ota",
            "Ilaro",
            "Ayetoro",
            "Imeko",
            "Ipokia",
          ];
        case "Kano":
          return [
            "Kano",
            "Wudil",
            "Gwarzo",
            "Rano",
            "Karaye",
            "Rogo",
            "Bagwai",
            "Dawakin Kudu",
          ];
        case "FCT":
          return [
            "Abuja",
            "Gwagwalada",
            "Kuje",
            "Bwari",
            "Kwali",
            "Garki",
            "Wuse",
            "Maitama",
            "Asokoro",
            "Gwarinpa",
          ];
        case "Rivers":
          return [
            "Port Harcourt",
            "Obio-Akpor",
            "Okrika",
            "Eleme",
            "Ikwerre",
            "Etche",
            "Oyigbo",
            "Degema",
            "Ahoada",
            "Bonny",
          ];
        default:
          return [
            "Main City",
            "Central",
            "North",
            "South",
            "East",
            "West",
            "Other",
          ];
      }
    } else if (country === "Ghana") {
      switch (state) {
        case "Greater Accra":
          return [
            "Accra",
            "Tema",
            "Adenta",
            "Ashaiman",
            "Madina",
            "Teshie",
            "Nungua",
            "Kasoa",
            "Dansoman",
            "East Legon",
          ];
        case "Ashanti":
          return [
            "Kumasi",
            "Obuasi",
            "Ejisu",
            "Juaben",
            "Bekwai",
            "Mampong",
            "Konongo",
            "Agogo",
          ];
        case "Northern":
          return [
            "Tamale",
            "Yendi",
            "Zabzugu",
            "Gushegu",
            "Karaga",
            "Savelugu",
            "Tolon",
            "Kumbungu",
          ];
        case "Western":
          return [
            "Sekondi-Takoradi",
            "Tarkwa",
            "Axim",
            "Half Assini",
            "Prestea",
            "Bogoso",
            "Elubo",
          ];
        case "Central":
          return [
            "Cape Coast",
            "Elmina",
            "Kasoa",
            "Winneba",
            "Swedru",
            "Dunkwa",
            "Ajumako",
          ];
        default:
          return ["Main City", "Town A", "Town B", "Town C", "Other"];
      }
    }
    return [];
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-6 py-8 md:px-8 lg:px-16">
        {/* Mobile Layout */}
        <div className="md:hidden max-w-md mx-auto w-full animate-fadeInUp">
          <div className="p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🌱 Create your farmer account
            </h1>
            <p className="text-gray-600 mb-6">
              Already have an account?{" "}
              <button
                onClick={handleLogin}
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                data-testid="link-login"
              >
                Log In
              </button>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    data-testid="input-first-name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    data-testid="input-last-name"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-phone"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-password"
                  required
                />
              </div>

              {/* Location Section */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Where do you live?
                </h3>

                {/* House Number & Street */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12"
                      value={formData.homeHouseNumber}
                      onChange={(e) =>
                        handleInputChange("homeHouseNumber", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-house-number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jadesola Avenue"
                      value={formData.homeStreet}
                      onChange={(e) =>
                        handleInputChange("homeStreet", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-street"
                      required
                    />
                  </div>
                </div>

                {/* Nearest Bus Stop */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nearest Bus Stop
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Agindingbi"
                    value={formData.homeBusStop}
                    onChange={(e) =>
                      handleInputChange("homeBusStop", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    data-testid="input-bus-stop"
                    required
                  />
                </div>

                {/* Additional Address Information */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Address Information (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apartment 3B, Behind GTBank"
                    value={formData.homeAdditionalDesc}
                    onChange={(e) =>
                      handleInputChange("homeAdditionalDesc", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    data-testid="input-additional-address"
                  />
                </div>

                {/* Country */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.homeCountry}
                    onChange={(e) =>
                      handleInputChange("homeCountry", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                    data-testid="select-country"
                    required
                    style={{ position: "relative", zIndex: 10 }}
                  >
                    <option value="">Select Country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                  </select>
                </div>

                {/* State & LGA */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      value={formData.homeState}
                      onChange={(e) =>
                        handleInputChange("homeState", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-state"
                      required
                      disabled={!formData.homeCountry}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select State</option>
                      {formData.homeCountry &&
                        getStatesForCountry(formData.homeCountry).map(
                          (state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LGA
                    </label>
                    <select
                      value={formData.homeLocalGov}
                      onChange={(e) =>
                        handleInputChange("homeLocalGov", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-lga"
                      required
                      disabled={!formData.homeState}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select LGA</option>
                      {formData.homeState &&
                        formData.homeCountry &&
                        getStateLGAs(
                          formData.homeState,
                          formData.homeCountry,
                        ).map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* City/Town & ZIP */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City/Town
                    </label>
                    <select
                      value={formData.homeLocalGov}
                      onChange={(e) =>
                        handleInputChange("homeLocalGov", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-city-town"
                      required
                      disabled={!formData.homeState}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select City/Town</option>
                      {formData.homeState &&
                        formData.homeCountry &&
                        getStateCities(
                          formData.homeState,
                          formData.homeCountry,
                        ).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 102420"
                      value={formData.homePostcode}
                      onChange={(e) =>
                        handleInputChange("homePostcode", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-zip-code"
                    />
                  </div>
                </div>
              </div>

              {/* Farm Address Section */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚜 Where is your farm located?
                </h3>

                {/* Farm House Number & Street */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm House Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot 5"
                      value={formData.farmHouseNumber}
                      onChange={(e) =>
                        handleInputChange("farmHouseNumber", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-farm-house-number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm Street
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Farm Land Road"
                      value={formData.farmStreet}
                      onChange={(e) =>
                        handleInputChange("farmStreet", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-farm-street"
                      required
                    />
                  </div>
                </div>

                {/* Farm Nearest Bus Stop */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nearest Bus Stop to Farm
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Farm Gate"
                    value={formData.farmBusStop}
                    onChange={(e) =>
                      handleInputChange("farmBusStop", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    data-testid="input-farm-bus-stop"
                    required
                  />
                </div>

                {/* Farm Additional Address Information */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Farm Address Information (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Behind the hill"
                    value={formData.farmAdditionalDesc}
                    onChange={(e) =>
                      handleInputChange("farmAdditionalDesc", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    data-testid="input-farm-additional-address"
                  />
                </div>

                {/* Farm Country */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Country
                  </label>
                  <select
                    value={formData.farmCountry}
                    onChange={(e) =>
                      handleInputChange("farmCountry", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                    data-testid="select-farm-country"
                    required
                    style={{ position: "relative", zIndex: 10 }}
                  >
                    <option value="">Select Country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                  </select>
                </div>

                {/* Farm State & LGA */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm State
                    </label>
                    <select
                      value={formData.farmState}
                      onChange={(e) =>
                        handleInputChange("farmState", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-farm-state"
                      required
                      disabled={!formData.farmCountry}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select State</option>
                      {formData.farmCountry &&
                        getStatesForCountry(formData.farmCountry).map(
                          (state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm LGA
                    </label>
                    <select
                      value={formData.farmLocalGov}
                      onChange={(e) =>
                        handleInputChange("farmLocalGov", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-farm-lga"
                      required
                      disabled={!formData.farmState}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select LGA</option>
                      {formData.farmState &&
                        formData.farmCountry &&
                        getStateLGAs(
                          formData.farmState,
                          formData.farmCountry,
                        ).map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Farm City/Town & ZIP */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm City/Town
                    </label>
                    <select
                      value={formData.farmLocalGov}
                      onChange={(e) =>
                        handleInputChange("farmLocalGov", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-farm-city-town"
                      required
                      disabled={!formData.farmState}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select City/Town</option>
                      {formData.farmState &&
                        formData.farmCountry &&
                        getStateLGAs(
                          formData.farmState,
                          formData.farmCountry,
                        ).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm ZIP Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 100002"
                      value={formData.farmPostcode}
                      onChange={(e) =>
                        handleInputChange("farmPostcode", e.target.value)
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-farm-zip-code"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-create-account"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-center max-w-6xl mx-auto w-full min-h-[85vh]">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 lg:p-12 animate-fadeInUp">
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                🌱 Create your farmer account
              </h1>
              <p className="text-gray-600 text-lg">
                Already have an account?{" "}
                <button
                  onClick={handleLogin}
                  className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                  data-testid="link-login-desktop"
                >
                  Log In
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-first-name-desktop"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-last-name-desktop"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  data-testid="input-phone-desktop"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  data-testid="input-email-desktop"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  data-testid="input-password-desktop"
                  required
                />
              </div>

              {/* Location Section */}
              <div className="pt-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Where do you live?
                </h3>

                {/* House Number & Street */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      House Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12"
                      value={formData.homeHouseNumber}
                      onChange={(e) =>
                        handleInputChange("homeHouseNumber", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-house-number-desktop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jadesola Avenue"
                      value={formData.homeStreet}
                      onChange={(e) =>
                        handleInputChange("homeStreet", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-street-desktop"
                      required
                    />
                  </div>
                </div>

                {/* Nearest Bus Stop */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nearest Bus Stop
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Agindingbi"
                    value={formData.homeBusStop}
                    onChange={(e) =>
                      handleInputChange("homeBusStop", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-bus-stop-desktop"
                    required
                  />
                </div>

                {/* Additional Address Information */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Address Information (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apartment 3B, Behind GTBank"
                    value={formData.homeAdditionalDesc}
                    onChange={(e) =>
                      handleInputChange("homeAdditionalDesc", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-additional-address-desktop"
                  />
                </div>

                {/* Country */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.homeCountry}
                    onChange={(e) =>
                      handleInputChange("homeCountry", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                    data-testid="select-country-desktop"
                    required
                    style={{ position: "relative", zIndex: 10 }}
                  >
                    <option value="">Select Country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                  </select>
                </div>

                {/* State & LGA */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={formData.homeState}
                      onChange={(e) =>
                        handleInputChange("homeState", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-state-desktop"
                      required
                      disabled={!formData.homeCountry}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select State</option>
                      {formData.homeCountry &&
                        getStatesForCountry(formData.homeCountry).map(
                          (state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LGA
                    </label>
                    <select
                      value={formData.homeLocalGov}
                      onChange={(e) =>
                        handleInputChange("homeLocalGov", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-lga-desktop"
                      required
                      disabled={!formData.homeState}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select LGA</option>
                      {formData.homeState &&
                        formData.homeCountry &&
                        getStateLGAs(
                          formData.homeState,
                          formData.homeCountry,
                        ).map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* City/Town & ZIP */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City/Town
                    </label>
                    <select
                      value={formData.homeLocalGov}
                      onChange={(e) =>
                        handleInputChange("homeLocalGov", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-city-town-desktop"
                      required
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select City/Town</option>
                      {formData.homeState &&
                        formData.homeCountry &&
                        getStateCities(
                          formData.homeState,
                          formData.homeCountry,
                        ).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 102420"
                      value={formData.homePostcode}
                      onChange={(e) =>
                        handleInputChange("homePostcode", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-zip-code-desktop"
                    />
                  </div>
                </div>
              </div>

              {/* Farm Address Section */}
              <div className="pt-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  🚜 Where is your farm located?
                </h3>

                {/* Farm House Number & Street */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm House Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot 5"
                      value={formData.farmHouseNumber}
                      onChange={(e) =>
                        handleInputChange("farmHouseNumber", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-farm-house-number-desktop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Street
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Farm Land Road"
                      value={formData.farmStreet}
                      onChange={(e) =>
                        handleInputChange("farmStreet", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-farm-street-desktop"
                      required
                    />
                  </div>
                </div>

                {/* Farm Nearest Bus Stop */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nearest Bus Stop to Farm
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Farm Gate"
                    value={formData.farmBusStop}
                    onChange={(e) =>
                      handleInputChange("farmBusStop", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-farm-bus-stop-desktop"
                    required
                  />
                </div>

                {/* Farm Additional Address Information */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Farm Address Information (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Behind the hill"
                    value={formData.farmAdditionalDesc}
                    onChange={(e) =>
                      handleInputChange("farmAdditionalDesc", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-farm-additional-address-desktop"
                  />
                </div>

                {/* Farm Country */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Country
                  </label>
                  <select
                    value={formData.farmCountry}
                    onChange={(e) =>
                      handleInputChange("farmCountry", e.target.value)
                    }
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                    data-testid="select-farm-country-desktop"
                    required
                    style={{ position: "relative", zIndex: 10 }}
                  >
                    <option value="">Select Country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                  </select>
                </div>

                {/* Farm State & LGA */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm State
                    </label>
                    <select
                      value={formData.farmState}
                      onChange={(e) =>
                        handleInputChange("farmState", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-farm-state-desktop"
                      required
                      disabled={!formData.farmCountry}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select State</option>
                      {formData.farmCountry &&
                        getStatesForCountry(formData.farmCountry).map(
                          (state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm LGA
                    </label>
                    <select
                      value={formData.farmLocalGov}
                      onChange={(e) =>
                        handleInputChange("farmLocalGov", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-farm-lga-desktop"
                      required
                      disabled={!formData.farmState}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select LGA</option>
                      {formData.farmState &&
                        formData.farmCountry &&
                        getStateLGAs(
                          formData.farmState,
                          formData.farmCountry,
                        ).map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Farm City/Town & ZIP */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm City/Town
                    </label>
                    <select
                      value={formData.farmLocalGov}
                      onChange={(e) =>
                        handleInputChange("farmLocalGov", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-farm-city-town-desktop"
                      required
                      disabled={!formData.farmState}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <option value="">Select City/Town</option>
                      {formData.farmState &&
                        formData.farmCountry &&
                        getStateLGAs(
                          formData.farmState,
                          formData.farmCountry,
                        ).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm ZIP Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 100002"
                      value={formData.farmPostcode}
                      onChange={(e) =>
                        handleInputChange("farmPostcode", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-farm-zip-code-desktop"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-700 text-white py-5 rounded-2xl font-semibold text-xl hover:bg-green-800 hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-create-account-desktop"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-8 right-6 w-24 h-24 opacity-40 md:bottom-8 md:right-8 md:w-20 md:h-20 lg:w-24 lg:h-24">
        <img
          src={leafImage}
          alt="Decorative leaf"
          className="w-full h-full object-contain"
        />
      </div>
    </main>
  );
};
