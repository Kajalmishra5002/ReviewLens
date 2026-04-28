import React from 'react';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, CreditCard, LogOut } from 'lucide-react';

const ProfileSidebar = ({ user, activeTab, setActiveTab, ordersCount, totalSpent, wishlistCount, avgRating, onLogout }) => {
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package, badge: ordersCount },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase()}{user?.name?.split(' ')[1]?.[0]?.toUpperCase() || ''}
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-[#111A2E] rounded-full"></div>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">{user?.name}</h2>
        <p className="text-sm text-slate-500 font-medium lowercase">@{user?.name?.replace(' ', '.').toLowerCase()}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === item.id 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
            {item.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === item.id ? 'bg-white text-indigo-500' : 'bg-indigo-500 text-white'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-4"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>

      <div className="grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-[#0A101D] p-4 rounded-2xl text-center">
          <p className="text-xl font-black text-slate-900 dark:text-white">{ordersCount}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Orders</p>
        </div>
        <div className="bg-slate-50 dark:bg-[#0A101D] p-4 rounded-2xl text-center">
          <p className="text-xl font-black text-slate-900 dark:text-white">₹{totalSpent}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Spent</p>
        </div>
        <div className="bg-slate-50 dark:bg-[#0A101D] p-4 rounded-2xl text-center">
          <p className="text-xl font-black text-slate-900 dark:text-white">{wishlistCount}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Wishlist</p>
        </div>
        <div className="bg-slate-50 dark:bg-[#0A101D] p-4 rounded-2xl text-center">
          <p className="text-xl font-black text-slate-900 dark:text-white">{avgRating}★</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Avg Rating</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSidebar;
