import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[80vh] flex items-center justify-center bg-slate-900 text-white"
    >
      <div className="max-w-md text-center space-y-6 px-4">
        
        {/* Icon */}
        <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>

        {/* Description */}
        <p className="text-gray-400">
          The page or product you are looking for doesn't exist or has been removed.
        </p>

        {/* Button */}
        <Link to="/">
          <button className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition">
            🏠 Go Back Home
          </button>
        </Link>

      </div>
    </motion.div>
  );
}