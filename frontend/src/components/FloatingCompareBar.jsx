import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, List } from "lucide-react";
import useStore from "../store/useStore";

export default function FloatingCompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useStore();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {compareList?.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl"
        >
          <div className="bg-white/80 dark:bg-[#0A101D]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-indigo-500/10 text-indigo-500 p-2.5 rounded-xl border border-indigo-500/20 hidden md:flex">
                <List className="w-5 h-5" />
              </div>
              
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                {compareList?.map((product, index) => (
                  <div key={product._id} className="relative bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-3 min-w-[150px] max-w-[200px] flex-shrink-0 group">
                    <button 
                      onClick={() => removeFromCompare(product._id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="w-8 h-8 bg-white dark:bg-[#0A101D] rounded-lg p-1 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                       <img src={product.image || product.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{product?.brand || "Generic"}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{product?.name || "Unknown Product"}</span>
                    </div>
                  </div>
                ))}

                {compareList?.length < 2 && (
                  <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2 flex items-center justify-center min-w-[150px] bg-slate-50/50 dark:bg-[#111A2E]/50">
                    <span className="text-xs font-medium text-slate-400">Add product to compare</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
              <button 
                onClick={clearCompare}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Clear
              </button>
              
              <button
                onClick={() => navigate("/compare")}
                disabled={compareList?.length < 2}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                  compareList?.length >= 2 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                Compare Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
