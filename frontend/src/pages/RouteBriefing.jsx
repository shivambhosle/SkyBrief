import { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

function RouteBriefing() {

  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState("");

  const fetchRoute = async () => {

  if (!departure || !destination) {
    setError("Please enter both departure and destination ICAO codes.");
    setRouteData(null);
    return;
  }

  if (!/^[A-Z]{4}$/.test(departure) || !/^[A-Z]{4}$/.test(destination)) {
    setError("ICAO codes must contain exactly 4 letters.");
    setRouteData(null);
    return;
  }

  try {

    setError("");

    const res = await API.get(
      `/route/${departure}/${destination}`
    );

    setRouteData(res.data);

  } 
  catch (err) {

  console.error(err);

  setRouteData(null);

  if (err.response?.status === 404) {

    setError("Invalid ICAO code. Please enter a valid airport ICAO.");

  } else if (err.response?.status === 400) {

    setError(err.response.data.detail);

  } else {

    setError("Unable to fetch route briefing. Please try again.");

  }
}

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

        {/* Route Search */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              maxLength={4}
              value={departure}
              onChange={(e) => setDeparture(e.target.value.toUpperCase())}
              placeholder="Departure ICAO (e.g. KJFK)"
              className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs uppercase tracking-wider text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition"
            />

            <input
              maxLength={4}
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              placeholder="Destination ICAO (e.g. KORD)"
              className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs uppercase tracking-wider text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition"
            />

            <button
              onClick={fetchRoute}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-md tracking-wide transition shadow-sm"
            >
              Evaluate Corridor
            </button>
          </div>
        </div>
        {error && (

          <div className="bg-red-900/30 border border-red-600 rounded-xl p-4 mb-4">

            <h3 className="text-red-400 font-semibold">
              Error
            </h3>

            <p className="text-red-200 mt-1">
              {error}
            </p>

          </div>

        )}
        {routeData && (

          <>

            {/* ROUTE OVERVIEW */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-5">

                ROUTE OVERVIEW

              </h3>

              <div className="grid md:grid-cols-3 items-center">

                <div>

                  <h2 className="text-3xl font-bold text-sky-300">

                    {routeData.departure.airport}

                  </h2>

                  <p className="text-slate-400">

                    {routeData.route.departure}

                  </p>

                </div>

                <div className="text-center">

                  <div className="text-5xl text-sky-400">

                    →

                  </div>

                  <p className="text-slate-400 mt-2">

                    Route Type

                  </p>

                  <p className="text-amber-300 font-semibold">

                    {routeData.route.type}

                  </p>

                </div>

                <div className="text-right">

                  <h2 className="text-3xl font-bold text-sky-300">

                    {routeData.destination.airport}

                  </h2>

                  <p className="text-slate-400">

                    {routeData.route.destination}

                  </p>

                </div>

              </div>

            </div>

            {/* WEATHER COMPARISON */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-5">

                WEATHER COMPARISON

              </h3>

              <div className="grid md:grid-cols-2 gap-8">

                {/* Departure */}

                <div>

                  <h4 className="text-xl font-bold text-sky-300 mb-5">

                    Departure

                  </h4>

                  <div className="grid grid-cols-2 gap-y-5">

                    <div>

                      <p className="text-slate-500 text-sm">

                        Temperature

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.departure.temperature_c} °C

                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500 text-sm">

                        Wind

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.departure.wind_dir_deg}° /
                        {" "}
                        {routeData.departure.wind_speed_kt} kt

                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500 text-sm">

                        Visibility

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.departure.visibility_km} km

                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500 text-sm">

                        Flight Category

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.departure.flight_category}

                      </p>

                    </div>

                  </div>

                </div>

                {/* Destination */}

                <div>

                  <h4 className="text-xl font-bold text-sky-300 mb-5">

                    Destination

                  </h4>

                  <div className="grid grid-cols-2 gap-y-5">

                    <div>

                      <p className="text-slate-500 text-sm">

                        Temperature

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.destination.temperature_c} °C

                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500 text-sm">

                        Wind

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.destination.wind_dir_deg}° /
                        {" "}
                        {routeData.destination.wind_speed_kt} kt

                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500 text-sm">

                        Visibility

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.destination.visibility_km} km

                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500 text-sm">

                        Flight Category

                      </p>

                      <p className="text-amber-300 text-lg font-semibold">

                        {routeData.destination.flight_category}

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>            
            
            {/* ROUTE DECISION */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">

              <h3 className="text-sky-300 text-lg font-semibold mb-5">

                OPERATIONAL DECISION

              </h3>

              <div className="flex items-center gap-5 mb-6">

                <span
                  className={`inline-block px-8 py-3 rounded-lg text-xl font-bold
                  ${
                    routeData.decision.verdict === "GO"
                      ? "bg-green-600"
                      : routeData.decision.verdict === "CAUTION"
                      ? "bg-yellow-500 text-black"
                      : "bg-red-600"
                  }`}
                >

                  {routeData.decision.verdict}

                </span>

                <div>

                  <p className="text-slate-400">

                    Risk Level

                  </p>

                  <p className="text-xl font-semibold">

                    {routeData.decision.risk_level}

                  </p>

                </div>

              </div>

              <div className="grid md:grid-cols-2 gap-8">

                <div>

                  <p className="text-slate-400 mb-2">

                    Route

                  </p>

                  <p className="text-amber-300 text-2xl font-semibold">

                    {routeData.route.route_name}

                  </p>

                </div>

                <div>

                  <p className="text-slate-400 mb-2">

                    Reasons

                  </p>

                  <ul className="list-disc ml-5 space-y-2 text-red-300">

                    {routeData.decision.reasons.map((reason, index) => (

                      <li key={index}>

                        {reason}

                      </li>

                    ))}

                  </ul>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

    </div>

  );

}

export default RouteBriefing;