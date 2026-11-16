import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  Code2,
  Sparkles
} from 'lucide-react';

export default function About() {
  const [openVivaIdx, setOpenVivaIdx] = useState(0);

  const vivaQuestions = [
    {
      q: "1. What is the core problem statement of this project, and why is it specifically useful for students?",
      a: "Students commuting to colleges and IT offices around Manyata Tech Park (along Outer Ring Road, Hebbal, Thanisandra, and Nagawara) routinely experience extreme bus overcrowding, unpredictable headways, and delayed arrivals. This web application provides students with advance crowd level predictions (Low, Medium, High), scheduled timetable ETAs, and smart alternative route suggestions to avoid congestion and plan stress-free commutes."
    },
    {
      q: "2. Why is Macro F1 Score used as the primary evaluation metric instead of simple Accuracy?",
      a: "In multi-class crowd prediction, class distributions are inherently imbalanced (in our holdout set: Low 36.7%, Medium 40.4%, High 22.9%). Simple accuracy can be deceptive because a naive classifier could frequently predict 'Medium' and still report ~50-60% accuracy while failing to detect crucial 'High' rush hours. Macro F1 calculates the unweighted harmonic mean of Precision and Recall across all three classes equally, penalizing models that fail to predict high congestion."
    },
    {
      q: "3. What is Data Leakage in this project, and how did your pipeline strictly prevent it?",
      a: "Data leakage happens when features created during or after the event are used as inputs for pre-trip prediction. In our dataset, columns 'simulated_passengers_onboard' and 'simulated_occupancy_percent' directly derive the target 'crowd_level'. Using them would yield a fake 99%+ accuracy that fails completely in real life because students do not know passenger counts before boarding. We strictly restricted inputs to pre-trip information: Route, Bus Stop, Day of Week, Hour, and Weekend status."
    },
    {
      q: "4. Why did Gradient Boosting outperform Random Forest, SVM, and Logistic Regression?",
      a: "BMTC commuter crowd patterns contain complex non-linear interactions: for instance, a 9:00 AM trip on a weekday creates high rush at Veerannapalya, whereas the same 9:00 AM trip on Sunday produces low crowd. Linear models (Logistic Regression at 35.91% F1) cannot model these boundary thresholds. While Random Forest builds independent trees, Gradient Boosting sequentially builds trees that specifically correct the residual errors of preceding trees, achieving 73.08% Macro F1."
    },
    {
      q: "5. How does your machine learning pipeline handle categorical variables and feature scaling?",
      a: "We used Scikit-Learn's ColumnTransformer and Pipeline architecture. Categorical features ('route', 'bus_stop', 'day_of_week') are encoded using OneHotEncoder(handle_unknown='ignore'). Numerical features ('hour', 'is_weekend') are passed directly to tree ensembles, while distance/linear models (KNN, SVM, Logistic Regression) receive StandardScaler normalization. The entire pipeline was fitted strictly on the 8,000 training records to prevent data snooping."
    },
    {
      q: "6. How is Bus Arrival (ETA) calculated if live BMTC GPS is unavailable?",
      a: "Our system uses a transparent BMTC Scheduled Headway Model. We utilize verified BMTC corridor timetable frequencies (8-10 min peak, 15-20 min off-peak) combined with haversine distance between verified stop coordinates and dynamic time-of-day traffic deceleration multipliers (1.45x morning, 1.55x evening peak). We explicitly disclose to users that ETAs are scheduled timetable estimates rather than falsely claiming live satellite tracking."
    },
    {
      q: "7. How does the Bus Recommendation Engine score and select optimal travel options?",
      a: "The recommendation engine evaluates all corridor routes between boarding and destination stops. It computes a composite score based on: (1) Base score of 100 points, (2) Crowd level penalty (+30 points for Low crowd, +5 for Medium, -30 for High crowd rush), and (3) Total travel duration penalty (-0.8 points per minute of wait and transit time). The highest-scoring route is recommended, with clear badges like 'BEST CHOICE' or 'LEAST CROWDED'."
    },
    {
      q: "8. What are the key limitations of this project, and how can it be enhanced in future work?",
      a: "First, the training dataset is synthetic rather than real electronic ticketing machine (ETM) logs. Second, live GPS tracking relies on third-party BMTC open API access, which currently requires institutional government partnerships. Future enhancements include integrating live BMTC ITS GPS feeds via GTFS-Realtime, weather impact features (monsoon delays), and user crowd crowdsourcing reports."
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Project Documentation & Viva Preparation</h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Technical architecture, machine learning methodology, limitations, and examiner Q&A guide.
        </p>
      </div>

      {/* Project Overview Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" /> Project Abstract & Motivation
        </h3>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          Bangalore's Manyata Tech Park corridor along the Outer Ring Road is one of Asia's largest technology and college hubs, 
          accommodating over 150,000 daily commuters. Students travelling via Bangalore Metropolitan Transport Corporation (BMTC) 
          face irregular arrival times and unpredictable bus crowd surges.
        </p>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          This full-stack system leverages machine learning classification algorithms (Gradient Boosting, Random Forest, Decision Tree, XGBoost, KNN, SVM, Logistic Regression) 
          to forecast crowd congestion ahead of time. It provides a modern React dashboard with route planning, scheduled arrival ETAs, 
          an interactive Leaflet map, and transparent model performance metrics.
        </p>
      </div>

      {/* Full-Stack Architecture Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" /> System Architecture & Tech Stack
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Frontend */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">1. Frontend Layer</span>
            <h4 className="font-bold text-white text-sm">React + Vite + Tailwind</h4>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Responsive dark transportation UI</li>
              <li>Lucide modern vector iconography</li>
              <li>Interactive Leaflet / OpenStreetMap</li>
              <li>Modular component architecture</li>
              <li>Axios API client with error handling</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">2. Backend API Layer</span>
            <h4 className="font-bold text-white text-sm">FastAPI + Python 3.13</h4>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>High-speed asynchronous endpoints</li>
              <li>Pydantic request & response validation</li>
              <li>CORS middleware enabled</li>
              <li>Scheduled timetable headway engine</li>
              <li>Bus recommendation scoring service</li>
            </ul>
          </div>

          {/* Machine Learning */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">3. Machine Learning Layer</span>
            <h4 className="font-bold text-white text-sm">Scikit-Learn + Joblib</h4>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Gradient Boosting classifier (73.08% F1)</li>
              <li>OneHotEncoder & StandardScaler</li>
              <li>Saved inside sklearn Pipeline</li>
              <li>Zero data leakage architecture</li>
              <li>Holdout test set evaluation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* College Project Viva Preparation Guide */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" /> College Viva / Oral Exam Q&A Guide
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Frequently asked questions by project examiners and professors</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/50">
            8 Essential Questions
          </span>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openVivaIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenVivaIdx(isOpen ? -1 : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition gap-4"
                >
                  <span className="text-xs md:text-sm font-bold text-slate-100">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs md:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-navy-950/40">
                    <p className="pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Honest Limitations & Disclosures */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Explicit Project Disclosures
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>1. Synthetic Dataset Disclosure:</strong> The models were trained and benchmarked on a 10,000-row synthetic Manyata corridor simulation. The metrics (73.08% Macro F1) reflect synthetic holdout performance and do not represent validated official BMTC passenger counts.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>2. ETA Calculation Transparency:</strong> Bus arrival ETAs are derived from standard BMTC corridor frequency headways and distance between stops, adjusted for traffic peak hours. The application does not claim live satellite GPS tracking.
        </p>
      </div>
    </div>
  );
}
