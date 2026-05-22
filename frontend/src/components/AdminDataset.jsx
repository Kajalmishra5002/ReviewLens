import React, { useState, useEffect } from "react";
import { Upload, Database, CheckCircle2, AlertCircle, Search } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function AdminDataset() {
  const [file, setFile] = useState(null);
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data.products || data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid CSV file");
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !productId) {
      toast.error("Please select a file and a product");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    setLoading(true);
    try {
      const { data } = await api.post("/admin/upload-dataset", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      if (data.success) {
        toast.success(data.message);
        setFile(null);
        setProductId("");
        setProgress(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload dataset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
          <Database className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Dataset Integrator</h1>
          <p className="text-slate-500 font-medium">Bulk import reviews for AI sentiment & fake detection</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <form onSubmit={handleUpload} className="space-y-8">
          
          {/* Step 1: Select Product */}
          <div>
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Step 1: Target Product</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white font-bold"
              >
                <option value="">Select product to link reviews...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Upload CSV */}
          <div>
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Step 2: Review Dataset (CSV)</label>
            <div 
              className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${
                file ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-[#0A101D] rounded-full flex items-center justify-center mx-auto">
                  <Upload className={`w-8 h-8 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                </div>
                {file ? (
                  <div>
                    <p className="text-emerald-600 font-bold">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500">Required columns: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500">review_text</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500">rating</code></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase text-indigo-500">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !file || !productId}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" /> Process & Import Dataset
              </>
            )}
          </button>
        </form>

        <div className="mt-12 p-6 bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Important Notes
          </h4>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3 font-medium">
            <li>• Ensure your CSV is UTF-8 encoded for proper character rendering.</li>
            <li>• The AI service will automatically analyze sentiment for each row.</li>
            <li>• Duplicate detection will flag reviews that already exist for this product.</li>
            <li>• Rating vs Sentiment mismatch will be automatically calculated to detect fake reviews.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
