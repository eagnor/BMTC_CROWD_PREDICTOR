import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

export default function ModelComparison() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCMModel, setSelectedCMModel] = useState('Gradient Boosting');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getModelInfo();
        setModelInfo(data);
      } catch (err) {
        console.error('Failed to load model info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading ML benchmark scores and confusion matrices..." />;
  }

  const models = modelInfo?.models || [];
  const currentModelForCM = models.find(m => m.model_name === selectedCMModel) || models[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Machine Learning Model Benchmark</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Holdout Test Set (2,000 Rows)
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-400">
          Rigorous empirical evaluation of 7 multi-class classification algorithms trained strictly on pre-trip commute features.
        </p>
      </div>

      {/* Best Model Hero Highlight */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-navy-950 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5" /> SELECTED PRODUCTION MODEL
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Gradient Boosting Classifier
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Gradient Boosting outperformed all competing architectures with a <span className="text-emerald-400 font-bold">73.08% Macro F1 Score</span> and <span className="text-emerald-400 font-bold">71.80% Test Accuracy</span>. 
              Its ensemble decision trees effectively capture non-linear student passenger spikes at key interchange nodes like Veerannapalya without overfitting.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Macro F1 Score</span>
              <span className="text-2xl font-black text-emerald-400">73.08%</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Test Accuracy</span>
              <span className="text-2xl font-black text-white">71.80%</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Precision (Macro)</span>
              <span className="text-lg font-bold text-sky-400">73.47%</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Recall (Macro)</span>
              <span className="text-lg font-bold text-indigo-400">72.73%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Bar Chart Comparison */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" /> Algorithm Performance Bar Chart (Macro F1 %)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Benchmarked on identical 2,000 holdout testing records</p>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Sorted by Macro F1</span>
        </div>

        <div className="space-y-4 pt-2">
          {models.map((m) => {
            const f1 = m.macro_f1;
            const isWinner = m.is_best;

            return (
              <div key={m.model_name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className={isWinner ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                      {m.model_name}
                    </span>
                    {isWinner && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">Acc: {m.accuracy}%</span>
                    <span className={`font-mono font-bold ${isWinner ? 'text-emerald-400' : 'text-sky-300'}`}>
                      {f1}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isWinner
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                        : f1 >= 70
                        ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                        : f1 >= 60
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                        : 'bg-gradient-to-r from-slate-600 to-slate-500'
                    }`}
                    style={{ width: `${Math.max(f1, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Benchmark Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" /> Complete Empirical Metrics Table
          </h3>
          <span className="text-xs text-slate-400 font-mono">Stratified Test Split (80/20)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Macro Precision</th>
                <th className="py-3 px-4">Macro Recall</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">Macro F1 Score</th>
                <th className="py-3 px-4">Latency / Sample</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {models.map((m) => (
                <tr
                  key={m.model_name}
                  className={`hover:bg-slate-800/40 transition ${
                    m.is_best ? 'bg-emerald-950/20 font-medium' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    {m.model_name}
                    {m.is_best && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{m.accuracy}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{m.macro_precision}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{m.macro_recall}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{m.macro_f1}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{m.latency_ms} ms</td>
                  <td className="py-3.5 px-4 text-center">
                    {m.is_best ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Selected Best
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-500 bg-slate-800">
                        Evaluated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Interactive Inspector */}
      {currentModelForCM && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Confusion Matrix Inspector (2,000 Test Records)</h3>
              <p className="text-xs text-slate-400">Class breakdown between True Labels and Predicted Labels</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Select Model:</span>
              <select
                value={selectedCMModel}
                onChange={(e) => setSelectedCMModel(e.target.value)}
                className="bg-slate-900 text-slate-200 text-xs font-semibold p-2 rounded-lg border border-slate-700 focus:outline-none"
              >
                {models.map(m => (
                  <option key={m.model_name} value={m.model_name}>
                    {m.model_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* 3x3 Matrix Grid (7 cols) */}
            <div className="md:col-span-7 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
              <div className="text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                Predicted Classes →
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
                {/* Header Row */}
                <div className="text-slate-500 flex items-center justify-center font-bold">
                  True ↓
                </div>
                <div className="p-2 rounded bg-slate-800 font-bold text-emerald-400">Low</div>
                <div className="p-2 rounded bg-slate-800 font-bold text-amber-400">Medium</div>
                <div className="p-2 rounded bg-slate-800 font-bold text-rose-400">High</div>

                {/* Rows */}
                {['Low', 'Medium', 'High'].map((rowLabel, rIdx) => (
                  <React.Fragment key={rowLabel}>
                    <div className="p-2 font-bold text-slate-300 flex items-center justify-center">
                      {rowLabel}
                    </div>
                    {[0, 1, 2].map((cIdx) => {
                      const count = currentModelForCM.confusion_matrix?.[rIdx]?.[cIdx] || 0;
                      const isDiagonal = rIdx === cIdx;

                      return (
                        <div
                          key={cIdx}
                          className={`p-3 rounded-lg font-mono font-bold text-sm transition ${
                            isDiagonal
                              ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 shadow-sm'
                              : 'bg-slate-950/50 text-slate-400 border border-slate-800/80'
                          }`}
                        >
                          {count}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Matrix Explanation & Insights (5 cols) */}
            <div className="md:col-span-5 space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-white block mb-1">Matrix Interpretation:</span>
                <p>
                  Green diagonal cells represent correct predictions. Gradient Boosting correctly classifies the majority of High-rush and Low-crowd trips, providing reliable warnings to college students.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-white block mb-1">Total Test Distribution:</span>
                <p className="text-slate-400">
                  Low: 734 trips (36.7%) • Medium: 807 trips (40.4%) • High: 459 trips (23.0%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Data Leakage Protocol & Methodology */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" /> Strict Data Leakage Prevention Protocol
        </h3>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          In student transportation research, many naive models achieve false 99%+ accuracy by training on 
          <code className="text-rose-400 mx-1 px-1 bg-slate-900 rounded">simulated_passengers_onboard</code> or 
          <code className="text-rose-400 mx-1 px-1 bg-slate-900 rounded">simulated_occupancy_percent</code>.
          Our model pipeline systematically excluded all onboard measurements because they directly define the target label and are unknown before a bus arrives.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="font-bold text-emerald-400 block mb-1">Allowed Pre-Trip Features (Known Ahead):</span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li><code className="text-slate-200">route</code>: BMTC corridor number</li>
              <li><code className="text-slate-200">bus_stop</code>: Passenger boarding point</li>
              <li><code className="text-slate-200">day_of_week</code>: Monday through Sunday</li>
              <li><code className="text-slate-200">hour</code>: Time of departure (0-23)</li>
              <li><code className="text-slate-200">is_weekend</code>: Weekend operational pattern</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="font-bold text-rose-400 block mb-1">Excluded Post-Arrival Columns (Data Leakage):</span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li><code className="text-rose-300">simulated_passengers_onboard</code> (determines target)</li>
              <li><code className="text-rose-300">simulated_occupancy_percent</code> (determines target)</li>
              <li><code className="text-rose-300">bus_capacity_assumed</code> (intermediate denominator)</li>
              <li><code className="text-rose-300">destination_area</code> (constant value across rows)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
