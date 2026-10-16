import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getTaf } from "../services/api";
import PlainEnglishBriefing from "../components/PlainEnglishBriefing";

function Taf() {
  const [icao, setIcao] = useState("");
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeFetch = async (targetIcao) => {
    const code = (targetIcao || icao).trim().toUpperCase();
    if (!code) {
      setError("Please enter a 4-letter airport ICAO code.");
      setTaf(null);
      return;
    }

    if (!/^[A-Z]{4}$/.test(code)) {
      setError("ICAO code must contain exactly 4 alphabetic characters.");
      setTaf(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getTaf(code);
      setTaf(res.data);
    } catch (err) {
      console.error(err);
      setTaf(null);
      if (err.response?.status === 404) {
        setError(`Airport ${code} not found or no TAF issued.`);
      } else {
        setError("Unable to retrieve forecast data from AWC feed. Please retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialIcao = params.get("icao");
    if (initialIcao && /^[A-Za-z]{4}$/.test(initialIcao)) {
      const clean = initialIcao.toUpperCase();
      setIcao(clean);
      executeFetch(clean);
    }
  }, []);

  const forecast = taf?.forecast;
  const analysis = taf?.analysis;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-700 selection:text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Navbar />

        {/* Section Header */}
        <div className="border-b border-zinc-800 pb-6 mb-6">
          <div className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
            Module 02 / Terminal Aerodrome Forecast
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            TAF Trend Analysis
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            24-to-30-hour aerodrome weather projections, tempo groups, and atmospheric change sequences.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeFetch();
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                maxLength={4}
                value={icao}
                onChange={(e) => setIcao(e.target.value.toUpperCase())}
                placeholder="Enter 4-letter ICAO (e.g. KJFK, EGLL, EDDF)"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs uppercase tracking-wider text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-md tracking-wide transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Fetching Forecast..." : "Inspect TAF"}
            </button>
          </form>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-zinc-900/90 border border-rose-900/60 rounded-lg p-4 mb-6 text-xs font-mono text-rose-300">
            <span className="font-bold text-rose-400 block mb-1">
              FORECAST RETRIEVAL NOTICE
            </span>
            <p>{error}</p>
          </div>
        )}

        {/* Forecast Content */}
        {forecast && (
          <div className="space-y-5">
            {/* Aerodrome Overview Header */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4 font-mono">
              <div>
                <span className="text-[10px] tracking-widest text-zinc-400 uppercase block mb-1">
                  AERODROME TERMINAL
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span>{forecast.icao}</span>
                  <span className="text-base font-normal text-zinc-400">
                    — {forecast.airport || "Terminal"}
                  </span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  ISSUED: {forecast.issue_time || "N/A"}
                </span>
                <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  VALID: {forecast.valid_from} → {forecast.valid_to}
                </span>
              </div>
            </div>

            {/* RAW TAF Teletype */}
            <div className="bg-zinc-950 border border-zinc-800/90 rounded-lg p-4 font-mono">
              <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-2 border-b border-zinc-800/60 pb-1.5">
                <span>RAW TELETYPE RECORD</span>
                <span>ORIGIN: AWC TAF FEED</span>
              </div>
              <pre className="text-emerald-400/90 whitespace-pre-wrap text-sm leading-relaxed">
                {forecast.raw_taf}
              </pre>
            </div>

            {/* Plain-English Advisory Summary */}
            <PlainEnglishBriefing icao={forecast.icao || icao} reportType="TAF" />

            {/* Overall Operational Assessment */}
            {analysis && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="font-mono text-xs tracking-wider text-zinc-400 uppercase">
                    TAF Period Risk Analysis
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold tracking-wider font-mono ${
                        analysis.overall_verdict === "GO"
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
                          : analysis.overall_verdict === "CAUTION"
                          ? "bg-amber-950/90 text-amber-300 border border-amber-800"
                          : "bg-rose-950/90 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {analysis.overall_verdict}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Peak Risk: <strong className="text-white">{analysis.risk_level}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3 rounded bg-zinc-950/50 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block mb-1">
                      Worst Forecast Period
                    </span>
                    <p className="text-zinc-200 font-bold">{analysis.worst_period}</p>
                  </div>
                  <div className="p-3 rounded bg-zinc-950/50 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block mb-1">
                      Assessment Basis
                    </span>
                    <p className="text-zinc-400 text-[11px]">
                      Operational verdict evaluated across all issued trend intervals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Forecast Periods Timeline */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs tracking-wider text-zinc-400 uppercase pb-1">
                Forecast Periods Breakdown ({forecast.forecast_periods?.length || 0} Groups)
              </h3>

              {forecast.forecast_periods?.map((period, index) => {
                const periodVerdict = analysis?.forecast_summary?.[index]?.verdict;
                return (
                  <div
                    key={index}
                    className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-4 font-mono"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wider">
                          [{period.type}]
                        </span>
                        <span className="text-xs text-zinc-400">
                          {period.from} → {period.to}
                        </span>
                      </div>

                      {periodVerdict && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                            periodVerdict === "GO"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : periodVerdict === "CAUTION"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                              : "bg-rose-950/80 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {periodVerdict}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                      <div className="p-2.5 rounded bg-zinc-950/50 border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 uppercase block">Wind</span>
                        <span className="text-zinc-200">
                          {period.wind_dir_deg !== null ? `${period.wind_dir_deg}°` : "VRB"} / {period.wind_speed_kt} kt
                          {period.wind_gust_kt ? ` G${period.wind_gust_kt}kt` : ""}
                        </span>
                      </div>

                      <div className="p-2.5 rounded bg-zinc-950/50 border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 uppercase block">Visibility</span>
                        <span className="text-zinc-200">
                          {period.visibility_km !== null ? `${period.visibility_km} km` : "Unspecified"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded bg-zinc-950/50 border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 uppercase block">Weather</span>
                        <span className="text-zinc-200">{period.weather || "NSW"}</span>
                      </div>

                      <div className="p-2.5 rounded bg-zinc-950/50 border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 uppercase block">Clouds</span>
                        <span className="text-zinc-200">
                          {period.clouds?.length ? period.clouds.join(", ") : "Clear / NSC"}
                        </span>
                      </div>
                    </div>

                    {/* Operational Reasons if any */}
                    {analysis?.forecast_summary?.[index]?.reasons?.length > 0 && (
                      <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-2">
                        <span className="text-zinc-400 uppercase">Hazards:</span>
                        <span>{analysis.forecast_summary[index].reasons.join(" • ")}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Taf;