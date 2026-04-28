import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Star, ShoppingCart, Menu, LayoutDashboard, GitCompare, MessageSquare } from "lucide-react";
import useStore from "../store/useStore";
import api from "../api/axios";
import ThemeToggle from "./ThemeToggle";
import { AnimatePresence } from "framer-motion";

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  
  const { activeUser, logoutActiveUser, cartItems } = useStore();
  const unreadCount = useStore((state) => state.unreadCount) || 0;
  const notifications = useStore((state) => state.notifications) || [];
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (searchResults.length > 0) setSearchResults([]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (activeUser) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications/my');
          useStore.getState().setNotifications(res.data.notifications);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      };
      fetchNotifications();
    }
  }, [activeUser]);

  return (
    <header className="h-20 bg-white dark:bg-[#0A101D] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
      
      {/* Left Area (Menu + Search) */}
      <div className="flex-1 flex items-center gap-4 max-w-2xl relative">
        
        {/* Hamburger Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-left"
              >
                <div className="p-2 space-y-1">
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/add-product" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle text-orange-500"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                    Add Product
                  </Link>
                  <Link 
                    to="/compare" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <GitCompare className="w-4 h-4 text-emerald-500" />
                    Compare
                  </Link>
                  <Link 
                    to="/reviews" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-sky-500" />
                    Reviews
                  </Link>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex-shrink-0">
          ReviewLens
        </Link>

        {/* Search Bar */}
        <div className="relative w-full group" ref={searchRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim().length > 0) {
                setIsSearchOpen(false);
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search products, reviews, or categories..."
            className="w-full bg-slate-100 dark:bg-[#111A2E] border border-transparent dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:bg-white dark:focus:bg-[#1C2333] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
        
        <AnimatePresence>
          {isSearchOpen && searchResults.length > 0 && (
            <div 
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
            >
              {searchResults.slice(0, 5).map(item => (
                <Link 
                  key={item._id} 
                  to={`/product/${item._id}`}
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                  className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/50 p-4 hover:bg-slate-50 dark:hover:bg-[#1C2333] transition-colors"
                >
                  <div className="bg-slate-50 dark:bg-[#0A101D] p-2 rounded-lg">
                    <img src={item.image || item.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={item.name} className="w-12 h-12 object-contain" />
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
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        <ThemeToggle />
        
        <Link to="/cart" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
          <ShoppingCart className="w-5 h-5" />
          {cartItems?.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-indigo-500 text-white text-[10px] font-black border-2 border-white dark:border-[#0A101D] rounded-full flex items-center justify-center">
              {cartItems.reduce((acc, item) => acc + (item.qty || 1), 0)}
            </span>
          )}
        </Link>
        
        {/* Map Tracking Icon */}
        <Link to="/tracking" title="Delivery Tracking" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>
        </Link>
        
        {/* Add Product Icon (Sellers Only) */}
        {activeUser && (activeUser.role === "Seller" || activeUser.role === "Admin") && (
          <button 
            title="Add Product"
            onClick={() => navigate("/seller-dashboard", { state: { tab: "add_product" } })}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        )}

        {/* Notifications Dropdown */}
        {activeUser && (
          <div className="relative group ml-2">
            <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#0A101D] rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Dropdown Panel */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right group-hover:scale-100 scale-95">
              <div className="p-4 bg-slate-50 dark:bg-[#0A101D]/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-slate-900 dark:text-white font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={async () => {
                        if (!notif.isRead) {
                          try {
                            await api.put(`/notifications/${notif._id}/read`);
                            useStore.getState().markNotificationAsRead(notif._id);
                          } catch (err) { console.error(err); }
                        }
                      }}
                      className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors ${notif.isRead ? 'bg-white dark:bg-[#111A2E]' : 'bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                    >
                      <p className={`text-sm ${notif.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}>{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeUser ? (
          <div className="relative group ml-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold border-2 border-indigo-200 dark:border-indigo-800 shadow-sm transition-transform hover:scale-105">
              {activeUser.name?.charAt(0).toUpperCase() || "U"}
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right group-hover:scale-100 scale-95">
              <div className="p-4 bg-slate-50 dark:bg-[#0A101D]/50 border-b border-slate-100 dark:border-slate-800">
                <p className="text-slate-900 dark:text-white font-semibold truncate">{activeUser.name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{activeUser.email}</p>
              </div>
              <div className="p-2 space-y-1">
                {(activeUser.role === "Seller" || activeUser.role === "Admin") && (
                  <button 
                    onClick={() => navigate("/seller-dashboard")} 
                    className="w-full text-left block px-3 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                  >
                    🏪 Seller Dashboard
                  </button>
                )}
                <Link to="/profile" className="block px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  My Profile
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
          <Link to="/login" className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
