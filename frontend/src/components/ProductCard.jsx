import { Link, useNavigate } from "react-router-dom";
import { Star, TrendingUp, Sparkles, Check, ShieldCheck, Zap, Plus, Award, AlertTriangle } from "lucide-react";
import useStore from "../store/useStore";
import toast from "react-hot-toast";

// Convert smartScore (0-5) → letter grade
const getGrade = (smartScore) => {
  if (!smartScore) return null;
  const s = (smartScore / 5) * 100;
  if (s >= 90) return { label: "A+", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30" };
  if (s >= 80) return { label: "A",  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30" };
  if (s >= 65) return { label: "B",  color: "text-indigo-600 dark:text-indigo-400",   bg: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30" };
  if (s >= 50) return { label: "C",  color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30" };
  return         { label: "D",  color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30" };
};

// Compute Positive/Negative % from reviews array
const getSentimentBars = (reviews) => {
  if (!reviews || reviews.length === 0) return { pos: 0, neg: 0 };
  const pos = reviews.filter(r => r.sentiment === "Positive").length;
  const neg = reviews.filter(r => r.sentiment === "Negative").length;
  const total = reviews.length;
  return { pos: Math.round((pos / total) * 100), neg: Math.round((neg / total) * 100) };
};

export default function ProductCard({ p, product, badgeType }) {
  const navigate = useNavigate();
  const { addToCart, addToCompare, compareList = [] } = useStore();

  // Use product if p is not provided
  if (!p && product) p = product;

  if (!p) return null;

  const isTrending = badgeType === "trending";
  const isBest = badgeType === "best";
  const isCompared = compareList?.some(item => item._id === p._id);
  const isCategoryMismatch = compareList?.length > 0 && !isCompared && compareList?.[0]?.category !== p?.category;

  // Detect suspicious reviews
  const suspiciousCount = p?.reviews?.filter?.(r => r.isSuspicious)?.length || 0;
  const hasFakeReviews = suspiciousCount > 0;

  // Grade from PRAS smart score
  const grade = getGrade(p?.smartScore);

  // Sentiment bars
  const { pos, neg } = getSentimentBars(p?.reviews || []);

  // Sentiment badge styling
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
    toast.success("Added to cart");
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
    navigate("/cart");
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCategoryMismatch) {
      toast.error(`Please select products from the same category (${compareList[0].category})`);
      return;
    }
    if (isCompared) { navigate("/compare"); return; }
    if (compareList?.length >= 3) { toast.error("Compare limit exceeded (Max 3)"); return; }
    addToCompare(p);
    toast.success("Added to compare");
  };

  return (
    <Link to={`/product/${p._id}`} className="block h-full">
      <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-5 shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 h-full hover:scale-[1.02]">

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 dark:group-hover:from-primary/10 dark:group-hover:to-accent/10 transition-all duration-500 pointer-events-none" />

        {/* Image Container */}
        <div className="relative mb-5 overflow-hidden rounded-xl bg-slate-50 dark:bg-[#0A101D] p-6 aspect-[4/3] flex items-center justify-center group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors">
          <img
            src={p?.images?.[0]?.url || p?.image || "https://via.placeholder.com/300"}
            alt={p?.name || "Product"}
            className="object-contain h-full w-full drop-shadow-md relative z-10 group-hover:scale-105 transition-transform duration-500"
          />

          {/* PRAS Grade Badge (Top Left) */}
          {grade && (
            <div className={`absolute top-3 left-3 z-30 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black border shadow-sm backdrop-blur-md ${grade.bg} ${grade.color}`}>
              <Sparkles className="w-3 h-3" />
              <span>PRAS {grade.label}</span>
            </div>
          )}

          {/* Trending / Best Badge (Bottom Left) */}
          {isTrending && (
            <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1 bg-indigo-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
              <TrendingUp className="w-3 h-3" /> Trending
            </div>
          )}
          {isBest && (
            <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
              <Award className="w-3 h-3" /> Best Product
            </div>
          )}

          {/* External Source Badge */}
          {p?.source === "external" && (
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-black shadow-md uppercase tracking-tighter">
              <Sparkles className="w-3 h-3" /> AI Curated
            </div>
          )}

          {/* Fake Review Indicator (Bottom Right) */}
          {hasFakeReviews && p?.source !== "external" && (
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md">
              <AlertTriangle className="w-3 h-3" /> Fake reviews
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

          {/* Rating */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 bg-yellow-100/50 dark:bg-yellow-500/10 px-2 py-1 rounded-md text-sm font-bold text-yellow-600 dark:text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{p?.ratings || p?.rating || "0.0"}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">({p?.reviews?.length || 0} reviews)</span>
          </div>

          {/* Mini Sentiment Bar */}
          {(pos > 0 || neg > 0) && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span className="text-emerald-600 dark:text-emerald-400">{pos}% Positive</span>
                <span className="text-red-500 dark:text-red-400">{neg}% Negative</span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="bg-emerald-500 rounded-l-full transition-all duration-700" style={{ width: `${pos}%` }} />
                <div className="bg-red-500 rounded-r-full transition-all duration-700" style={{ width: `${neg}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div className="mt-4 relative z-10">
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
      </div>
    </Link>
  );
}