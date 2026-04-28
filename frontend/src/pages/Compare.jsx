import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Star, Zap, Smartphone, ChevronRight, Award, Camera, Battery, DollarSign, Monitor, Shield, Gamepad2, ArrowLeft, Sparkles, TrendingUp, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import useStore from "../store/useStore";
import api from "../api/axios";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const priorities = [
  { id: "Overall Best", icon: Award },
  { id: "Camera", icon: Camera },
  { id: "Battery Life", icon: Battery },
  { id: "Value for Money", icon: DollarSign },
  { id: "Performance", icon: Zap },
  { id: "Display", icon: Monitor },
  { id: "Build Quality", icon: Shield },
  { id: "Gaming", icon: Gamepad2 }
];

export default function Compare() {
  const { compareList, addToCompare, removeFromCompare } = useStore();
  const [allProducts, setAllProducts] = useState([]);
  const [activePriority, setActivePriority] = useState("Overall Best");

  // Load all DB products for the dropdown selector and suggestions
  useEffect(() => {
    api.get("/products")
      .then(res => {
        const prods = res.data.products || res.data || [];
        setAllProducts(prods);
      })
      .catch(err => console.error("Failed to load products", err));
  }, []);

  // Derive IDs directly from the store — no separate state needed
  const productAId = compareList[0]?._id || "";
  const productBId = compareList[1]?._id || "";

  // Handlers for dropdown changes: update the compareList store
  const handleProductAChange = (id) => {
    const chosen = allProducts.find(p => p._id === id);
    if (!chosen) return;
    removeFromCompare(productAId);
    addToCompare(chosen);
  };

  const handleProductBChange = (id) => {
    if (!id) { removeFromCompare(productBId); return; }
    const chosen = allProducts.find(p => p._id === id);
    if (chosen) addToCompare(chosen);
  };

  // Resolve pA/pB: store first (handles ext_* products), then DB lookup
  const pA = compareList.find(p => p._id === productAId) || allProducts.find(p => p._id === productAId) || null;
  const pB = compareList.find(p => p._id === productBId) || allProducts.find(p => p._id === productBId) || null;

  const categoryProducts = allProducts.filter(p => pA && p.category === pA.category && p._id !== pA._id);

  // Smart Suggestions
  const getSmartSuggestions = () => {
    if (!pA) return [];
    return [...categoryProducts]
      .sort((a, b) => {
        const aDiffBrand = a?.brand !== pA?.brand ? 1 : 0;
        const bDiffBrand = b?.brand !== pA?.brand ? 1 : 0;
        if (aDiffBrand !== bDiffBrand) return bDiffBrand - aDiffBrand;
        return Math.abs((a?.price || 0) - (pA?.price || 0)) - Math.abs((b?.price || 0) - (pA?.price || 0));
      })
      .slice(0, 4);
  };
  const suggestions = getSmartSuggestions();

  const getDynamicScore = (product, priority) => {
    if (!product) return 0;
    let score = product.smartScore || product.sentimentScore || 75;
    
    if (priority !== "Overall Best") {
      const featuresText = Array.isArray(product.features) ? product.features.join(" ") : (product.features || "");
      const text = ((product.description || "") + " " + featuresText).toLowerCase();
      const mappings = {
        "Camera": ["camera", "lens", "photo", "megapixel", "sensor"],
        "Battery Life": ["battery", "mah", "charge", "power", "w"],
        "Value for Money": ["value", "budget", "affordable", "price", "cheap"],
        "Performance": ["processor", "ram", "speed", "performance", "cpu", "chip", "bionic", "snapdragon"],
        "Display": ["display", "screen", "oled", "hz", "resolution", "pixel", "amoled", "nits"],
        "Build Quality": ["build", "aluminum", "design", "durability", "metal", "glass", "titanium"],
        "Gaming": ["gaming", "gpu", "graphics", "refresh rate", "fps", "cooling"]
      };
      
      let kwScore = 0;
      (mappings[priority] || []).forEach(kw => {
        if (text.includes(kw)) kwScore += 5;
      });
      score = score * 0.7 + kwScore;
    }
    return Math.min(Math.round(score), 99); // Max 99 for realism
  };

  const getFeatureScores = (p) => {
    return [
      { name: "Camera", score: getDynamicScore(p, "Camera") },
      { name: "Battery", score: getDynamicScore(p, "Battery Life") },
      { name: "Value", score: getDynamicScore(p, "Value for Money") },
      { name: "Performance", score: getDynamicScore(p, "Performance") },
      { name: "Display", score: getDynamicScore(p, "Display") },
      { name: "Build", score: getDynamicScore(p, "Build Quality") }
    ];
  };

  const extractSpecs = (p) => {
    if (!p) return {};
    
    const findSpec = (keywords, defaultVal) => {
      if (!Array.isArray(p.features)) return defaultVal;
      const feature = p.features.find(f => keywords.some(kw => typeof f === 'string' && f.toLowerCase().includes(kw)));
      return feature || defaultVal;
    };

    return [
      { label: "Display", value: findSpec(["display", "screen", "inch", "oled", "lcd"], "Standard Display") },
      { label: "Processor", value: findSpec(["processor", "chip", "snapdragon", "intel", "amd", "bionic", "core"], "Standard Processor") },
      { label: "RAM", value: findSpec(["ram", "memory", "gb"], "Standard RAM") },
      { label: "Storage", value: findSpec(["storage", "rom", "ssd", "tb"], "Standard Storage") },
      { label: "Battery", value: findSpec(["battery", "mah", "charging"], "Standard Battery") }
    ];
  };

  const extractProsCons = (p) => {
    if (!p) return { pros: [], cons: [] };
    const pros = Array.isArray(p.features) ? p.features.slice(0, 3) : ["Good value", "Reliable performance"];
    const cons = [];
    if ((p.smartScore || 75) < 80) cons.push("Average user sentiment reported");
    if (p.price > 80000) cons.push("Premium price tag");
    if (cons.length === 0) cons.push("No major reported drawbacks");
    return { pros, cons };
  };

  const scoreA = getDynamicScore(pA, activePriority);
  const scoreB = getDynamicScore(pB, activePriority);
  const winner = scoreA > scoreB ? pA : pB;
  const isDraw = scoreA === scoreB;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white pt-6 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              Product Comparison <span className="text-indigo-500 dark:text-blue-400">({pA && pB ? '2' : '1'} product{pA && pB ? 's' : ''})</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Detailed head-to-head analysis with PRAS scoring.
            </p>
          </div>
          <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        {/* Product Selectors */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Product 1</label>
            <div className="relative">
              <select
                value={productAId}
                onChange={(e) => handleProductAChange(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allProducts.map(p => (
                  <option key={`a-${p._id}`} value={p._id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center -mx-3 z-10 hidden md:flex">
             <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/30 border-4 border-slate-50 dark:border-[#0A101D]">
               VS
             </div>
          </div>

          <div className="flex-1 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Product 2</label>
            <div className="relative">
              <select
                value={productBId}
                onChange={(e) => handleProductBChange(e.target.value)}
                disabled={!pA || categoryProducts.length === 0}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                <option value="">{pA ? "-- Select Product to Compare --" : "-- Select Product 1 First --"}</option>
                {categoryProducts.map(p => (
                  <option key={`b-${p._id}`} value={p._id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {pA && !pB && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-yellow-500" /> Smart Suggestions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestions.map(p => (
                <div key={p._id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 hover:border-indigo-500 transition-colors flex flex-col">
                  <img src={p.image || p.images?.[0]?.url} alt={p.name} className="h-24 object-contain mb-3 bg-white dark:bg-[#0A101D] rounded-lg p-2" />
                  <h4 className="font-bold text-sm line-clamp-1 mb-1">{p.name}</h4>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-bold text-indigo-500 text-sm">₹{p.price?.toLocaleString()}</span>
                    <button onClick={() => handleProductBChange(p._id)} className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1.5 px-3 rounded-lg">
                      Compare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full Comparison Dashboard */}
        {pA && pB && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* AI Top Pick Banner */}
            <div className="bg-gradient-to-r from-indigo-600/10 to-blue-600/10 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
               <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                 <Sparkles className="w-8 h-8 text-white" />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-black text-indigo-500 tracking-widest uppercase bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">AI Top Pick</span>
                 </div>
                 <h2 className="text-xl md:text-2xl font-black mb-1 text-slate-900 dark:text-white">
                   {isDraw ? "It's a Tie!" : winner?.name || "Winner"}
                 </h2>
                 <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                   {isDraw 
                    ? "Both products offer incredibly similar value and PRAS scores for this category. The choice comes down to personal preference." 
                    : `The ${winner?.brand || 'winner'} wins for ${activePriority} due to its superior PRAS score (${winner?.smartScore || 0}) and better aligned feature set. Highly recommended.`}
                 </p>
               </div>
            </div>

            {/* Priority Toggles */}
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4 px-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Optimize comparison for:</h4>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {priorities.map(p => {
                  const Icon = p.icon;
                  const isActive = activePriority === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePriority(p.id)}
                      className={`flex flex-col items-center justify-center min-w-[90px] h-20 rounded-xl border transition-all duration-200 ${
                        isActive 
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm shadow-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                        : "bg-transparent border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1C2333] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-1.5 ${isActive ? "text-indigo-500" : ""}`} />
                      <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-wider">{p.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Cards Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[pA, pB].map((p, index) => {
                 if (!p) return null;
                 const isWinner = winner?._id === p?._id && !isDraw;
                 const prosCons = extractProsCons(p);
                 const specs = extractSpecs(p);
                 const features = getFeatureScores(p);
                 const score = index === 0 ? scoreA : scoreB;

                 return (
                   <div key={p._id} className={`bg-white dark:bg-[#111A2E] border rounded-3xl p-6 md:p-8 relative transition-colors ${isWinner ? 'border-indigo-500 shadow-xl shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
                     
                     {/* Winner Badge */}
                     {isWinner && (
                       <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-xl rounded-tr-3xl uppercase tracking-widest flex items-center gap-1 shadow-md shadow-indigo-500/30">
                         <Award className="w-3 h-3" /> Winner
                       </div>
                     )}

                     {/* Top Section: Image & Title */}
                     <div className="flex items-start gap-6 mb-8">
                       <div className="w-32 h-32 bg-slate-50 dark:bg-[#0A101D] rounded-2xl p-4 flex items-center justify-center border border-slate-100 dark:border-slate-800 flex-shrink-0">
                         <img src={p.image || p.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={p.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                       </div>
                       <div>
                         <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">{p.brand || "Generic"}</p>
                         <h3 className="text-xl font-black leading-tight mb-2 line-clamp-2">{p.name}</h3>
                         <div className="flex items-center gap-4">
                           <span className="text-2xl font-black text-slate-900 dark:text-white">₹{p.price?.toLocaleString()}</span>
                           <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {(p.ratings || p.rating || 0).toFixed(1)}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* CTA & PRAS Badge */}
                     <div className="flex items-center justify-between gap-4 mb-8">
                        <Link to={`/product/${p._id}`} className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold transition-transform active:scale-95 text-sm ${isWinner ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'}`}>
                          View Details <ExternalLink className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl">
                          <Sparkles className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-[10px] font-black uppercase text-green-600/70 dark:text-green-400/70 tracking-widest leading-none mb-0.5">PRAS Score</p>
                            <p className="text-lg font-black text-green-600 dark:text-green-400 leading-none">{score}</p>
                          </div>
                        </div>
                     </div>

                     {/* Feature Progress Bars */}
                     <div className="space-y-4 mb-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Feature Scores</h4>
                        {features.map(f => (
                          <div key={f.name}>
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                              <span className="text-slate-500">{f.name}</span>
                              <span className="text-slate-900 dark:text-white">{f.score} / 100</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-[#0A101D] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/50">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${f.score}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${isWinner ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-400 dark:bg-slate-600'}`}
                              />
                            </div>
                          </div>
                        ))}
                     </div>

                     {/* Specs List */}
                     <div className="mb-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Key Specifications</h4>
                        <ul className="space-y-3">
                          {specs.map(spec => (
                            <li key={spec.label} className="flex justify-between items-start gap-4 text-sm">
                              <span className="text-slate-500 font-medium whitespace-nowrap">{spec.label}</span>
                              <span className="text-right font-bold text-slate-900 dark:text-white line-clamp-2">{spec.value}</span>
                            </li>
                          ))}
                        </ul>
                     </div>

                     {/* Pros & Cons */}
                     <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Pros & Cons</h4>
                        <div className="space-y-3">
                          {prosCons.pros.map((pro, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="font-medium leading-tight">{pro}</span>
                            </div>
                          ))}
                          {prosCons.cons.map((con, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="font-medium leading-tight">{con}</span>
                            </div>
                          ))}
                        </div>
                     </div>

                   </div>
                 );
               })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}