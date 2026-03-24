import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "./firebase";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { API_URL } from "./apiConfig";

const MagicLogin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"verifying" | "ready" | "submitting" | "success" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No secure token provided in the link.");
      setStatus("error");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/users/verify-invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify magic link.");
        }

        setEmail(data.email);
        setStatus("ready");
      } catch (err: any) {
        console.error("Token verification error:", err);
        setError(err.message || "An unexpected error occurred.");
        setStatus("error");
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch(`${API_URL}/users/complete-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete setup.");
      }

      // Automatically log the user in using the custom token
      await signInWithCustomToken(auth, data.customToken);

      setStatus("success");
      
      // Short delay for user experience
      setTimeout(() => {
        navigate("/"); 
      }, 1500);

    } catch (err: any) {
      console.error("Complete setup error:", err);
      setError(err.message || "An unexpected error occurred during setup.");
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 px-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-neutral-100 w-full max-w-md">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === "success" ? <CheckCircle2 size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {status === "verifying" && "Verifying Link..."}
            {(status === "ready" || status === "submitting" || status === "error") && "Set up your account"}
            {status === "success" && "Welcome aboard!"}
          </h2>
          {email && status !== "success" && (
            <p className="text-sm text-neutral-500 mt-2">
              Accepting invite for <span className="font-semibold text-neutral-700">{email}</span>
            </p>
          )}
        </div>

        {/* ALERTS */}
        {error && (
          <div className="flex items-start gap-3 text-red-700 mb-6 p-4 bg-red-50 rounded-xl text-sm font-medium">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* STATES */}
        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
            <p className="text-neutral-500 font-medium">Securing your connection...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-4">
            <p className="text-emerald-600 font-bold text-lg animate-pulse mb-6">
              Account secured. Redirecting to workspace...
            </p>
          </div>
        )}

        {/* SET PASSWORD FORM */}
        {(status === "ready" || status === "submitting") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium pr-12"
                  disabled={status === "submitting"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-2">Must be at least 8 characters long.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                disabled={status === "submitting"}
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting" || !password || !confirmPassword}
              className={`w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 ${
                status === "submitting" || !password || !confirmPassword
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30"
              }`}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving & Logging In...
                </>
              ) : (
                "Set Password & Login"
              )}
            </button>
          </form>
        )}

        {/* ACTION BUTTON ON FATAL ERRORS */}
        {error && status === "error" && (
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-neutral-100 text-neutral-700 font-bold py-4 rounded-xl hover:bg-neutral-200 transition-all mt-6"
          >
            Return to Login
          </button>
        )}

      </div>
    </div>
  );
};

export default MagicLogin;
