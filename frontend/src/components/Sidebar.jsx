import React from 'react';
import {
  Home,
  Navigation2,
  Users,
  Clock3,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Bus
} from 'lucide-react';

export default function Sidebar({ activePage, onSelectPage, isOpen, onClose }) {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      desc: 'Manyata Commuter Overview'
    },
    {
      id: 'plan-journey',
      label: 'Plan My Journey',
      icon: Navigation2,
      desc: 'Find Best Buses & Options'
    },
    {
      id: 'crowd-prediction',
      label: 'Crowd Prediction',
      icon: Users,
      desc: 'AI Bus Crowd Check'
    },
    {
      id: 'bus-arrivals',
      label: 'Bus Arrivals',
      icon: Clock3,
      desc: 'Schedules & Arrival ETAs'
    },
    {
      id: 'route-map',
      label: 'Route Map',
      icon: MapPin,
      desc: 'Interactive Corridor Map'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-50 lg:z-20 h-screen lg:h-[calc(100vh-61px)] w-64 bg-navy-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Student Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition duration-150 text-left group ${
                  isActive
                    ? 'bg-blue-600/15 border border-blue-500/40 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm block">{item.label}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {item.desc}
                    </span>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-sky-400" />}
              </button>
            );
          })}
        </div>

        {/* Simplified Student Footer */}
        <div className="p-4 border-t border-slate-800 bg-navy-950/40">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Manyata Student Corridor</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Connecting Hebbal, Yelahanka, Nagawara, and Thanisandra with smart crowd insights.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
