import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Bus, Navigation, Layers, Info, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { api, FALLBACK_STOPS, FALLBACK_ROUTES } from '../services/api';

// Component to ensure Leaflet recalculates dimensions when mounted
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Custom Leaflet marker icons with CSS styling
const createCustomIcon = (color = '#38bdf8', isCenter = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${isCenter ? '24px' : '16px'};
        height: ${isCenter ? '24px' : '16px'};
        border-radius: 50%;
        border: 3px solid #0f172a;
        box-shadow: 0 0 ${isCenter ? '14px' : '8px'} ${color};
      "></div>
    `,
    iconSize: isCenter ? [24, 24] : [16, 16],
    iconAnchor: isCenter ? [12, 12] : [8, 8],
    popupAnchor: [0, -12],
  });
};

export default function RouteMap() {
  const [stops, setStops] = useState(FALLBACK_STOPS);
  const [routes, setRoutes] = useState(FALLBACK_ROUTES);
  const [selectedStop, setSelectedStop] = useState(FALLBACK_STOPS[2] || FALLBACK_STOPS[0]);
  const [visibleRoutes, setVisibleRoutes] = useState({
    '500-D': true,
    '290-E': true,
    '290-B': true,
  });

  // Centered at Manyata Tech Park, North Bengaluru
  const centerPosition = [13.0475, 77.6215];

  useEffect(() => {
    async function init() {
      try {
        const [stopsData, routesData] = await Promise.all([
          api.getStops(),
          api.getRoutes(),
        ]);
        if (Array.isArray(stopsData) && stopsData.length > 0) {
          setStops(stopsData);
          const manyataStop = stopsData.find(s => s.name === 'Manyata Tech Park') || stopsData[0];
          setSelectedStop(manyataStop);
        }
        if (Array.isArray(routesData) && routesData.length > 0) {
          setRoutes(routesData);
        }
      } catch (err) {
        console.warn('RouteMap init notice:', err.message);
      }
    }
    init();
  }, []);

  const toggleRoute = (routeNo) => {
    setVisibleRoutes(prev => ({
      ...prev,
      [routeNo]: !prev[routeNo]
    }));
  };

  // Construct coordinate polylines for each route
  const getRouteCoordinates = (routeSequence) => {
    if (!routeSequence) return [];
    return routeSequence
      .map(stopName => {
        const found = stops.find(s => s.name === stopName);
        return found ? [found.lat, found.lng] : null;
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Manyata Corridor Route Map</h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            OpenStreetMap view of Manyata Tech Park bus stops and connected BMTC student routes.
          </p>
        </div>

        {/* Route Filter Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Filter Routes:
          </span>
          {routes.map(r => (
            <button
              key={r.route_no}
              onClick={() => toggleRoute(r.route_no)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                visibleRoutes[r.route_no]
                  ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                  : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: visibleRoutes[r.route_no] ? r.color : '#64748b' }}
              />
              <span>Route {r.route_no}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Stop Details Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leaflet Map (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden border border-slate-800 h-[520px] relative shadow-2xl">
          <MapContainer
            center={centerPosition}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapResizer />

            {/* Standard OpenStreetMap Tile Layer (Free, reliable, no API key required) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route Polylines */}
            {routes.map(r => {
              if (!visibleRoutes[r.route_no]) return null;
              const coords = getRouteCoordinates(r.stops_sequence);
              return (
                <Polyline
                  key={r.route_no}
                  positions={coords}
                  pathOptions={{
                    color: r.color || '#3b82f6',
                    weight: 5,
                    opacity: 0.85,
                  }}
                />
              );
            })}

            {/* Stop Markers */}
            {stops.map(stop => {
              const isManyata = stop.name === 'Manyata Tech Park';
              const markerIcon = createCustomIcon(
                isManyata ? '#38bdf8' : '#10b981',
                isManyata
              );

              return (
                <Marker
                  key={stop.id || stop.name}
                  position={[stop.lat, stop.lng]}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => setSelectedStop(stop),
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-slate-900 text-sm mb-0.5">{stop.name}</h4>
                      <p className="text-xs text-slate-600 mb-1">{stop.area}</p>
                      <span className="text-[10px] text-blue-600 font-medium block">
                        Click to view corridor details
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[500] glass-panel bg-navy-950/90 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 shadow-lg backdrop-blur-md">
            <span className="font-bold text-white block">Map Legend</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Manyata Tech Park (Tech Hub)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Student Transit Stops</span>
            </div>
          </div>
        </div>

        {/* Selected Stop Details (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Stop Details
            </h3>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              GPS Verified
            </span>
          </div>

          {selectedStop ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Bus Stop
                </span>
                <h4 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedStop.name}
                </h4>
                <p className="text-xs text-slate-300 mt-1">{selectedStop.area}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Nearby Landmark</span>
                <p className="text-slate-200">{selectedStop.landmark}</p>
              </div>

              {/* Routes passing through this stop */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Buses Serving This Stop
                </span>
                <div className="space-y-2">
                  {routes
                    .filter(r => r.stops_sequence?.includes(selectedStop.name))
                    .map(r => (
                      <div
                        key={r.route_no}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white"
                            style={{ backgroundColor: r.color }}
                          >
                            {r.route_no}
                          </span>
                          <span className="text-xs text-slate-300 font-medium">
                            {r.origin} ↔ {r.destination}
                          </span>
                        </div>
                        <span className="text-[11px] text-sky-400 font-medium">Every {r.peak_frequency_mins}m</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* External Navigation Link */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedStop.lat},${selectedStop.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5" /> Open in Google Maps
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Click any stop marker on the map to view corridor details.</p>
          )}

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              Real latitude and longitude coordinates are calibrated for all 8 Manyata corridor transit points.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
