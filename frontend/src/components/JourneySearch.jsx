import React, { useState } from 'react';
import { ArrowLeftRight, Bus, Search, AlertCircle } from 'lucide-react';
import SearchableStopSelect from './SearchableStopSelect';

export default function JourneySearch({
  stops = [],
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onSwap,
  onSearch,
  isLoading = false,
}) {
  const [validationError, setValidationError] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!pickup && !destination) {
      setValidationError('Please select both pickup and destination bus stops.');
      return;
    }
    if (!pickup) {
      setValidationError('Please select a pickup bus stop.');
      return;
    }
    if (!destination) {
      setValidationError('Please select a destination bus stop.');
      return;
    }
    if (pickup === destination) {
      setValidationError('Pickup and destination stops cannot be the same.');
      return;
    }

    onSearch();
  };

  const handleSwapClick = () => {
    setValidationError('');
    onSwap();
  };

  return (
    <div className="w-full bg-navy-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl relative">
      {/* Decorative subtle top edge glow */}
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-end gap-3 md:gap-4">
          {/* Pickup Stop */}
          <div className="w-full">
            <SearchableStopSelect
              label="Pickup Bus Stop"
              placeholder="Enter pickup bus stop"
              value={pickup}
              onChange={(val) => {
                setValidationError('');
                onPickupChange(val);
              }}
              stops={stops}
              disabled={isLoading}
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwapClick}
              disabled={isLoading || (!pickup && !destination)}
              className="p-3 rounded-xl border border-slate-700/80 bg-navy-800/90 text-slate-300 hover:text-white hover:border-sky-500/50 hover:bg-navy-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
              title="Swap pickup and destination"
              aria-label="Swap locations"
            >
              <ArrowLeftRight className="w-5 h-5 transition-transform duration-200 group-hover:rotate-180 text-sky-400" />
            </button>
          </div>

          {/* Destination Stop */}
          <div className="w-full">
            <SearchableStopSelect
              label="Destination Bus Stop"
              placeholder="Enter destination bus stop"
              value={destination}
              onChange={(val) => {
                setValidationError('');
                onDestinationChange(val);
              }}
              stops={stops}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>Real BMTC corridor routes & ML-powered crowd forecasting</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Finding Buses...</span>
              </>
            ) : (
              <>
                <Bus className="w-4 h-4" />
                <span>Find My Bus</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
