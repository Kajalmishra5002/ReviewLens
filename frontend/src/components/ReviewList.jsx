import { Star, MessageSquareText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ReviewList({ reviews, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-50 dark:bg-[#0A101D] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
        <MessageSquareText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-xl font-black text-slate-900 dark:text-white">No reviews yet</p>
        <p className="text-slate-500 font-medium mt-1 text-sm">Be the first to share your experience!</p>
      </div>
    );
  }

  const highlightKeywords = (text) => {
    if (!text) return "";
    const positiveWords = ["good", "great", "best", "awesome", "excellent", "amazing", "perfect", "love", "nice", "fantastic"];
    const negativeWords = ["bad", "worst", "poor", "waste", "slow", "terrible", "disappointed", "hate", "useless", "broken"];
    
    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      const lowerWord = word.toLowerCase().replace(/[.,!]/g, "");
      if (positiveWords.includes(lowerWord)) {
        return <span key={i} className="text-emerald-600 dark:text-emerald-400 font-bold">{word}</span>;
      }
      if (negativeWords.includes(lowerWord)) {
        return <span key={i} className="text-red-600 dark:text-red-400 font-bold">{word}</span>;
      }
      return word;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((r, i) => {
        const sentiment = (r.sentiment || "neutral").toLowerCase();
        const isSuspicious = !!r.isSuspicious;
        const reviewText = r.text || r.reviewText || r.comment;
        
        let badgeStyle = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
        if(sentiment === 'positive') badgeStyle = "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
        else if (sentiment === 'negative') badgeStyle = "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
        else if (sentiment === 'neutral') badgeStyle = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";

        return (
          <motion.div
            key={r._id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-slate-50 dark:bg-[#0A101D] p-6 rounded-2xl border flex flex-col justify-between hover:shadow-md transition-all group relative ${
              r.isFake ? 'border-red-400/50 bg-red-50/10' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Fake Review Badge */}
            <div className="absolute top-4 right-4 z-20">
               {r.isFake ? (
                 <div className="group/tooltip relative">
                    <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg cursor-help">
                      <AlertTriangle className="w-3 h-3" /> FAKE REVIEW
                    </span>
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-30 font-medium">
                      This review appears suspicious due to similarity or generic content.
                    </div>
                 </div>
               ) : (
                 <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                   <CheckCircle2 className="w-3 h-3" /> GENUINE
                 </span>
               )}
            </div>

            <div>
              {isSuspicious && (
                <div className="flex items-center gap-2 text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-2 py-1 mb-4">
                  <AlertTriangle className="w-3 h-3" /> POTENTIAL FAKE REVIEW
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{r.name || r.userName || "Verified Buyer"}</h4>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`w-3.5 h-3.5 ${idx < Math.round(r.rating) ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-700"}`} 
                      />
                    ))}
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${badgeStyle}`}>
                  {sentiment}
                </span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic font-medium line-clamp-4">
                &quot;{highlightKeywords(reviewText)}&quot;
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              {r.confidenceScore > 0 && (
                <span className="text-indigo-500">{Math.round(r.confidenceScore * 100)}% AI CONFIDENCE</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
