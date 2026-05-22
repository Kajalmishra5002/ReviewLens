import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export default function RatingStars({ rating, setRating, interactive = true }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={interactive ? { scale: 1.2 } : {}}
          whileTap={interactive ? { scale: 0.9 } : {}}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`focus:outline-none transition-colors ${
            star <= (hover || rating) ? "text-yellow-400" : "text-slate-300 dark:text-slate-700"
          }`}
        >
          <Star
            className={`w-6 h-6 ${star <= (hover || rating) ? "fill-current" : ""}`}
            strokeWidth={interactive ? 2 : 1.5}
          />
        </motion.button>
      ))}
    </div>
  );
}
