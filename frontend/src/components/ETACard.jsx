import React from 'react';
import { Clock, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

export default function ETACard({ etaData }) {
  if (!etaData) return null;

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
              {etaData.route}
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {etaData.origin_stop} → {etaData.destination_stop}
            </span>
          </div>
          <p className="text-xs text-slate-400">{etaData.route_name}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Next Bus In</span>
            <span className="text-2xl font-black text-sky-400">
              {etaData.next_bus_eta_mins} <span className="text-sm font-normal text-slate-300">mins</span>
            </span>
          </div>
          <div className="h-10 w-[1px] bg-slate-800 hidden md:block" />
          <CrowdBadge level={etaData.predicted_crowd_level} size="md" />
        </div>
      </div>

      {/* Travel Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Est. Journey Time</span>
          <span className="text-base font-bold text-slate-100">{etaData.journey_duration_mins} mins</span>
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Destination Arrival</span>
          <span className="text-base font-bold text-emerald-400">{etaData.estimated_arrival_time}</span>
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 block mb-0.5">Tracking Mode</span>
          <span className="text-xs font-medium text-amber-400 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3 h-3" /> Scheduled Timetable
          </span>
        </div>
      </div>

      {/* Upcoming departures schedule list */}
      {etaData.upcoming_departures && etaData.upcoming_departures.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            Upcoming Scheduled Buses from {etaData.origin_stop}
          </h4>
          <div className="space-y-1.5">
            {etaData.upcoming_departures.map((dep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 border border-slate-800/80 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-200">{dep.departure_time}</span>
                  <span className="text-slate-400">in {dep.eta_mins_to_origin} mins</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 hidden sm:inline">Arr. {dep.estimated_destination_arrival}</span>
                  <CrowdBadge level={dep.predicted_crowd} size="sm" showIcon={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Honest data disclaimer */}
      <p className="text-[11px] text-slate-500 mt-4 leading-normal italic">
        * {etaData.schedule_disclaimer}
      </p>
    </div>
  );
}
