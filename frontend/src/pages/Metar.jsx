import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getBriefing } from "../services/api";
import PlainEnglishBriefing from "../components/PlainEnglishBriefing";

function Metar() {
  const [icao, setIcao] = useState("");
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeFetch = async (targetIcao) => {
    const code = (targetIcao || icao).trim().toUpperCase();
    if (!code) {
      setError("Please enter a 4-letter airport ICAO code.");
      setBriefing(null);
      return;
    }

    if (!/^[A-Z]{4}$/.test(code)) {
      setError("ICAO code must contain exactly 4 alphabetic characters.");
      setBriefing(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getBriefing(code);
      setBriefing(res.data);
    } catch (err) {
      console.error(err);
      setBriefing(null);
      if (err.response?.status === 404) {
        setError(`Airport ${code} not found. Please verify the ICAO code.`);
      } else {
        setError("Unable to retrieve weather data from AWC feed. Please retry.");
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

  const weather = briefing?.weather;
  const verdict = briefing?.verdict;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-700 selection:text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Navbar />

        {/* Section Header */}
        <div className="border-b border-zinc-800 pb-6 mb-6">
          <div className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
            Module 01 / Surface Observations
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            METAR Surface Analysis
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time automated airport weather observation decoding and operational flight category synthesis.
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
                placeholder="Enter 4-letter ICAO (e.g. KJFK, EGLL, KORD)"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs uppercase tracking-wider text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-md tracking-wide transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Fetching Report..." : "Inspect METAR"}
            </button>
          </form>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-zinc-900/90 border border-rose-900/60 rounded-lg p-4 mb-6 text-xs font-mono text-rose-300">
            <span className="font-bold text-rose-400 block mb-1">
              OBSERVATION RETRIEVAL ERROR
            </span>
            <p>{error}</p>
          </div>
        )}

        {/* Loaded Data */}
        {weather && (
          <div className="space-y-5">
            {/* Station Header */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase block mb-1">
                  STATION IDENTIFIER
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="font-mono">{weather.icao}</span>
                  <span className="text-base font-normal text-zinc-400">
                    — {weather.airport || "Aerodrome"}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                {weather.flight_category && (
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold tracking-wider ${
                      weather.flight_category === "VFR"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                        : weather.flight_category === "MVFR"
                        ? "bg-blue-950/80 text-blue-400 border border-blue-800/80"
                        : weather.flight_category === "IFR"
                        ? "bg-amber-950/80 text-amber-400 border border-amber-800/80"
                        : "bg-rose-950/80 text-rose-400 border border-rose-800/80"
                    }`}
                  >
                    {weather.flight_category}
                  </span>
                )}
                {weather.observation_time && (
                  <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    OBS: {weather.observation_time}
                  </span>
                )}
              </div>
            </div>

            {/* RAW METAR */}
            <div className="bg-zinc-950 border border-zinc-800/90 rounded-lg p-4 font-mono">
              <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-2 border-b border-zinc-800/60 pb-1.5">
                <span>RAW TELETYPE RECORD</span>
                <span>ORIGIN: AWC</span>
              </div>
              <pre className="text-emerald-400/90 whitespace-pre-wrap text-sm leading-relaxed">
                {weather.raw_metar}
              </pre>
            </div>

            {/* Plain-English Briefing Copilot */}
            <PlainEnglishBriefing icao={weather.icao || icao} reportType="METAR" />

            {/* Decoded Telemetry Grid */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
              <h3 className="font-mono text-xs tracking-wider text-zinc-400 uppercase mb-4 border-b border-zinc-800 pb-2">
                Decoded Surface Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono">
                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 uppercase block mb-1">Wind Vector</span>
                  <p className="text-base font-bold text-zinc-100">
                    {weather.wind_dir_deg !== null ? `${weather.wind_dir_deg}°` : "VRB"} / {weather.wind_speed_kt} kt
                  </p>
                </div>

                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 uppercase block mb-1">Visibility</span>
                  <p className="text-base font-bold text-zinc-100">
                    {weather.visibility_km !== null ? `${weather.visibility_km} km` : "Unknown"}
                  </p>
                </div>

                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 uppercase block mb-1">Temperature / DP</span>
                  <p className="text-base font-bold text-zinc-100">
                    {weather.temperature_c}°C / {weather.dewpoint_c}°C
                  </p>
                </div>

                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 uppercase block mb-1">Altimeter (QNH)</span>
                  <p className="text-base font-bold text-zinc-100">
                    {weather.pressure_hpa ? `${weather.pressure_hpa} hPa` : "Standard"}
                  </p>
                </div>

                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 uppercase block mb-1">Ceiling Base</span>
                  <p className="text-base font-bold text-zinc-100">
                    {weather.ceiling_ft ? `${weather.ceiling_ft} ft` : "Clear / None"}
                  </p>
                </div>
              </div>

              {/* Cloud Layer Detail */}
              {weather.cloud_layers && weather.cloud_layers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center gap-2 font-mono text-xs">
                  <span className="text-zinc-400 text-[11px] uppercase">Reported Cloud Layers:</span>
                  <div className="flex gap-2">
                    {weather.cloud_layers.map((l, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Operational Decision */}
            {verdict && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="font-mono text-xs tracking-wider text-zinc-400 uppercase">
                    Rule-Based Operational Decision
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold tracking-wider font-mono ${
                        verdict.verdict === "GO"
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
                          : verdict.verdict === "CAUTION"
                          ? "bg-amber-950/90 text-amber-300 border border-amber-800"
                          : "bg-rose-950/90 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {verdict.verdict}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Risk Level: <strong className="text-white">{verdict.risk_level}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-zinc-400 font-mono text-[11px] uppercase block mb-1">
                    Operational Assessment Factors:
                  </span>
                  {verdict.reasons && verdict.reasons.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-zinc-300 font-mono">
                      {verdict.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-400 font-mono">
                      No operational concerns detected for nominal VFR flight operations.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Metar;