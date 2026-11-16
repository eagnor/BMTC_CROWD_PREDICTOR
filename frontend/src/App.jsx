import React, { useState, useEffect } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { api, FALLBACK_STOPS, FALLBACK_ROUTES } from './services/api';
import JourneySearch from './components/JourneySearch';
import RouteResultCard from './components/RouteResultCard';

export default function App() {
  const [stops, setStops] = useState(FALLBACK_STOPS);
  const [allRoutes, setAllRoutes] = useState(FALLBACK_ROUTES);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchingRoutes, setMatchingRoutes] = useState([]);
  const [routeETAs, setRouteETAs] = useState({});

  // Load stops and routes on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [stopsData, routesData] = await Promise.all([
          api.getStops(),
          api.getRoutes(),
        ]);
        if (Array.isArray(stopsData) && stopsData.length > 0) {
          setStops(stopsData);
        }
        if (Array.isArray(routesData) && routesData.length > 0) {
          setAllRoutes(routesData);
        }
      } catch (err) {
        console.warn('Initial data load notice:', err.message);
      }
    }
    loadData();
  }, []);

  // Handle Swap
  const handleSwap = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  // Perform Journey Search
  const handleSearch = async () => {
    if (!pickup || !destination || pickup === destination) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // 1. Identify all direct corridor routes serving both pickup and destination
      const direct = allRoutes.filter((r) => {
        const seq = r.stops_sequence || [];
        return seq.includes(pickup) && seq.includes(destination);
      });

      setMatchingRoutes(direct);

      // 2. If direct routes found, fetch ETA & upcoming departures for each route in parallel
      if (direct.length > 0) {
        const etaResults = {};
        await Promise.all(
          direct.map(async (r) => {
            try {
              const res = await api.estimateETA({
                origin_stop: pickup,
                destination_stop: destination,
                route: r.route_no,
              });
              etaResults[r.route_no] = res;
            } catch (err) {
              console.warn(`ETA error for route ${r.route_no}:`, err.message);
            }
          })
        );
        setRouteETAs(etaResults);
      } else {
        setRouteETAs({});
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Unable to load bus information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setPickup('');
    setDestination('');
    setHasSearched(false);
    setMatchingRoutes([]);
    setRouteETAs({});
    setError(null);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* 1. Header — Compact, Minimal, Beautiful */}
      <header className="border-b border-slate-800/80 bg-navy-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Bus className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-white tracking-tight">
                  MyBMTC
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Find your bus. Check the crowd. Travel smarter.
              </p>
            </div>
          </div>

          {hasSearched && (
            <button
              onClick={handleResetSearch}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-navy-800 transition-colors flex items-center gap-1.5"
              title="Reset search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Mobile Tagline (visible on mobile where header hides it) */}
        <div className="sm:hidden text-center pb-1">
          <p className="text-xs text-slate-400">
            Find your bus. Check the crowd. Travel smarter.
          </p>
        </div>

        {/* 2. Journey Search Section */}
        <JourneySearch
          stops={stops}
          pickup={pickup}
          destination={destination}
          onPickupChange={setPickup}
          onDestinationChange={setDestination}
          onSwap={handleSwap}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* 3. Dynamic Results or Empty State */}
        {isLoading ? (
          /* Loading State */
          <div className="py-16 text-center space-y-4 animate-in fade-in">
            <div className="inline-flex p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl">
              <div className="w-8 h-8 border-3 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Finding available BMTC buses...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Checking routes, upcoming departures, and AI crowd forecasts
              </p>
            </div>
          </div>
        ) : error ? (
          /* API / Network Error State */
          <div className="p-8 rounded-2xl bg-navy-900/60 border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">{error}</h3>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Retry Search
            </button>
          </div>
        ) : !hasSearched ? (
          /* Before Search: Clean Empty State */
          <div className="py-16 sm:py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-inner">
              <Bus className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Where are you travelling today?
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enter your pickup and destination to discover available buses, upcoming departures, and crowd predictions.
              </p>
            </div>
          </div>
        ) : matchingRoutes.length === 0 ? (
          /* No Direct Buses Found State */
          <div className="py-16 text-center space-y-4 max-w-md mx-auto p-8 rounded-2xl bg-navy-900/50 border border-slate-800/80">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/80 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">
                No direct buses found for this journey.
              </h3>
              <p className="text-sm text-slate-400">
                Try selecting different bus stops along the corridor.
              </p>
            </div>
          </div>
        ) : (
          /* Results Found — Available Buses & Upcoming Departures */
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Journey Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-navy-900/90 border border-slate-800/80 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  My Journey:
                </span>
                <span className="font-semibold text-sky-400">{pickup}</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-emerald-400">{destination}</span>
              </div>

              <div className="text-xs text-slate-400">
                Found{' '}
                <strong className="text-white">{matchingRoutes.length}</strong>{' '}
                direct route{matchingRoutes.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Results Title */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Available Buses
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Routes from <span className="text-slate-300">{pickup}</span> to{' '}
                <span className="text-slate-300">{destination}</span>
              </p>
            </div>

            {/* List of Route Cards */}
            <div className="space-y-4">
              {matchingRoutes.map((route) => (
                <RouteResultCard
                  key={route.route_no}
                  route={route}
                  etaData={routeETAs[route.route_no]}
                  pickup={pickup}
                  destination={destination}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-900/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="font-medium text-slate-400">
            MyBMTC — Find your bus. Check the crowd. Travel smarter.
          </p>
        </div>
      </footer>
    </div>
  );
}
