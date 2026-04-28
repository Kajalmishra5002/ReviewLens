import { Link } from "react-router-dom";
import { Star, TrendingUp, Award } from "lucide-react";


export default function DashboardProductCard({ p, badgeType }) {
  if (!p) return null;

  const isTrending = badgeType === "trending";
  const isBest = badgeType === "best";

  // Simulate sentiment distribution if not available
  const positiveScore = p.smartScore || p.sentimentScore || 75;

  return (
    <div 
      className="bg-white dark:bg-[#111A2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative"
    >
      <Link to={`/product/${p._id}`} className="absolute inset-0 z-0"></Link>

      {/* Image Container */}
      <div className="relative h-48 bg-slate-50 dark:bg-[#0A101D] p-6 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-[#1C2333] transition-colors">
        <img
          src={p?.images?.[0]?.url || p?.image || "https://via.placeholder.com/300"}
          alt={p?.name || "Product"}
          className="object-contain h-full w-full drop-shadow-md relative z-10"
        />

        {/* Badges */}
        {isTrending && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-indigo-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
            <TrendingUp className="w-3 h-3" /> Trending
          </div>
        )}
        {isBest && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
            <Award className="w-3 h-3" /> Best Product
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col relative z-10">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {p?.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            ₹{p?.price?.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            {p?.ratings || p?.rating || "4.5"}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium mb-3">
          <span className="text-slate-500 dark:text-slate-400">
            {p?.numOfReviews || p?.reviews?.length || 0} reviews
          </span>
          <span className="text-emerald-500 font-bold">
            {positiveScore}% positive
          </span>
        </div>

        {/* Sentiment Bars */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-yellow-400 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
