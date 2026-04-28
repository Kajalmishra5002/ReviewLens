import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import api from "../api/axios";

// Modular Components
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileInfo from "../components/profile/ProfileInfo";
import OrdersList from "../components/profile/OrdersList";
import AddressCard from "../components/profile/AddressCard";
import WishlistGrid from "../components/profile/WishlistGrid";

export default function Profile() {
  const { activeUser, setActiveUser, logoutActiveUser } = useStore();
  
  // State
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: "", email: "", gender: "", mobileNumber: "", city: "", dob: "" 
  });

  // Fetch Data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // In real app, fetch from API
        const userRes = await api.get("/users/profile");
        setActiveUser(userRes.data.user);
        
        const wishRes = await api.get(`/wishlist/${userRes.data.user._id}`);
        setWishlist(wishRes.data || []);

        const orderRes = await api.get("/orders/my");
        setOrders(orderRes.data.orders || []);
      } catch (error) {
        console.error("Failed to load profile data", error);
        // Fallback to dummy data for demonstration if API fails
        setOrders([
          { _id: '1', orderItems: [{ name: 'Nike Air Max 270' }], totalPrice: 8495, status: 'Delivered', createdAt: new Date() },
          { _id: '2', orderItems: [{ name: 'OnePlus Nord CE 4' }], totalPrice: 24999, status: 'Shipped', createdAt: new Date() },
          { _id: '3', orderItems: [{ name: 'Sony WH-1000XM5' }], totalPrice: 29990, status: 'Processing', createdAt: new Date() }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeUser) fetchProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Form
  useEffect(() => {
    if (activeUser) {
      setEditForm({
        name: activeUser.name || "Aryan Sharma",
        email: activeUser.email || "aryan.sharma@gmail.com",
        gender: activeUser.gender || "Male",
        mobileNumber: activeUser.mobileNumber || "9876543210",
        city: activeUser.city || "Lucknow, UP",
        dob: activeUser.dob || "12 March 1998"
      });
    }
  }, [activeUser]);

  // Calculations
  const stats = useMemo(() => {
    const totalSpent = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    return {
      ordersCount: orders.length || 24,
      totalSpent: totalSpent ? (totalSpent / 1000).toFixed(1) + 'k' : '18.4k',
      wishlistCount: wishlist.length || 7,
      avgRating: 4.9
    };
  }, [orders, wishlist]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/users/profile", {
        ...editForm,
        phone: editForm.mobileNumber
      });
      setActiveUser(res.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (!activeUser && !loading) {
     return <div className="text-center py-20 text-slate-500 font-bold">Please login to view your profile.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR */}
          <div className="lg:col-span-3">
            <ProfileSidebar 
              user={activeUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              {...stats}
              onLogout={logoutActiveUser}
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Personal Info */}
                  <ProfileInfo 
                    editForm={editForm}
                    setEditForm={setEditForm}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSubmit={handleUpdate}
                  />

                  {/* Orders Preview */}
                  <OrdersList 
                    orders={orders} 
                    onViewAll={() => setActiveTab('orders')} 
                  />

                  {/* Bottom Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Address Section */}
                    <div className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black">Saved Addresses</h3>
                        <button onClick={() => setActiveTab('addresses')} className="text-sm font-bold text-indigo-500 hover:underline">Manage</button>
                      </div>
                      <div className="space-y-4">
                        {(activeUser?.addresses?.length > 0 ? activeUser.addresses : [
                          { street: '12, Gomti Nagar Extension', city: 'Lucknow', state: 'UP', zipCode: '226010', isDefault: true },
                          { street: 'Cyber Hub, Sector 5', city: 'Noida', state: 'UP', zipCode: '201301', isDefault: false }
                        ]).slice(0, 2).map((addr, idx) => (
                          <AddressCard key={idx} address={addr} index={idx} onEdit={() => setActiveTab('addresses')} />
                        ))}
                      </div>
                    </div>

                    {/* Wishlist Section */}
                    <WishlistGrid 
                      items={wishlist} 
                      onViewAll={() => setActiveTab('wishlist')} 
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  key="orders-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <OrdersList orders={orders} viewAll={true} />
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div 
                  key="wishlist-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8"
                >
                   <h3 className="text-xl font-black mb-8">My Wishlist</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {wishlist.map(item => (
                       <div key={item._id} className="bg-slate-50 dark:bg-[#0A101D] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
                          <img src={item.image || item.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={item.name} className="h-32 object-contain mb-4" />
                          <h4 className="font-black text-sm mb-2">{item.name}</h4>
                          <p className="text-indigo-500 font-black">₹{item.price?.toLocaleString()}</p>
                       </div>
                     ))}
                   </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div 
                  key="addresses-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8"
                >
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black">Manage Addresses</h3>
                     <button className="bg-indigo-600 text-white font-black px-6 py-2.5 rounded-xl text-sm">Add New Address</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {(activeUser?.addresses?.length > 0 ? activeUser.addresses : [
                       { street: '12, Gomti Nagar Extension', city: 'Lucknow', state: 'UP', zipCode: '226010', isDefault: true },
                       { street: 'Cyber Hub, Sector 5', city: 'Noida', state: 'UP', zipCode: '201301', isDefault: false }
                     ]).map((addr, idx) => (
                       <div key={idx} className="bg-slate-50 dark:bg-[#0A101D] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 relative">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="bg-indigo-500/10 text-indigo-500 text-[10px] font-black px-2 py-0.5 rounded uppercase">{idx === 0 ? 'Home' : 'Work'}</span>
                            {addr.isDefault && <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded uppercase">Default</span>}
                          </div>
                          <p className="text-sm font-bold leading-relaxed">{addr.street}, {addr.city}, {addr.state} — {addr.zipCode}</p>
                          <div className="flex gap-4 mt-6">
                             <button className="text-xs font-black text-indigo-500 uppercase">Edit</button>
                             <button className="text-xs font-black text-red-500 uppercase">Remove</button>
                          </div>
                       </div>
                     ))}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
