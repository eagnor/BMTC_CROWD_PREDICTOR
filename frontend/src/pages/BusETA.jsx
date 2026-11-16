import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bus,
  MapPin,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import ETACard from '../components/ETACard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api, FALLBACK_STOPS, FALLBACK_ROUTES } from '../services/api';

export default function BusETA({ onNavigate }) {
  const [routes, setRoutes] = useState(FALLBACK_ROUTES);
  const [stops, setStops] = useState(FALLBACK_STOPS);
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedRoute, setSelectedRoute] = useState('500-D');
  const [originStop, setOriginStop] = useState('Hebbal');
  const [destinationStop, setDestinationStop] = useState('Manyata Tech Park');
  const [queryHour, setQueryHour] = useState(new Date().getHours());
  const [queryMinute, setQueryMinute] = useState(new Date().getMinutes());

  const [etaResult, setEtaResult] = useState(null);
  const [etaLoading, setEtaLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [routesData, stopsData, ttData] = await Promise.all([
          api.getRoutes(),
          api.getStops(),
          api.getTimetable()
        ]);
        if (Array.isArray(routesData) && routesData.length > 0) setRoutes(routesData);
        if (Array.isArray(stopsData) && stopsData.length > 0) setStops(stopsData);
        if (ttData) setTimetableData(ttData);

        await fetchETA('500-D', 'Hebbal', 'Manyata Tech Park', new Date().getHours(), new Date().getMinutes());
      } catch (err) {
        console.warn('BusETA init notice:', err.message);
        await fetchETA('500-D', 'Hebbal', 'Manyata Tech Park', new Date().getHours(), new Date().getMinutes());
      }
    }
    init();
  }, []);

  const fetchETA = async (r, orig, dest, hr, min) => {
    setEtaLoading(true);
    try {
      const data = await api.estimateETA({
        route: r,
        origin_stop: orig,
        destination_stop: dest,
        current_hour: hr,
        current_minute: min
      });
      setEtaResult(data);
    } catch (err) {
      console.error('Error fetching ETA:', err);
    } finally {
      setEtaLoading(false);
    }
  };

  const handleRouteChange = (newRouteNo) => {
    setSelectedRoute(newRouteNo);
    const rObj = routes.find(rt => rt.route_no === newRouteNo);
    if (rObj && rObj.stops_sequence.length >= 2) {
      const newOrig = rObj.stops_sequence[0];
      const newDest = rObj.stops_sequence[rObj.stops_sequence.length - 1];
      setOriginStop(newOrig);
      setDestinationStop(newDest);
      fetchETA(newRouteNo, newOrig, newDest, queryHour, queryMinute);
    }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    fetchETA(selectedRoute, originStop, destinationStop, queryHour, queryMinute);
  };

  const activeRouteObj = routes.find(r => r.route_no === selectedRoute);
  const availableStops = activeRouteObj?.stops_sequence || stops.map(s => s.name);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Bus Arrivals & Timetable</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-sky-400 border border-blue-500/30">
            Scheduled Headways
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-400">
          Estimated upcoming bus arrival times based on official BMTC corridor schedules and traffic travel times.
        </p>
      </div>

      {/* Transparent Headway Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-sky-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Schedule-Based Frequency Model:</span>
            <span className="text-xs text-slate-400">
              Arrival times are calculated from published BMTC corridor headway frequencies. Real-time satellite GPS tracking is not claimed.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Timetable Frequency Active</span>
        </div>
      </div>

      {/* Route & Stop Selection Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Route selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-blue-400" /> BMTC Route
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-semibold text-sm focus:outline-none cursor-pointer"
            >
              {routes.map(r => (
                <option key={r.route_no} value={r.route_no}>
                  Route {r.route_no} ({r.origin} ↔ {r.destination})
                </option>
              ))}
            </select>
          </div>

          {/* Boarding stop */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Boarding Stop
            </label>
            <select
              value={originStop}
              onChange={(e) => setOriginStop(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-semibold text-sm focus:outline-none cursor-pointer"
            >
              {availableStops.map(sName => (
                <option key={sName} value={sName}>
                  {sName}
                </option>
              ))}
            </select>
          </div>

          {/* Destination stop */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Destination
            </label>
            <select
              value={destinationStop}
              onChange={(e) => setDestinationStop(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-semibold text-sm focus:outline-none cursor-pointer"
            >
              {availableStops.map(sName => (
                <option key={sName} value={sName}>
                  {sName}
                </option>
              ))}
            </select>
          </div>

          {/* Departure Hour */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Time Window
            </label>
            <select
              value={queryHour}
              onChange={(e) => setQueryHour(Number(e.target.value))}
              className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                </option>
              ))}
            </select>
          </div>

          {/* Calculate Button */}
          <div>
            <button
              type="submit"
              disabled={etaLoading}
              className="w-full p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              {etaLoading ? <LoadingSpinner size="sm" message="" /> : (
                <>
                  <Clock className="w-4 h-4" /> Calculate ETA
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Calculated ETA Card Component */}
      {etaResult && <ETACard etaData={etaResult} />}

      {/* Default Timetable Display (Always Visible) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Manyata Corridor Bus Timetables</h3>
            <p className="text-xs text-slate-400">Regular BMTC operating frequencies and corridor coverage</p>
          </div>
          <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> 3 Direct Corridors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {routes.map((tt, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className="px-3 py-1 rounded-md text-xs font-bold text-white shadow"
                  style={{ backgroundColor: tt.color || '#3b82f6' }}
                >
                  Route {tt.route_no}
                </span>
                <span className="text-xs text-slate-400">{tt.bus_type}</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 text-sm mb-1">{tt.route_name}</h4>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Daily: 05:30 AM – 10:45 PM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Peak Hours</span>
                  <span className="text-sm font-bold text-sky-400">Every {tt.peak_frequency_mins} mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Off-Peak</span>
                  <span className="text-sm font-bold text-slate-300">Every {tt.offpeak_frequency_mins} mins</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Corridor Stops
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tt.stops_sequence?.map((st, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-0.5 rounded-md border ${
                        st === 'Manyata Tech Park'
                          ? 'bg-blue-950 text-blue-300 border-blue-700/50 font-semibold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                      }`}
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
