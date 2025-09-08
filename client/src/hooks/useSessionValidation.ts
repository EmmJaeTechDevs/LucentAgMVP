import { useEffect } from "react";
import { useLocation } from "wouter";
import { SessionCrypto } from "@/utils/sessionCrypto";

interface SessionData {
  userId: string;
  token: string;
  expiry: number;
  userType?: string;
  [key: string]: any;
}

export function useSessionValidation(userType?: "buyer" | "farmer") {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const validateSession = () => {
      const now = new Date().getTime();
      let isValid = false;

      if (userType === "buyer") {
        const buyerSession = sessionStorage.getItem("buyerSession");
        if (buyerSession) {
          try {
            const encryptedSessionData = JSON.parse(buyerSession);
            const sessionData: SessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
            isValid = !!(sessionData.userId && sessionData.token && now < sessionData.expiry);
          } catch (error) {
            console.error("Error parsing buyer session:", error);
          }
        }
      } else if (userType === "farmer") {
        const farmerSession = sessionStorage.getItem("farmerSession");
        if (farmerSession) {
          try {
            const encryptedSessionData = JSON.parse(farmerSession);
            const sessionData: SessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
            isValid = !!(sessionData.userId && sessionData.token && now < sessionData.expiry);
          } catch (error) {
            console.error("Error parsing farmer session:", error);
          }
        }
      } else {
        // Check both buyer and farmer sessions if userType not specified
        const buyerSession = sessionStorage.getItem("buyerSession");
        const farmerSession = sessionStorage.getItem("farmerSession");
        
        if (buyerSession) {
          try {
            const encryptedBuyerData = JSON.parse(buyerSession);
            const sessionData: SessionData = SessionCrypto.decryptSessionData(encryptedBuyerData);
            if (sessionData.userId && sessionData.token && now < sessionData.expiry) {
              isValid = true;
            }
          } catch (error) {
            console.error("Error parsing buyer session:", error);
          }
        }
        
        if (!isValid && farmerSession) {
          try {
            const encryptedFarmerData = JSON.parse(farmerSession);
            const sessionData: SessionData = SessionCrypto.decryptSessionData(encryptedFarmerData);
            if (sessionData.userId && sessionData.token && now < sessionData.expiry) {
              isValid = true;
            }
          } catch (error) {
            console.error("Error parsing farmer session:", error);
          }
        }
      }

      if (!isValid) {
        // Clear invalid sessions
        sessionStorage.clear();
        localStorage.clear();
        // Redirect to session expired page
        setLocation("/session-expired");
      }
    };

    validateSession();

    // Check session every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userType, setLocation]);
}