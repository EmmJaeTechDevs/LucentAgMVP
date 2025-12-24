import { useState, useEffect } from "react";
import { X, ArrowLeft, Loader2, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { SiGoogle, SiApple } from "react-icons/si";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { PasswordValidator, validatePasswordStrength } from "@/components/PasswordValidator";
import { BaseUrl } from "../../../Baseconfig";
import { storeSession } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSignInClick: () => void;
}

interface BuyerFormData {
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
}

export function SignUpModal({ isOpen, onClose, onSuccess, onSignInClick }: SignUpModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
  const [states, setStates] = useState<Array<{ id: number; name: string; countryId: number }>>([]);
  const [lgas, setLgas] = useState<Array<{ id: number; name: string; stateId: number }>>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  const [formData, setFormData] = useState<BuyerFormData>({
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
  });

  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [isOpen]);

  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.homeCountry) {
        setStates([]);
        setLgas([]);
        return;
      }

      const selectedCountry = countries.find(c => c.name === formData.homeCountry);
      if (!selectedCountry) return;

      setLoadingStates(true);
      try {
        const response = await fetch(`${BaseUrl}/api/locations/states/${selectedCountry.id}`);
        const data = await response.json();
        if (data.states && Array.isArray(data.states)) {
          setStates(data.states);
        }
      } catch (error) {
        console.error("Failed to fetch states:", error);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [formData.homeCountry, countries]);

  useEffect(() => {
    const fetchLgas = async () => {
      if (!formData.homeState) {
        setLgas([]);
        return;
      }

      const selectedState = states.find(s => s.name === formData.homeState);
      if (!selectedState) return;

      setLoadingLgas(true);
      try {
        const response = await fetch(`${BaseUrl}/api/locations/lgas/${selectedState.id}`);
        const data = await response.json();
        if (data.lgas && Array.isArray(data.lgas)) {
          setLgas(data.lgas);
        }
      } catch (error) {
        console.error("Failed to fetch LGAs:", error);
      } finally {
        setLoadingLgas(false);
      }
    };
    fetchLgas();
  }, [formData.homeState, states]);

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

  const handleInputChange = (field: keyof BuyerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'phone') {
      setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
    }
  };

  useEffect(() => {
    const requiredFieldsFilled = 
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.homeHouseNumber.trim() !== "" &&
      formData.homeStreet.trim() !== "" &&
      formData.homeBusStop.trim() !== "" &&
      formData.homeCountry.trim() !== "" &&
      formData.homeState.trim() !== "" &&
      formData.homeLocalGov.trim() !== "";

    const noValidationErrors = !errors.email && !errors.phone;
    const passwordValid = validatePasswordStrength(formData.password, formData.email || formData.firstName);

    setIsFormValid(requiredFieldsFilled && noValidationErrors && passwordValid);
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    
    setErrors({ email: emailError, phone: phoneError });
    
    if (emailError || phoneError) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
      });
      return;
    }
    
    if (!validatePasswordStrength(formData.password, formData.email || formData.firstName)) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements.",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BaseUrl}/api/auth/register-buyer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userType: "buyer",
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
        }),
      });

      const responseData = await response.json();

      if (responseData?.message?.toLowerCase().includes("error")) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: responseData.message,
        });
        return;
      }

      if (response.ok && (response.status === 200 || response.status === 201)) {
        const userId = responseData?.userId || responseData?.user?.userId || responseData?.user?.id || `temp_${Date.now()}`;
        
        const now = new Date().getTime();
        const expiryTime = now + (8 * 60 * 60 * 1000);
        
        const sessionData = {
          userId: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          userType: "buyer",
          expiry: expiryTime,
        };
        
        const encryptedSessionData = SessionCrypto.encryptSessionData(sessionData);
        sessionStorage.setItem("buyerSession", JSON.stringify(encryptedSessionData));
        localStorage.setItem("buyerUserId", SessionCrypto.encrypt(userId));
        localStorage.setItem("userType", "buyer");
        
        storeSession({
          userId: userId,
          email: formData.email,
          password: formData.password,
          userType: "buyer"
        });

        toast({
          title: "Registration Successful!",
          description: "Welcome to Lucent!",
        });

        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: responseData?.message || "Unable to complete registration. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect. Please check your internet and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const selectClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm appearance-none bg-white";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="button-signup-back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Create Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="button-signup-close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-center text-gray-500 mb-6">
            Create your buyer account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="First name"
                  className={inputClass}
                  data-testid="input-signup-firstname"
                />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Last name"
                  className={inputClass}
                  data-testid="input-signup-lastname"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
                data-testid="input-signup-email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+234 801 234 5678"
                className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`}
                data-testid="input-signup-phone"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Create a password"
                  className={inputClass}
                  data-testid="input-signup-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <PasswordValidator 
                    password={formData.password} 
                    username={formData.email || formData.firstName} 
                  />
                </div>
              )}
            </div>

            {/* Address Section */}
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Delivery Address</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelClass}>House Number *</label>
                  <input
                    type="text"
                    value={formData.homeHouseNumber}
                    onChange={(e) => handleInputChange("homeHouseNumber", e.target.value)}
                    placeholder="No."
                    className={inputClass}
                    data-testid="input-signup-housenumber"
                  />
                </div>
                <div>
                  <label className={labelClass}>Street *</label>
                  <input
                    type="text"
                    value={formData.homeStreet}
                    onChange={(e) => handleInputChange("homeStreet", e.target.value)}
                    placeholder="Street name"
                    className={inputClass}
                    data-testid="input-signup-street"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className={labelClass}>Bus Stop / Landmark *</label>
                <input
                  type="text"
                  value={formData.homeBusStop}
                  onChange={(e) => handleInputChange("homeBusStop", e.target.value)}
                  placeholder="Nearest bus stop or landmark"
                  className={inputClass}
                  data-testid="input-signup-busstop"
                />
              </div>

              <div className="mb-3">
                <label className={labelClass}>Additional Description</label>
                <input
                  type="text"
                  value={formData.homeAdditionalDesc}
                  onChange={(e) => handleInputChange("homeAdditionalDesc", e.target.value)}
                  placeholder="Any additional info (optional)"
                  className={inputClass}
                  data-testid="input-signup-additional"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelClass}>Country *</label>
                  <div className="relative">
                    <select
                      value={formData.homeCountry}
                      onChange={(e) => handleInputChange("homeCountry", e.target.value)}
                      className={selectClass}
                      data-testid="select-signup-country"
                    >
                      <option value="">Select</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <div className="relative">
                    <select
                      value={formData.homeState}
                      onChange={(e) => handleInputChange("homeState", e.target.value)}
                      className={selectClass}
                      disabled={loadingStates}
                      data-testid="select-signup-state"
                    >
                      <option value="">Select</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.name}>{state.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>LGA *</label>
                  <div className="relative">
                    <select
                      value={formData.homeLocalGov}
                      onChange={(e) => handleInputChange("homeLocalGov", e.target.value)}
                      className={selectClass}
                      disabled={loadingLgas}
                      data-testid="select-signup-lga"
                    >
                      <option value="">Select</option>
                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.name}>{lga.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Postcode</label>
                  <input
                    type="text"
                    value={formData.homePostcode}
                    onChange={(e) => handleInputChange("homePostcode", e.target.value)}
                    placeholder="Postcode"
                    className={inputClass}
                    data-testid="input-signup-postcode"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-signup-submit"
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
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              data-testid="button-signup-google"
            >
              <SiGoogle className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              data-testid="button-signup-apple"
            >
              <SiApple className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            By continuing you agree to Lucent's{" "}
            <button className="text-green-700 hover:underline font-medium">Terms</button>
            {" "}and{" "}
            <button className="text-green-700 hover:underline font-medium">Privacy Policy</button>
          </p>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <button 
              onClick={onSignInClick}
              className="text-green-700 hover:underline font-semibold"
              data-testid="link-signin-from-signup"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
