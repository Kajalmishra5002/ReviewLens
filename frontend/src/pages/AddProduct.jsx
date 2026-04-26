import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, Image as ImageIcon, Sparkles, Tag, DollarSign, Package } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    price: "",
    image: "",
    features: "",
    rating: "" // optional
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image || !formData.features) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);
    try {
      // Post to protected backend route
      const res = await api.post("/products/add", formData);
      toast.success(res.data.message || "Product added successfully!");
      // Optionally redirect or clear form
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-8 h-8 text-purple-500" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Seller Portal: Add Product</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Form Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <PlusCircle className="w-32 h-32 text-purple-500" />
           </div>

           <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
             
             {/* Name */}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Sony WH-1000XM5"
                    className="pl-10 w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>
             </div>

             {/* Category (Locked) */}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category <span className="text-red-500">*</span></label>
                <select 
                  name="category"
                  value={formData.category} // Locked to Electronics
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-300 dark:border-slate-700 py-3 px-4 opacity-70 cursor-not-allowed"
                >
                  <option value="Electronics">Electronics</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Sellers are restricted to the Electronics category currently.</p>
             </div>

             {/* Price */}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    min="1"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 29999"
                    className="pl-10 w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>
             </div>

             {/* Features */}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Features <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <Sparkles className="h-4 w-4 text-slate-400" />
                  </div>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    required
                    placeholder="Noise cancelling, 30hr battery, USB-C (comma separated)"
                    rows="3"
                    className="pl-10 w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                  ></textarea>
                </div>
             </div>

             {/* Image URL */}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    required
                    placeholder="https://example.com/image.png"
                    className="pl-10 w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>
             </div>

             {/* Optional Rating */}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Rating (Optional)</label>
                <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="e.g. 4.5"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  />
             </div>

             <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Publish Product"
                  )}
                </button>
             </div>
           </form>
        </div>

        {/* Live Preview Column */}
        <div className="mt-8 md:mt-0">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 px-2">Live Store Preview</h2>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-lg max-w-sm sticky top-24">
             {/* Preview Card exactly mirroring Home.jsx mapping */}
             <div className="relative mb-4 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 p-4 aspect-square flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
               {formData.image ? (
                 <img src={formData.image} alt="Preview" className="object-contain h-full w-full" />
               ) : (
                 <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center">
                   <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                   <span className="text-sm font-medium">Image Preview</span>
                 </div>
               )}
             </div>

             <div className="flex-1">
               <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">
                 {formData.name || "Product Title..."}
               </h2>
               <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{formData.features || "Feature abstract..."}</p>
             </div>

             <div className="mt-4 text-xl font-bold text-green-600 dark:text-green-400">
               ₹{formData.price ? Number(formData.price).toLocaleString("en-IN") : "0"}
             </div>
             <button className="w-full mt-4 bg-slate-200 dark:bg-slate-800 text-slate-400 py-2 rounded font-medium cursor-not-allowed">
               Add to Cart
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
