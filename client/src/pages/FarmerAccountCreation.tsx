import React, { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import leafImage from "@assets/entypo_leaf_1756517515112.png";

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  houseNumber: string;
  nearestBusStop: string;
  streetName: string;
  state: string;
  lga: string;
  cityTown: string;
  zipCode: string;
}

export const FarmerAccountCreation = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { isLoading } = useLoading({ minimumLoadTime: 600 });
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    houseNumber: "",
    nearestBusStop: "",
    streetName: "",
    state: "",
    lga: "",
    cityTown: "",
    zipCode: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading account creation..." />;
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Reset dependent fields when state changes
      if (field === 'state') {
        newData.lga = '';
        newData.cityTown = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      console.log("Form data ready for API:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to verification page
      setLocation("/farmer-verification");
      
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Error creating account. Please try again.");
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
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
    "Yobe", "Zamfara"
  ];

  // Sample LGAs for Lagos (can be expanded based on selected state)
  const lagosLGAs = [
    "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", 
    "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", 
    "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
  ];

  // Sample LGAs for other states
  const getStateLGAs = (state: string): string[] => {
    switch (state) {
      case "Lagos":
        return lagosLGAs;
      case "Ogun":
        return ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Sagamu", "Yewa North", "Yewa South"];
      case "Kano":
        return ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"];
      case "FCT":
        return ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Municipal Area Council", "Kwali"];
      case "Rivers":
        return ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"];
      default:
        return ["Municipal", "Central", "North", "South", "East", "West"];
    }
  };

  // Get cities/towns based on state
  const getStateCities = (state: string): string[] => {
    switch (state) {
      case "Lagos":
        return ["Lagos", "Ikeja", "Victoria Island", "Ikoyi", "Lekki", "Surulere", "Yaba", "Maryland", "Magodo", "Gbagada", "Ajah", "Ikorodu", "Badagry", "Epe"];
      case "Ogun":
        return ["Abeokuta", "Sagamu", "Ijebu Ode", "Ota", "Ilaro", "Ayetoro", "Imeko", "Ipokia"];
      case "Kano":
        return ["Kano", "Wudil", "Gwarzo", "Rano", "Karaye", "Rogo", "Bagwai", "Dawakin Kudu"];
      case "FCT":
        return ["Abuja", "Gwagwalada", "Kuje", "Bwari", "Kwali", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa"];
      case "Rivers":
        return ["Port Harcourt", "Obio-Akpor", "Okrika", "Eleme", "Ikwerre", "Etche", "Oyigbo", "Degema", "Ahoada", "Bonny"];
      default:
        return ["Main City", "Central", "North", "South", "East", "West", "Other"];
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-6 py-8 md:px-8 lg:px-16">
        {/* Mobile Layout */}
        <div className="md:hidden max-w-md mx-auto w-full animate-fadeInUp">
          <div className="p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create your account
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
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
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
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
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
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
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

              {/* Location Section */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Where do you live?
                </h3>

                {/* House Number & Bus Stop */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12"
                      value={formData.houseNumber}
                      onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-house-number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nearest Bus Stop
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Agindingbi"
                      value={formData.nearestBusStop}
                      onChange={(e) => handleInputChange("nearestBusStop", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-bus-stop"
                      required
                    />
                  </div>
                </div>

                {/* Street Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jadesola Avenue"
                    value={formData.streetName}
                    onChange={(e) => handleInputChange("streetName", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    data-testid="input-street-name"
                    required
                  />
                </div>

                {/* State & LGA */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-state"
                      required
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LGA
                    </label>
                    <select
                      value={formData.lga}
                      onChange={(e) => handleInputChange("lga", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-lga"
                      required
                      disabled={!formData.state}
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <option value="">Select LGA</option>
                      {formData.state && getStateLGAs(formData.state).map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
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
                      value={formData.cityTown}
                      onChange={(e) => handleInputChange("cityTown", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all relative z-10"
                      data-testid="select-city-town"
                      required
                      disabled={!formData.state}
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <option value="">Select City/Town</option>
                      {formData.state && getStateCities(formData.state).map(city => (
                        <option key={city} value={city}>{city}</option>
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
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      data-testid="input-zip-code"
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
                Create your account
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
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
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
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
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
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
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

              {/* Location Section */}
              <div className="pt-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Where do you live?
                </h3>

                {/* House Number & Bus Stop */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      House Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12"
                      value={formData.houseNumber}
                      onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-house-number-desktop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nearest Bus Stop
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Agindingbi"
                      value={formData.nearestBusStop}
                      onChange={(e) => handleInputChange("nearestBusStop", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-bus-stop-desktop"
                      required
                    />
                  </div>
                </div>

                {/* Street Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jadesola Avenue"
                    value={formData.streetName}
                    onChange={(e) => handleInputChange("streetName", e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-street-name-desktop"
                    required
                  />
                </div>

                {/* State & LGA */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-state-desktop"
                      required
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LGA
                    </label>
                    <select
                      value={formData.lga}
                      onChange={(e) => handleInputChange("lga", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-lga-desktop"
                      required
                      disabled={!formData.state}
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <option value="">Select LGA</option>
                      {formData.state && getStateLGAs(formData.state).map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
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
                      value={formData.cityTown}
                      onChange={(e) => handleInputChange("cityTown", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg relative z-10"
                      data-testid="select-city-town-desktop"
                      required
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <option value="">Select City/Town</option>
                      {formData.state && getStateCities(formData.state).map(city => (
                        <option key={city} value={city}>{city}</option>
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
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                      data-testid="input-zip-code-desktop"
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