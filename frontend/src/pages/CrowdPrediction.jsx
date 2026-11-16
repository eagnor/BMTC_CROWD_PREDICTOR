import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bus,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import CrowdBadge from '../components/CrowdBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { api, FALLBACK_STOPS, FALLBACK_ROUTES } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CrowdPrediction({ initialParams, onNavigate }) {
  const [routes, setRoutes] = useState(FALLBACK_ROUTES);
  const [stops, setStops] = useState(FALLBACK_STOPS);
  const [predicting, setPredicting] = useState(false);

  // Student Form Inputs
  const [selectedRoute, setSelectedRoute] = useState(initialParams?.route || '500-D');
  const [selectedStop, setSelectedStop] = useState(initialParams?.bus_stop || 'Veerannapalya');
  const [dayOfWeek, setDayOfWeek] = useState(initialParams?.dayOfWeek || 'Monday');
  const [hour, setHour] = useState(initialParams?.hour !== undefined ? initialParams.hour : 9);

  // Prediction Result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [routesData, stopsData] = await Promise.all([
          api.getRoutes(),
          api.getStops(),
        ]);
        if (Array.isArray(routesData) && routesData.length > 0) setRoutes(routesData);
        if (Array.isArray(stopsData) && stopsData.length > 0) setStops(stopsData);

        const r = initialParams?.route || '500-D';
        const s = initialParams?.bus_stop || 'Veerannapalya';
        const d = initialParams?.dayOfWeek || 'Monday';
        const h = initialParams?.hour !== undefined ? initialParams.hour : 9;
        await handlePredict(r, s, d, h);
      } catch (err) {
        console.warn('CrowdPrediction init notice:', err.message);
        await handlePredict(selectedRoute, selectedStop, dayOfWeek, hour);
      }
    }
    loadData();
  }, []);

  const handlePredict = async (r, s, d, h) => {
    setError(null);
    setPredicting(true);
    try {
      const pred = await api.predictCrowd({
        route: r,
        bus_stop: s,
        day_of_week: d,
        hour: parseInt(h, 10),
      });
      setResult(pred);
    } catch (err) {
      console.error('Prediction failed:', err);
      setError('Could not complete prediction. Please verify input selections.');
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePredict(selectedRoute, selectedStop, dayOfWeek, hour);
  };

  // Filter stops that belong to selected route
  const currentRouteData = routes.find((r) => r.route_no === selectedRoute);
  const availableStopsForRoute = currentRouteData?.stops_sequence || stops.map((s) => s.name);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">AI Crowd Prediction</h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Check expected passenger crowd levels before heading to your BMTC bus stop.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Bus className="w-4 h-4 text-sky-400" /> Commute Details
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full font-semibold">
              Live AI Model
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Route Selection */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-blue-400" /> BMTC Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => {
                  const newRoute = e.target.value;
                  setSelectedRoute(newRoute);
                  const rObj = routes.find((r) => r.route_no === newRoute);
                  if (rObj && rObj.stops_sequence.length > 0) {
                    setSelectedStop(rObj.stops_sequence[0]);
                  }
                }}
                className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {routes.map((r) => (
                  <option key={r.route_no} value={r.route_no} className="bg-navy-900 text-slate-200">
                    Route {r.route_no} ({r.origin} → {r.destination})
                  </option>
                ))}
              </select>
            </div>

            {/* Boarding Stop Selection */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Boarding Stop
              </label>
              <select
                value={selectedStop}
                onChange={(e) => setSelectedStop(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {availableStopsForRoute.map((sName) => (
                  <option key={sName} value={sName} className="bg-navy-900 text-slate-200">
                    {sName}
                  </option>
                ))}
              </select>
            </div>

            {/* Day of Week */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Travel Day
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d} className="bg-navy-900 text-slate-200">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Hour of Day */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Planned Departure Time
              </label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i} className="bg-navy-900 text-slate-200">
                    {i === 0 ? '12:00 AM (Midnight)' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM (Noon)' : `${i - 12}:00 PM`}
                    {i >= 8 && i <= 10 ? ' — Morning Peak' : ''}
                    {i >= 17 && i <= 20 ? ' — Evening Peak' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={predicting}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
            >
              {predicting ? <LoadingSpinner size="sm" message="" /> : (
                <>
                  <Sparkles className="w-4 h-4" /> Check Expected Crowd
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Prediction Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Output Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Expected Bus Crowd Level
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      Route {result.route} at {result.bus_stop}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {result.day_of_week} at {String(result.hour).padStart(2, '0')}:00
                    </span>
                  </div>

                  <div>
                    <CrowdBadge level={result.crowd_level} size="lg" />
                  </div>
                </div>

                {/* Explanation in plain student language */}
                <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Commute Advice
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Less-Crowded Alternative Recommendation Card */}
              {result.suggested_alternative && (
                <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/25 shadow-lg">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-emerald-300 text-sm">
                        Less Crowded Bus Available!
                      </h4>
                    </div>
                    <CrowdBadge level={result.suggested_alternative.predicted_crowd} size="sm" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {result.suggested_alternative.reason}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-emerald-900/40 text-xs">
                    <span className="text-slate-400">
                      Next departure in ~{result.suggested_alternative.estimated_arrival_mins} mins
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRoute(result.suggested_alternative.route);
                        handlePredict(
                          result.suggested_alternative.route,
                          result.suggested_alternative.bus_stop,
                          dayOfWeek,
                          hour
                        );
                      }}
                      className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      Switch to Route {result.suggested_alternative.route} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Student Transparency Note */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-normal">
            <span className="font-semibold text-slate-300 block mb-0.5">Commuter Notice:</span>
            Crowd classifications are estimated based on Manyata corridor student transit schedules. Actual passenger density may vary with local weather and campus timings.
          </div>
        </div>
      </div>
    </div>
  );
}
