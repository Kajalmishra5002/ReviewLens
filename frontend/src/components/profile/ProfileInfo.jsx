import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Map } from 'lucide-react';

const ProfileInfo = ({ editForm, setEditForm, isEditing, setIsEditing, onSubmit }) => {
  const fields = [
    { label: 'Full Name', key: 'name', icon: User, placeholder: 'Kajal Mishra' },
    { label: 'Email', key: 'email', icon: Mail, placeholder: 'kajal.mishra@gmail.com' },
    { label: 'Phone', key: 'mobileNumber', icon: Phone, placeholder: '+91  9415953210' },
    { label: 'Date of Birth', key: 'dob', icon: Calendar, placeholder: '12 March 2005' },
    { label: 'Gender', key: 'gender', icon: User, placeholder: 'Female' },
    { label: 'City', key: 'city', icon: Map, placeholder: 'Lucknow, UP' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111A2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Personal Information</h3>
        <span className="text-xs text-slate-400 font-medium italic">Last updated 3 days ago</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
              <div className="relative">
                <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={editForm[field.key]}
                  onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white ${!isEditing ? 'opacity-80 cursor-not-allowed' : 'bg-white dark:bg-slate-900'}`}
                  placeholder={field.placeholder}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          {isEditing ? (
            <>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black px-8 py-3 rounded-xl transition-all">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(true)} className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-black px-8 py-3 rounded-xl transition-all hover:bg-indigo-500/20">
                Edit Profile
              </button>
              <button type="button" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black px-8 py-3 rounded-xl transition-all">
                Change Password
              </button>
            </>
          )}
        </div>
      </form>
    </motion.section>
  );
};

export default ProfileInfo;
