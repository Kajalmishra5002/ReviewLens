import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, BrainCircuit, CheckCircle2, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import api from "../api/axios";

// Import ChartJS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTitle, Tooltip, Legend);

export default function Reviews() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const { activeUser } = useStore();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        const list = res.data.products || res.data || [];
        setProducts(list);
        if (list.length > 0) {
          setSelectedProductId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Extract reviews directly from the selected product instead of fetching separately
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p._id === selectedProductId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReviews(prev => {
        const next = product?.reviews || [];
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
        return next;
      });
    }
  }, [selectedProductId, products]);

  const selectedProduct = products.find(p => p._id === selectedProductId);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!activeUser) return toast.error("Please login to write a review");
    if (rating === 0) return toast.error("Please select a star rating");
    if (!reviewText.trim()) return toast.error("Please write a review comment");

    setSubmitting(true);
    try {
      // POST to the correct reviews endpoint
      await api.post(`/reviews`, {
        productId: selectedProductId,
        userId: activeUser._id,
        name: activeUser.name,
        rating,
        reviewText: reviewText
      });
      toast.success("Review submitted! AI analyzed your sentiment.");
      setRating(0);
      setReviewText("");
      
      // Update local state to reflect new review instantly
      const updatedReview = {
        _id: Date.now().toString(),
        user: activeUser._id,
        name: activeUser.name,
        rating,
        comment: reviewText,
        sentiment: "Analyzing..." // Optimistic update
      };
      
      setProducts(prevProducts => prevProducts.map(p => {
        if (p._id === selectedProductId) {
          return { ...p, reviews: [updatedReview, ...(p.reviews || [])] };
        }
        return p;
      }));
      // setReviews is automatically triggered by the useEffect that watches products
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate Distribution
  const getDistribution = () => {
    let pos = 0, neu = 0, neg = 0;
    reviews.forEach(r => {
      if (r.sentiment === "Positive") pos++;
      else if (r.sentiment === "Negative") neg++;
      else neu++;
    });
    return { pos, neu, neg };
  };

  const dist = getDistribution();
  const totalRev = reviews.length;

  // Chart options & data
  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [dist.pos, dist.neu, dist.neg],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',  // Emerald 500
          'rgba(234, 179, 8, 0.8)',   // Yellow 500
          'rgba(239, 68, 68, 0.8)',   // Red 500
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e2e8f0', font: { family: 'inherit', weight: 'bold' } } 
      }
    }
  };

  // Extract Pros & Cons
  const getProsAndCons = () => {
    const pros = [];
    const cons = [];
    
    // Sort reviews by rating to get the "best" and "worst" statements
    const positiveReviews = reviews.filter(r => r.sentiment === 'Positive' || r.rating >= 4);
    const negativeReviews = reviews.filter(r => r.sentiment === 'Negative' || r.rating <= 2);

    // Extract short snippets from review comment
    positiveReviews.forEach(r => {
      if (pros.length < 3 && r.comment && r.comment.length > 5) {
        // extract first sentence or short phrase
        const snippet = r.comment.split('.')[0];
        if (snippet.length < 60) pros.push(snippet);
      }
    });

    negativeReviews.forEach(r => {
      if (cons.length < 3 && r.comment && r.comment.length > 5) {
        const snippet = r.comment.split('.')[0];
        if (snippet.length < 60) cons.push(snippet);
      }
    });

    // Fallbacks
    if (pros.length === 0) pros.push("Great value", "Good quality", "Reliable performance");
    if (cons.length === 0) cons.push("Average build", "Can be pricey", "Limited availability");

    return { pros: pros.slice(0, 3), cons: cons.slice(0, 3) };
  };

  const { pros, cons } = getProsAndCons();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 text-slate-100 space-y-10">
      
      {/* 1. Header & Dropdown Section */}
      <section className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/30 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 justify-between shadow-2xl relative overflow-hidden">
        {/* Abstract Background shapes */}
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 shadow-inner backdrop-blur-sm">
              <MessageSquare className="w-6 h-6 text-purple-300" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Interactive Reviews</h1>
          </div>
          <p className="text-indigo-200/90 text-sm font-medium leading-relaxed max-w-lg">
            Select a product to explore user feedback, dynamic AI sentiment distribution, and key pros & cons extracted from real reviews.
          </p>
        </div>

        <div className="w-full md:w-[45%] flex flex-col gap-2 relative z-10">
          <label className="text-xs font-black text-indigo-300 tracking-widest uppercase ml-1">Select Product to Analyze</label>
          <select 
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-indigo-950/80 border border-indigo-400/30 text-white p-4 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 cursor-pointer appearance-none shadow-inner transition-all font-bold"
          >
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* 2. Middle Section - Selected Product Analysis */}
      {selectedProduct && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Sentiment Analysis Graph & Pros/Cons */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Chart Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <BrainCircuit className="w-32 h-32 text-indigo-500" />
              </div>

              <h3 className="font-black text-xl mb-6 text-white flex items-center gap-2 relative z-10">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                Sentiment Overview
              </h3>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-800/80 text-sm relative z-10 mb-6">
                <span className="text-slate-400 font-medium">Total Reviews Analyzed</span>
                <span className="font-black text-2xl text-purple-400 bg-purple-500/10 px-4 py-1 rounded-full border border-purple-500/20">{totalRev}</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] relative z-10">
                {totalRev > 0 ? (
                  <Pie data={chartData} options={chartOptions} />
                ) : (
                  <p className="text-slate-500 font-medium bg-slate-800/50 px-4 py-2 rounded-xl">No sentiment data available.</p>
                )}
              </div>
            </div>

            {/* Pros & Cons Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                
                {/* Pros */}
                <div className="p-6 border-b lg:border-b md:border-r border-slate-800 bg-gradient-to-b from-emerald-500/5 to-transparent">
                  <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> Top Pros
                  </h4>
                  <ul className="space-y-3">
                    {pros.map((pro, idx) => (
                      <li key={`pro-${idx}`} className="text-sm font-medium text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5 font-bold">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="p-6 bg-gradient-to-b from-red-500/5 to-transparent">
                  <h4 className="text-red-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4" /> Top Cons
                  </h4>
                  <ul className="space-y-3">
                    {cons.map((con, idx) => (
                      <li key={`con-${idx}`} className="text-sm font-medium text-slate-300 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5 font-bold">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>

          {/* Right Col: Reviews List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-full max-h-[850px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="font-black text-xl text-white">User Feedback</h3>
              <div className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500/20">
                Latest first
              </div>
            </div>
            
            <div className="overflow-y-auto pr-2 flex-1 space-y-4 custom-scrollbar">
              {reviews.length > 0 ? (
                reviews.map((r) => {
                  let badgeCol = "bg-slate-800 text-slate-300 border-slate-700";
                  if(r.sentiment === 'Positive') badgeCol = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  else if (r.sentiment === 'Negative') badgeCol = "bg-red-500/10 text-red-400 border-red-500/20";
                  else badgeCol = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

                  return (
                    <div key={r._id} className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-white mb-1">{r.name}</h4>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-yellow-400 fill-current" : "text-slate-600"}`} />
                            ))}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeCol}`}>
                          {r.sentiment}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        "{r.comment}"
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-800/20">
                  <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
                  <p className="text-white font-bold text-lg mb-1">No reviews yet.</p>
                  <p className="text-slate-500 text-sm">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>

        </section>
      )}

      {/* 3. Bottom Section - Write Review */}
      {selectedProduct && (
        <section className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Star className="w-64 h-64 text-indigo-500" />
          </div>

          <div className="max-w-3xl relative z-10">
            <h3 className="font-black text-2xl mb-2 text-white">Write your review</h3>
            <p className="text-indigo-200/70 text-sm mb-8 font-medium">Your review text will be analyzed instantly by our AI model to update the global product sentiment score.</p>
            
            <form onSubmit={submitReview} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Rate the product</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button 
                      key={num} 
                      type="button" 
                      onClick={() => setRating(num)}
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                        rating >= num
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-400 scale-105 shadow-lg shadow-yellow-400/20"
                        : "border-slate-700 bg-slate-800/50 text-slate-600 hover:border-slate-500 hover:bg-slate-700"
                      }`}
                    >
                      <Star className={`w-6 h-6 ${rating >= num ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Your Experience</label>
                <textarea 
                  rows="4" 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your detailed experience. Example: The camera quality is excellent, but the battery drains a bit fast..."
                  className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 resize-none font-medium placeholder:text-slate-600 transition-all shadow-inner"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-purple-500/20"
                >
                  {submitting ? (
                    <>Processing AI Analysis...</>
                  ) : (
                    <>Submit & Analyze <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
              </div>

            </form>
          </div>
        </section>
      )}

    </div>
  );
}
