import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MessageSquareText, ThumbsUp, ThumbsDown, ArrowLeft, BrainCircuit, ShoppingCart, TrendingUp, Check, ShieldCheck, Zap, X } from "lucide-react";
import useStore from "../store/useStore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const { addToCompare, compareList, addToCart } = useStore();
  const navigate = useNavigate();

  // Review Filters
  const [reviewFilter, setReviewFilter] = useState("All");

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

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Backend not running");
        return res.json();
      })
      .then(data => {
        const prod = data.product || data;
        setProduct(prod);
        setMainImage(prod.images?.[0]?.url || prod.image || "https://via.placeholder.com/600");
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load product details", err);
        setLoading(false);
      });
  }, [id]);

  // Derived Data
  const filteredReviews = useMemo(() => {
    if (!product?.reviews) return [];
    if (reviewFilter === "All") return product.reviews;
    return product.reviews.filter(r => {
      const sentiment = typeof r === 'object' ? r.sentiment : "Positive";
      return sentiment === reviewFilter;
    });
  }, [product, reviewFilter]);

  const { pros, cons, sentimentStats } = useMemo(() => {
    if (!product) return { pros: [], cons: [], sentimentStats: { pos: 0, neu: 0, neg: 0 } };
    
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    
    const allReviews = product.reviews || [];
    
    // Count sentiments
    allReviews.forEach(r => {
      const sentiment = typeof r === 'object' ? r.sentiment : "Positive";
      if (sentiment === 'Positive') posCount++;
      else if (sentiment === 'Negative') negCount++;
      else neuCount++;
    });

    const total = allReviews.length || 1; // avoid division by zero
    
    // Extract short meaningful opinions
    const extract = (sentimentType) => {
      return allReviews
        .filter(r => (typeof r === 'object' ? r.sentiment === sentimentType : sentimentType === 'Positive') && (typeof r === 'object' ? r.reviewText || r.comment : r))
        .map(r => {
           const text = typeof r === 'object' ? (r.reviewText || r.comment) : r;
           const sentence = text.split(/[.!?,]/)[0].trim();
           return sentence.length > 5 ? sentence : text.trim();
        })
        .filter(text => text.length < 80);
    };

    const uniquePros = [...new Set(extract("Positive"))].slice(0, 3);
    const uniqueCons = [...new Set(extract("Negative"))].slice(0, 3);

    // Fallback if no exact sentiment data
    let posPercent = Math.round((posCount / total) * 100);
    let negPercent = Math.round((negCount / total) * 100);
    let neuPercent = Math.round((neuCount / total) * 100);

    // Use smartScore if available and reviews are too few
    if (allReviews.length === 0 && product.smartScore) {
      posPercent = product.smartScore;
      negPercent = Math.floor((100 - posPercent) * 0.4);
      neuPercent = 100 - posPercent - negPercent;
    }

    return {
      pros: uniquePros,
      cons: uniqueCons,
      sentimentStats: { pos: posPercent, neu: neuPercent, neg: negPercent }
    };
  }, [product]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32 bg-white dark:bg-[#111A2E] rounded-3xl mt-10 shadow-sm border border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Product Not Found</h1>
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
              <span className="text-xs opacity-80 font-semibold ml-1">({product.reviews?.length || 0} Reviews)</span>
            </div>

            {product.sentimentScore && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 px-4 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  AI Score: {product.sentimentScore}% Positive
                </span>
              </div>
            )}
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
               <div className="text-3xl font-black text-slate-900 dark:text-white">{product.rating || product.ratings || "N/A"}</div>
               <div className="flex items-center gap-1 text-yellow-500 justify-center mt-1">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating || product.ratings || 0) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                 ))}
               </div>
             </div>
             <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
             <div>
               <div className="text-2xl font-black text-slate-900 dark:text-white">{product.reviews?.length || 0}</div>
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
                  <span className="text-emerald-600 dark:text-emerald-400">Positive</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{sentimentStats.pos}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{width: `${sentimentStats.pos}%`}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-yellow-600 dark:text-yellow-400">Neutral</span>
                  <span className="text-yellow-600 dark:text-yellow-400">{sentimentStats.neu}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{width: `${sentimentStats.neu}%`}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-red-600 dark:text-red-400">Negative</span>
                  <span className="text-red-600 dark:text-red-400">{sentimentStats.neg}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{width: `${sentimentStats.neg}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Positives */}
          <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-5 font-bold text-lg">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl"><ThumbsUp className="w-5 h-5" /></div> 
              Top Positives
            </div>
            <ul className="space-y-4">
              {pros.map((pro, i) => (
                <li key={`pro-${i}`} className="text-slate-700 dark:text-slate-300 flex items-start gap-3 font-medium text-sm">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> 
                  <span>{pro}</span>
                </li>
              ))}
              {pros.length === 0 && <li className="text-slate-500 italic text-sm font-medium">No major pros identified yet.</li>}
            </ul>
          </div>

          {/* Negatives */}
          <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-5 font-bold text-lg">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl"><ThumbsDown className="w-5 h-5" /></div> 
              Top Concerns
            </div>
            <ul className="space-y-4">
              {cons.map((con, i) => (
                <li key={`con-${i}`} className="text-slate-700 dark:text-slate-300 flex items-start gap-3 font-medium text-sm">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> 
                  <span>{con}</span>
                </li>
              ))}
              {cons.length === 0 && <li className="text-slate-500 italic text-sm font-medium">No major concerns reported by users.</li>}
            </ul>
          </div>

        </div>

        {/* Filters & Reviews List */}
        <div className="mt-16 border-t border-slate-100 dark:border-slate-800 pt-10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareText className="w-6 h-6 text-indigo-500" />
              All Reviews
            </h3>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-[#0A101D] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {["All", "Positive", "Neutral", "Negative"].map(f => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    reviewFilter === f 
                      ? f === 'Positive' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                        : f === 'Negative' ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                        : f === 'Neutral' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((r, i) => {
                const isObj = typeof r === 'object';
                const cmt = isObj ? (r.reviewText || r.comment) : r;
                const rName = isObj ? (r.userName || r.name) : "Verified Buyer";
                const rRating = isObj ? (r.rating || 5) : 5;
                const sentiment = isObj ? (r.sentiment || "Positive") : "Positive";
                
                let badgeStyle = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                if(sentiment === 'Positive') badgeStyle = "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
                else if (sentiment === 'Negative') badgeStyle = "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
                else badgeStyle = "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";

                return (
                  <div key={`review-${i}`} className="bg-slate-50 dark:bg-[#0A101D] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-500/30 transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">{rName}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className={`w-3.5 h-3.5 ${idx < Math.round(rRating) ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-700"}`} />
                            ))}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${badgeStyle}`}>
                          {sentiment}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic font-medium">"{cmt}"</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 text-center bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <MessageSquareText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">No {reviewFilter !== 'All' ? reviewFilter : ''} reviews found</p>
                <p className="text-slate-500 text-sm mt-1">Try selecting a different filter.</p>
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}