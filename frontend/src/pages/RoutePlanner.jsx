import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ArrowUpDown,
  Navigation,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Bus,
  Compass
} from 'lucide-react';
import CrowdBadge from '../components/CrowdBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { api, FALLBACK_STOPS, FALLBACK_ROUTES } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RoutePlanner({ initialParams, onNavigate }) {
  const [stops, setStops] = useState(FALLBACK_STOPS);
  const [routes, setRoutes] = useState(FALLBACK_ROUTES);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Form inputs
  const [origin, setOrigin] = useState(initialParams?.origin || 'Hebbal');
  const [destination, setDestination] = useState(initialParams?.dest || 'Manyata Tech Park');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  // Results
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [stopsData, routesData] = await Promise.all([
          api.getStops(),
          api.getRoutes(),
        ]);
        if (Array.isArray(stopsData) && stopsData.length > 0) setStops(stopsData);
        if (Array.isArray(routesData) && routesData.length > 0) setRoutes(routesData);

        const start = initialParams?.origin || 'Hebbal';
        const end = initialParams?.dest || 'Manyata Tech Park';
        await planJourney(start, end, dayOfWeek, hour, minute);
      } catch (err) {
        console.warn('RoutePlanner init notice:', err.message);
        await planJourney(origin, destination, dayOfWeek, hour, minute);
      }
    }
    init();
  }, []);

  const planJourney = async (orig, dest, day, hr, min) => {
    if (orig === dest) {
      setErrorMessage('Boarding stop and destination cannot be identical. Please select two different bus stops.');
      return;
    }
    setErrorMessage(null);
    setSearching(true);
    try {
      const rec = await api.recommendBus({
        origin_stop: orig,
        destination_stop: dest,
        day_of_week: day,
        hour: parseInt(hr, 10),
        minute: parseInt(min, 10),
      });
      setRecommendationResult(rec);
      if (rec.recommended_option) {
        setSelectedOption(rec.recommended_option);
      } else if (rec.all_options && rec.all_options.length > 0) {
        setSelectedOption(rec.all_options[0]);
      }
    } catch (err) {
      console.error('Error planning journey:', err);
      setErrorMessage(err.response?.data?.detail || 'Could not find routes for the selected stops.');
    } finally {
      setSearching(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    planJourney(destination, temp, dayOfWeek, hour, minute);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    planJourney(origin, destination, dayOfWeek, hour, minute);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Plan My Journey</h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Find the best BMTC buses connecting your stop to Manyata Tech Park with travel times and crowd levels.
        </p>
      </div>

      {/* Input Form Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Origin Stop Dropdown */}
            <div className="md:col-span-5 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 focus-within:border-sky-500 transition">
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Boarding Bus Stop
              </label>
              <select
                value={origin}
                onChange={(e) => {
                  setErrorMessage(null);
                  setOrigin(e.target.value);
                }}
                className="w-full bg-transparent text-slate-100 font-semibold text-sm focus:outline-none cursor-pointer py-0.5"
              >
                {stops.map((s) => (
                  <option key={s.id || s.name} value={s.name} className="bg-navy-900 text-slate-200">
                    {s.name} ({s.area || 'Bangalore'})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 transition shadow-sm"
                title="Swap Boarding & Destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Stop Dropdown */}
            <div className="md:col-span-5 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 focus-within:border-sky-500 transition">
              <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Destination Bus Stop
              </label>
              <select
                value={destination}
                onChange={(e) => {
                  setErrorMessage(null);
                  setDestination(e.target.value);
                }}
                className="w-full bg-transparent text-slate-100 font-semibold text-sm focus:outline-none cursor-pointer py-0.5"
              >
                {stops.map((s) => (
                  <option key={s.id || s.name} value={s.name} className="bg-navy-900 text-slate-200">
                    {s.name} ({s.area || 'Bangalore'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Day Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Travel Day
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 p-2.5 rounded-lg border border-slate-800 text-sm focus:outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d} className="bg-navy-900 text-slate-200">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Expected Departure Time
              </label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full bg-slate-900 text-slate-200 p-2.5 rounded-lg border border-slate-800 text-sm focus:outline-none"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i} className="bg-navy-900 text-slate-200">
                    {i === 0 ? '12:00 AM (Midnight)' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM (Noon)' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={searching}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                {searching ? <LoadingSpinner size="sm" message="" /> : (
                  <>
                    <Compass className="w-4 h-4" /> Find Travel Options
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-3 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Travel Options Grid */}
      {recommendationResult && (
        <div className="space-y-6">
          {/* Recommendation Summary */}
          <div className="p-4 rounded-xl bg-blue-950/50 border border-blue-800/50 text-xs md:text-sm text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Travel Recommendation:</span>
              <p>{recommendationResult.summary}</p>
            </div>
          </div>

          {/* Options Cards */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">
              Available Bus Options ({recommendationResult.all_options?.length || 0})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendationResult.all_options?.map((opt) => {
                const isSelected = selectedOption?.route === opt.route;

                return (
                  <div
                    key={opt.route}
                    onClick={() => setSelectedOption(opt)}
                    className={`glass-panel p-5 rounded-xl border cursor-pointer transition relative ${
                      isSelected
                        ? 'border-sky-500 bg-slate-900/90 ring-1 ring-sky-500/50 shadow-lg'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                    }`}
                  >
                    {opt.recommendation_badge && (
                      <span className="absolute -top-2.5 right-4 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-md">
                        {opt.recommendation_badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow"
                          style={{ backgroundColor: opt.color || '#3b82f6' }}
                        >
                          Route {opt.route}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{opt.route_name}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <CrowdBadge level={opt.predicted_crowd} size="sm" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Next Bus</span>
                        <span className="text-sm font-bold text-sky-400">~{opt.eta_minutes}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Transit Time</span>
                        <span className="text-sm font-bold text-slate-200">~{opt.travel_time_minutes}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Est.</span>
                        <span className="text-sm font-bold text-emerald-400">~{opt.total_time_minutes}m</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug mb-3">
                      {opt.reason}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                        View Itinerary <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Itinerary Timeline */}
          {selectedOption && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2.5 py-1 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: selectedOption.color || '#3b82f6' }}
                    >
                      Route {selectedOption.route}
                    </span>
                    <h3 className="font-bold text-slate-100 text-base">{selectedOption.route_name}</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Stop itinerary from {origin} to {destination}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('crowd-prediction', {
                        route: selectedOption.route,
                        bus_stop: origin,
                        hour,
                        dayOfWeek
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Check Expected Crowd
                </button>
              </div>

              {/* Stop Timeline */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {/* Boarding Stop */}
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-navy-950" />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Boarding Stop</span>
                      <span className="text-sm font-semibold text-white">{origin}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Next Bus Arrival:</span>
                      <span className="text-xs font-bold text-sky-400 ml-1.5">In ~{selectedOption.eta_minutes} mins</span>
                    </div>
                  </div>
                </div>

                {/* Intermediate Stops */}
                {selectedOption.intermediate_stops?.map((stop, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-navy-950" />
                    <div>
                      <span className="text-xs text-slate-300 font-medium">{stop}</span>
                      <span className="text-[11px] text-slate-400 block">Intermediate Stop</span>
                    </div>
                  </div>
                ))}

                {/* Destination Stop */}
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-navy-950" />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Final Destination</span>
                      <span className="text-sm font-semibold text-white">{destination}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Estimated Transit Time:</span>
                      <span className="text-xs font-bold text-slate-200 ml-1.5">~{selectedOption.travel_time_minutes} mins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
