// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { BrainCircuit, ShieldCheck, TrendingUp } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "Smart Sentiment Analysis",
    description: "DistilBERT Transformer model analyzes review context and sarcasm to deliver highly accurate sentiment scores — far beyond keyword matching.",
    gradient: "from-indigo-500 to-purple-600",
    glow: "group-hover:shadow-indigo-500/20",
    border: "group-hover:border-indigo-400/40 dark:group-hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30"
  },
  {
    icon: ShieldCheck,
    title: "Fake Review Detection",
    description: "Multi-signal ML analysis flags suspicious activity using timing patterns, text similarity clustering, and same-user spam detection.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/20",
    border: "group-hover:border-emerald-400/40 dark:group-hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30"
  },
  {
    icon: TrendingUp,
    title: "PRAS Intelligent Scoring",
    description: "Ridge Regression ML model dynamically weighs sentiment, review volume, fake detection, and ratings to produce adaptive product scores.",
    gradient: "from-amber-500 to-orange-500",
    glow: "group-hover:shadow-amber-500/20",
    border: "group-hover:border-amber-400/40 dark:group-hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30"
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function AIHighlightBanner() {
  return (
    <section className="w-full py-14 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI-Powered Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 leading-tight">
            AI Insights Powered Shopping
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-base font-medium max-w-xl mx-auto">
            ReviewLens uses state-of-the-art AI to make every buying decision smarter, safer, and more transparent.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={cardVariants}
                className={`group relative bg-white dark:bg-[#111A2E] rounded-2xl border border-slate-200 dark:border-slate-800 p-7 shadow-lg hover:shadow-2xl ${feat.glow} ${feat.border} transition-all duration-300 overflow-hidden cursor-default`}
              >
                {/* Gradient glow in corner */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 rounded-full blur-2xl transition-all duration-500 pointer-events-none`} />

                {/* Gradient border line on top */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feat.iconBg} mb-5`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-br ${feat.gradient} bg-clip-text`} style={{ color: "transparent", backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                  <Icon className={`w-6 h-6 text-current hidden`} />
                </div>

                {/* Use a plain colored icon for simplicity */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feat.iconBg} mb-5 -mt-11`}>
                  <Icon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
