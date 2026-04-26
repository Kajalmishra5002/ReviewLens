import { useState, useEffect } from "react";
import useSettingsStore from "../store/useSettingsStore";
import useStore from "../store/useStore";
import { translations } from "../utils/translations";
import toast from "react-hot-toast";
import { Sun, Moon, Globe, Bell, User as UserIcon, Save, Palette } from "lucide-react";
import api from "../api/axios";

export default function Settings() {
  const { theme, setTheme, language, setLanguage, currency, setCurrency, dateFormat, setDateFormat, accentColor, setAccentColor, notifications, toggleNotification } = useSettingsStore();
  const { activeUser, setActiveUser } = useStore();

  const [editForm, setEditForm] = useState({ name: "", email: "", gender: "Male", mobileNumber: "" });

  useEffect(() => {
    if (activeUser) {
      setEditForm({ 
        name: activeUser.name || "", 
        email: activeUser.email || "",
        gender: activeUser.gender || "Male",
        mobileNumber: activeUser.mobileNumber || ""
      });
    }
  }, [activeUser]);

  const t = translations[language] || translations["en"];

  const handleSaveProfile = async () => {
    if (!activeUser) return toast.error("Not logged in");
    if (editForm.mobileNumber && !/^\d{10}$/.test(editForm.mobileNumber)) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }
    
    try {
      const res = await api.put("/auth/profile/update", editForm);
      setActiveUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const getAccentText = () => {
    switch(accentColor) {
      case 'orange': return 'text-orange-500';
      case 'green': return 'text-green-500';
      case 'blue': return 'text-blue-500';
      case 'purple': default: return 'text-purple-500';
    }
  };

  const getAccentBg = () => {
    switch(accentColor) {
      case 'orange': return 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 border-orange-500';
      case 'green': return 'bg-green-500 hover:bg-green-600 shadow-green-500/20 border-green-500';
      case 'blue': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 border-blue-500';
      case 'purple': default: return 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20 border-purple-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto dark:text-white text-slate-900 pb-16 pt-6 px-4">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-2 text-slate-900 dark:text-white tracking-tight">
        {t.settingsTitle || "Settings"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* APPEARANCE */}
        <div className="p-8 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-[#111A2E] bg-white shadow-sm h-fit relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full pointer-events-none ${getAccentBg().split(' ')[0]}`}></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b dark:border-slate-800 border-slate-100 pb-4 relative z-10">
            {theme === "dark" ? <Moon className={getAccentText()} /> : <Sun className={getAccentText()} />}
            {t.appearance || "Appearance"}
          </h2>
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1.5 mb-8 relative z-10 border dark:border-slate-800">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-2.5 flex justify-center items-center gap-2 rounded-lg font-bold transition-all ${
                theme === "light" 
                ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Sun size={18} /> {t.themeLight || "Light Mode"}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-2.5 flex justify-center items-center gap-2 rounded-lg font-bold transition-all ${
                theme === "dark" 
                ? "bg-slate-800 text-white shadow-sm border border-slate-700" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Moon size={18} /> {t.themeDark || "Dark Mode"}
            </button>
          </div>

          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
            <Palette size={16}/> Accent Color
          </h3>
          <div className="flex gap-4 relative z-10">
            {['orange', 'purple', 'green', 'blue'].map(color => (
              <button 
                key={color}
                onClick={() => setAccentColor(color)}
                className={`w-12 h-12 rounded-2xl transition-all ${accentColor === color ? 'scale-110 ring-4 ring-offset-4 dark:ring-offset-[#111A2E] ring-slate-200 dark:ring-slate-700' : 'hover:scale-110'}`}
                style={{ backgroundColor: color === 'orange' ? '#f97316' : color === 'purple' ? '#a855f7' : color === 'green' ? '#22c55e' : '#3b82f6' }}
              />
            ))}
          </div>
        </div>

        {/* REGIONAL & LANGUAGE */}
        <div className="p-8 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-[#111A2E] bg-white shadow-sm h-fit relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full pointer-events-none ${getAccentBg().split(' ')[0]}`}></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b dark:border-slate-800 border-slate-100 pb-4 relative z-10">
            <Globe className={getAccentText()} />
            Regional & Language
          </h2>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border outline-none dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 dark:text-white text-slate-900 transition-colors font-semibold cursor-pointer"
              >
                <option value="en">English (US)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="es">Spanish (Español)</option>
                <option value="ar">Arabic (العربية)</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="zh">Chinese (中文)</option>
                <option value="pt">Portuguese (Português)</option>
                <option value="ru">Russian (Русский)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border outline-none dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 dark:text-white text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                  <option value="JPY">¥ JPY</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border outline-none dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 dark:text-white text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="p-8 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-[#111A2E] bg-white shadow-sm h-fit relative overflow-hidden md:col-span-2">
          <div className={`absolute top-0 right-0 w-48 h-48 blur-3xl opacity-10 rounded-full pointer-events-none ${getAccentBg().split(' ')[0]}`}></div>
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2 border-b dark:border-slate-800 border-slate-100 pb-4 relative z-10">
            <Bell className={getAccentText()} />
            {t.notifications || "Notifications"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { id: 'email', label: 'Email Updates' },
              { id: 'order', label: 'Order Progress' },
              { id: 'marketing', label: 'Marketing Offers' },
              { id: 'security', label: 'Security Alerts' },
              { id: 'push', label: 'Push Notifications' }
            ].map((notif) => (
              <div key={notif.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-slate-800 border-slate-100">
                <span className="font-bold text-sm">{notif.label}</span>
                <button
                  onClick={() => toggleNotification(notif.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${notifications[notif.id] ? getAccentBg().split(' ')[0] : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notifications[notif.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACCOUNT / MY PROFILE - 3 COLUMN LAYOUT */}
        <div className="p-8 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-[#111A2E] bg-white shadow-sm md:col-span-2 h-fit relative overflow-hidden">
          <div className={`absolute -bottom-20 -left-20 w-64 h-64 blur-3xl opacity-10 rounded-full pointer-events-none ${getAccentBg().split(' ')[0]}`}></div>
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2 border-b dark:border-slate-800 border-slate-100 pb-4 relative z-10">
            <UserIcon className={getAccentText()} />
            My Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div>
              <label className="block text-xs dark:text-slate-400 text-slate-500 mb-3 font-black tracking-widest uppercase">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border outline-none dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 focus:border-slate-400 transition-colors font-medium text-sm shadow-inner"
                disabled={!activeUser}
              />
            </div>

            <div>
              <label className="block text-xs dark:text-slate-400 text-slate-500 mb-3 font-black tracking-widest uppercase">Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border outline-none dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 focus:border-slate-400 transition-colors font-medium text-sm shadow-inner"
                disabled={!activeUser}
              />
            </div>

            <div>
              <label className="block text-xs dark:text-slate-400 text-slate-500 mb-3 font-black tracking-widest uppercase">Mobile Number</label>
              <input
                type="text"
                value={editForm.mobileNumber}
                onChange={(e) => setEditForm({...editForm, mobileNumber: e.target.value})}
                placeholder="10-digit mobile number"
                className="w-full px-5 py-4 rounded-2xl border outline-none dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 focus:border-slate-400 transition-colors font-medium text-sm shadow-inner"
                disabled={!activeUser}
              />
            </div>
          </div>

          <div className="mt-8 relative z-10">
            <label className="block text-xs dark:text-slate-400 text-slate-500 mb-4 font-black tracking-widest uppercase">Gender</label>
            <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-slate-800 border-slate-100 w-fit">
              {['Male', 'Female', 'Other'].map(gender => (
                <label key={gender} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${editForm.gender === gender ? getAccentBg().split(' ').pop() : 'border-slate-300 dark:border-slate-600'}`}>
                    {editForm.gender === gender && <div className={`w-3 h-3 rounded-full ${getAccentBg().split(' ')[0]}`} />}
                  </div>
                  <input 
                    type="radio" 
                    name="gender" 
                    value={gender} 
                    checked={editForm.gender === gender}
                    onChange={(e) => setEditForm({...editForm, gender: e.target.value})} 
                    className="hidden"
                    disabled={!activeUser}
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{gender}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleSaveProfile}
            disabled={!activeUser}
            className={`mt-10 relative z-10 flex items-center gap-3 justify-center px-8 py-4 disabled:bg-slate-300 disabled:dark:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 text-white rounded-2xl font-black transition-all shadow-xl text-sm uppercase tracking-widest w-full md:w-auto ${activeUser ? getAccentBg() : ''}`}
          >
            <Save size={20} /> Update Profile
          </button>
        </div>

      </div>
    </div>
  );
}
