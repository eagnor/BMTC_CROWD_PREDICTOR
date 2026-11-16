import React from 'react';
import { Users, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * CrowdIndicator
 * Standardized crowd indicator component matching My BMTC specifications:
 * - Low Crowd: Green indicator, "Low Crowd", "Comfortable travel"
 * - Moderate Crowd: Amber indicator, "Moderate Crowd", "Some crowd expected"
 * - High Crowd: Red indicator, "High Crowd", "High crowd expected"
 * - Unavailable: Gray indicator, "Crowd prediction unavailable"
 */
export default function CrowdIndicator({ level, size = 'md', showSublabel = true, className = '' }) {
  const norm = (level || '').toLowerCase().trim();

  let config = null;

  if (norm === 'low') {
    config = {
      label: 'Low Crowd',
      sublabel: 'Comfortable travel',
      dotColor: 'bg-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      textAccent: 'text-emerald-400',
      icon: CheckCircle2,
    };
  } else if (norm === 'medium' || norm === 'moderate') {
    config = {
      label: 'Moderate Crowd',
      sublabel: 'Some crowd expected',
      dotColor: 'bg-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      textAccent: 'text-amber-400',
      icon: Users,
    };
  } else if (norm === 'high') {
    config = {
      label: 'High Crowd',
      sublabel: 'High crowd expected',
      dotColor: 'bg-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      textAccent: 'text-rose-400',
      icon: AlertTriangle,
    };
  } else {
    config = {
      label: 'Crowd prediction unavailable',
      sublabel: 'Prediction unavailable',
      dotColor: 'bg-slate-500',
      badgeBg: 'bg-slate-800/60 border-slate-700 text-slate-400',
      textAccent: 'text-slate-400',
      icon: HelpCircle,
    };
  }

  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${config.badgeBg} ${className}`}>
        <span className={`w-2 h-2 rounded-full ${config.dotColor} shrink-0 animate-pulse`} />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border text-sm ${config.badgeBg} ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor} shrink-0`} />
        <span className="font-semibold tracking-wide text-xs uppercase">{config.label}</span>
      </div>
      {showSublabel && (
        <span className="text-xs text-slate-300 font-normal">
          {config.sublabel}
        </span>
      )}
    </div>
  );
}
