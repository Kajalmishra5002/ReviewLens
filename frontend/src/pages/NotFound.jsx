import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[70vh] flex items-center justify-center bg-transparent"
    >
      <div className="max-w-md text-center p-10 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Abstract background blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 space-y-6">
          {/* Icon */}
          <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 dark:border-red-500/20">
            <AlertCircle className="w-12 h-12" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Oops!</h1>
          <h2 className="text-xl font-bold text-slate-500 dark:text-slate-400">Page Not Found</h2>

          {/* Description */}
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            The page or product you are looking for doesn't exist or has been moved to another dimension.
          </p>

          {/* Button */}
          <Link to="/" className="inline-block">
            <button className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:shadow-xl transition-all hover:-translate-y-1">
              🏠 Back to Safety
            </button>
          </Link>
        </div>

      </div>
    </motion.div>
  );
}