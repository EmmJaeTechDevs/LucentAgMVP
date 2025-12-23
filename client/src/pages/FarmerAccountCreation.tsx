import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { Eye, EyeOff, Loader2, ChevronLeft, Check, Home } from "lucide-react";
import { PasswordValidator, validatePasswordStrength } from "@/components/PasswordValidator";
import { BaseUrl } from "../../../Baseconfig";
import { storeSession } from "@/lib/storage";
import lucentLogo from "@assets/image 20_1759571692580.png";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  homeHouseNumber: string;
  homeStreet: string;
  homeBusStop: string;
  homeAdditionalDesc: string;
  homeCountry: string;
  homeState: string;
  homeLocalGov: string;
  homePostcode: string;
  farmHouseNumber: string;
  farmStreet: string;
  farmBusStop: string;
  farmAdditionalDesc: string;
  farmCountry: string;
  farmState: string;
  farmLocalGov: string;
  farmPostcode: string;
}

const STEPS = [
  { id: 1, title: "Create Account", description: "Set up your login details to get started" },
  { id: 2, title: "Home Address", description: "Where you currently live" },
  { id: 3, title: "Farm Address", description: "Where your farm is located" },
  { id: 4, title: "Farm Profile", description: "What you produce/process" },
];

export const FarmerAccountCreation = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    homeHouseNumber: "",
    homeStreet: "",
    homeBusStop: "",
    homeAdditionalDesc: "",
    homeCountry: "Nigeria",
    homeState: "",
    homeLocalGov: "",
    homePostcode: "",
    farmHouseNumber: "",
    farmStreet: "",
    farmBusStop: "",
    farmAdditionalDesc: "",
    farmCountry: "Nigeria",
    farmState: "",
    farmLocalGov: "",
    farmPostcode: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string; password?: string }>({});
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
  const [homeStates, setHomeStates] = useState<Array<{ id: number; name: string; countryId: number }>>([]);
  const [farmStates, setFarmStates] = useState<Array<{ id: number; name: string; countryId: number }>>([]);
  const [homeLgas, setHomeLgas] = useState<Array<{ id: number; name: string; stateId: number }>>([]);
  const [farmLgas, setFarmLgas] = useState<Array<{ id: number; name: string; stateId: number }>>([]);
  const [loadingHomeStates, setLoadingHomeStates] = useState(false);
  const [loadingFarmStates, setLoadingFarmStates] = useState(false);
  const [loadingHomeLgas, setLoadingHomeLgas] = useState(false);
  const [loadingFarmLgas, setLoadingFarmLgas] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${BaseUrl}/api/locations/countries`);
        const data = await response.json();
        if (data.countries && Array.isArray(data.countries)) {
          setCountries(data.countries);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchHomeStates = async () => {
      if (!formData.homeCountry) {
        setHomeStates([]);
        setHomeLgas([]);
        return;
      }
      const selectedCountry = countries.find(c => c.name === formData.homeCountry);
      if (!selectedCountry) return;
      setLoadingHomeStates(true);
      try {
        const response = await fetch(`${BaseUrl}/api/locations/states/${selectedCountry.id}`);
        const data = await response.json();
        if (data.states && Array.isArray(data.states)) {
          setHomeStates(data.states);
        }
      } catch (error) {
        console.error("Failed to fetch home states:", error);
      } finally {
        setLoadingHomeStates(false);
      }
    };
    fetchHomeStates();
  }, [formData.homeCountry, countries]);

  useEffect(() => {
    const fetchFarmStates = async () => {
      if (!formData.farmCountry) {
        setFarmStates([]);
        setFarmLgas([]);
        return;
      }
      const selectedCountry = countries.find(c => c.name === formData.farmCountry);
      if (!selectedCountry) return;
      setLoadingFarmStates(true);
      try {
        const response = await fetch(`${BaseUrl}/api/locations/states/${selectedCountry.id}`);
        const data = await response.json();
        if (data.states && Array.isArray(data.states)) {
          setFarmStates(data.states);
        }
      } catch (error) {
        console.error("Failed to fetch farm states:", error);
      } finally {
        setLoadingFarmStates(false);
      }
    };
    fetchFarmStates();
  }, [formData.farmCountry, countries]);

  useEffect(() => {
    const fetchHomeLgas = async () => {
      if (!formData.homeState) {
        setHomeLgas([]);
        return;
      }
      const selectedState = homeStates.find(s => s.name === formData.homeState);
      if (!selectedState) return;
      setLoadingHomeLgas(true);
      try {
        const response = await fetch(`${BaseUrl}/api/locations/lgas/${selectedState.id}`);
        const data = await response.json();
        if (data.lgas && Array.isArray(data.lgas)) {
          setHomeLgas(data.lgas);
        }
      } catch (error) {
        console.error("Failed to fetch home LGAs:", error);
      } finally {
        setLoadingHomeLgas(false);
      }
    };
    fetchHomeLgas();
  }, [formData.homeState, homeStates]);

  useEffect(() => {
    const fetchFarmLgas = async () => {
      if (!formData.farmState) {
        setFarmLgas([]);
        return;
      }
      const selectedState = farmStates.find(s => s.name === formData.farmState);
      if (!selectedState) return;
      setLoadingFarmLgas(true);
      try {
        const response = await fetch(`${BaseUrl}/api/locations/lgas/${selectedState.id}`);
        const data = await response.json();
        if (data.lgas && Array.isArray(data.lgas)) {
          setFarmLgas(data.lgas);
        }
      } catch (error) {
        console.error("Failed to fetch farm LGAs:", error);
      } finally {
        setLoadingFarmLgas(false);
      }
    };
    fetchFarmLgas();
  }, [formData.farmState, farmStates]);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return "Phone number is required";
    const phoneRegex = /^(\+234|234|0)(70|80|81|90|91|80|81|70|71|80|81|90|91)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "Please enter a valid Nigerian phone number";
    }
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'phone') {
      setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
    }
  };

  const isStep1Valid = () => {
    return (
      formData.email.trim() !== "" &&
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.password.trim() !== "" &&
      !validateEmail(formData.email) &&
      !validatePhone(formData.phone) &&
      validatePasswordStrength(formData.password, formData.email || formData.firstName)
    );
  };

  const isStep2Valid = () => {
    return (
      formData.homeHouseNumber.trim() !== "" &&
      formData.homeStreet.trim() !== "" &&
      formData.homeBusStop.trim() !== "" &&
      formData.homeCountry.trim() !== "" &&
      formData.homeState.trim() !== "" &&
      formData.homeLocalGov.trim() !== ""
    );
  };

  const isStep3Valid = () => {
    return (
      formData.farmHouseNumber.trim() !== "" &&
      formData.farmStreet.trim() !== "" &&
      formData.farmBusStop.trim() !== "" &&
      formData.farmCountry.trim() !== "" &&
      formData.farmState.trim() !== "" &&
      formData.farmLocalGov.trim() !== ""
    );
  };

  const handleContinue = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      toast({
        variant: "destructive",
        title: "Please complete all fields",
        description: "Fill in all required fields before continuing.",
      });
      return;
    }
    if (currentStep === 2 && !isStep2Valid()) {
      toast({
        variant: "destructive",
        title: "Please complete all fields",
        description: "Fill in all required home address fields.",
      });
      return;
    }
    if (currentStep === 3 && !isStep3Valid()) {
      toast({
        variant: "destructive",
        title: "Please complete all fields",
        description: "Fill in all required farm address fields.",
      });
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) {
      toast({
        variant: "destructive",
        title: "Incomplete Information",
        description: "Please ensure all required fields are filled correctly.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
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
        farmCountry: formData.farmCountry
      };

      const response = await api.farmers.register(backendData) as any;
      const userId = response?.userId || response?.user?.userId || response?.user?.id;
      
      if (userId) {
        const sessionData = {
          userId: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          userType: "farmer",
          expiry: new Date().getTime() + (8 * 60 * 60 * 1000)
        };
        const encryptedSessionData = SessionCrypto.encryptSessionData(sessionData);
        sessionStorage.setItem("farmerSession", JSON.stringify(encryptedSessionData));
        localStorage.setItem("farmerUserId", SessionCrypto.encrypt(userId));
        storeSession({
          userId: userId,
          email: formData.email,
          password: formData.password,
          userType: "farmer"
        });
      }
      setLocation("/farmer-verification");
    } catch (error) {
      console.error("Error creating account:", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "Error creating account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = (step: typeof STEPS[0], index: number) => {
    const isCompleted = currentStep > step.id;
    const isCurrent = currentStep === step.id;
    
    return (
      <div key={step.id} className={`flex items-start gap-3 ${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
          isCompleted ? 'bg-green-600 border-green-600' : isCurrent ? 'border-green-600' : 'border-gray-300'
        }`}>
          {isCompleted ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <span className={`text-xs ${isCurrent ? 'text-green-600' : 'text-gray-400'}`}>{step.id}</span>
          )}
        </div>
        <div>
          <p className={`font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>{step.title}</p>
          <p className="text-sm text-gray-400">{step.description}</p>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your email address"
          data-testid="input-email"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter first name"
            data-testid="input-first-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter last name"
            data-testid="input-last-name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your phone number"
          data-testid="input-phone"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter Password"
            data-testid="input-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <PasswordValidator 
          password={formData.password} 
          username={formData.email || formData.firstName}
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">House Number</label>
          <input
            type="text"
            value={formData.homeHouseNumber}
            onChange={(e) => handleInputChange("homeHouseNumber", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter house number"
            data-testid="input-home-house-number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Street</label>
          <input
            type="text"
            value={formData.homeStreet}
            onChange={(e) => handleInputChange("homeStreet", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter street name"
            data-testid="input-home-street"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bus Stop / Landmark</label>
        <input
          type="text"
          value={formData.homeBusStop}
          onChange={(e) => handleInputChange("homeBusStop", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nearest bus stop or landmark"
          data-testid="input-home-bus-stop"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Description (Optional)</label>
        <input
          type="text"
          value={formData.homeAdditionalDesc}
          onChange={(e) => handleInputChange("homeAdditionalDesc", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Any additional details"
          data-testid="input-home-additional"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
          <select
            value={formData.homeCountry}
            onChange={(e) => handleInputChange("homeCountry", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            data-testid="select-home-country"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.name}>{country.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
          <select
            value={formData.homeState}
            onChange={(e) => handleInputChange("homeState", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={!formData.homeCountry || loadingHomeStates}
            data-testid="select-home-state"
          >
            <option value="">Select State</option>
            {homeStates.map((state) => (
              <option key={state.id} value={state.name}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Local Government</label>
          <select
            value={formData.homeLocalGov}
            onChange={(e) => handleInputChange("homeLocalGov", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={!formData.homeState || loadingHomeLgas}
            data-testid="select-home-lga"
          >
            <option value="">Select LGA</option>
            {homeLgas.map((lga) => (
              <option key={lga.id} value={lga.name}>{lga.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Postcode (Optional)</label>
          <input
            type="text"
            value={formData.homePostcode}
            onChange={(e) => handleInputChange("homePostcode", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter postcode"
            data-testid="input-home-postcode"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">House Number</label>
          <input
            type="text"
            value={formData.farmHouseNumber}
            onChange={(e) => handleInputChange("farmHouseNumber", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter house number"
            data-testid="input-farm-house-number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Street</label>
          <input
            type="text"
            value={formData.farmStreet}
            onChange={(e) => handleInputChange("farmStreet", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter street name"
            data-testid="input-farm-street"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bus Stop / Landmark</label>
        <input
          type="text"
          value={formData.farmBusStop}
          onChange={(e) => handleInputChange("farmBusStop", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nearest bus stop or landmark"
          data-testid="input-farm-bus-stop"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Description (Optional)</label>
        <input
          type="text"
          value={formData.farmAdditionalDesc}
          onChange={(e) => handleInputChange("farmAdditionalDesc", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Any additional details"
          data-testid="input-farm-additional"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
          <select
            value={formData.farmCountry}
            onChange={(e) => handleInputChange("farmCountry", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            data-testid="select-farm-country"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.name}>{country.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
          <select
            value={formData.farmState}
            onChange={(e) => handleInputChange("farmState", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={!formData.farmCountry || loadingFarmStates}
            data-testid="select-farm-state"
          >
            <option value="">Select State</option>
            {farmStates.map((state) => (
              <option key={state.id} value={state.name}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Local Government</label>
          <select
            value={formData.farmLocalGov}
            onChange={(e) => handleInputChange("farmLocalGov", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={!formData.farmState || loadingFarmLgas}
            data-testid="select-farm-lga"
          >
            <option value="">Select LGA</option>
            {farmLgas.map((lga) => (
              <option key={lga.id} value={lga.name}>{lga.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Postcode (Optional)</label>
          <input
            type="text"
            value={formData.farmPostcode}
            onChange={(e) => handleInputChange("farmPostcode", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter postcode"
            data-testid="input-farm-postcode"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Almost There!</h3>
        <p className="text-gray-600 mb-4">
          Review your information and click "Create Account" to complete your registration.
        </p>
        <p className="text-sm text-gray-500">
          After registration, you'll be able to add your farm profile and crop preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
          <p className="text-sm text-gray-600">{formData.firstName} {formData.lastName}</p>
          <p className="text-sm text-gray-600">{formData.email}</p>
          <p className="text-sm text-gray-600">{formData.phone}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Home Address</h4>
          <p className="text-sm text-gray-600">
            {formData.homeHouseNumber} {formData.homeStreet}, {formData.homeBusStop}
          </p>
          <p className="text-sm text-gray-600">
            {formData.homeLocalGov}, {formData.homeState}, {formData.homeCountry}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Farm Address</h4>
          <p className="text-sm text-gray-600">
            {formData.farmHouseNumber} {formData.farmStreet}, {formData.farmBusStop}
          </p>
          <p className="text-sm text-gray-600">
            {formData.farmLocalGov}, {formData.farmState}, {formData.farmCountry}
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Create Account";
      case 2: return "Home Address";
      case 3: return "Farm Address";
      case 4: return "Complete Registration";
      default: return "Create Account";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="px-4 pt-4 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <img src={lucentLogo} alt="Lucent Ag" className="h-12 object-contain" />
            <button
              onClick={() => setLocation("/")}
              className="p-2 text-gray-600 hover:text-gray-900"
              data-testid="button-home-mobile"
            >
              <Home className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Step {currentStep} of 4 : <span className="font-medium">{getStepTitle()}</span>
            </p>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h1>
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <button onClick={() => setLocation("/login")} className="text-gray-900 font-semibold underline">
                  Log In
                </button>
              </p>
            </div>

            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="mt-8 space-y-3">
              {currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleContinue}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-lg font-medium transition-colors"
                  data-testid="button-continue"
                >
                  Continue
                </button>
              )}

              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  data-testid="button-back"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Sidebar - Step Indicator */}
        <div className="w-80 bg-white border-r border-gray-200 p-8">
          {/* Logo */}
          <div className="mb-8">
            <img src={lucentLogo} alt="Lucent Ag" className="h-14 object-contain" />
          </div>

          {/* Step Badge */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              Step {currentStep}/4
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {STEPS.map((step, index) => renderStepIndicator(step, index))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-end p-6 border-b border-gray-100">
            <button
              onClick={() => setLocation("/")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              data-testid="button-return-home"
            >
              Return to Homepage
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-lg">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h1>
                <p className="text-gray-500">
                  Already have an account?{" "}
                  <button onClick={() => setLocation("/login")} className="text-gray-900 font-semibold underline">
                    Log In
                  </button>
                </p>
              </div>

              {renderCurrentStep()}

              {/* Navigation Buttons */}
              <div className="mt-8 flex gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    data-testid="button-back-desktop"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                )}

                {currentStep === 4 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
                    data-testid="button-submit-desktop"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleContinue}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-medium transition-colors"
                    data-testid="button-continue-desktop"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
