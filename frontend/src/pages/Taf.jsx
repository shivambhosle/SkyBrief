import { useState } from "react";
import Navbar from "../components/Navbar";
import { getTaf } from "../services/api";

function Taf() {
  const [icao, setIcao] = useState("");
  const [taf, setTaf] = useState(null);
  const [error, setError] = useState("");

  const fetchTaf = async () => {

  if (!icao) {
    setError("Please enter an ICAO code.");
    setTaf(null);
    return;
  }

  if (!/^[A-Z]{4}$/.test(icao)) {
    setError("ICAO code must contain exactly 4 letters.");
    setTaf(null);
    return;
  }

  try {

    setError("");

    const res = await getTaf(icao);

    setTaf(res.data);

  } catch (err) {

    console.error(err);

    setTaf(null);

    if (err.response?.status === 404) {

      setError("Airport not found. Please enter a valid ICAO code.");

    } else {

      setError("Unable to fetch forecast data. Please try again.");

    }

  }

};

  const forecast = taf?.forecast;
  const analysis = taf?.analysis;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <h1 className="text-5xl font-bold text-sky-400 mb-6">
          TAF Analysis
        </h1>

        <Navbar />

        {/* ICAO SEARCH */}

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-4">

          <h2 className="text-xl mb-3">
            ICAO Search
          </h2>

          <div className="flex gap-3">

            <input
              value={icao}
              onChange={(e) => setIcao(e.target.value.toUpperCase())}
              placeholder="Enter ICAO (VABB)"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3"
            />

            <button
              onClick={fetchTaf}
              className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg font-semibold"
            >
              Analyze TAF
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
        {forecast && (

          <>

            {/* AIRPORT INFORMATION */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">

              <h2 className="text-3xl font-bold text-sky-300">
                {forecast.airport}
              </h2>

              <p className="text-slate-400 mt-2">
                ICAO: {forecast.icao}
              </p>

            </div>

            {/* RAW TAF */}

            <div className="bg-black border border-slate-700 rounded-xl p-4 mb-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-3">
                RAW TAF
              </h3>

              <pre className="text-green-400 font-mono whitespace-pre-wrap text-lg">
                {forecast.raw_taf}
              </pre>

            </div>

            {/* FORECAST SUMMARY */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-5">
                FORECAST SUMMARY
              </h3>

              <div className="grid md:grid-cols-4 gap-4">

                <div>
                  <p className="text-slate-500 text-sm">
                    Issue Time
                  </p>

                  <p className="text-white">
                    {forecast.issue_time}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">
                    Valid From
                  </p>

                  <p className="text-white">
                    {forecast.valid_from}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">
                    Valid To
                  </p>

                  <p className="text-white">
                    {forecast.valid_to}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">
                    Airport Elevation
                  </p>

                  <p className="text-white">
                    {forecast.airport_elevation_ft} ft
                  </p>
                </div>

              </div>

            </div>

            {/* FORECAST TIMELINE */}

            <div className="space-y-4">

              <h3 className="text-sky-300 text-xl font-semibold">
                FORECAST TIMELINE
              </h3>

              {forecast.forecast_periods.map((period, index) => (

                <div
                  key={index}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-5"
                >

                  <div className="flex justify-between items-center mb-5">

                    <h4 className="text-2xl font-bold text-sky-300">
                      {period.type}
                    </h4>

                    <span
                      className={`px-5 py-2 rounded-lg font-bold
                      ${
                        analysis.forecast_summary[index].verdict === "GO"
                          ? "bg-green-600"
                          : analysis.forecast_summary[index].verdict === "CAUTION"
                          ? "bg-yellow-500 text-black"
                          : "bg-red-600"
                      }`}
                    >
                      {analysis.forecast_summary[index].verdict}
                    </span>

                  </div>

                  <div className="grid md:grid-cols-2 gap-y-5 gap-x-10">

                    <div>
                      <p className="text-slate-500 text-sm">
                        Forecast Period
                      </p>

                      <p className="text-white">
                        {period.from}
                      </p>

                      <p className="text-white">
                        to
                      </p>

                      <p className="text-white">
                        {period.to}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Wind
                      </p>

                      <p className="text-amber-300 font-semibold text-lg">
                        {period.wind_dir_deg}° / {period.wind_speed_kt} kt
                        {period.wind_gust_kt &&
                          ` (G ${period.wind_gust_kt} kt)`}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Visibility
                      </p>

                      <p className="text-amber-300 font-semibold text-lg">
                        {period.visibility_km} km
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Weather
                      </p>

                      <p className="text-amber-300 font-semibold text-lg">
                        {period.weather || "Nil Significant Weather"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Cloud Layers
                      </p>

                      <div className="text-white space-y-1">

                        {period.clouds.length > 0 ? (
                          period.clouds.map((cloud, i) => (
                            <div key={i}>
                              {cloud}
                            </div>
                          ))
                        ) : (
                          <div>None</div>
                        )}

                      </div>

                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Reasons
                      </p>

                      <div className="text-red-300 space-y-1">

                        {analysis.forecast_summary[index].reasons.length > 0 ? (
                          analysis.forecast_summary[index].reasons.map(
                            (reason, i) => (
                              <div key={i}>
                                • {reason}
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-green-400">
                            No operational concerns
                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))}            </div>

            {/* OPERATIONAL DECISION */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mt-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-4">
                OPERATIONAL DECISION
              </h3>

              <div className="flex items-center gap-4 mb-5">

                <span
                  className={`inline-block px-6 py-2 rounded-lg text-lg font-bold
                  ${
                    analysis.overall_verdict === "GO"
                      ? "bg-green-600"
                      : analysis.overall_verdict === "CAUTION"
                      ? "bg-yellow-500 text-black"
                      : "bg-red-600"
                  }`}
                >
                  {analysis.overall_verdict}
                </span>

                <span className="text-slate-300">
                  Risk Level:
                  <span className="font-semibold text-white ml-2">
                    {analysis.risk_level}
                  </span>
                </span>

              </div>

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <p className="text-slate-500 text-sm mb-2">
                    Worst Forecast Period
                  </p>

                  <p className="text-xl font-semibold text-amber-300">
                    {analysis.worst_period}
                  </p>

                </div>

                <div>

                  <p className="text-slate-500 text-sm mb-2">
                    Forecast Summary
                  </p>

                  <p className="text-slate-300">
                    This operational decision is based on all forecast
                    periods contained in the issued TAF.
                  </p>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

    </div>

  );

}

export default Taf;