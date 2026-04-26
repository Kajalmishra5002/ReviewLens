import { Link } from "react-router-dom";
import { Mail, ExternalLink, Zap } from "lucide-react";

const GithubIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.12-.34 6.4-1.54 6.4-6.98 0-1.54-.54-2.84-1.44-3.84.15-.36.64-1.82-.14-3.78 0 0-1.18-.38-3.88 1.44a13.38 13.38 0 0 0-7 0C6.27 2.22 5.09 2.6 5.09 2.6c-.78 1.96-.29 3.42-.14 3.78-.9.1-1.44 1.3-1.44 3.84 0 5.4 3.26 6.6 6.38 6.94a4.8 4.8 0 0 0-1 3.02v4" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="mt-16 bg-white dark:bg-[#0A101D] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Branding */}
          <div className="flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">ReviewLens</span>
            </Link>
            <p className="text-sm font-medium leading-relaxed max-w-xs">
              AI-powered product research and sentiment analysis platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-2">Quick Links</h4>
            <Link to="/" className="text-sm hover:text-indigo-500 transition-colors">Home</Link>
            <Link to="/search" className="text-sm hover:text-indigo-500 transition-colors">Search</Link>
            <Link to="/compare" className="text-sm hover:text-indigo-500 transition-colors">Compare</Link>
            <Link to="#" className="text-sm hover:text-indigo-500 transition-colors">About</Link>
          </div>

          {/* Categories */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-2">Categories</h4>
            <Link to="/search?q=smartphones" className="text-sm hover:text-indigo-500 transition-colors">Smartphones</Link>
            <Link to="/search?q=laptops" className="text-sm hover:text-indigo-500 transition-colors">Laptops</Link>
            <Link to="/search?q=gaming" className="text-sm hover:text-indigo-500 transition-colors">Gaming</Link>
            <Link to="/search?q=accessories" className="text-sm hover:text-indigo-500 transition-colors">Accessories</Link>
          </div>

          {/* Contact / Info */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-2">Contact</h4>
            <a href="mailto:hello@reviewlens.demo" className="text-sm flex items-center gap-2 hover:text-indigo-500 transition-colors">
              <Mail className="w-4 h-4" /> hello@reviewlens.demo
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm flex items-center gap-2 hover:text-indigo-500 transition-colors">
              <GithubIcon className="w-4 h-4" /> View on GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© 2026 ReviewLens. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-indigo-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
