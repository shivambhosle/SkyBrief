import { useState, useEffect } from "react";
import { getBriefingSummary } from "../services/api";

function PlainEnglishBriefing({ icao, reportType = "METAR" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMismatches, setShowMismatches] = useState(false);

  const fetchSummary = async () => {
    if (!icao || icao.length !== 4) return;
    setLoading(true);
    setError("");

    try {
      const res = await getBriefingSummary(icao, reportType);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch LLM briefing summary:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to generate plain-English briefing at this time."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (icao && icao.length === 4) {
      fetchSummary();
    }
  }, [icao, reportType]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-sky-500/30 rounded-xl p-6 mb-6 shadow-lg shadow-sky-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
            <h3 className="text-xl font-bold text-sky-400 tracking-wide">
              Generating Plain-English Briefing...
            </h3>
          </div>
          <span className="text-xs uppercase font-mono px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
            AI Assistant
          </span>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-4/6"></div>
          <div className="h-4 bg-slate-800 rounded w-3/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-400">
              Plain-English Briefing Notice
            </h3>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchSummary}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-sky-300 font-medium transition-colors"
          >
            Retry Briefing
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary;
  const verification = data.verification || { passed: true, mismatches: [] };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-xl p-6 mb-6 shadow-xl relative overflow-hidden">
      {/* Top Banner: Title + Disclaimers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Plain-English Briefing
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/50">
                {reportType}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synthesized from parsed ground-truth observations
            </p>
          </div>
        </div>

        {/* Badges: Disclaimer & Verification */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mandatory AI Notice */}
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            AI-generated · Verify against official data
          </span>

          {/* Verification Badge */}
          {verification.passed ? (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Verified against parsed data
            </span>
          ) : (
            <button
              onClick={() => setShowMismatches(!showMismatches)}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Mismatches Found ({verification.mismatches?.length || 1})
            </button>
          )}
        </div>
      </div>

      {/* Mismatches Details Panel (if any) */}
      {!verification.passed && (
        <div className="mt-4 p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs">
          <div className="flex items-center justify-between text-rose-300 font-semibold mb-2">
            <span>Automated Claim Verification Discrepancies:</span>
            <button
              onClick={() => setShowMismatches(!showMismatches)}
              className="text-rose-400 hover:underline"
            >
              {showMismatches ? "Hide" : "Show details"}
            </button>
          </div>
          {showMismatches && (
            <ul className="list-disc list-inside space-y-1 text-rose-200">
              {verification.mismatches.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Primary Briefing Summary */}
      <div className="my-5">
        <p className="text-base text-slate-100 leading-relaxed font-normal bg-slate-800/40 border border-slate-700/40 rounded-lg p-4">
          {summary.summary}
        </p>
      </div>

      {/* Meteorological Breakdown Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Wind Summary */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3.5">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Wind Analysis
          </span>
          <p className="text-sm text-sky-200 font-medium">
            {summary.wind_summary || "Unknown"}
          </p>
        </div>

        {/* Visibility Category */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3.5">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Visibility Category
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800">
            {summary.visibility_category || "Unknown"}
          </span>
        </div>

        {/* Ceiling Category */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3.5">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Ceiling Category
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800">
            {summary.ceiling_category || "Unknown"}
          </span>
        </div>
      </div>

      {/* Operational Hazards & Data Gaps */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Hazards */}
        <div className="p-3.5 rounded-lg bg-slate-800/30 border border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
            Operational Hazards
          </span>
          {summary.hazards && summary.hazards.length > 0 ? (
            <ul className="space-y-1.5">
              {summary.hazards.map((hazard, idx) => (
                <li
                  key={idx}
                  className="text-xs text-amber-300 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {hazard}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No significant hazards flagged.
            </p>
          )}
        </div>

        {/* Data Gaps */}
        <div className="p-3.5 rounded-lg bg-slate-800/30 border border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
            Observation Data Gaps
          </span>
          {summary.data_gaps && summary.data_gaps.length > 0 ? (
            <ul className="space-y-1.5">
              {summary.data_gaps.map((gap, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-400 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {gap}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Report contains complete standard observation fields.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlainEnglishBriefing;
