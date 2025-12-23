import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { Eye, EyeOff, Loader2, ChevronLeft, Check, Home, X, ChevronDown, ChevronUp, Leaf, Info, Pencil, ThumbsUp, ThumbsDown } from "lucide-react";
import { PasswordValidator, validatePasswordStrength } from "@/components/PasswordValidator";
import { BaseUrl } from "../../../Baseconfig";
import { storeSession } from "@/lib/storage";
import lucentLogo from "@assets/image 20_1759571692580.png";

interface Plant {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
}

interface PlantQuestion {
  id: string;
  question: string;
  options: string[];
  multiSelect?: boolean;
}

interface CropConfig {
  cropName: string;
  processesIt: boolean | null;
  questions: PlantQuestion[];
  answers: Record<string, string[]>;
}

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
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [availablePlants, setAvailablePlants] = useState<Plant[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [cropsConfirmed, setCropsConfirmed] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [cropConfigs, setCropConfigs] = useState<CropConfig[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingCrops, setEditingCrops] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCropDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPlants = async () => {
      setLoadingPlants(true);
      try {
        const response = await fetch(`${BaseUrl}/api/plants`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setAvailablePlants(data);
          } else if (data.plants && Array.isArray(data.plants)) {
            setAvailablePlants(data.plants);
          }
        }
      } catch (error) {
        console.error("Failed to fetch plants:", error);
      } finally {
        setLoadingPlants(false);
      }
    };
    fetchPlants();
  }, []);

  const addCrop = (crop: string) => {
    if (!selectedCrops.includes(crop)) {
      setSelectedCrops([...selectedCrops, crop]);
    }
    setCropDropdownOpen(false);
  };

  const removeCrop = (crop: string) => {
    setSelectedCrops(selectedCrops.filter(c => c !== crop));
  };

  const confirmCrops = () => {
    if (selectedCrops.length === 0) return;
    const configs: CropConfig[] = selectedCrops.map(cropName => ({
      cropName,
      processesIt: null,
      questions: [],
      answers: {}
    }));
    setCropConfigs(configs);
    setCropsConfirmed(true);
    setCurrentCropIndex(0);
    setEditingCrops(false);
  };

  const fetchPlantQuestions = async (cropName: string, cropIndex: number) => {
    const plant = availablePlants.find(p => p.name === cropName);
    if (!plant) return;
    
    setLoadingQuestions(true);
    try {
      const response = await fetch(`${BaseUrl}/api/plants/${plant.id}/questions`);
      if (response.ok) {
        const data = await response.json();
        const questions: PlantQuestion[] = Array.isArray(data) ? data : (data.questions || []);
        setCropConfigs(prev => {
          const updated = [...prev];
          updated[cropIndex] = { ...updated[cropIndex], questions };
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to fetch plant questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleProcessAnswer = async (answer: boolean) => {
    setCropConfigs(prev => {
      const updated = [...prev];
      updated[currentCropIndex] = { ...updated[currentCropIndex], processesIt: answer };
      return updated;
    });
    
    if (answer) {
      await fetchPlantQuestions(selectedCrops[currentCropIndex], currentCropIndex);
    }
  };

  const toggleAnswerOption = (questionId: string, option: string) => {
    setCropConfigs(prev => {
      const updated = [...prev];
      const currentAnswers = updated[currentCropIndex].answers[questionId] || [];
      const isSelected = currentAnswers.includes(option);
      updated[currentCropIndex] = {
        ...updated[currentCropIndex],
        answers: {
          ...updated[currentCropIndex].answers,
          [questionId]: isSelected 
            ? currentAnswers.filter(a => a !== option)
            : [...currentAnswers, option]
        }
      };
      return updated;
    });
  };

  const goToNextCrop = () => {
    if (currentCropIndex < selectedCrops.length - 1) {
      setCurrentCropIndex(currentCropIndex + 1);
    }
  };

  const goToPrevCrop = () => {
    if (currentCropIndex > 0) {
      setCurrentCropIndex(currentCropIndex - 1);
    }
  };

  const getPlantImage = (cropName: string) => {
    const plant = availablePlants.find(p => p.name === cropName);
    return plant?.imageUrl || "";
  };

  const startEditingCrops = () => {
    setEditingCrops(true);
  };

  const cancelEditingCrops = () => {
    setEditingCrops(false);
  };

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
      setShowSuccessModal(true);
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

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    setLocation("/farmer-dashboard");
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

  const renderCropSelection = () => (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">What do you grow on your farm?</h3>
      <p className="text-sm text-gray-500 mb-4">Select one or more crops</p>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setCropDropdownOpen(!cropDropdownOpen)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:border-gray-400 transition-colors"
          data-testid="dropdown-select-crops"
        >
          <span className="text-gray-500">Select Crops</span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${cropDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {cropDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loadingPlants ? (
              <div className="px-4 py-3 flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading crops...
              </div>
            ) : availablePlants.filter(plant => !selectedCrops.includes(plant.name)).length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">
                {availablePlants.length === 0 ? "No crops available" : "All crops selected"}
              </p>
            ) : (
              availablePlants.filter(plant => !selectedCrops.includes(plant.name)).map((plant) => (
                <button
                  key={plant.id}
                  type="button"
                  onClick={() => addCrop(plant.name)}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                  data-testid={`crop-option-${plant.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {plant.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedCrops.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedCrops.map((crop) => (
            <span
              key={crop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
            >
              <Leaf className="w-4 h-4 text-green-600" />
              {crop}
              <button
                type="button"
                onClick={() => removeCrop(crop)}
                className="hover:text-red-500 transition-colors"
                data-testid={`remove-crop-${crop.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

    </div>
  );

  const renderCropConfiguration = () => {
    const currentCrop = selectedCrops[currentCropIndex];
    const currentConfig = cropConfigs[currentCropIndex];
    const plantImage = getPlantImage(currentCrop);
    const nextCrop = currentCropIndex < selectedCrops.length - 1 ? selectedCrops[currentCropIndex + 1] : null;

    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white">
          <div>
            <p className="font-medium text-gray-900">What do you grow on your farm?</p>
            <div className="flex items-center gap-1.5 text-green-700 text-sm mt-1">
              <Leaf className="w-4 h-4" />
              <span>{selectedCrops.length} Crop{selectedCrops.length > 1 ? 's' : ''} Selected</span>
            </div>
          </div>
          <button
            type="button"
            onClick={startEditingCrops}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-edit-crops"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Tell us about your {currentCrop}</h3>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </div>

          <div className="p-4">
            <div className="flex items-start gap-4">
              {plantImage && (
                <img 
                  src={plantImage} 
                  alt={currentCrop}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <p className="text-gray-700 mb-3">Do you process your {currentCrop.toLowerCase()}?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleProcessAnswer(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      currentConfig?.processesIt === true 
                        ? 'bg-green-700 text-white border-green-700' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                    data-testid="button-process-yes"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProcessAnswer(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      currentConfig?.processesIt === false 
                        ? 'bg-gray-700 text-white border-gray-700' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                    data-testid="button-process-no"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loadingQuestions && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        )}

        {currentConfig?.processesIt === true && currentConfig.questions.length > 0 && (
          <div className="space-y-4">
            {currentConfig.questions.map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{question.question}</p>
                    {question.multiSelect !== false && (
                      <p className="text-sm text-gray-500 mt-0.5">(Select all that apply)</p>
                    )}
                  </div>
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => {
                      const isSelected = (currentConfig.answers[question.id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleAnswerOption(question.id, option)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            isSelected 
                              ? 'bg-white border-green-600 text-green-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          data-testid={`option-${question.id}-${option.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {isSelected && <Leaf className="w-4 h-4" />}
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${((currentCropIndex + 1) / selectedCrops.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Crop {currentCropIndex + 1} of {selectedCrops.length}</span>
            {nextCrop && (
              <span className="text-gray-600">Next: <span className="font-medium text-gray-900">{nextCrop}</span></span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          {formData.firstName || "Hi"}, we will like to ensure you earn the most from your crops. To help us do this, please let us know how you handle them post-harvest.
        </p>
      </div>

      {!cropsConfirmed || editingCrops ? renderCropSelection() : renderCropConfiguration()}
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
      case 4: return "Farm Profile";
      default: return "Create Account";
    }
  };

  const handleStep4Back = () => {
    if (cropsConfirmed && !editingCrops) {
      if (currentCropIndex > 0) {
        goToPrevCrop();
      } else {
        // Go back to crop selection to allow repicking crops
        setCropsConfirmed(false);
        setCropConfigs([]);
        setCurrentCropIndex(0);
      }
    } else if (editingCrops) {
      cancelEditingCrops();
    } else {
      setCurrentStep(3);
    }
  };

  const handleStep4Next = () => {
    if (editingCrops) {
      confirmCrops();
    } else if (!cropsConfirmed) {
      if (selectedCrops.length === 0) {
        toast({
          title: "Select crops",
          description: "Please select at least one crop to continue",
          variant: "destructive",
        });
        return;
      }
      confirmCrops();
    } else if (currentCropIndex < selectedCrops.length - 1) {
      goToNextCrop();
    } else {
      handleSubmit();
    }
  };

  const getStep4ButtonText = () => {
    if (editingCrops) return "Save Crops";
    if (!cropsConfirmed) return `Continue with ${selectedCrops.length} crop${selectedCrops.length !== 1 ? 's' : ''}`;
    if (currentCropIndex < selectedCrops.length - 1) return "Next";
    return "Continue";
  };

  const isLastCropCompleted = () => {
    return cropsConfirmed && currentCropIndex === selectedCrops.length - 1;
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
              onClick={() => setLocation("/farmer-dashboard")}
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
              {(currentStep > 1 || (currentStep === 4 && (cropsConfirmed || editingCrops))) && (
                <button
                  onClick={currentStep === 4 ? handleStep4Back : handleBack}
                  className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  data-testid="button-back"
                >
                  Back
                </button>
              )}

              {currentStep === 4 ? (
                <button
                  onClick={handleStep4Next}
                  disabled={isSubmitting || (!cropsConfirmed && selectedCrops.length === 0)}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    getStep4ButtonText()
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
              onClick={() => setLocation("/farmer-dashboard")}
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
                {(currentStep > 1 || (currentStep === 4 && (cropsConfirmed || editingCrops))) && (
                  <button
                    onClick={currentStep === 4 ? handleStep4Back : handleBack}
                    className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    data-testid="button-back-desktop"
                  >
                    Back
                  </button>
                )}

                {currentStep === 4 ? (
                  <button
                    onClick={handleStep4Next}
                    disabled={isSubmitting || (!cropsConfirmed && selectedCrops.length === 0)}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
                    data-testid="button-submit-desktop"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      getStep4ButtonText()
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              data-testid="button-close-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome! Your Farmer Account Is Ready
              </h2>
              <p className="text-gray-500 mb-8">
                Your account has been successfully created. You can now list your produce, receive orders, and connect with buyers.
              </p>

              <button
                onClick={handleGoToDashboard}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-medium transition-colors"
                data-testid="button-go-to-dashboard"
              >
                Go to My Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
