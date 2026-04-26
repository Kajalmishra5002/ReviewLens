import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import api from "../api/axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
        toast.success("Email verified!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid or expired token.");
        toast.error("Verification failed");
      }
    };

    if (token) verifyToken();
  }, [token, navigate]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="card w-full max-w-md text-center flex flex-col items-center justify-center p-8 space-y-6">
        {status === "loading" && (
          <>
            <Loader className="w-16 h-16 text-[#FF6B00] animate-spin" />
            <h2 className="text-2xl font-bold dark:text-white text-slate-800">Verifying...</h2>
            <p className="dark:text-slate-400 text-slate-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-bold dark:text-white text-slate-800">Verified!</h2>
            <p className="dark:text-slate-400 text-slate-600">{message}</p>
            <p className="text-sm dark:text-slate-500 text-slate-500">Redirecting to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold dark:text-white text-slate-800">Verification Failed</h2>
            <p className="text-red-400">{message}</p>
            <Link to="/login" className="btn mt-4 w-full text-center">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
