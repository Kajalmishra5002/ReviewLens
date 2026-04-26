import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, Grid, Star, Award, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardProductCard from "../components/DashboardProductCard";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductListing({ type = "all" }) {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(250000);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    // Reset filters on type change
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setMaxPrice(250000);
    setMinRating(0);

    setLoading(true);
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
        console.error(`Failed to load products for ${type}`, err);
        setLoading(false);
      });
  }, [type]);

  const categories = ["All", ...new Set(allProducts.map(p => p.category).filter(Boolean))];
  const brands = ["All", ...new Set(allProducts.map(p => p.brand).filter(Boolean))];

  // Base sorted catalog based on `type`
  const baseCatalog = useMemo(() => {
    let sorted = [...allProducts];
    if (type === "best") {
      sorted = sorted.filter(p => (p.ratings || p.rating || 0) >= 4.0 && (p.smartScore || p.sentimentScore || 75) >= 80);
      sorted.sort((a,b) => (b.smartScore || b.sentimentScore || 75) - (a.smartScore || a.sentimentScore || 75));
    }
    return sorted;
  }, [allProducts, type]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return baseCatalog.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchBrand = selectedBrand === "All" || p.brand === selectedBrand;
      const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      const matchRating = (p.ratings || p.rating || 0) >= minRating;
      return matchCat && matchBrand && matchSearch && matchPrice && matchRating;
    });
  }, [baseCatalog, selectedCategory, selectedBrand, searchTerm, maxPrice, minRating]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setMaxPrice(250000);
    setMinRating(0);
  };

  const isFiltering = selectedCategory !== "All" || selectedBrand !== "All" || searchTerm !== "" || maxPrice !== 250000 || minRating !== 0;

  // Page Header Details
  let HeaderIcon = Grid;
  let headerTitle = "All Products";
  let headerColor = "from-indigo-600 to-purple-600";
  let headerSub = "Browse our complete catalog of AI-analyzed electronics.";
  
  if (type === "best") {
    HeaderIcon = Award;
    headerTitle = "Best Rated Products";
    headerSub = "Highest quality electronics filtered by AI sentiment and user ratings.";
    headerColor = "from-orange-500 to-pink-600";
  }

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white pt-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* HEADER SECTION */}
        <section className={`relative bg-gradient-to-r ${headerColor} rounded-3xl p-10 text-white shadow-xl overflow-hidden mb-10`}>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner border border-white/30">
              <HeaderIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{headerTitle}</h1>
          </div>
          <p className="text-white/90 font-medium max-w-xl">{headerSub}</p>
        </section>

        {/* MAIN LAYOUT: Sidebar + Grid */}
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
                  placeholder="Search..." 
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
            
            {filteredCatalog.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm"
              >
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Products Found</h3>
                <p className="text-slate-500 max-w-sm mb-6">We couldn't find any {type} products matching your current filters.</p>
                <button 
                  onClick={resetFilters}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md shadow-indigo-500/20"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Grid className="w-5 h-5 text-indigo-500" /> Showing {filteredCatalog.length} Results
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredCatalog.map((p, index) => {
                       let badge = null;
                       if (type === "best" && index < 3) badge = "best";

                       return (
                        <motion.div 
                          key={p._id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="relative"
                        >
                          <DashboardProductCard p={p} badgeType={badge} />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
}
