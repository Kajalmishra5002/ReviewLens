import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const AddressCard = ({ address, index, onEdit }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-slate-50 dark:bg-[#0A101D] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${index === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
          {index === 0 ? 'Home' : 'Office'}
        </span>
        {address.isDefault && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">Default</span>}
      </div>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
        {address.street}, {address.city}, {address.state} — {address.zipCode}
      </p>
      <button 
        onClick={() => onEdit(address)}
        className="mt-4 text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-widest"
      >
        Edit
      </button>
    </motion.div>
  );
};

export default AddressCard;
