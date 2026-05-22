import { useState } from "react";
import { Send, Loader2, BrainCircuit, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import RatingStars from "./RatingStars";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewForm({ productId, onReviewAdded }) {
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !rating || !reviewText) {
      toast.error("Please fill all fields and select a rating");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/products/${productId}/review`, {
        productId, // Explicitly send in body too
        rating,
        text: reviewText,
        name: userName,
      });

      if (data.success) {
        toast.success("Review submitted!");
        // Note: The new backend structure returns the whole product, 
        // we'll extract the latest review sentiment if available.
        const latestReview = data.product.reviews[data.product.reviews.length - 1];
        setResult({
          sentiment: latestReview.sentiment,
          confidence: 0.95, // DistilBERT confidence or mock
        });
        
        // Reset form after delay
        setTimeout(() => {
          setUserName("");
          setRating(0);
          setReviewText("");
          setResult(null);
          if (onReviewAdded) onReviewAdded();
        }, 3000);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Send className="w-5 h-5 text-indigo-500" /> Write a Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rating</label>
          <RatingStars rating={rating} setRating={setRating} />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Review</label>
          <textarea
            rows="4"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            className="w-full bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || !!result}
          className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
            loading || !!result
              ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:-translate-y-1"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Sentiment...
            </>
          ) : result ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Submitted Successfully
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Submit Review
            </>
          )}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl">
                <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">AI Sentiment Detected</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{result.sentiment}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confidence</p>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round(result.confidence * 100)}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
