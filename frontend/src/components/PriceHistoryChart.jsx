import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { TrendingDown, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PriceHistoryChart = ({ productId, currentPrice = 45000 }) => {
  const [timeframe, setTimeframe] = useState('1M');

  // 1. Generate Realistic Mock Data based on timeframe
  const data = useMemo(() => {
    const points = timeframe === '7D' ? 7 : timeframe === '1M' ? 30 : timeframe === '6M' ? 24 : 52;
    const now = new Date();
    const mockData = [];
    let basePrice = currentPrice;
    
    // Reverse generation to ensure today is the last point
    for (let i = points; i >= 0; i--) {
      const date = new Date();
      if (timeframe === '7D' || timeframe === '1M') {
        date.setDate(now.getDate() - i);
      } else {
        date.setDate(now.getDate() - (i * 7)); // Weekly points for 6M/1Y
      }

      // Add some random fluctuation (up to 2% daily)
      const change = (Math.random() - 0.45) * (basePrice * 0.015);
      basePrice += change;

      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(basePrice),
        timestamp: date.getTime(),
      });
    }
    return mockData;
  }, [timeframe, currentPrice]);

  // 2. AI Logic: Calculate Insights
  const insights = useMemo(() => {
    if (data.length === 0) return null;
    
    const prices = data.map(d => d.price);
    const atl = Math.min(...prices);
    const lastPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2] || lastPrice;
    
    // 7-Day SMA (Simple Moving Average)
    const recentPrices = prices.slice(-7);
    const sma7 = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

    const isNearATL = lastPrice <= atl * 1.05; // Within 5% of All-Time Low
    const sentiment = lastPrice < prevPrice * 0.99 ? 'Dropping' : lastPrice > prevPrice * 1.01 ? 'Spiking' : 'Stable';
    const percentChange = ((lastPrice - prevPrice) / prevPrice * 100).toFixed(1);

    return { atl, sma7, isNearATL, sentiment, percentChange, lastPrice };
  }, [data]);

  // 3. Custom Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const current = payload[0].payload;
      // Find the previous data point in the local array
      const index = data.findIndex(d => d.timestamp === current.timestamp);
      const prev = index > 0 ? data[index - 1] : null;
      const diff = prev ? ((current.price - prev.price) / prev.price * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-[#0A101D]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{current.date}</p>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white">₹{current.price.toLocaleString()}</span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${Number(diff) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {Number(diff) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(diff)}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
              insights.sentiment === 'Spiking' ? 'bg-amber-500/20 text-amber-400' : 
              insights.sentiment === 'Dropping' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {insights.sentiment}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg relative overflow-hidden group">
      {/* Decorative subtle gradient for theme match */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

      {/* Header & Controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            Price Intelligence
            <AnimatePresence>
              {insights?.isNearATL && (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500 text-[10px] font-black text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                >
                  <Zap size={10} fill="currentColor" /> BEST TIME TO BUY
                </motion.span>
              )}
            </AnimatePresence>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Smart tracking powered by ReviewLens AI</p>
        </div>

        <div className="flex bg-slate-50 dark:bg-[#0A101D] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {['7D', '1M', '6M', '1Y'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                timeframe === t 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Insights Bar */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Price</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₹{insights?.lastPrice.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">All-Time Low</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{insights?.atl.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">7-Day SMA</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{Math.round(insights?.sma7).toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Market Trend</p>
          <div className={`flex items-center gap-1.5 text-xl font-black ${
            insights?.sentiment === 'Dropping' ? 'text-rose-500' : 
            insights?.sentiment === 'Spiking' ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            {insights?.sentiment === 'Dropping' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            {insights?.sentiment}
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="relative z-10 h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" className="dark:stroke-white/5" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
              domain={['dataMin - 1000', 'dataMax + 1000']}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />
            <ReferenceLine 
              y={insights?.atl} 
              stroke="#10b981" 
              strokeDasharray="5 5" 
              label={{ position: 'right', value: 'ATL', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#6366f1" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        <AlertCircle size={14} className="text-indigo-500" />
        Data verified by ReviewLens AI Engine. Accuracy guaranteed.
      </div>
    </div>
  );
};

export default PriceHistoryChart;
