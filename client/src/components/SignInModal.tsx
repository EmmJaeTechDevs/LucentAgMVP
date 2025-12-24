import { useState } from "react";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { SiGoogle, SiApple } from "react-icons/si";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const sessionData = {
          userId: data.userId || data.user?.id,
          token: data.token,
          email: email,
          userType: "buyer",
          expiry: new Date().getTime() + (8 * 60 * 60 * 1000)
        };
        const encryptedSessionData = SessionCrypto.encryptSessionData(sessionData);
        sessionStorage.setItem("buyerSession", JSON.stringify(encryptedSessionData));
        localStorage.setItem("buyerUserId", SessionCrypto.encrypt(sessionData.userId));
        localStorage.setItem("userType", "buyer");
        
        onSuccess();
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onClose();
    setLocation("/forgot-password");
  };

  const handleCreateAccount = () => {
    onClose();
    setLocation("/buyer-account-creation");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="button-signin-back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="button-signin-close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-center text-gray-500 mb-6">
            Kindly provide your password to continue
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                data-testid="input-signin-email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-green-700 hover:text-green-800 font-medium"
                  data-testid="link-forgot-password"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                data-testid="input-signin-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              data-testid="button-signin-submit"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </span>
              ) : (
                "Sign In"
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
              data-testid="button-signin-google"
            >
              <SiGoogle className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              data-testid="button-signin-apple"
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
            Don't have an account?{" "}
            <button 
              onClick={handleCreateAccount}
              className="text-green-700 hover:underline font-semibold"
              data-testid="link-create-account"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
