import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, Image as ImageIcon, Sparkles, Tag, DollarSign, 
  X, CheckCircle, UploadCloud, AlertCircle, Percent, Box
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "Mobile", name: "Mobile & Smartphones", icon: "📱" },
  { id: "Laptop", name: "Laptops & Computers", icon: "💻" },
  { id: "Tablet", name: "Tablets & E-Readers", icon: "📟" },
  { id: "TV", name: "TV & Displays", icon: "📺" },
  { id: "Audio", name: "Audio & Headphones", icon: "🎧" },
  { id: "Camera", name: "Cameras & Photography", icon: "📸" },
  { id: "Gaming", name: "Gaming", icon: "🎮" },
  { id: "Accessories", name: "Accessories & Cables", icon: "🔌" },
  { id: "Smartwatch", name: "Smartwatches & Wearables", icon: "⌚" },
  { id: "Networking", name: "Networking & Routers", icon: "🌐" },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    sku: "",
    category: "",
    condition: "Brand New",
    warranty: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    lowStockAlert: "5",
    weight: "",
    description: "",
    features: "",
  });

  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  // Tag Management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Image Upload (Base64 for simplicity in MVP)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 6) {
      toast.error("You can only upload up to 6 images");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // AI Description Generation
  const handleAIGenerate = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Please enter a Product Name and select a Category first.");
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post("/products/generate-description", {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        category: formData.category,
        features: formData.features
      });
      
      setFormData(prev => ({
        ...prev,
        description: res.data.description
      }));
      toast.success("Description generated successfully!");
    } catch {
      toast.error("Failed to generate description via AI");
    } finally {
      setGenerating(false);
    }
  };

  const calculateDiscount = () => {
    if (!formData.price || !formData.compareAtPrice) return null;
    const price = Number(formData.price);
    const mrp = Number(formData.compareAtPrice);
    if (mrp > price) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || images.length === 0) {
      return toast.error("Please fill required fields (Name, Price, Category, and at least 1 Image)");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags,
        images: images, 
        features: formData.features.split('\n').filter(f => f.trim()),
      };

      const res = await api.post("/products/add", payload);
      toast.success(res.data.message || "Product added successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Add New Product</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Fill in the details below to list your electronics product on the marketplace.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center disabled:opacity-70"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : null}
            Publish Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Package className="w-5 h-5 text-indigo-500" />
              Product Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Name *</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="e.g. Samsung Galaxy S24 Ultra 256GB"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Brand</label>
                  <input
                    type="text" name="brand" value={formData.brand} onChange={handleChange}
                    placeholder="e.g. Samsung"
                    className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Model</label>
                  <input
                    type="text" name="model" value={formData.model} onChange={handleChange}
                    placeholder="e.g. SM-S928B"
                    className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">SKU / Barcode</label>
                  <input
                    type="text" name="sku" value={formData.sku} onChange={handleChange}
                    placeholder="Auto-generate"
                    className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Description</label>
                  <button 
                    type="button" 
                    onClick={handleAIGenerate}
                    disabled={generating}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generating ? 'Generating...' : '✦ AI Generate'}
                  </button>
                </div>
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  placeholder="Describe the product's features, specs, and condition..."
                  rows="5"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Key Features (One per line)</label>
                <textarea
                  name="features" value={formData.features} onChange={handleChange}
                  placeholder="e.g. Active Noise Cancellation&#10;40-hour Battery Life&#10;Water Resistant"
                  rows="3"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Condition</label>
                  <select
                    name="condition" value={formData.condition} onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none"
                  >
                    <option>Brand New</option>
                    <option>Open Box</option>
                    <option>Refurbished (Excellent)</option>
                    <option>Used (Good)</option>
                  </select>
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Warranty</label>
                  <input
                    type="text" name="warranty" value={formData.warranty} onChange={handleChange}
                    placeholder="e.g. 1 Year Manufacturer"
                    className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                 </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Pricing & Stock
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Selling Price (₹) *</label>
                <input
                  type="number" name="price" value={formData.price} onChange={handleChange} required min="0"
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Compare at (₹)</label>
                <input
                  type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} min="0"
                  placeholder="MRP"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Discount</label>
                <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 py-2.5 px-4 font-mono flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  {calculateDiscount() ? `${calculateDiscount()}% OFF` : '--'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stock Qty *</label>
                <input
                  type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0"
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Low Stock Alert</label>
                <input
                  type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleChange} min="0"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Weight (kg)</label>
                <input
                  type="number" name="weight" value={formData.weight} onChange={handleChange} min="0" step="0.01"
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <ImageIcon className="w-5 h-5 text-sky-500" />
              Product Images
            </h2>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer group">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-indigo-500 transition-colors" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">Drop images here or <span className="text-indigo-600 dark:text-indigo-400">browse</span></p>
              <p className="text-slate-500 text-xs mt-1">PNG, JPG, WEBP • Max 6 images, 5MB each</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">MAIN</span>
                    )}
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-white/90 dark:bg-black/70 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Publish Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">Publish Settings</h3>
             
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                 <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-md dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Active</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-slate-600 dark:text-slate-400">Visibility</span>
                 <span className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Public</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-slate-600 dark:text-slate-400">Listing Type</span>
                 <span className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-md dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Standard</span>
               </div>
             </div>

             <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md hover:shadow-indigo-500/25 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Publish Product"
                  )}
                </button>
                <button className="w-full bg-white dark:bg-[#0A101D] text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Preview Listing
                </button>
             </div>
          </div>

          {/* Categories Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
               Electronics Category *
             </h3>
             <div className="grid grid-cols-2 gap-2">
               {CATEGORIES.map(cat => (
                 <button
                   key={cat.id}
                   type="button"
                   onClick={() => handleCategorySelect(cat.id)}
                   className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                     formData.category === cat.id 
                     ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                     : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0A101D] text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                   }`}
                 >
                   <span className="text-xl mb-1">{cat.icon}</span>
                   <span className="text-[10px] font-medium leading-tight">{cat.name}</span>
                 </button>
               ))}
             </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Product Tags</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Press enter or comma to add tags (Max 10)</p>
             
             <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
             </div>
             
             <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                disabled={tags.length >= 10}
                placeholder={tags.length >= 10 ? "Maximum tags reached" : "e.g. wireless, android, 5G..."}
                className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all disabled:opacity-50"
             />
          </div>

          {/* Live Mini Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
             <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Listing Summary</h3>
             <ul className="space-y-3 text-sm">
               <li className="flex justify-between">
                 <span className="text-slate-500">Name</span>
                 <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{formData.name || '--'}</span>
               </li>
               <li className="flex justify-between">
                 <span className="text-slate-500">Category</span>
                 <span className="font-medium text-slate-900 dark:text-white">{CATEGORIES.find(c => c.id === formData.category)?.name || '--'}</span>
               </li>
               <li className="flex justify-between">
                 <span className="text-slate-500">Price</span>
                 <span className="font-medium text-slate-900 dark:text-white">{formData.price ? `₹${Number(formData.price).toLocaleString('en-IN')}` : '--'}</span>
               </li>
               <li className="flex justify-between">
                 <span className="text-slate-500">Stock</span>
                 <span className="font-medium text-slate-900 dark:text-white">{formData.stock || '--'}</span>
               </li>
               <li className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                 <span className="text-slate-500">Images</span>
                 <span className="font-medium text-slate-900 dark:text-white">{images.length}/6</span>
               </li>
             </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
