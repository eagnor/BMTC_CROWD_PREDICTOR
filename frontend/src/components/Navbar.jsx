import React from 'react';
import { Bus, MapPin, Menu, X, Sparkles, Navigation } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen, activePage }) {
  return (
    <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden"
          aria-label="Toggle Navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[1px] shadow-lg shadow-blue-500/10">
            <div className="w-full h-full bg-navy-900 rounded-[11px] flex items-center justify-center">
              <Bus className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white">
                BMTC <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Crowd Predictor</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2.5 py-0.5 rounded-full">
                Student Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Manyata Tech Park Student Commute Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Right status badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">AI Predictions: Active</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/50 px-3 py-1.5 rounded-full text-xs text-blue-300 font-medium">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span>Manyata ORR Corridor</span>
        </div>
      </div>
    </header>
  );
}
