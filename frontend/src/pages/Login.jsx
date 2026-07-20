import logo from "../logo.png";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Loader, Eye, EyeOff } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f172a] flex items-center justify-center px-4 overflow-hidden">
      <AnimatedBackground dark={true} />

      <div className="w-full max-w-md">
        {/* Logo */}
        <img
          src={logo}
          alt="CallSense AI"
          className="w-12 h-12 rounded-xl object-cover mx-auto mb-4 shadow-lg"
        />

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@callsense.ai"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-white/30 hover:text-indigo-400 text-xs transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Sign Up */}
        <p className="text-center text-white/40 text-xs mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign Up
          </button>
        </p>

        {/* Back */}
        <p className="text-center text-white/20 text-xs mt-2">
          <button
            onClick={() => navigate("/")}
            className="hover:text-white/40 transition-colors"
          >
            ← Back to home
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;