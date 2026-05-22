import { useState, useEffect, useMemo } from "react";
import { Star, MessageSquare, ArrowLeft, Search, Filter, ChevronDown, BrainCircuit, BarChart3, TrendingUp, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import { motion, AnimatePresence } from "framer-motion";

// Import ChartJS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, ChartTitle, Tooltip, Legend);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  // 1. Fetch all products for selector
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        console.log("Fetched Products:", data);
        if (data.products) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  const fetchReviewData = async (id) => {
    try {
      setLoading(true);
      setStatsLoading(true);
      
      // Fetch Reviews
      const revRes = await api.get(`/reviews/${id}`);
      setReviews(revRes.data.reviews || []);
      
      // Fetch Product Details
      const prodRes = await api.get(`/products/${id}`);
      setProduct(prodRes.data.product || prodRes.data);
      
    } catch (err) {
      console.error("Failed to fetch review data:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // 3. Filter States
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    if (selectedProductId) {
      fetchReviewData(selectedProductId);
    } else {
      setReviews([]);
      setProduct(null);
      setLoading(false);
    }
  }, [selectedProductId]);

  // Chart Data & Filtered Reviews
  const { pieData, barData, stats, filteredReviews } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { pieData: null, barData: null, stats: { pos: 0, neu: 0, neg: 0, avg: 0 }, filteredReviews: [] };
    }

    let pos = 0, neu = 0, neg = 0;
    const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach(r => {
      if (r.sentiment === "Positive") pos++;
      else if (r.sentiment === "Negative") neg++;
      else neu++;

      ratings[Math.round(r.rating)] = (ratings[Math.round(r.rating)] || 0) + 1;
      totalRating += r.rating;
    });

    const total = reviews.length;
    const avg = (totalRating / total).toFixed(1);

    // Filter Logic
    let filtered = [...reviews];
    if (filterType === "Positive") filtered = reviews.filter(r => r.sentiment === "Positive");
    if (filterType === "Negative") filtered = reviews.filter(r => r.sentiment === "Negative");
    if (filterType === "Fake") filtered = reviews.filter(r => r.isFake || r.isSuspicious);

    const pie = {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data: [pos, neu, neg],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0,
        },
      ],
    };

    const bar = {
      labels: ["1 ⭐", "2 ⭐", "3 ⭐", "4 ⭐", "5 ⭐"],
      datasets: [
        {
          label: "Reviews",
          data: [ratings[1], ratings[2], ratings[3], ratings[4], ratings[5]],
          backgroundColor: '#6366f1',
          borderRadius: 8,
        },
      ],
    };

    return { pieData: pie, barData: bar, stats: { pos, neu, neg, total, avg }, filteredReviews: filtered };
  }, [reviews, filterType]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section with Selector */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-500 font-bold text-sm mb-4 hover:translate-x-1 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Review Hub</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
              Select an electronic product to dive deep into customer sentiment, verify authenticity, and see real-time satisfaction graphs.
            </p>
          </div>

          <div className="w-full lg:w-[400px] space-y-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search electronic product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white font-medium"
                />
             </div>
             <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white font-bold cursor-pointer"
                >
                  <option value="">Select a Product</option>
                  {filteredProducts.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedProductId && product ? (
          <motion.div
            key={selectedProductId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Analysis Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sentiment Pie Chart */}
              <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <BrainCircuit className="w-32 h-32 text-indigo-500 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <BrainCircuit className="w-6 h-6 text-indigo-500" />
                  Sentiment Distribution
                </h3>
                <div className="h-64 relative">
                  {stats.total > 0 ? (
                    <Pie 
                      data={pieData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: 'bold' } } } } 
                      }} 
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full">No Data</div>
                  )}
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-500">{stats.pos}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Positive</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-yellow-500">{stats.neu}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Neutral</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-red-500">{stats.neg}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Negative</p>
                  </div>
                </div>
              </div>

              {/* Rating Bar Chart */}
              <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-indigo-500" />
                  Rating Breakdown
                </h3>
                <div className="h-64">
                   {stats.total > 0 ? (
                     <Bar 
                        data={barData} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { weight: 'bold' } } },
                            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' } } }
                          }
                        }} 
                      />
                   ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">No Ratings</div>
                   )}
                </div>
                <div className="mt-8 p-4 bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Rating</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.avg} <span className="text-yellow-400 text-xl">★</span></p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
                      <div className="flex items-center gap-1.5 text-indigo-500 font-black">
                        <TrendingUp className="w-4 h-4" /> Top 10%
                      </div>
                   </div>
                </div>
              </div>

              {/* Review Submission Area */}
              <div className="lg:col-span-1">
                <ReviewForm productId={selectedProductId} onReviewAdded={() => fetchReviewData(selectedProductId)} />
              </div>

            </div>

            {/* Detailed Reviews List */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/20">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Verified Feedback</h2>
                    <p className="text-slate-500 font-medium mt-0.5">Explore {stats.total} authentic reviews for {product.name}</p>
                  </div>
                </div>
                
                {/* 🎯 Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#111A2E] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   {["All", "Positive", "Negative", "Fake"].map(type => (
                     <button
                       key={type}
                       onClick={() => setFilterType(type)}
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                         filterType === type 
                           ? "bg-indigo-500 text-white shadow-md" 
                           : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                       }`}
                     >
                       {type}
                     </button>
                   ))}
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-[#111A2E] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div className="flex flex-col items-center px-4 border-r border-slate-100 dark:border-slate-800">
                      <ThumbsUp className="w-4 h-4 text-emerald-500 mb-1" />
                      <span className="text-sm font-black text-emerald-500">{stats.pos}</span>
                   </div>
                   <div className="flex flex-col items-center px-4">
                      <ThumbsDown className="w-4 h-4 text-red-500 mb-1" />
                      <span className="text-sm font-black text-red-500">{stats.neg}</span>
                   </div>
                </div>
              </div>

              <ReviewList reviews={filteredReviews} loading={loading} />
            </div>
          </motion.div>
        ) : !selectedProductId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 dark:bg-[#0A101D] rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <MessageSquare className="w-24 h-24 text-slate-300 dark:text-slate-700 relative z-10" />
            </div>
            <div className="max-w-md">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Product Selected</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Please search or select an electronic product above to start exploring its community feedback and sentiment trends.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
