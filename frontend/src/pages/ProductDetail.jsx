import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MessageSquareText, ThumbsUp, ThumbsDown, ArrowLeft, BrainCircuit, ShoppingCart, TrendingUp, Check, ShieldCheck, Zap, X, AlertTriangle, TrendingDown, PieChart as PieChartIcon } from "lucide-react";
import useStore from "../store/useStore";
import api from "../api/axios";
import toast from "react-hot-toast";
import SkeletonCard from "../components/SkeletonCard";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import PriceHistoryChart from "../components/PriceHistoryChart";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import ProductCard from "../components/ProductCard";

// Chart Components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const { addToCompare, compareList, addToCart } = useStore();
  const navigate = useNavigate();

  // Review Filters
  const [reviewFilter, setReviewFilter] = useState("All");
  const [showOnlyGenuine, setShowOnlyGenuine] = useState(false);

  const isCompared = product ? compareList.some((p) => p._id === product._id) : false;

  const handleCompare = () => {
    if (!product) return;
    addToCompare(product);
    if (!isCompared) toast.success("Added to Compare");
    navigate('/compare');
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast.success("Added to Cart");
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product);
    navigate('/cart');
  };
  const fetchReviews = () => {
    setReviewsLoading(true);
    api.get(`/reviews/${id}`)
      .then(res => {
        setReviews(res.data.reviews || []);
        setReviewsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load reviews", err);
        setReviewsLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 1. Fetch Product Data
    api.get(`/products/${id}`)
      .then(res => {
        const prod = res.data.product || res.data;
        setProduct(prod);
        setMainImage(prod.images?.[0]?.url || prod.image || "https://via.placeholder.com/600");
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load product details", err);
        setError("Product not found or server error");
        setLoading(false);
      });

    // 2. Fetch Product Specific Reviews (Dynamic)
    fetchReviews();

    // 3. Fetch Related Products
    setRelatedLoading(true);
    api.get(`/products/related/${id}`)
      .then(res => {
        setRelatedProducts(res.data.products || []);
        setRelatedLoading(false);
      })
      .catch(err => {
        console.error("Failed to load related products", err);
        setRelatedLoading(false);
      });
  }, [id]);

  // Derived Data
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    let result = [...reviews];
    
    if (showOnlyGenuine) {
      result = result.filter(r => !r.isFake);
    }
    
    if (reviewFilter !== "All") {
      result = result.filter(r => r.sentiment === reviewFilter);
    }
    
    return result;
  }, [reviews, reviewFilter, showOnlyGenuine]);

  const { pros, cons, sentimentStats, barChartData } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      if (product?.smartScore) {
        const s = (product.smartScore / 5) * 100;
        return { 
          pros: [], cons: [], 
          sentimentStats: { pos: Math.round(s), neu: 0, neg: Math.round(100 - s), posCount: 0, neuCount: 0, negCount: 0, fakeCount: 0 },
          barChartData: { labels: [], datasets: [] }
        };
      }
      return { pros: [], cons: [], sentimentStats: { pos: 0, neu: 0, neg: 0, posCount: 0, neuCount: 0, negCount: 0, fakeCount: 0 }, barChartData: { labels: [], datasets: [] } };
    }
    
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    
    reviews.forEach(r => {
      if (r.sentiment === 'Positive') posCount++;
      else if (r.sentiment === 'Negative') negCount++;
      else neuCount++;
    });

    const total = reviews.length;
    const fakeCount = reviews.filter(r => r.isFake).length;
    
    // Rating Distribution for Bar Chart
    const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      const rate = Math.round(r.rating);
      if (ratings[rate] !== undefined) ratings[rate]++;
    });

    const barChartData = {
      labels: ['1 ⭐', '2 ⭐', '3 ⭐', '4 ⭐', '5 ⭐'],
      datasets: [
        {
          label: 'Number of Reviews',
          data: [ratings[1], ratings[2], ratings[3], ratings[4], ratings[5]],
          backgroundColor: '#6366f1',
          borderRadius: 8,
        },
      ],
    };

    return {
      pros: [],
      cons: [],
      barChartData,
      sentimentStats: { 
        pos: total > 0 ? Math.round((posCount / total) * 100) : 0, 
        neu: total > 0 ? Math.round((neuCount / total) * 100) : 0, 
        neg: total > 0 ? Math.round((negCount / total) * 100) : 0,
        posCount,
        neuCount,
        negCount,
        fakeCount,
        fakePercentage: total > 0 ? Math.round((fakeCount / total) * 100) : 0
      }
    };
  }, [reviews, product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
           <div className="h-[500px] bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 animate-pulse rounded-3xl"></div>
           <div className="space-y-6">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full"></div>
              <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
              <div className="h-40 w-full bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-3xl"></div>
              <div className="flex gap-4">
                 <div className="h-16 flex-1 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
                 <div className="h-16 flex-1 bg-indigo-500/20 animate-pulse rounded-2xl"></div>
              </div>
           </div>
        </div>
        <div className="mt-16 h-64 w-full bg-slate-50 dark:bg-[#0A101D] animate-pulse rounded-3xl border border-slate-200 dark:border-slate-800"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-32 bg-white dark:bg-[#111A2E] rounded-3xl mt-10 shadow-sm border border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{error || "Product Not Found"}</h1>
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-2">&larr; Back to Shop</Link>
      </div>
    );
  }

  const allImages = product.images?.map(img => img.url) || [product.image].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Image gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex items-center justify-center relative overflow-hidden group shadow-lg aspect-square lg:aspect-auto lg:h-[500px]">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <motion.img
              key={mainImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-105 drop-shadow-xl"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 rounded-2xl flex-shrink-0 border-2 overflow-hidden bg-white dark:bg-[#111A2E] ${mainImage === img ? 'border-indigo-600 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'} transition-all`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Product Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-500/20">
              {product.brand}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{product.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-xl font-bold shadow-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{product.rating || product.ratings || "N/A"}</span>
              <span className="text-xs opacity-80 font-semibold ml-1">({reviews?.length || 0} Reviews)</span>
            </div>

            {sentimentStats.fakePercentage > 20 && (
              <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl font-bold border border-red-200 dark:border-red-800 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs uppercase tracking-tighter">AI Warning: High Fake Review Volume ({sentimentStats.fakePercentage}%)</span>
              </div>
            )}

            {/* PRAS Circular Grade Badge */}
            {product.smartScore > 0 && (() => {
              const s = (product.smartScore / 5) * 100;
              const grade = s >= 90 ? "A+" : s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : "D";
              const gradeColor = s >= 80 ? "text-emerald-600 dark:text-emerald-400" : s >= 65 ? "text-indigo-600 dark:text-indigo-400" : s >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
              const gradeBg = s >= 80 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : s >= 65 ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30" : s >= 50 ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30";
              const barColor = s >= 80 ? "bg-emerald-500" : s >= 65 ? "bg-indigo-500" : s >= 50 ? "bg-amber-500" : "bg-red-500";
              return (
                <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm ${gradeBg}`}>
                  {/* Grade Circle */}
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-xl ${gradeColor} border-current`}>
                    {grade}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <BrainCircuit className={`w-3.5 h-3.5 ${gradeColor}`} />
                      <span className={`text-xs font-black uppercase tracking-widest ${gradeColor}`}>PRAS Score</span>
                      {s >= 65 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    {/* Confidence bar */}
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${Math.round(s)}%` }} />
                    </div>
                    <p className={`text-[10px] font-bold mt-0.5 ${gradeColor}`}>{Math.round(s)}% Confidence</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="text-4xl font-black text-slate-900 dark:text-white mb-8 flex items-end gap-3">
            ₹{product.price?.toLocaleString("en-IN")}
            <span className="text-lg text-slate-400 line-through font-bold mb-1">
              ₹{Math.floor(product.price * 1.2).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mb-8 p-6 bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
              {product.description || "Experience premium quality and cutting-edge technology. Buy with confidence."}
            </p>
            {product.features && product.features.length > 0 && (
              <ul className="space-y-4">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start text-slate-700 dark:text-slate-300 gap-3 font-semibold text-sm">
                    <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button 
              onClick={handleAddToCart} 
              className="flex-1 bg-white dark:bg-[#111A2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-bold transition-colors border border-slate-200 dark:border-slate-700 flex justify-center items-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button 
              onClick={handleBuyNow} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-xl transition-all hover:-translate-y-1 flex justify-center items-center gap-2"
            >
              <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" /> Buy Now
            </button>
            <button 
              onClick={handleCompare}
              title="Compare Product"
              className={`px-6 py-4 rounded-2xl font-bold border transition-colors flex items-center justify-center gap-2 ${
                isCompared 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' 
                  : 'bg-white dark:bg-[#111A2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              {isCompared ? <Check className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </button>
          </div>

          {(product.amazonLink || product.flipkartLink) && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {product.amazonLink && (
                <a 
                  href={product.amazonLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#FF9900] hover:bg-[#E38800] text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex justify-center items-center gap-2"
                >
                  Buy on Amazon
                </a>
              )}
              {product.flipkartLink && (
                <a 
                  href={product.flipkartLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#2874F0] hover:bg-[#1C5ECA] text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex justify-center items-center gap-2"
                >
                  Buy on Flipkart
                </a>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Explainable AI (XAI) Section */}
      {product?.aiInsights && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-slate-50 to-white dark:from-[#0A101D] dark:to-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg"><BrainCircuit className="w-6 h-6 text-white" /></div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Explainable AI Insights</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Summary */}
            <div className="lg:col-span-1 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
               <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                 <Zap className="w-4 h-4" /> AI Summary
               </h3>
               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                 {product.aiInsights.summary}
               </p>
               {product.aiInsights.lastGenerated && (
                 <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-tighter">Last analyzed: {new Date(product.aiInsights.lastGenerated).toLocaleDateString()}</p>
               )}
            </div>

            {/* Positive Highlights */}
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" /> Positive Sentiment
              </h3>
              {product.aiInsights.positiveHighlights?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.aiInsights.positiveHighlights.map(h => (
                    <span key={h} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-100 dark:border-emerald-500/20">
                      {h}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Not enough positive data</p>
              )}
            </div>

            {/* Negative Highlights */}
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4" /> Areas for Improvement
              </h3>
              {product.aiInsights.negativeHighlights?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.aiInsights.negativeHighlights.map(h => (
                    <span key={h} className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-100 dark:border-red-500/20">
                      {h}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No significant concerns</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Price History & Best Time to Buy */}
      <PriceHistoryChart productId={id} />

      {/* Customer Reviews & Sentiment Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
              <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Customer Reviews & Sentiment</h2>
              <p className="text-slate-500 font-medium mt-1">Smart sentiment extraction from verified buyers</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0A101D] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
             <div className="text-center">
               <div className="text-3xl font-black text-slate-900 dark:text-white">{product.avgRating || product.rating || product.ratings || "0"}</div>
               <div className="flex items-center gap-1 text-yellow-500 justify-center mt-1">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.avgRating || product.rating || product.ratings || 0) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                 ))}
               </div>
             </div>
             <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
             <div>
               <div className="text-2xl font-black text-slate-900 dark:text-white">{product.totalReviews || reviews.length}</div>
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Reviews</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Sentiment Breakdown Chart */}
          <div className="bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Sentiment Breakdown
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-emerald-600 dark:text-emerald-400">Positive ({sentimentStats.posCount})</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{sentimentStats.pos}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{width: `${sentimentStats.pos}%`}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-yellow-600 dark:text-yellow-400">Neutral ({sentimentStats.neuCount})</span>
                  <span className="text-yellow-600 dark:text-yellow-400">{sentimentStats.neu}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{width: `${sentimentStats.neu}%`}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-red-600 dark:text-red-400">Negative ({sentimentStats.negCount})</span>
                  <span className="text-red-600 dark:text-red-400">{sentimentStats.neg}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{width: `${sentimentStats.neg}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution Bar Chart */}
          <div className="bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Rating Distribution
            </h3>
            <div className="h-40">
               {reviews.length > 0 ? (
                 <Bar 
                   data={barChartData} 
                   options={{ 
                     responsive: true, 
                     maintainAspectRatio: false, 
                     plugins: { legend: { display: false } },
                     scales: { 
                       y: { display: false }, 
                       x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' } } } 
                     } 
                   }} 
                 />
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Data</div>
               )}
            </div>
          </div>

          {/* Genuine vs Fake Pie Chart */}
          <div className="bg-slate-50 dark:bg-[#0A101D] p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Review Authenticity
            </h4>
            <div className="h-40">
              <Pie 
                data={{
                  labels: ['Genuine', 'Fake'],
                  datasets: [{
                    data: [(sentimentStats.posCount + sentimentStats.neuCount + sentimentStats.negCount) - sentimentStats.fakeCount, sentimentStats.fakeCount],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0,
                  }]
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: 'bold' } } } }
                }}
              />
            </div>
          </div>

        </div>

        {/* Review Form Integration */}
        <div className="mt-12">
          <ReviewForm productId={id} onReviewAdded={fetchReviews} />
        </div>

        {/* Filters & Reviews List */}
        <div className="mt-16 border-t border-slate-100 dark:border-slate-800 pt-10">
          
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-2">
              {["All", "Positive", "Neutral", "Negative"].map((f) => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    reviewFilter === f 
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-slate-50 dark:bg-[#0A101D] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={showOnlyGenuine} 
                    onChange={() => setShowOnlyGenuine(!showOnlyGenuine)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
                <span className="text-xs font-black text-slate-500 group-hover:text-emerald-500 transition-colors uppercase tracking-tighter">Only Genuine Reviews</span>
              </label>
            </div>
          </div>

          <ReviewList reviews={filteredReviews} loading={reviewsLoading} />
        </div>

      </motion.div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center justify-between mb-10 px-2">
             <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Related Products</h2>
                <p className="text-slate-500 font-medium mt-1">Based on category and similar features</p>
             </div>
             <Link to="/" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {relatedProducts.map(p => (
               <ProductCard key={p._id} p={p} />
             ))}

          </div>
        </div>
      )}
    </div>
  );
}