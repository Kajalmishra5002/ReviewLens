import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import api from "../api/axios";
import { User, Package, Edit2, BadgeCheck, LogOut, Heart, Star, ChevronRight, Settings, Wallet, Bell } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { activeUser, setActiveUser, logoutActiveUser } = useStore();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", gender: "", mobileNumber: "", city: "" });

  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch fresh user data to get all fields including gender, mobile, city, addresses
        const res = await api.get("/users/profile");
        setActiveUser(res.data.user);
        
        // Fetch wishlist
        const wishRes = await api.get(`/wishlist/${res.data.user._id}`);
        setWishlist(wishRes.data || []);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      }
    };
    
    if (activeUser) {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (activeUser) {
      setEditForm({ 
        name: activeUser.name || "", 
        email: activeUser.email || "",
        gender: activeUser.gender || "Male",
        mobileNumber: activeUser.mobileNumber || "",
        city: activeUser.city || ""
      });
    }
  }, [activeUser]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    if (activeUser) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [activeUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editForm.mobileNumber && !/^\d{10}$/.test(editForm.mobileNumber)) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }
    
    try {
      const res = await api.put("/users/profile", editForm);
      setActiveUser(res.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleLogout = () => {
    logoutActiveUser();
    window.location.href = "/login";
  };

  if (!activeUser) {
    return <div className="text-center py-20 text-slate-400 font-medium">Please login to view profile.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Account</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage your profile, orders, and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar Menu (Flipkart Style) */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* User Brief */}
          <div className="bg-white dark:bg-[#111A2E] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              {activeUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Hello,</p>
              <h2 className="text-slate-900 dark:text-white font-bold truncate">{activeUser.name}</h2>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white dark:bg-[#111A2E] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
            
            {/* Orders */}
            <button 
              onClick={() => setActiveTab("orders")}
              className={`flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#0A101D] transition-colors w-full text-left ${activeTab === 'orders' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <div className="flex items-center gap-4">
                <Package className={`w-5 h-5 ${activeTab === 'orders' ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-500'}`} />
                <span className="font-bold text-sm tracking-wide">MY ORDERS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Account Settings */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4 mb-4 text-slate-500">
                <Settings className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-sm tracking-wide uppercase">Account Settings</span>
              </div>
              <div className="flex flex-col space-y-1 ml-9">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Profile Information
                </button>
                <button 
                  onClick={() => setActiveTab("addresses")}
                  className={`text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Manage Addresses
                </button>
              </div>
            </div>

            {/* Payments */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4 mb-4 text-slate-500">
                <Wallet className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-sm tracking-wide uppercase">Payments</span>
              </div>
              <div className="flex flex-col space-y-1 ml-9">
                <button className="flex items-center justify-between text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white w-full">
                  <span>Gift Cards</span>
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">₹113</span>
                </button>
                <button className="text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white w-full">
                  Saved UPI
                </button>
                <button className="text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white w-full">
                  Saved Cards
                </button>
              </div>
            </div>

            {/* My Stuff */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4 mb-4 text-slate-500">
                <User className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-sm tracking-wide uppercase">My Stuff</span>
              </div>
              <div className="flex flex-col space-y-1 ml-9">
                <button 
                  className={`flex items-center gap-2 text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}
                >
                  <Star className="w-4 h-4" /> My Reviews & Ratings
                </button>
                <button 
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex items-center gap-2 text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${activeTab === 'wishlist' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Heart className="w-4 h-4" /> All Wishlist
                </button>
                <button 
                  className={`flex items-center gap-2 text-left text-sm font-semibold py-2 px-3 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}
                >
                  <Bell className="w-4 h-4" /> All Notifications
                </button>
              </div>
            </div>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-5 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full text-left font-bold text-sm tracking-wide"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              LOGOUT
            </button>

          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Personal Information</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">12</span>
                    <span className="text-[10px] font-bold text-indigo-800/60 dark:text-indigo-300 uppercase tracking-widest mt-1">Reviews Given</span>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-2xl font-black text-pink-600 dark:text-pink-400">{wishlist.length}</span>
                    <span className="text-[10px] font-bold text-pink-800/60 dark:text-pink-300 uppercase tracking-widest mt-1">Saved Items</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹113</span>
                    <span className="text-[10px] font-bold text-emerald-800/60 dark:text-emerald-300 uppercase tracking-widest mt-1">Gift Balance</span>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First & Last Name</label>
                        <input 
                          type="text" 
                          required
                          value={editForm.name} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})} 
                          className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
                        <input 
                          type="text" 
                          value={editForm.mobileNumber} 
                          onChange={e => setEditForm({...editForm, mobileNumber: e.target.value})} 
                          placeholder="10-digit mobile number"
                          className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                        <input 
                          type="text" 
                          value={editForm.city} 
                          onChange={e => setEditForm({...editForm, city: e.target.value})} 
                          placeholder="Your City"
                          className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Gender</label>
                      <div className="flex items-center gap-6">
                        {['Male', 'Female', 'Other'].map(gender => (
                          <label key={gender} className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${editForm.gender === gender ? 'border-indigo-600 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                              {editForm.gender === gender && <div className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />}
                            </div>
                            <input 
                              type="radio" 
                              name="gender" 
                              value={gender} 
                              checked={editForm.gender === gender}
                              onChange={e => setEditForm({...editForm, gender: e.target.value})} 
                              className="hidden" 
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{gender}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={editForm.email} 
                        onChange={e => setEditForm({...editForm, email: e.target.value})} 
                        className="w-full bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                        SAVE
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{activeUser.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number</p>
                        {activeUser.mobileNumber ? (
                          <p className="text-base font-semibold text-slate-900 dark:text-white">+91 {activeUser.mobileNumber}</p>
                        ) : (
                          <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            + Add Mobile Number
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{activeUser.gender || "Not Specified"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{activeUser.city || "Not Specified"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{activeUser.email}</p>
                        {activeUser.isVerified !== false && (
                          <BadgeCheck className="w-5 h-5 text-emerald-500" title="Verified Email" />
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role</p>
                      <span className="inline-flex items-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-1 rounded-full uppercase tracking-widest font-black">
                        {activeUser.role}
                      </span>
                    </div>

                  </div>
                )}
              </div>
              
              {/* FAQs Footer Area mimicking Flipkart style */}
              <div className="bg-slate-50 dark:bg-[#0A101D] p-6 md:p-8 border-t border-slate-200 dark:border-slate-800">
                 <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">FAQs</h3>
                 <div className="space-y-4">
                   <div>
                     <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">What happens when I update my email address (or mobile number)?</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400">Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">When will my account be updated with the new email address (or mobile number)?</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400">It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
                   </div>
                 </div>
                 <div className="mt-6 flex items-center gap-6">
                   <button onClick={() => toast.error("Deactivation requires email confirmation")} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Deactivate Account</button>
                   <button onClick={() => toast.error("Account deletion is disabled in demo mode")} className="text-sm font-bold text-red-600 dark:text-red-400 hover:underline">Delete Account</button>
                 </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Order History</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-lg text-slate-900 dark:text-white font-bold mb-1">No orders found</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Looks like you haven't made your first order yet.</p>
                  <button onClick={() => window.location.href = '/'} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-[#0A101D] p-5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold text-sm mb-1">Order ID: #{order._id.substring(0, 10).toUpperCase()}</p>
                        <p className="text-xs text-slate-500 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                        <p className={`text-sm font-bold capitalize ${
                          order.status === 'Processing' ? 'text-amber-500' : 
                          order.status === 'Delivered' ? 'text-emerald-500' : 'text-blue-500'
                        }`}>
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              order.status === 'Processing' ? 'bg-amber-500' : 
                              order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}></span>
                            {order.status || 'Pending'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-slate-900 dark:text-white font-black text-lg">₹{(order.totalPrice || 0).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">My Wishlist</h2>
              
              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-lg text-slate-900 dark:text-white font-bold mb-1">Wishlist is empty</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Save items you love and buy them later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map(item => (
                    <div key={item._id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A101D] rounded-2xl overflow-hidden shadow-sm flex flex-col transition-transform hover:-translate-y-1">
                      <div className="h-48 p-4 bg-slate-50 dark:bg-[#1C2333] flex items-center justify-center">
                        <img src={item.image || (item.images && item.images[0]?.url) || 'https://via.placeholder.com/150'} alt={item.name} className="h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-2">{item.name || item.title}</h3>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-auto">₹{item.price?.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Saved Addresses</h2>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                  + Add New Address
                </button>
              </div>
              
              {!activeUser?.addresses || activeUser.addresses.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-[#0A101D] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-lg text-slate-900 dark:text-white font-bold mb-1">No addresses saved</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add an address so you can checkout faster.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeUser.addresses.map((address, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl relative bg-slate-50 dark:bg-[#0A101D]">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs px-2 py-1 rounded-full font-bold">
                          Default
                        </span>
                      )}
                      <p className="font-bold text-slate-900 dark:text-white mb-2">{activeUser.name} <span className="text-slate-500 font-normal ml-2">{activeUser.mobileNumber}</span></p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{address.street}, {address.city}, {address.state} {address.zipCode}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Edit</button>
                        <button className="text-sm font-bold text-red-600 dark:text-red-400">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
