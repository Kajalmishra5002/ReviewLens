import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, LayoutDashboard, Store, Star, Scale } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import useStore from "../store/useStore";
import api from "../api/axios";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { activeUser, logoutActiveUser, cart } = useStore();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const debounce = setTimeout(async () => {
      try {
        const res = await api.get(`/products?keyword=${searchQuery}`);
        setSearchResults(res.data.products || res.data || []);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white/70 dark:bg-[#0A101D]/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 shadow-sm" 
          : "bg-white dark:bg-[#0A101D] border-b border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side - Brand & Navigation */}
        <div className="flex items-center gap-8">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/30 transform group-hover:scale-105 transition-all">
              <div className="w-5 h-5 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-black dark:text-white text-slate-900 leading-none tracking-tight">ReviewLens</span>
              <span className="text-[10px] uppercase text-primary font-bold tracking-widest mt-1">Electronics</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 ml-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Store className="w-4 h-4" /> Store
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/compare" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Scale className="w-4 h-4" /> Compare
            </Link>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search for laptops, phones, headphones..."
                className="w-full bg-slate-100 dark:bg-[#111A2E] border border-transparent dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-full py-3 pl-12 pr-4 focus:outline-none focus:bg-white dark:focus:bg-[#1C2333] focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
              />
            </div>
            
            <AnimatePresence>
              {isSearchOpen && searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] shadow-2xl overflow-hidden z-50"
                >
                  {searchResults.slice(0, 5).map(item => (
                    <Link 
                      key={item._id} 
                      to={`/product/${item._id}`}
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                      className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/50 p-4 hover:bg-slate-50 dark:hover:bg-[#1C2333] transition-colors"
                    >
                      <div className="bg-slate-50 dark:bg-[#0A101D] p-2 rounded-lg">
                        <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/40'} alt={item.name} className="w-12 h-12 object-contain" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name || item.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-sm font-bold text-accent">₹{item.price?.toLocaleString("en-IN")}</span>
                           {item.rating && (
                             <span className="flex items-center text-xs text-slate-500"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1"/> {item.rating}</span>
                           )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Right Side - Actions & Auth */}
        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          
          <Link to="/cart" className="relative group p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ShoppingCart className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors" />
            {cart?.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-lg border-2 border-white dark:border-[#0A101D]"
              >
                {cart.length}
              </motion.span>
            )}
          </Link>

          {activeUser ? (
             <div className="relative group ml-2">
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-primary text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all border-2 border-transparent hover:border-primary-light">
                  {activeUser.name?.charAt(0).toUpperCase() || "U"}
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right group-hover:scale-100 scale-95">
                  <div className="p-4 bg-slate-50 dark:bg-[#0A101D]/50 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-slate-900 dark:text-white font-semibold truncate">{activeUser.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{activeUser.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {(activeUser.role === "Seller" || activeUser.role === "Admin" || true) && (
                      <button 
                        onClick={() => navigate("/add-product")} 
                        className="w-full text-left block px-3 py-2.5 text-sm text-primary font-medium hover:bg-primary/10 rounded-xl transition-colors"
                      >
                        + Add Product
                      </button>
                    )}
                    <Link to="/profile" className="block px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      My Profile
                    </Link>
                    <Link to="/settings" className="block px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      Settings
                    </Link>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                    <button 
                      onClick={() => { logoutActiveUser(); navigate('/'); }} 
                      className="w-full text-left px-3 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
             </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link to="/login" className="hidden sm:block text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-semibold text-sm transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </motion.nav>
  );
}