import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [quickIcao, setQuickIcao] = useState("");
  const navigate = useNavigate();

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const clean = quickIcao.trim().toUpperCase();
    if (clean.length === 4) {
      navigate(`/metar?icao=${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-700 selection:text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Navbar />

        {/* Console Header & Subtitle */}
        <div className="border-b border-zinc-800 pb-8 mb-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-zinc-400 uppercase tracking-widest">
                <span>Flight Operations Dispatch</span>
                <span>/</span>
                <span>Atmospheric Intelligence</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Operational Weather Briefing
              </h1>
              <p className="text-sm md:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Deterministic decoding and plain-English operational synthesis of raw Aviation Weather Center (AWC) METAR, TAF, and en-route corridor data.
              </p>
            </div>

            {/* Quick Station Lookup */}
            <form onSubmit={handleQuickSearch} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  value={quickIcao}
                  onChange={(e) => setQuickIcao(e.target.value.toUpperCase())}
                  placeholder="ICAO (e.g. KJFK)"
                  className="w-44 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs uppercase tracking-wider text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-md tracking-wide transition shadow-sm"
              >
                Inspect Station
              </button>
            </form>
          </div>
        </div>

        {/* 3 Core Module Panels */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {/* METAR */}
          <Link
            to="/metar"
            className="group block p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90 transition shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase text-zinc-400 tracking-widest">
                Module 01
              </span>
              <span className="text-zinc-500 group-hover:text-zinc-200 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              METAR Analysis
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Current surface observation parsing, runway wind vectors, cloud ceilings, altimeter pressure, and plain-English operational synthesis.
            </p>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <span>UPDATE RATE</span>
              <span className="text-zinc-300">HOURLY / SPECI</span>
            </div>
          </Link>

          {/* TAF */}
          <Link
            to="/taf"
            className="group block p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90 transition shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase text-zinc-400 tracking-widest">
                Module 02
              </span>
              <span className="text-zinc-500 group-hover:text-zinc-200 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              TAF Terminal Forecast
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              24-to-30-hour aerodrome trend decoding, gradual (BECMG) transitions, temporary (TEMPO) deteriorations, and probability groups.
            </p>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <span>HORIZON</span>
              <span className="text-zinc-300">24 – 30 HOURS</span>
            </div>
          </Link>

          {/* Route Briefing */}
          <Link
            to="/route"
            className="group block p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90 transition shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase text-zinc-400 tracking-widest">
                Module 03
              </span>
              <span className="text-zinc-500 group-hover:text-zinc-200 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              Route Corridor Briefing
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Cross-country departure and destination atmospheric comparison, risk scoring, and corridor weather viability.
            </p>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <span>CORRIDOR</span>
              <span className="text-zinc-300">POINT-TO-POINT</span>
            </div>
          </Link>
        </div>

        {/* Flight Rules Reference Console */}
        <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase font-mono">
              DGCA / ICAO Categorical Minima Reference
            </h3>
            <span className="font-mono text-[10px] text-zinc-400 uppercase">
              CAR Section 8 / ICAO Annex 2 Standards
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-zinc-200">VFR</span>
              </div>
              <p className="text-[11px] text-zinc-400">Ceiling ≥ 1,500 ft (450 m)</p>
              <p className="text-[11px] text-zinc-400">Visibility ≥ 5.0 km (5,000 m)</p>
            </div>

            <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-bold text-zinc-200">SVFR (Marginal)</span>
              </div>
              <p className="text-[11px] text-zinc-400">Ceiling 1,000–1,500 ft</p>
              <p className="text-[11px] text-zinc-400">Visibility 3.0–5.0 km</p>
            </div>

            <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-bold text-zinc-200">IFR</span>
              </div>
              <p className="text-[11px] text-zinc-400">Ceiling 500–1,000 ft</p>
              <p className="text-[11px] text-zinc-400">Visibility 1.5–3.0 km</p>
            </div>

            <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="font-bold text-zinc-200">LVO / CAT II-III</span>
              </div>
              <p className="text-[11px] text-zinc-400">Ceiling &lt; 500 ft (DH)</p>
              <p className="text-[11px] text-zinc-400">Visibility &lt; 1.5 km (RVR)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;