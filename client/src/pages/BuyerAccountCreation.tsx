import React, { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { PasswordValidator, validatePasswordStrength } from "@/components/PasswordValidator";
import { BaseUrl } from "../../../Baseconfig";

// THIS IS THE NEW BUYER REGISTRATION FORM
// ALL FIELDS MATCH BACKEND REQUIREMENTS EXACTLY

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

export const BuyerAccountCreation = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
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
    homeCountry: "",
    homeState: "",
    homeLocalGov: "",
    homePostcode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const { toast } = useToast();

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    // Nigerian phone number validation - supports formats: +234xxxxxxxxx, 08xxxxxxxxx, 234xxxxxxxxx
    const phoneRegex = /^(\+234|234|0)(70|80|81|90|91|80|81|70|71|80|81|90|91)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "Please enter a valid Nigerian phone number (e.g., +234801234567 or 08012345678)";
    }
    return undefined;
  };

  const handleInputChange = (field: keyof BuyerFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation errors when user starts typing and validate in real-time
    if (field === 'email') {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError }));
    } else if (field === 'phone') {
      const phoneError = validatePhone(value);
      setErrors(prev => ({ ...prev, phone: phoneError }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email and phone before submitting
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
    
    // Validate password strength before submitting
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
      // Call your external backend API using CORS proxy to avoid CORS errors
      const response = await fetch(`${BaseUrl}/api/auth/register-buyer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
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

      console.log("Full response:", response);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Parse response data
      const responseData = await response.json();
      console.log("Response data:", responseData);

      // Check if response contains error message or indicates failure
      if (
        responseData?.message &&
        responseData.message.toLowerCase().includes("error")
      ) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: responseData.message,
        });
        return; // Stay on current page
      }

      // Only proceed if registration was successful
      if (response.ok && (response.status === 200 || response.status === 201)) {
        // Store complete user data in sessionStorage with 24-hour expiry
        const userId = responseData?.userId || responseData?.user?.userId || responseData?.user?.id || `temp_${Date.now()}`;
        const token = responseData?.token || responseData?.accessToken || "";
        
        const now = new Date().getTime();
        const expiryTime = now + (8 * 60 * 60 * 1000); // 8 hours from now
        
        const sessionData = {
          userId: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          token: token,
          userType: "buyer",
          expiry: expiryTime,
        };
        
        // Encrypt sensitive session data before storing
        const encryptedSessionData = SessionCrypto.encryptSessionData(sessionData);
        sessionStorage.setItem("buyerSession", JSON.stringify(encryptedSessionData));
        // Also store in localStorage for backward compatibility (encrypted)
        localStorage.setItem("buyerUserId", SessionCrypto.encrypt(userId));

        // Show success message
        toast({
          title: "✅ Registration Successful!",
          description: "Please verify your account to continue.",
        });

        // Redirect to verification page only on success
        setLocation("/buyer-verification");
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: `Registration failed with status: ${response.status}`,
        });
      }
    } catch (error: any) {
      console.error("Error creating account:", error);

      if (error.name === "TypeError") {
        // Network error
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your connection and try again.",
        });
      } else {
        // Other error
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: "Error creating account. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          padding: "40px",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "#2e7d32",
              marginBottom: "15px",
            }}
          >
            NEW BUYER REGISTRATION
          </h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>
            Fill all fields to create your buyer account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* PERSONAL INFORMATION */}
          <div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#333",
                marginBottom: "15px",
              }}
            >
              👤 Personal Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.phone ? "2px solid #ef4444" : "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                placeholder="+234801234567 or 08012345678"
                required
              />
              {errors.phone && (
                <div style={{ 
                  color: "#ef4444", 
                  fontSize: "14px", 
                  marginTop: "5px" 
                }}>
                  {errors.phone}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.email ? "2px solid #ef4444" : "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                placeholder="your@email.com"
                required
              />
              {errors.email && (
                <div style={{ 
                  color: "#ef4444", 
                  fontSize: "14px", 
                  marginTop: "5px" 
                }}>
                  {errors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Password *
              </label>
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    paddingRight: "48px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  placeholder="Enter secure password"
                  required
                  data-testid="input-password-buyer"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                  }}
                  data-testid="toggle-password-visibility-buyer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <PasswordValidator 
                password={formData.password} 
                username={formData.email || formData.firstName}
                className="mb-2"
              />
            </div>
          </div>

          {/* HOME ADDRESS */}
          <div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#333",
                marginBottom: "15px",
              }}
            >
              🏠 Home Address
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  House Number *
                </label>
                <input
                  type="text"
                  value={formData.homeHouseNumber}
                  onChange={(e) =>
                    handleInputChange("homeHouseNumber", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  placeholder="45B"
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  Street *
                </label>
                <input
                  type="text"
                  value={formData.homeStreet}
                  onChange={(e) =>
                    handleInputChange("homeStreet", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  placeholder="Shopping Street"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Nearest Bus Stop *
              </label>
              <input
                type="text"
                value={formData.homeBusStop}
                onChange={(e) =>
                  handleInputChange("homeBusStop", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                placeholder="Mall Junction"
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Additional Description
              </label>
              <input
                type="text"
                value={formData.homeAdditionalDesc}
                onChange={(e) =>
                  handleInputChange("homeAdditionalDesc", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                placeholder="Opposite the mall"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  Country *
                </label>
                <select
                  value={formData.homeCountry}
                  onChange={(e) =>
                    handleInputChange("homeCountry", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  required
                >
                  <option value="">Select Country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  State *
                </label>
                <input
                  type="text"
                  value={formData.homeState}
                  onChange={(e) =>
                    handleInputChange("homeState", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  placeholder="Lagos"
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "30px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  Local Government *
                </label>
                <input
                  type="text"
                  value={formData.homeLocalGov}
                  onChange={(e) =>
                    handleInputChange("homeLocalGov", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  placeholder="Victoria Island"
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  Postcode
                </label>
                <input
                  type="text"
                  value={formData.homePostcode}
                  onChange={(e) =>
                    handleInputChange("homePostcode", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  placeholder="101001"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: isSubmitting ? "#ccc" : "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1.2rem",
              fontWeight: "600",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background-color 0.3s",
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              "CREATE BUYER ACCOUNT"
            )}
          </button>

          {/* LOGIN LINK */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p
              style={{ color: "#666", fontSize: "1rem", marginBottom: "10px" }}
            >
              Already have an account?
            </p>
            <button
              type="button"
              onClick={() => setLocation("/login")}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "transparent",
                color: "#2e7d32",
                border: "2px solid #2e7d32",
                borderRadius: "10px",
                fontSize: "1.2rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#2e7d32";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#2e7d32";
              }}
            >
              LOGIN TO YOUR ACCOUNT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
