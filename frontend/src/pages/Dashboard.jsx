import React, { useState, useEffect } from 'react';
import {
  Bus,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  MapPin,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Compass
} from 'lucide-react';
import RouteCard from '../components/RouteCard';
import ETACard from '../components/ETACard';
import CrowdBadge from '../components/CrowdBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { api, FALLBACK_STOPS, FALLBACK_ROUTES } from '../services/api';

export default function Dashboard({ onNavigate }) {
  const [routes, setRoutes] = useState(FALLBACK_ROUTES);
  const [stops, setStops] = useState(FALLBACK_STOPS);
  const [sampleETA, setSampleETA] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quick commute search form
  const [startingStop, setStartingStop] = useState('Hebbal');
  const [destinationStop, setDestinationStop] = useState('Manyata Tech Park');
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [routesData, stopsData, etaData] = await Promise.all([
          api.getRoutes(),
          api.getStops(),
          api.estimateETA({
            origin_stop: 'Hebbal',
            destination_stop: 'Manyata Tech Park',
            route: '500-D'
          })
        ]);
        if (Array.isArray(routesData) && routesData.length > 0) setRoutes(routesData);
        if (Array.isArray(stopsData) && stopsData.length > 0) setStops(stopsData);
        if (etaData) setSampleETA(etaData);
      } catch (err) {
        console.warn('Dashboard data notice:', err.message);
      }
    }
    loadData();
  }, []);

  const handleSwapStops = () => {
    setSearchError(null);
    const temp = startingStop;
    setStartingStop(destinationStop);
    setDestinationStop(temp);
  };

  const handleFindBus = (e) => {
    e.preventDefault();
    if (startingStop === destinationStop) {
      setSearchError('Starting stop and destination cannot be identical. Please select two different stops.');
      return;
    }
    setSearchError(null);
    if (onNavigate) {
      onNavigate('plan-journey', { origin: startingStop, dest: destinationStop });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/60 via-slate-900 to-navy-950 border border-blue-500/20 p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-sky-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Bengaluru Student Commute Companion
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Your Daily BMTC Journey, Made Smarter.
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
            Find buses, check crowd levels, and plan a comfortable journey to Manyata Tech Park.
          </p>

          {/* Quick Route Search Card */}
          <form
            onSubmit={handleFindBus}
            className="bg-navy-950/95 border border-slate-700/80 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-xl backdrop-blur-md"
          >
            {/* Starting Stop */}
            <div className="flex-1 w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-900/90 rounded-xl border border-slate-800 focus-within:border-sky-500 transition">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="w-full text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Starting Bus Stop
                </span>
                <select
                  value={startingStop}
                  onChange={(e) => {
                    setSearchError(null);
                    setStartingStop(e.target.value);
                  }}
                  className="bg-transparent text-slate-100 text-sm font-semibold focus:outline-none w-full cursor-pointer py-0.5"
                >
                  {stops.map((s) => (
                    <option key={s.id || s.name} value={s.name} className="bg-navy-900 text-slate-200">
                      {s.name} ({s.area || 'Bangalore'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapStops}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 transition shrink-0 shadow-sm"
              title="Swap Stops"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Destination Stop */}
            <div className="flex-1 w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-900/90 rounded-xl border border-slate-800 focus-within:border-sky-500 transition">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="w-full text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Destination Bus Stop
                </span>
                <select
                  value={destinationStop}
                  onChange={(e) => {
                    setSearchError(null);
                    setDestinationStop(e.target.value);
                  }}
                  className="bg-transparent text-slate-100 text-sm font-semibold focus:outline-none w-full cursor-pointer py-0.5"
                >
                  {stops.map((s) => (
                    <option key={s.id || s.name} value={s.name} className="bg-navy-900 text-slate-200">
                      {s.name} ({s.area || 'Bangalore'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0"
            >
              <Compass className="w-4 h-4" /> Find My Bus
            </button>
          </form>

          {/* Validation Error Banner */}
          {searchError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Corridor Quick Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Routes</span>
            <Bus className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{routes.length} Corridors</div>
          <span className="text-xs text-slate-400 mt-1 block">500-D, 290-E, 290-B</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Transit Stops</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stops.length} Bus Stops</div>
          <span className="text-xs text-slate-400 mt-1 block">Hebbal & Manyata ORR</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Prediction</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">Available</div>
          <span className="text-xs text-slate-400 mt-1 block">Trained Corridor Pipeline</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Peak Hours</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">8-10 AM & 5-8 PM</div>
          <span className="text-xs text-slate-400 mt-1 block">Student & Office Rush</span>
        </div>
      </div>

      {/* Current Crowd Overview & Student Commute Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple crowd overview card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Current Crowd Overview
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                AI Assessed
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Low Crowd</span>
                    <span className="text-[11px] text-slate-400">Ample seats available</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400">Best Comfort</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Moderate Crowd</span>
                    <span className="text-[11px] text-slate-400">Standing likely</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-400">Manageable</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">High Rush</span>
                    <span className="text-[11px] text-slate-400">Heavy college congestion</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-400">Allow Extra Time</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-slate-300">
            <span className="text-white font-bold block mb-1">Student Commute Tip:</span>
            Travel between 11:00 AM and 3:30 PM for relaxed seating and minimal bus stop queues.
          </div>
        </div>

        {/* Live / Upcoming Bus Departures */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Upcoming Bus Departures (Hebbal → Manyata Tech Park)
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('bus-arrivals')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              Full Timetable <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {sampleETA && <ETACard etaData={sampleETA} />}
        </div>
      </div>

      {/* Popular Student Routes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Popular Student Corridors</h3>
            <p className="text-xs text-slate-400">Frequent BMTC buses connecting North Bangalore to Manyata Tech Park</p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('plan-journey')}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
          >
            All Travel Options <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {routes.map((route) => (
            <RouteCard
              key={route.route_no}
              route={route}
              onSelect={(r) => {
                if (onNavigate) onNavigate('plan-journey', { route: r.route_no, origin: r.origin, dest: r.destination });
              }}
              onPredict={(r) => {
                if (onNavigate) onNavigate('crowd-prediction', { route: r.route_no, bus_stop: r.origin });
              }}
            />
          ))}
        </div>
      </div>

      {/* Quick Access Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-600/20 text-sky-400 border border-blue-500/30 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Check Your Bus Crowd Ahead of Time</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your route and boarding time to see if seats will be available or if you should take an alternate bus.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('crowd-prediction')}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md flex items-center gap-2 shrink-0"
        >
          Check Expected Crowd <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
