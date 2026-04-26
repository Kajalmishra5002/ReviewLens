import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useSettingsStore from "./store/useSettingsStore";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductListing from "./pages/ProductListing";
import Compare from "./pages/Compare";
import Checkout from "./pages/Checkout";
import SearchResults from "./pages/SearchResults";

import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";
import AddProduct from "./pages/AddProduct";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FloatingCompareBar from "./components/FloatingCompareBar";

export default function App() {
  const { theme } = useSettingsStore();

  // Handle global theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Handle global language attribute
  const { language } = useSettingsStore();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden dark:bg-[#0A101D] bg-slate-50 transition-colors duration-300">
      <Toaster position="top-center" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/best-products" element={<ProductListing type="best" />} />
          <Route path="/search" element={<SearchResults />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </main>
      </div>

      {/* 🤖 Global AI Assistant */}
      <Chatbot />
      
      {/* ⚖️ Global Compare Bar */}
      <FloatingCompareBar />
    </div>
  );
}