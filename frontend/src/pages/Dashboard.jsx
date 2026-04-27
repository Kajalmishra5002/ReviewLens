import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Award, Grid, Search, Filter, SlidersHorizontal, ArrowRight, Heart, ShoppingCart, CheckCircle2, Zap, Star } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(250000);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    api.get("/products")
      .then(res => {
        const prods = res.data.products || res.data || [];
        const enrichedProds = prods.map(p => {
           const reviews = p.numOfReviews || p.reviews?.length || 0;
           const sentiment = p.smartScore || p.sentimentScore || 75;
           return {
             ...p
           };
        });
        setAllProducts(enrichedProds);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products for Dashboard", err);
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...new Set(allProducts.map(p => p.category).filter(Boolean))];
  const brands = ["All", ...new Set(allProducts.map(p => p.brand).filter(Boolean))];


  const bestProducts = useMemo(() => {
    return allProducts
      .filter(p => (p.ratings || p.rating || 0) >= 4.0 && (p.smartScore || p.sentimentScore || 75) >= 80)
      .sort((a,b) => (b.smartScore || b.sentimentScore || 75) - (a.smartScore || a.sentimentScore || 75))
      .slice(0, 3); // Limit to top 3 initially
  }, [allProducts]);

  // Filtered Catalog Logic (Only shows when filters are active)
  const isFiltering = selectedCategory !== "All" || selectedBrand !== "All" || searchTerm !== "" || maxPrice !== 250000 || minRating !== 0;

  const filteredCatalog = useMemo(() => {
    if (!isFiltering) return []; // Hide catalog by default
    return allProducts.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchBrand = selectedBrand === "All" || p.brand === selectedBrand;
      const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      const matchRating = (p.ratings || p.rating || 0) >= minRating;
      return matchCat && matchBrand && matchSearch && matchPrice && matchRating;
    });
  }, [allProducts, selectedCategory, selectedBrand, searchTerm, maxPrice, minRating, isFiltering]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setMaxPrice(250000);
    setMinRating(0);
  };

  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-16">
      
      {/* 1. HERO BANNER */}
      <section className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-3xl p-10 md:p-16 text-white shadow-2xl overflow-hidden mt-4">
        {/* Abstract Background Shapes */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-start max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-6 shadow-inner border border-white/30"
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" /> New Electronics Arrived
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight drop-shadow-md">
            Discover the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Smart Shopping</span>
          </h1>
          
          <p className="text-lg text-white/90 font-medium mb-10 leading-relaxed max-w-xl">
            Leverage AI sentiment analysis to filter out the noise. Find the highest-rated electronics, backed by transparent user reviews and dynamic scoring.
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-10">
            <div className="flex flex-col">
              <span className="text-3xl font-black drop-shadow-md">500+</span>
              <span className="text-xs uppercase tracking-widest font-bold opacity-80">Products</span>
            </div>
            <div className="w-px h-10 bg-white/30"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black drop-shadow-md">50K+</span>
              <span className="text-xs uppercase tracking-widest font-bold opacity-80">Reviews</span>
            </div>
            <div className="w-px h-10 bg-white/30"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black drop-shadow-md">98%</span>
              <span className="text-xs uppercase tracking-widest font-bold opacity-80">Accuracy</span>
            </div>
          </div>

          <button 
            onClick={() => {
               document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
               if (!isFiltering) setSelectedCategory("Electronics"); // Trigger filter open
            }}
            className="bg-white text-purple-600 hover:bg-slate-50 font-black px-8 py-4 rounded-xl shadow-xl shadow-black/20 flex items-center gap-3 transition-transform hover:-translate-y-1 active:translate-y-0"
          >
            Start Exploring <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>


      {/* 3. BEST RATED PRODUCTS */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20">
              <Award className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Best Rated Products</h2>
          </div>
          <Link to="/best-products" className="hidden sm:flex text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 items-center gap-1 group transition-colors">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestProducts.map((p, index) => (
            <motion.div 
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
               <ProductCard p={p} badgeType="best" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. CATALOG WITH FILTERS */}
      <section id="catalog-section" className="pt-10 border-t border-slate-200 dark:border-slate-800/50">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* FILTER SIDEBAR */}
          <div className="w-full lg:w-1/4 space-y-8">
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-lg flex items-center gap-2 dark:text-white text-slate-900">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-500" /> Filters
                </h3>
                {isFiltering && (
                  <button onClick={resetFilters} className="text-xs font-bold text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    Reset
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6 relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search catalog..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-sm font-medium dark:text-white p-3 pl-11 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Categories Dropdown */}
              <div className="mb-6">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Category</h4>
                <div className="relative">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Brands Dropdown */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Brand</h4>
                <div className="relative">
                  <select 
                    value={selectedBrand} 
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    {brands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Max Price */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Max Price</h4>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="250000" 
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Min Rating */}
              <div className="mb-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Min Rating</h4>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map(r => (
                    <button 
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`flex-1 py-2 flex justify-center items-center gap-1 rounded-lg text-xs font-bold transition-all ${
                        minRating === r 
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {r === 0 ? "All" : <>{r}+ <Star className="w-3 h-3 fill-current" /></>}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* CATALOG GRID */}
          <div className="w-full lg:w-3/4">
            
            {!isFiltering ? (
              <div className="bg-slate-50 dark:bg-[#111A2E]/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                <Filter className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Explore the Full Catalog</h3>
                <p className="text-slate-500 max-w-sm mb-6">Use the filters on the left to discover specific products based on your needs.</p>
                <button 
                  onClick={() => setSelectedCategory(categories[1] || "All")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Show All Products
                </button>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Products Found</h3>
                <p className="text-slate-500 max-w-sm mb-6">We couldn't find any products matching your current filters.</p>
                <button 
                  onClick={resetFilters}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Grid className="w-5 h-5 text-indigo-500" /> Filtered Results ({filteredCatalog.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCatalog.map((p, index) => (
                    <motion.div 
                      key={p._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard p={p} badgeType="trending" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}