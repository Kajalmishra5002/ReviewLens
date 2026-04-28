import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingDown, TrendingUp, Minus, ShoppingBag, Clock, AlertCircle } from "lucide-react";

const RECOMMENDATION_CONFIG = {
  "Buy Now": {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    icon: ShoppingBag,
    gradient: ["#10b981", "#059669"]
  },
  "Wait": {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    icon: Clock,
    gradient: ["#f59e0b", "#d97706"]
  },
  "Good Time": {
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/20",
    icon: ShoppingBag,
    gradient: ["#6366f1", "#4f46e5"]
  },
  "Insufficient Data": {
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
    icon: AlertCircle,
    gradient: ["#94a3b8", "#64748b"]
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-base font-black text-slate-900 dark:text-white">
          ₹{payload[0].value?.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function PriceHistoryChart({ productId }) {
  const [history, setHistory] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    Promise.all([
      api.get(`/products/${productId}/price-history`),
      api.get(`/products/${productId}/best-time-to-buy`)
    ])
      .then(([priceRes, buyRes]) => {
        const priceData = priceRes.data;
        const buyData = buyRes.data;
        
        const formatted = (priceData.history || []).map(entry => ({
          date: new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          price: entry.price
        }));
        setHistory(formatted);
        setInsight(buyData);
      })
      .catch(err => console.error("Price history fetch failed", err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return null;
  if (!insight) return null;

  const config = RECOMMENDATION_CONFIG[insight.recommendation] || RECOMMENDATION_CONFIG["Insufficient Data"];
  const RecoIcon = config.icon;
  const TrendIcon = insight.trend === "falling" ? TrendingDown : insight.trend === "rising" ? TrendingUp : Minus;
  const trendColor = insight.trend === "falling" ? "text-emerald-500" : insight.trend === "rising" ? "text-red-500" : "text-slate-400";
  const [gradStart, gradEnd] = config.gradient;

  return (
    <div className="mt-16 bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <TrendIcon className={`w-7 h-7 ${trendColor}`} />
            Price History & Trend
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Historical pricing data and intelligent buy recommendations</p>
        </div>

        {/* Recommendation Badge */}
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-sm ${config.bg} ${config.border}`}>
          <RecoIcon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
          <div>
            <p className={`text-lg font-black ${config.color}`}>{insight.recommendation}</p>
            <p className="text-xs text-slate-500 font-medium">Best Time to Buy Prediction</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
        {[
          { label: "Current Price", value: `₹${insight.currentPrice?.toLocaleString("en-IN")}`, sub: "live" },
          { label: "7-Day Average", value: `₹${insight.avgPrice?.toLocaleString("en-IN")}`, sub: "SMA" },
          { label: "Lowest Recorded", value: `₹${insight.lowestPrice?.toLocaleString("en-IN")}`, sub: "all time" }
        ].map(stat => (
          <div key={stat.label} className="bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {history.length > 1 ? (
        <div className="h-56 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradStart} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={gradEnd} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={gradStart}
                strokeWidth={2.5}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 5, fill: gradStart, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Not enough price data to display a chart yet. Check back after a price update.</p>
        </div>
      )}

      {/* Explanation */}
      {insight.explanation && (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-6 italic border-t border-slate-100 dark:border-slate-800 pt-5">
          💡 {insight.explanation}
        </p>
      )}
    </div>
  );
}
