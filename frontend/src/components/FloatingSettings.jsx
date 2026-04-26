import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function FloatingSettings() {
  return (
    <Link
      to="/settings"
      className="fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-2xl transition-all duration-300 bg-slate-800 hover:bg-slate-700 text-white hover:scale-110 border border-slate-600 group"
      title="Settings"
    >
      <Settings size={28} className="transition-transform group-hover:rotate-45" />
    </Link>
  );
}
