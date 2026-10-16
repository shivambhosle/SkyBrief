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
      console.error("Failed to fetch briefing summary:", err);
      setError(
        err.response?.data?.detail ||
          "Advisory briefing temporarily unavailable."
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
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 mb-5 font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></span>
          <span className="uppercase tracking-wider text-zinc-200">
            Synthesizing Operational Weather Summary [{icao} {reportType}]...
          </span>
        </div>
        <div className="space-y-2 animate-pulse pt-2">
          <div className="h-3 bg-zinc-800/80 rounded w-5/6"></div>
          <div className="h-3 bg-zinc-800/80 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 mb-5 text-xs font-mono">
        <div className="flex items-center justify-between text-zinc-400">
          <span>NOTICE: {error}</span>
          <button
            onClick={fetchSummary}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] uppercase transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary;
  const verification = data.verification || { passed: true, mismatches: [] };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 mb-6 text-zinc-200">
      {/* Technical Header & Verification Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-white">
            OPERATIONAL BRIEFING ADVISORY
          </span>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-400">[{reportType}]</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Regulatory Advisory Notice */}
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider">
            AI Advisory · Verify with official report
          </span>

          {/* Verification Pill */}
          {verification.passed ? (
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              VERIFIED: 0 DISCREPANCIES
            </span>
          ) : (
            <button
              onClick={() => setShowMismatches(!showMismatches)}
              className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] tracking-wider flex items-center gap-1 hover:border-zinc-700 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              DISCREPANCY ALERT ({verification.mismatches?.length || 1})
            </button>
          )}
        </div>
      </div>

      {/* Discrepancy details if verification failed */}
      {!verification.passed && showMismatches && (
        <div className="mt-3 p-3 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300">
          <span className="text-zinc-400 uppercase block mb-1">
            Verification Discrepancies:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
            {verification.mismatches.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Narrative */}
      <div className="my-4">
        <p className="text-sm leading-relaxed text-zinc-200 font-sans">
          {summary.summary}
        </p>
      </div>

      {/* Parameter Breakdown */}
      <div className="grid md:grid-cols-3 gap-3 mb-3 font-mono text-xs">
        <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
            Wind Vector
          </span>
          <span className="text-zinc-200">
            {summary.wind_summary || "Unknown"}
          </span>
        </div>

        <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
            Visibility Category
          </span>
          <span className="text-zinc-200">
            {summary.visibility_category || "Unknown"}
          </span>
        </div>

        <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
            Ceiling Category
          </span>
          <span className="text-zinc-200">
            {summary.ceiling_category || "Unknown"}
          </span>
        </div>
      </div>

      {/* Hazards & Gaps */}
      <div className="grid md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 rounded bg-zinc-950/40 border border-zinc-800/60">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1.5">
            Operational Hazards
          </span>
          {summary.hazards && summary.hazards.length > 0 ? (
            <ul className="space-y-1">
              {summary.hazards.map((h, i) => (
                <li key={i} className="text-zinc-300 flex items-center gap-1.5">
                  <span className="text-zinc-500">•</span>
                  {h}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-zinc-400 text-[11px]">
              None flagged in parsed fields.
            </span>
          )}
        </div>

        <div className="p-3 rounded bg-zinc-950/40 border border-zinc-800/60">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1.5">
            Report Data Gaps
          </span>
          {summary.data_gaps && summary.data_gaps.length > 0 ? (
            <ul className="space-y-1">
              {summary.data_gaps.map((g, i) => (
                <li key={i} className="text-zinc-400 flex items-center gap-1.5">
                  <span className="text-zinc-500">•</span>
                  {g}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-zinc-400 text-[11px]">
              Complete observation fields available.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlainEnglishBriefing;
