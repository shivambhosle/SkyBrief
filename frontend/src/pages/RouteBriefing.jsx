import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

function RouteBriefing() {
  const [searchParams] = useSearchParams();
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeRouteQuery = async (depCode, destCode) => {
    const dep = depCode.trim().toUpperCase();
    const dest = destCode.trim().toUpperCase();

    if (!dep || !dest) {
      setError("Please enter both departure and destination ICAO codes.");
      setRouteData(null);
      return;
    }

    if (!/^[A-Z]{4}$/.test(dep) || !/^[A-Z]{4}$/.test(dest)) {
      setError("ICAO codes must contain exactly 4 letters (e.g. VIDP, VABB).");
      setRouteData(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/route/${dep}/${dest}`);
      setRouteData(res.data);
    } catch (err) {
      console.error(err);
      setRouteData(null);
      if (err.response?.status === 404) {
        setError("Aerodrome observation not found for specified ICAO code(s).");
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || "Invalid route corridor parameters.");
      } else {
        setError("Unable to retrieve route weather briefing. Check network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const depParam = searchParams.get("dep") || searchParams.get("departure");
    const destParam = searchParams.get("dest") || searchParams.get("destination");
    if (depParam && destParam) {
      setDeparture(depParam.toUpperCase());
      setDestination(destParam.toUpperCase());
      executeRouteQuery(depParam, destParam);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeRouteQuery(departure, destination);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-700 selection:text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Navbar />

        {/* Section Header */}
        <div className="border-b border-zinc-800 pb-6 mb-6">
          <div className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
            Module 03 / En-Route Corridor Analysis
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Route Weather Briefing
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Comparative departure and destination atmospheric evaluation and cross-country risk synthesis.
          </p>
        </div>

        {/* Route Search Form */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 mb-6">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-7 gap-3">
            <div className="md:col-span-3">
              <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                Departure Aerodrome (ICAO)
              </label>
              <input
                maxLength={4}
                value={departure}
                onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                placeholder="e.g. VIDP"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs uppercase tracking-wider text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>

            <div className="md:col-span-3">
              <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                Destination Aerodrome (ICAO)
              </label>
              <input
                maxLength={4}
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                placeholder="e.g. VABB"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs uppercase tracking-wider text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-md tracking-wide transition shadow-sm disabled:opacity-50"
              >
                {loading ? "EVALUATING..." : "ANALYZE"}
              </button>
            </div>
          </form>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-zinc-900/90 border border-rose-900/60 rounded-lg p-4 mb-6 text-xs font-mono text-rose-300">
            <span className="font-bold text-rose-400 block mb-1">
              CORRIDOR ANALYSIS ERROR
            </span>
            <p>{error}</p>
          </div>
        )}

        {/* Route Data Display */}
        {routeData && (
          <div className="space-y-6">
            {/* Route Overview Header */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  FLIGHT CORRIDOR DISPATCH SUMMARY
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700/80 text-zinc-300 uppercase tracking-wider">
                  {routeData.route?.type || "Standard"} Route
                </span>
              </div>

              <div className="grid md:grid-cols-3 items-center gap-6 pt-5">
                <div>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                    DEPARTURE ORIGIN
                  </span>
                  <div className="font-mono text-2xl font-bold text-white tracking-tight">
                    {routeData.route?.departure}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 truncate">
                    {routeData.departure?.airport || "Aerodrome"}
                  </div>
                </div>

                <div className="text-center flex flex-col items-center justify-center">
                  <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider mb-1">
                    TRANSIT VECTOR
                  </div>
                  <div className="font-mono text-lg text-zinc-300 font-semibold tracking-wider flex items-center gap-3">
                    <span>{routeData.route?.departure}</span>
                    <span className="text-zinc-600">─────►</span>
                    <span>{routeData.route?.destination}</span>
                  </div>
                </div>

                <div className="md:text-right">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                    DESTINATION ARRIVAL
                  </span>
                  <div className="font-mono text-2xl font-bold text-white tracking-tight">
                    {routeData.route?.destination}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 truncate">
                    {routeData.destination?.airport || "Aerodrome"}
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Atmospheric Comparison */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-5">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  ATMOSPHERIC METRIC COMPARISON
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  GROUND TRUTH TELEMETRY
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Departure Card */}
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-md p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
                    <span className="font-mono text-xs font-bold text-white">
                      DEP: {routeData.route?.departure}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        routeData.departure?.flight_category === "VFR"
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                          : routeData.departure?.flight_category === "MVFR"
                          ? "bg-blue-950/80 text-blue-400 border-blue-800/80"
                          : routeData.departure?.flight_category === "IFR"
                          ? "bg-amber-950/80 text-amber-400 border-amber-800/80"
                          : "bg-rose-950/80 text-rose-400 border-rose-800/80"
                      }`}
                    >
                      {routeData.departure?.flight_category || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        TEMPERATURE
                      </span>
                      <span className="text-zinc-100 font-bold">
                        {routeData.departure?.temperature_c != null
                          ? `${routeData.departure.temperature_c} °C`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        SURFACE WIND
                      </span>
                      <span className="text-zinc-100 font-bold">
                        {routeData.departure?.wind_dir_deg != null
                          ? `${routeData.departure.wind_dir_deg}° / ${routeData.departure?.wind_speed_kt ?? 0} kt`
                          : "CALM"}
                      </span>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        VISIBILITY
                      </span>
                      <span className="text-zinc-100 font-bold">
                        {routeData.departure?.visibility_km != null
                          ? `${routeData.departure.visibility_km} km`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        CATEGORY MINIMA
                      </span>
                      <span className="text-zinc-300">
                        {routeData.departure?.flight_category || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Destination Card */}
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-md p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
                    <span className="font-mono text-xs font-bold text-white">
                      DEST: {routeData.route?.destination}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        routeData.destination?.flight_category === "VFR"
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                          : routeData.destination?.flight_category === "MVFR"
                          ? "bg-blue-950/80 text-blue-400 border-blue-800/80"
                          : routeData.destination?.flight_category === "IFR"
                          ? "bg-amber-950/80 text-amber-400 border-amber-800/80"
                          : "bg-rose-950/80 text-rose-400 border-rose-800/80"
                      }`}
                    >
                      {routeData.destination?.flight_category || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        TEMPERATURE
                      </span>
                      <span className="text-zinc-100 font-bold">
                        {routeData.destination?.temperature_c != null
                          ? `${routeData.destination.temperature_c} °C`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        SURFACE WIND
                      </span>
                      <span className="text-zinc-100 font-bold">
                        {routeData.destination?.wind_dir_deg != null
                          ? `${routeData.destination.wind_dir_deg}° / ${routeData.destination?.wind_speed_kt ?? 0} kt`
                          : "CALM"}
                      </span>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        VISIBILITY
                      </span>
                      <span className="text-zinc-100 font-bold">
                        {routeData.destination?.visibility_km != null
                          ? `${routeData.destination.visibility_km} km`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">
                        CATEGORY MINIMA
                      </span>
                      <span className="text-zinc-300">
                        {routeData.destination?.flight_category || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Decision */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-5">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  OPERATIONAL DISPATCH ASSESSMENT
                </span>
                <span className="font-mono text-[10px] text-zinc-400 uppercase">
                  ROUTE: {routeData.route?.route_name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-5">
                <span
                  className={`font-mono text-sm px-4 py-2 rounded border font-bold tracking-wider ${
                    routeData.decision?.verdict === "GO"
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                      : routeData.decision?.verdict === "CAUTION"
                      ? "bg-amber-950/80 text-amber-400 border-amber-800/80"
                      : "bg-rose-950/80 text-rose-400 border-rose-800/80"
                  }`}
                >
                  [{routeData.decision?.verdict || "UNKNOWN"}]
                </span>

                <div className="font-mono text-xs">
                  <span className="text-zinc-400 text-[10px] uppercase block mb-0.5">
                    CALCULATED RISK LEVEL
                  </span>
                  <span className="font-semibold text-zinc-100">
                    {routeData.decision?.risk_level || "Standard"}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-2">
                  DISPATCH DETERMINATION FACTORS
                </span>
                <ul className="space-y-1.5 font-mono text-xs">
                  {routeData.decision?.reasons?.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-zinc-500">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteBriefing;