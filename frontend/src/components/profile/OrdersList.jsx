import React from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Clock } from 'lucide-react';

const OrdersList = ({ orders, viewAll = false, onViewAll }) => {
  const displayOrders = viewAll ? orders : orders.slice(0, 3);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Orders</h3>
        {!viewAll && orders.length > 3 && (
          <button onClick={onViewAll} className="text-sm font-bold text-indigo-500 hover:underline">View all →</button>
        )}
      </div>

      {!viewAll && (
        <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 mb-8 overflow-x-auto">
          {['All', 'Delivered', 'In Transit', 'Cancelled'].map((tab) => (
            <button key={tab} className={`pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${tab === 'All' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-500'}`}>
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {displayOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No orders found.</div>
        ) : (
          displayOrders.map((order) => (
            <div key={order._id} className="group bg-slate-50 dark:bg-[#0A101D] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between transition-all hover:border-indigo-500/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <Package className="w-8 h-8 text-indigo-500 opacity-80" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">{order.orderItems?.[0]?.name || "Electronics Item"}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Order #{order._id.substring(0, 8).toUpperCase()} · {order.orderItems?.length || 1} items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-sm text-slate-900 dark:text-white">₹{order.totalPrice?.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-bold mb-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                  order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  {order.status === 'Delivered' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                  {order.status || 'Processing'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default OrdersList;
