import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const WishlistGrid = ({ items, onViewAll }) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Wishlist <span className="text-slate-400 ml-1 font-medium">{items.length} items</span></h3>
        <button onClick={onViewAll} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {items.slice(0, 4).map((item) => (
          <motion.div 
            key={item._id} 
            whileHover={{ scale: 1.05 }}
            className="bg-slate-50 dark:bg-[#0A101D] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all"
          >
            <div className="w-full h-24 mb-3 flex items-center justify-center">
              <img 
                src={item.image || item.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                alt={item.name} 
                className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
              />
            </div>
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white line-clamp-1 mb-1">{item.name}</h4>
            <p className="text-xs font-black text-indigo-500">₹{item.price?.toLocaleString()}</p>
          </motion.div>
        ))}
        
        {items.length === 0 && (
          <div className="col-span-2 py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            Your wishlist is empty
          </div>
        )}
        
        {items.length > 4 && (
          <button onClick={onViewAll} className="col-span-2 mt-2 text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest text-center">
            + {items.length - 4} more items
          </button>
        )}
      </div>
    </motion.section>
  );
};

export default WishlistGrid;
