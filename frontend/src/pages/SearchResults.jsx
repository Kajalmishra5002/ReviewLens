import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sparkles, Camera, Battery, DollarSign, Zap, Monitor, Shield, Gamepad2, Award, ArrowLeft, Star, TrendingUp } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import Footer from "../components/Footer";
import { AnimatePresence, motion } from "framer-motion";

const priorities = [
  { id: "Overall Best", icon: Award },
  { id: "Camera", icon: Camera },
  { id: "Battery Life", icon: Battery },
  { id: "Value for Money", icon: DollarSign },
  { id: "Performance", icon: Zap },
  { id: "Display", icon: Monitor },
  { id: "Build Quality", icon: Shield },
  { id: "Gaming", icon: Gamepad2 }
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added
  const [activePriority, setActivePriority] = useState("Overall Best");

  useEffect(() => {
    if (!query) return;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
        console.log("Search API Response:", res.data); // Debug logging
        
        if (res.data.success) {
          setProducts(res.data.products || []);
        } else {
          throw new Error(res.data.message || "Search failed");
        }
      } catch (err) {
        console.error("Search failed:", err);
        setError(err.message || "Something went wrong while searching.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const sortedProducts = useMemo(() => {
    const scored = products.map(p => {
      let priorityScore = p.smartScore || 0;
      
      if (activePriority !== "Overall Best") {
        let keywordScore = 0;
        const featuresText = Array.isArray(p.features) ? p.features.join(" ") : (p.features || "");
        const text = ((p.description || "") + " " + featuresText).toLowerCase();
        
        const mappings = {
          "Camera": ["camera", "lens", "photo", "megapixel"],
          "Battery Life": ["battery", "mah", "charge", "power"],
          "Value for Money": ["value", "budget", "affordable", "price", "cheap"],
          "Performance": ["processor", "ram", "speed", "performance", "cpu", "chip"],
          "Display": ["display", "screen", "oled", "hz", "resolution", "pixel"],
          "Build Quality": ["build", "aluminum", "design", "durability", "metal"],
          "Gaming": ["gaming", "gpu", "graphics", "refresh rate", "fps"]
        };
        
        const keywords = mappings[activePriority] || [];
        keywords.forEach(kw => {
          if (text.includes(kw)) keywordScore += 2;
        });
        
        // Blend PRAS score with specific priority keyword match
        priorityScore = (p.smartScore || 0) * 0.6 + keywordScore * 2;
      }

      return { ...p, priorityScore };
    });

    return scored.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [products, activePriority]);

  const topProduct = sortedProducts[0];
  const remainingProducts = sortedProducts.slice(1);

  if (loading) {
     return (
       <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
         <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-8"></div>
         <div className="h-32 w-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse mb-10"></div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {[...Array(8)].map((_, i) => (
             <SkeletonCard key={i} />
           ))}
         </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white pt-6">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-16 space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              Results for <span className="text-indigo-500 dark:text-blue-400">"{query}"</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {products.length} products analysed · PRAS scored · Ranked by {activePriority}
            </p>
          </div>
          <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        {/* AI Research Summary */}
        <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-500/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 mb-2 tracking-wide uppercase">AI Research Summary</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                For the broad query "{query}", the top picks are split into distinct buckets based on value, performance, and user satisfaction. 
                Our PRAS algorithm has analyzed reviews across multiple sources. Focus on specific priorities like Battery or Display to instantly re-rank the results.
              </p>
            </div>
          </div>
        </div>

        {/* Priority Toggles */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 px-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white">What matters most to you?</h4>
            <span className="text-xs text-slate-500 ml-2 hidden sm:inline">— products re-rank instantly based on your priority</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {priorities.map(p => {
              const Icon = p.icon;
              const isActive = activePriority === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePriority(p.id)}
                  className={`flex flex-col items-center justify-center min-w-[90px] h-20 rounded-xl border transition-all duration-200 ${
                    isActive 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm shadow-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                    : "bg-transparent border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1C2333] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1.5 ${isActive ? "text-indigo-500" : ""}`} />
                  <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-wider">{p.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Retry Search
            </button>
          </div>
        )}

        {/* Top Product Hero Card */}
        {!error && topProduct && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Best for {activePriority}
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-full md:w-1/3 bg-slate-50 dark:bg-[#0A101D] rounded-2xl p-6 flex items-center justify-center border border-slate-100 dark:border-slate-800/50 relative">
                 <img src={topProduct?.images?.[0]?.url || 'https://via.placeholder.com/300'} alt={topProduct?.name} className="w-full max-h-64 object-contain mix-blend-multiply dark:mix-blend-normal" />
                 {/* PRAS Badge overlay */}
                 <div className="absolute bottom-4 left-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                    <Sparkles className="w-4 h-4" /> PRAS {topProduct?.smartScore || 0}
                 </div>
              </div>

              <div className="w-full md:w-2/3 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">{topProduct?.brand || "Generic"}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                  <Link to={`/product/${topProduct?._id}`} className="hover:text-indigo-500 transition-colors">
                    {topProduct?.name}
                  </Link>
                </h2>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-6 line-clamp-3 leading-relaxed">
                  {topProduct?.description}
                </p>
                
                <div className="flex items-end gap-4 mb-8">
                  <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">₹{topProduct?.price?.toLocaleString('en-IN')}</span>
                  {topProduct?.ratings && (
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-500 mb-1">
                       <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {Number(topProduct?.ratings).toFixed(1)} / 5
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to={`/product/${topProduct?._id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 flex items-center gap-2">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Remaining Products Grid */}
        {!error && remainingProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            <AnimatePresence>
              {remainingProducts.map((p, index) => (
                <motion.div 
                  key={p?._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center font-black text-sm z-20 shadow-lg border-2 border-white dark:border-[#0A101D]">
                    {index + 2}
                  </div>
                  <ProductCard p={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No Products Found */}
        {!error && products.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-500 mb-2">No products found for "{query}"</h3>
            <p className="text-slate-400 font-medium">Try searching for a different term or brand.</p>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
