import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import useStore from "../store/useStore";
import api from "../api/axios";
import toast from "react-hot-toast";

const GithubIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.12-.34 6.4-1.54 6.4-6.98 0-1.54-.54-2.84-1.44-3.84.15-.36.64-1.82-.14-3.78 0 0-1.18-.38-3.88 1.44a13.38 13.38 0 0 0-7 0C6.27 2.22 5.09 2.6 5.09 2.6c-.78 1.96-.29 3.42-.14 3.78-.9.1-1.44 1.3-1.44 3.84 0 5.4 3.26 6.6 6.38 6.94a4.8 4.8 0 0 0-1 3.02v4" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginActiveUser } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Save token (if backend returns it, else it sets cookies, we still save user)
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      if (res?.data?.user) {
        loginActiveUser(res.data.user);
      }
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Glow Effects */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-xl transition duration-1000 group-hover:opacity-100"></div>
        
        {/* Main Form Container */}
        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400">Sign in to ReviewLens to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-white transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-white transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Setup Mock OAuth Buttons as Requested */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-900 px-4 text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await api.post("/auth/google-login", { 
                      email: "google@test.com", 
                      name: "Google User" 
                    });
                    if (res?.data?.token) localStorage.setItem("token", res.data.token);
                    if (res?.data?.user) loginActiveUser(res.data.user);
                    toast.success("Google Login successful!");
                    navigate("/dashboard");
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Google Login failed");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700">
                <GithubIcon className="h-5 w-5" />
                GitHub
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}