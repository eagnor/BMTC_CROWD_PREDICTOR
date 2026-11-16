import React from 'react';
import { Clock, ArrowRight, ShieldCheck, Bus, MapPin } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

export default function RouteCard({ route, onSelect, onPredict }) {
  if (!route) return null;

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between border border-slate-800 transition duration-200">
      <div>
        {/* Header with Route badge and frequency */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide text-white shadow-md"
              style={{ backgroundColor: route.color || '#2563eb' }}
            >
              {route.route_no}
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm md:text-base leading-tight">
                {route.origin} <ArrowRight className="inline w-3.5 h-3.5 text-slate-400 mx-1" /> {route.destination}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{route.bus_type}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2.5 py-1 rounded-md">
            <Clock className="w-3 h-3" />
            Every {route.peak_frequency_mins}m
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
          {route.description}
        </p>

        {/* Corridor Stops Preview */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Key Stops ({route.stops_sequence?.length || 0})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {route.stops_sequence?.map((stop, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-0.5 rounded-md border ${
                  stop === 'Manyata Tech Park'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-600/50 font-medium'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700/60'
                }`}
              >
                {stop}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onPredict && onPredict(route)}
          className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          Check Crowd
        </button>
        <button
          onClick={() => onSelect && onSelect(route)}
          className="text-xs font-semibold text-sky-300 hover:text-white bg-sky-600/20 hover:bg-sky-600/40 px-3 py-1.5 rounded-lg border border-sky-500/30 transition flex items-center gap-1"
        >
          Plan Route <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
