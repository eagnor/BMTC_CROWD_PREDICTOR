import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, X, Check } from 'lucide-react';

export default function SearchableStopSelect({
  label,
  placeholder = 'Select bus stop',
  value,
  onChange,
  stops = [],
  disabled = false,
  error = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Filter stops based on search term
  const filteredStops = stops.filter((stop) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      stop.name.toLowerCase().includes(q) ||
      (stop.area && stop.area.toLowerCase().includes(q)) ||
      (stop.landmark && stop.landmark.toLowerCase().includes(q))
    );
  });

  // Selected stop object
  const selectedStop = stops.find((s) => s.name === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchTerm('');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  const handleSelect = (stopName) => {
    onChange(stopName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button / Input Box */}
      <div
        onClick={handleOpen}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border transition-all cursor-pointer select-none bg-navy-900/90 ${
          error
            ? 'border-rose-500/60 ring-1 ring-rose-500/30'
            : isOpen
            ? 'border-sky-500 ring-2 ring-sky-500/20 bg-navy-900'
            : 'border-slate-800 hover:border-slate-700 hover:bg-navy-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <MapPin
            className={`w-5 h-5 shrink-0 transition-colors ${
              value ? 'text-sky-400' : 'text-slate-500'
            }`}
          />
          <div className="min-w-0 flex-1">
            {value ? (
              <div className="truncate">
                <span className="text-white font-medium text-base leading-tight block truncate">
                  {value}
                </span>
                {selectedStop?.landmark && (
                  <span className="text-xs text-slate-400 truncate block mt-0.5">
                    {selectedStop.landmark}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-500 text-sm">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-sky-400' : 'text-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-navy-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
          {/* Search Box inside Dropdown */}
          <div className="p-2.5 border-b border-slate-800 bg-navy-950/60">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter bus stops..."
                className="w-full pl-9 pr-3 py-2 bg-navy-900 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Stops List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredStops.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">
                No bus stops match "{searchTerm}"
              </div>
            ) : (
              filteredStops.map((stop) => {
                const isSelected = stop.name === value;
                return (
                  <button
                    key={stop.name}
                    type="button"
                    onClick={() => handleSelect(stop.name)}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-sky-600/20 text-sky-300'
                        : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-white truncate">
                        {stop.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {stop.landmark || stop.area}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
