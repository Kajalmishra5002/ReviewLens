import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { Filter, SlidersHorizontal, ChevronDown, Search, ArrowRight, Zap, Star, Shield, Cpu, Activity, Smartphone, Laptop, Headphones, Tv, Gamepad2, Tablet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroSearch, setHeroSearch] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sortBy, setSortBy] = useState("Featured");

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Backend not running");
        return res.json();
      })
      .then((data) => {
        const fetched = Array.isArray(data?.products) ? data.products : (Array.isArray(data) ? data : []);
        setProducts(fetched);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err.message);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  console.log("Products data in Home:", products);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const handleQuickSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  let filteredProducts = Array.isArray(products) ? [...products] : [];

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter((p) => 
      p?.name?.toLowerCase()?.includes(q) || 
      (p?.brand && p?.brand?.toLowerCase()?.includes(q))
    );
  }
  if (category !== "All") {
    filteredProducts = filteredProducts.filter((p) => p?.category === category);
  }
  if (brand !== "All") {
    filteredProducts = filteredProducts.filter((p) => p?.brand === brand);
  }
  if (minRating > 0) {
    filteredProducts = filteredProducts.filter((p) => (p?.ratings || p?.rating || 0) >= minRating);
  }
  filteredProducts = filteredProducts.filter((p) => (p?.price || 0) <= maxPrice);

  switch (sortBy) {
    case "Price Low-High":
      filteredProducts.sort((a, b) => (a?.price || 0) - (b?.price || 0));
      break;
    case "Price High-Low":
      filteredProducts.sort((a, b) => (b?.price || 0) - (a?.price || 0));
      break;
    case "Highest Rated":
      filteredProducts.sort((a, b) => (b?.ratings || b?.rating || 0) - (a?.ratings || a?.rating || 0));
      break;
    case "Name A-Z":
      filteredProducts.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
      break;
    case "Featured":
    default:
      break;
  }

  const categories = ["All", ...new Set(products.map((p) => p?.category).filter(Boolean))];
  const brands = ["All", ...new Set(products.map((p) => p?.brand).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-[#0A101D]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-[#0A101D] flex-col gap-4 text-center p-4">
        <h2 className="text-2xl font-bold text-red-500">Something went wrong</h2>
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-500 text-white rounded-xl">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto pb-16 pt-4 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* 🌟 PREMIUM HERO SECTION */}
      <section className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-900 via-[#111A2E] to-[#0A101D] border border-indigo-500/20">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center py-24 px-4 sm:px-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-8 shadow-inner shadow-white/5"
          >
            <Zap className="w-3.5 h-3.5" /> Powered by PRAS Algorithm
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight"
          >
            Research Smarter. <br/> Buy Better.
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-slate-300 max-w-2xl mb-10 font-medium leading-relaxed"
          >
            <span className="text-white font-bold">ReviewLens</span> analyzes product reviews using AI and our proprietary PRAS scoring to help you cut through the noise and make smarter buying decisions.
          </motion.p>
          
          {/* Hero Search Bar */}
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleHeroSearch}
            className="w-full max-w-2xl relative group"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-2 shadow-2xl">
              <Search className="w-6 h-6 text-slate-400 ml-4 flex-shrink-0" />
              <input 
                type="text" 
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search products, categories, or 'best phones under 40000'"
                className="w-full bg-transparent text-white placeholder-slate-400 px-4 py-3 focus:outline-none text-lg font-medium"
              />
              <button type="submit" className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-8 py-3.5 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95">
                Search
              </button>
            </div>
          </motion.form>

          {/* Quick Priorities */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            {["Overall Best", "Camera", "Battery Life", "Value for Money", "Performance", "Gaming"].map(tag => (
              <button 
                key={tag}
                onClick={() => handleQuickSearch(tag)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all backdrop-blur-sm"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🚀 FEATURE HIGHLIGHTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Shield, title: "PRAS Scoring", desc: "Our proprietary Product Review Analysis System guarantees honest, manipulation-free scores out of 5.", color: "from-blue-500 to-indigo-500" },
          { icon: Cpu, title: "Multi-Source Analysis", desc: "We aggregate and normalize data from across the web, merging internal insights with real-time global APIs.", color: "from-purple-500 to-pink-500" },
          { icon: Activity, title: "Unbiased Results", desc: "No sponsored rankings. The AI top pick is purely calculated based on verified user sentiment and hardware value.", color: "from-emerald-500 to-teal-500" }
        ].map((feature, i) => (
          <div key={i} className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
             <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 dark:opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
             <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 transform group-hover:-translate-y-1 transition-transform`}>
               <feature.icon className="w-7 h-7" />
             </div>
             <h3 className="text-xl font-black mb-3">{feature.title}</h3>
             <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* 📱 TRENDING CATEGORIES */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Trending Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Smartphone, label: "Smartphones", q: "phone" },
            { icon: Laptop, label: "Laptops", q: "laptop" },
            { icon: Headphones, label: "Earphones", q: "earphone" },
            { icon: Tv, label: "Televisions", q: "tv" },
            { icon: Gamepad2, label: "Gaming", q: "gaming" },
            { icon: Tablet, label: "Tablets", q: "tablet" }
          ].map((cat, i) => (
            <button 
              key={i}
              onClick={() => handleQuickSearch(cat.q)}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10 transition-all group"
            >
              <cat.icon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
              <span className="font-bold text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 🛒 MAIN SHOP SECTION */}
      <div id="shop-section" className="flex flex-col lg:flex-row gap-8 mt-4 pt-8 border-t border-slate-200 dark:border-slate-800">
        
        {/* 🛠️ Filter Sidebar */}
        <aside className="w-full lg:w-[280px] flex-shrink-0">
          <div className="sticky top-28 rounded-3xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="font-bold text-lg">Filters</h2>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Search Catalog</label>
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Find anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
              <div className="relative group">
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:border-indigo-500 transition-all text-sm font-bold cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Brand */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Brand</label>
              <div className="relative group">
                <select 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:border-indigo-500 transition-all text-sm font-bold cursor-pointer"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6 bg-slate-50 dark:bg-[#0A101D] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex justify-between">
                <span>Max Price</span>
                <span className="text-indigo-500 font-bold">₹{maxPrice.toLocaleString("en-IN")}</span>
              </label>
              <input 
                type="range" 
                min="1000" 
                max="500000" 
                step="1000"
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Min PRAS Rating</label>
              <div className="flex flex-wrap gap-2">
                {[0, 3, 4, 4.5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMinRating(val)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      minRating === val 
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                        : "bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {val > 0 && <Star className={`w-3.5 h-3.5 ${minRating === val ? "text-white fill-white" : "text-yellow-400 fill-yellow-400"}`} />}
                    {val === 0 ? "Any" : `${val}+`}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => { 
                setSearchQuery("");
                setCategory("All"); 
                setBrand("All"); 
                setMinRating(0); 
                setMaxPrice(500000); 
                setSortBy("Featured");
              }}
              className="w-full py-3 mt-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* 📦 Product Grid */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white dark:bg-[#111A2E] p-4 sm:px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black mb-1">Local Catalog</h2>
              <p className="text-xs font-bold text-slate-500">{filteredProducts.length} items found</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0A101D] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-indigo-500" />
                Sort by: 
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer appearance-none ml-1 pr-4"
                >
                  <option value="Featured" className="text-slate-900">Featured</option>
                  <option value="Price Low-High" className="text-slate-900">Price Low→High</option>
                  <option value="Price High-Low" className="text-slate-900">Price High→Low</option>
                  <option value="Highest Rated" className="text-slate-900">Highest Rated</option>
                  <option value="Name A-Z" className="text-slate-900">Name A–Z</option>
                </select>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-[#0A101D] rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black mb-2">No products found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">We couldn't find any items matching your current filter selection in the local catalog.</p>
              <button 
                onClick={() => { 
                  setSearchQuery("");
                  setCategory("All"); 
                  setBrand("All"); 
                  setMinRating(0); 
                  setMaxPrice(500000); 
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-500/20"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProducts.slice(0, 6).map((p) => (
                    <ProductCard key={p._id} p={p} />
                  ))}
                </AnimatePresence>
              </div>
              
              {/* View All Button */}
              {filteredProducts.length > 6 && (
                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={() => navigate('/search')}
                    className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-[#111A2E] border-2 border-indigo-500/20 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-black rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 group"
                  >
                    View All Products <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
        
      </div>
      
      {/* 🦶 FOOTER */}
      <Footer />
    </div>
  );
}