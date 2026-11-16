import React from 'react';
import { Bus } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading commute data...', size = 'md' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-bmtc-blue animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Bus className="w-5 h-5 text-sky-400 animate-pulse" />
        </div>
      </div>
      {message && <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>}
    </div>
  );
}
