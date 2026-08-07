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

    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto px-6 py-8">

        <h1 className="text-5xl font-bold text-sky-400 mb-6">
          Route Briefing
        </h1>

        <Navbar />

        {/* SEARCH */}

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-4">

          <h2 className="text-xl mb-4">
            Route Search
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              value={departure}
              onChange={(e) => setDeparture(e.target.value.toUpperCase())}
              placeholder="Departure ICAO"
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3"
            />

            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              placeholder="Destination ICAO"
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3"
            />

            <button
              onClick={fetchRoute}
              className="bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold"
            >
              Analyze Route
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