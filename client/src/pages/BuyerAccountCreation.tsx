import React, { useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";

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
    homePostcode: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof BuyerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This matches your backend JSON structure exactly
      const backendData = {
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
        homeCountry: formData.homeCountry
      };

      console.log("Sending buyer data:", backendData);
      
      // Call your external backend API using Axios POST request
      const response = await axios.post(
        "https://lucent-ag-api-damidek.replit.app/api/auth/register-buyer",
        backendData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 15000,
          withCredentials: false
        }
      );
      
      console.log("Full response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("Response headers:", response.headers);
      
      // Store userId for verification page
      const userId = response.data?.userId || `temp_${Date.now()}`;
      localStorage.setItem("buyerUserId", userId);
      
      // Show success message with more details
      alert(`Registration successful! Status: ${response.status}. Please verify your account.`);
      
      // Redirect to verification page
      setLocation("/buyer-verification");
      
    } catch (error: any) {
      console.error("Error creating account:", error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || "Registration failed";
        alert(`Error: ${errorMessage}`);
      } else if (error.request) {
        // Network error
        alert("Network error. Please check your connection and try again.");
      } else {
        // Other error
        alert("Error creating account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        padding: "40px"
      }}>
        
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ 
            fontSize: "1.8rem", 
            fontWeight: "bold", 
            color: "#2e7d32", 
            marginBottom: "15px" 
          }}>
            NEW BUYER REGISTRATION
          </h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>
            Fill all fields to create your buyer account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* PERSONAL INFORMATION */}
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#333", marginBottom: "15px" }}>
              👤 Personal Information
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px"
                }}
                placeholder="+2348123456789"
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px"
                }}
                placeholder="your@email.com"
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px"
                }}
                placeholder="Enter secure password"
                required
              />
            </div>
          </div>

          {/* HOME ADDRESS */}
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#333", marginBottom: "15px" }}>
              🏠 Home Address
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  House Number *
                </label>
                <input
                  type="text"
                  value={formData.homeHouseNumber}
                  onChange={(e) => handleInputChange("homeHouseNumber", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                  placeholder="45B"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  Street *
                </label>
                <input
                  type="text"
                  value={formData.homeStreet}
                  onChange={(e) => handleInputChange("homeStreet", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                  placeholder="Shopping Street"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                Nearest Bus Stop *
              </label>
              <input
                type="text"
                value={formData.homeBusStop}
                onChange={(e) => handleInputChange("homeBusStop", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px"
                }}
                placeholder="Mall Junction"
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                Additional Description
              </label>
              <input
                type="text"
                value={formData.homeAdditionalDesc}
                onChange={(e) => handleInputChange("homeAdditionalDesc", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px"
                }}
                placeholder="Opposite the mall"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  Country *
                </label>
                <select
                  value={formData.homeCountry}
                  onChange={(e) => handleInputChange("homeCountry", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                  required
                >
                  <option value="">Select Country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  State *
                </label>
                <input
                  type="text"
                  value={formData.homeState}
                  onChange={(e) => handleInputChange("homeState", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                  placeholder="Lagos"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "30px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  Local Government *
                </label>
                <input
                  type="text"
                  value={formData.homeLocalGov}
                  onChange={(e) => handleInputChange("homeLocalGov", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                  placeholder="Victoria Island"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                  Postcode
                </label>
                <input
                  type="text"
                  value={formData.homePostcode}
                  onChange={(e) => handleInputChange("homePostcode", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px"
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
              transition: "background-color 0.3s"
            }}
          >
            {isSubmitting ? "Creating Account..." : "CREATE BUYER ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
};