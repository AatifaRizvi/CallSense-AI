import logo from '../logo.png';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Loader, Eye, EyeOff } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company_or_organization: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          company_or_organization: formData.company_or_organization,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Save to user_profiles table
      if (data?.user) {
        await supabase.from("user_profiles").insert({
          id: data.user.id,
          full_name: formData.fullName,
          company_or_organization: formData.company_or_organization,
          role: "user",
          approved: true,
        });
      }
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Account Created!</h2>
          <p className="text-white/40 text-sm mb-6">
            We sent a verification link to{" "}
            <span className="text-white">{formData.email}</span>. Please verify
            your email to complete registration.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="CallSense AI"
            className="w-12 h-12 rounded-xl object-cover mx-auto mb-4 shadow-lg"
          />
          <h1 className="text-white text-2xl font-bold">Create Account</h1>
          <p className="text-white/40 text-sm mt-1">Join CallSense AI</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Work Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Company / Organization */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Company / Organization
              </label>
              <input
                type="text"
                name="company_or_organization"
                value={formData.company_or_organization}
                onChange={handleChange}
                placeholder="Acme Corp / IIT Delhi / NGO Name"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors pr-10"
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

            {/* Confirm Password */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
              />
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
                  <Loader size={14} className="animate-spin" /> Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-white/40 text-xs mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign In
          </button>
        </p>

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

export default Register;
