import { Link, useNavigate } from "react-router-dom";
import { Star, TrendingUp, Sparkles, Check, Heart, ShieldCheck, Zap, Plus } from "lucide-react";
import useStore from "../store/useStore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ProductCard({ p }) {
  const navigate = useNavigate();
  const { addToCart, addToCompare, compareList = [] } = useStore();

  if (!p) return null;

  const isCompared = compareList?.some(item => item._id === p._id);

  // 🎨 Sentiment styling
  let sentimentColor = "text-slate-500 dark:text-slate-400";
  let sentimentBg = "bg-slate-100 dark:bg-[#1C2333] border-slate-200 dark:border-slate-800";
  let sentimentIcon = <Zap className="w-3 h-3" />;

  if (p?.sentiment === "Positive") {
    sentimentColor = "text-emerald-600 dark:text-emerald-400";
    sentimentBg = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
    sentimentIcon = <ShieldCheck className="w-3 h-3" />;
  } else if (p?.sentiment === "Negative") {
    sentimentColor = "text-red-600 dark:text-red-400";
    sentimentBg = "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
    sentimentIcon = <TrendingUp className="w-3 h-3 rotate-180" />;
  } else if (p?.sentiment === "Neutral") {
    sentimentColor = "text-amber-600 dark:text-amber-400";
    sentimentBg = "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
    sentimentIcon = <TrendingUp className="w-3 h-3" />;
  }

  // 🛒 Add to Cart
  const handleAddToCart = (e) => {
    e.preventDefault(); // prevent triggering Link
    addToCart(p);
    toast.success("Added to cart");
  };

  // 💳 Buy Now → cart → navigate
  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart(p);
    navigate("/cart");
  };

  const isCategoryMismatch = compareList?.length > 0 && !isCompared && compareList?.[0]?.category !== p?.category;

  // 🔁 Compare
  const handleCompare = (e) => {
    e.preventDefault();
    if (isCategoryMismatch) {
      toast.error(`Please select products from the same category (${compareList[0].category})`);
      return;
    }
    
    if (isCompared) {
      navigate("/compare");
      return;
    }

    if (compareList?.length >= 3) {
      toast.error("Compare limit exceeded (Max 3)");
      return;
    }
    
    addToCompare(p);
    toast.success("Added to compare");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-5 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
    >
      <Link 
        to={`/product/${p._id}`} 
        onClick={() => console.log("Navigating to product", p._id)}
        className="absolute inset-0 z-20"
      ></Link>

      {/* Image Container */}
      <div className="relative mb-5 overflow-hidden rounded-xl bg-slate-50 dark:bg-[#0A101D] p-6 aspect-[4/3] flex items-center justify-center group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors">
        <motion.img
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          src={p?.images?.[0]?.url || p?.image || "https://via.placeholder.com/300"}
          alt={p?.name || "Product"}
          className="object-contain h-full w-full drop-shadow-md relative z-10"
        />

        {/* PRAS Badge (Top Left) */}
        {p?.sentimentScore && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1 rounded-full bg-white/90 dark:bg-[#111A2E]/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
            <Sparkles className={`w-3.5 h-3.5 ${sentimentColor}`} />
            <span className="text-slate-800 dark:text-white">{p.sentimentScore}</span>
          </div>
        )}

        {/* Compare Button (Top Right) */}
        <button 
          onClick={handleCompare}
          disabled={isCategoryMismatch && !isCompared}
          className={`absolute top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md ${
            isCompared 
              ? 'bg-indigo-500 text-white border border-indigo-600' 
              : 'bg-white/80 dark:bg-[#111A2E]/80 text-slate-500 hover:text-indigo-500 hover:bg-white dark:hover:bg-[#111A2E] border border-slate-200 dark:border-slate-700'
          } ${isCategoryMismatch && !isCompared ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCompared ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Info Section */}
      <div className="flex-1 relative z-10">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{p?.brand || "Brand"}</p>
          <div className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${sentimentBg} ${sentimentColor}`}>
            {sentimentIcon}
            {p?.sentiment || "Neutral"}
          </div>
        </div>

        <h2 className="font-bold text-[17px] leading-tight text-slate-900 dark:text-slate-100 line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {p?.name || "Unknown"}
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-yellow-100/50 dark:bg-yellow-500/10 px-2 py-1 rounded-md text-sm font-bold text-yellow-600 dark:text-yellow-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{p?.ratings || p?.rating || "0.0"}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">({p?.reviews?.length || 0} reviews)</span>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="mt-5 relative z-10">
        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{(p?.price || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-slate-500 line-through mb-1">
            ₹{Math.floor((p?.price || 0) * 1.2).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            className="w-full relative z-30 bg-slate-100 dark:bg-[#1C2333] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white py-2.5 rounded-xl font-semibold text-sm transition-colors border border-slate-200 dark:border-slate-700"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full relative z-30 bg-accent hover:bg-accent-hover text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-accent/20 hover:shadow-lg hover:-translate-y-0.5"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}