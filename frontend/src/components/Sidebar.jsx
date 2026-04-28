import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Scale, TrendingUp, User, Settings, Sparkles, MessageSquare } from "lucide-react";


export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Compare", path: "/compare", icon: Scale },
    { name: "Reviews", path: "/reviews", icon: MessageSquare },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen flex-shrink-0 bg-gradient-to-b from-indigo-500 to-purple-600 text-white flex flex-col transition-all duration-300 shadow-xl z-20">
      {/* Branding */}
      <div className="p-6">
        <Link to="/" className="flex flex-col">
          <span className="text-2xl font-black tracking-tight leading-none text-white">ReviewLens</span>
          <span className="text-xs font-semibold text-indigo-100 tracking-wider mt-1 opacity-90">Sentiment Analysis</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-white/20 text-white shadow-inner" 
                  : "text-indigo-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pro Tip Card */}
      <div className="p-4 mb-4">
        <div 
          className="bg-white/10 border border-white/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-bold text-white">Pro Tip</span>
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Compare products to find the best deals!
          </p>
        </div>
      </div>
    </aside>
  );
}
