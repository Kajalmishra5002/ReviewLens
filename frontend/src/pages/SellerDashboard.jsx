import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, PlusCircle, Package, ShoppingBag, DollarSign, 
  Trash2, Edit, TrendingUp
} from "lucide-react";
import api from "../api/axios";
import useStore from "../store/useStore";
import toast from "react-hot-toast";
import AddProduct from "./AddProduct";
import { useLocation } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";

export default function SellerDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "overview");
  const { activeUser } = useStore();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalEarnings = orders.reduce((acc, order) => acc + (order.sellerRevenue || 0), 0);

  useEffect(() => {
    if (activeUser && (activeUser.role === "Seller" || activeUser.role === "Admin")) {
      fetchDashboardData();
    }
  }, [activeUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        api.get(`/products/seller/${activeUser._id}`),
        api.get(`/orders/seller/${activeUser._id}`)
      ]);
      setProducts(prodRes.data.products);
      setOrders(ordRes.data.orders);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/admin/delete/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  // Monthly Earnings Data preparation
  const getMonthlyEarnings = () => {
    const data = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      if (!data[month]) data[month] = 0;
      data[month] += (order.sellerRevenue || 0);
    });
    
    // Convert to array
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(m => ({
      name: m,
      revenue: data[m] || 0
    })).filter(m => data[m] !== undefined || m === new Date().toLocaleString('default', { month: 'short' }));
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center p-10"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex bg-white dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-[#111A2E] border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Seller Panel
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage your store</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: "add_product", label: "Add Product", icon: <PlusCircle className="w-5 h-5" /> },
            { id: "my_products", label: "My Products", icon: <Package className="w-5 h-5" /> },
            { id: "orders", label: "Orders", icon: <ShoppingBag className="w-5 h-5" /> },
            { id: "earnings", label: "Earnings", icon: <DollarSign className="w-5 h-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0A101D]">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold">Total Products</h3>
                  <Package className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalProducts}</p>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-emerald-600 dark:text-emerald-400 font-semibold">Total Orders</h3>
                  <ShoppingBag className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalOrders}</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-amber-600 dark:text-amber-400 font-semibold">Total Earnings</h3>
                  <DollarSign className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{totalEarnings.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Orders</h2>
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Buyer</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-300">#{order._id.slice(-6)}</td>
                      <td className="p-4 text-slate-900 dark:text-white">{order.user?.name || 'Guest'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">₹{order.sellerRevenue?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">No orders yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD PRODUCT TAB */}
        {activeTab === "add_product" && (
          <div className="h-full overflow-y-auto pb-10">
            {/* Reuse the AddProduct component seamlessly */}
            <AddProduct />
          </div>
        )}

        {/* MY PRODUCTS TAB */}
        {activeTab === "my_products" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col group">
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 p-4 relative">
                    <img src={product.images?.[0]?.url || "https://via.placeholder.com/300"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    <div className="absolute top-2 right-2 bg-white dark:bg-slate-900 rounded-full shadow p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(product._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1">{product.name}</h3>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{product.price?.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-500">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't added any products yet.</p>
                  <button onClick={() => setActiveTab('add_product')} className="mt-4 text-indigo-600 font-semibold hover:underline">Add your first product</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Customer Orders</h1>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Order #{order._id}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {order.orderItems.map(item => (
                      <div key={item._id} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                         <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                         <div className="flex-1">
                           <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                           <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <p className="text-slate-500">Buyer: <span className="font-medium text-slate-900 dark:text-white">{order.user?.name}</span></p>
                    <p className="font-bold text-slate-900 dark:text-white">Your Revenue: <span className="text-emerald-600 dark:text-emerald-400">₹{order.sellerRevenue?.toLocaleString('en-IN')}</span></p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="p-12 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders received yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "earnings" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Earnings Report</h1>
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Lifetime Earnings</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">₹{totalEarnings.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getMonthlyEarnings()}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
