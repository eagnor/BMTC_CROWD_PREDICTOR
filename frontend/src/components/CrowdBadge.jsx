import React from 'react';
import { Users, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function CrowdBadge({ level, size = 'md', showIcon = true, className = '' }) {
  const normLevel = (level || 'Medium').toLowerCase();

  const configs = {
    low: {
      bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'LOW CROWD',
      sublabel: 'Ample Seats',
      icon: CheckCircle
    },
    medium: {
      bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
      dot: 'bg-amber-400',
      label: 'MODERATE CROWD',
      sublabel: 'Standing likely',
      icon: Users
    },
    high: {
      bg: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
      dot: 'bg-rose-400',
      label: 'HIGH RUSH',
      sublabel: 'Heavy Congestion',
      icon: ShieldAlert
    }
  };

  const current = configs[normLevel] || configs.medium;
  const IconComp = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 space-x-1.5',
    md: 'text-sm px-3.5 py-1.5 space-x-2',
    lg: 'text-base px-5 py-2.5 space-x-2.5 font-semibold'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border shadow-sm backdrop-blur-sm ${current.bg} ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      <span className={`w-2 h-2 rounded-full ${current.dot} animate-pulse`} />
      {showIcon && <IconComp className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
    </span>
  );
}
