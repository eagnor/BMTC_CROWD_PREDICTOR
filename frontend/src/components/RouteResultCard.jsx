import React, { useState } from 'react';
import { Bus, Clock, ArrowRight, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import CrowdIndicator from './CrowdIndicator';

export default function RouteResultCard({
  route,
  etaData,
  pickup,
  destination,
}) {
  const [showAllStops, setShowAllStops] = useState(false);

  // Fallbacks if etaData is not fully loaded yet
  const durationMins = etaData?.journey_duration_mins || 16;
  const intermediateStops = etaData?.intermediate_stops || [];
  const upcomingDepartures = etaData?.upcoming_departures || [];
  const nextEtaMins = etaData?.next_bus_eta_mins ?? 5;
  const overallCrowd = etaData?.predicted_crowd_level || 'Medium';

  return (
    <div className="bg-navy-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-slate-700/80">
      {/* Route Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Route Number Badge */}
            <div className="px-3.5 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-xl tracking-tight shrink-0 shadow-inner">
              {route.route_no}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  {route.route_name || `Route ${route.route_no}`}
                </h3>
                {route.bus_type && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    {route.bus_type}
                  </span>
                )}
              </div>

              {/* Journey Path */}
              <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                <span className="font-medium text-sky-400">{pickup}</span>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium text-emerald-400">{destination}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Est. Journey: <strong className="text-white">{durationMins} mins</strong></span>
            </div>

            {route.peak_frequency_mins && (
              <div className="text-xs px-3 py-1.5 rounded-lg bg-navy-800/80 border border-slate-700/60 text-slate-300">
                Frequency: Every <strong className="text-white">{route.peak_frequency_mins}–{route.offpeak_frequency_mins || 15}m</strong>
              </div>
            )}
          </div>
        </div>

        {/* Intermediate Stops (if any) */}
        {intermediateStops.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-slate-400">Via stops:</span>
            {intermediateStops.map((stop, i) => (
              <span
                key={stop}
                className="px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/50 text-slate-300"
              >
                {stop}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Departures Section */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upcoming Buses & Expected Crowd
            </h4>
          </div>

          <span className="text-[11px] font-medium text-sky-400/90 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            Scheduled ETA
          </span>
        </div>

        {/* Departures Grid / List */}
        {upcomingDepartures.length === 0 ? (
          <div className="p-4 rounded-xl bg-navy-950/50 border border-slate-800 text-center text-sm text-slate-400">
            No upcoming scheduled departures found for this route right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingDepartures.map((dep, idx) => {
              const countdownText =
                dep.eta_mins_to_origin <= 1
                  ? 'Arriving now'
                  : `Leaves in ${dep.eta_mins_to_origin} minutes`;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    idx === 0
                      ? 'bg-navy-800/90 border-sky-500/40 shadow-sm ring-1 ring-sky-500/10'
                      : 'bg-navy-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Departure Time & Countdown */}
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-lg font-bold text-white tracking-tight">
                        {dep.departure_time}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Next Bus
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-medium text-sky-400 mt-0.5">
                      {countdownText}
                    </div>

                    <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <span>Est. arrival:</span>
                      <strong className="text-slate-200">
                        {dep.estimated_destination_arrival}
                      </strong>
                    </div>
                  </div>

                  {/* Crowd Indicator */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <CrowdIndicator
                      level={dep.predicted_crowd}
                      size="sm"
                      className="w-full justify-between"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Honest Disclosure Footnote */}
        <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <span>
            Scheduled ETA calculated from BMTC timetable frequency & corridor distances. Predictions generated by trained machine learning model.
          </span>
        </div>
      </div>
    </div>
  );
}
