import { useState } from "react";
import Navbar from "../components/Navbar";
import { getBriefing } from "../services/api";
import PlainEnglishBriefing from "../components/PlainEnglishBriefing";

function Metar() {
  const [icao, setIcao] = useState("");
  const [briefing, setBriefing] = useState(null);
  const [error, setError] = useState("");

  const fetchBriefing = async () => {

    if (!icao) {
      setError("Please enter an ICAO code.");
      setBriefing(null);
      return;
    }

    if (!/^[A-Z]{4}$/.test(icao)) {
      setError("ICAO code must contain exactly 4 letters.");
      setBriefing(null);
      return;
    }

    try {

      setError("");

      const res = await getBriefing(icao);

      setBriefing(res.data);

    } catch (err) {

      console.error(err);

      setBriefing(null);

      if (err.response?.status === 404) {

        setError("Airport not found. Please enter a valid ICAO code.");

      } else {

        setError("Unable to fetch weather data. Please try again.");

      }

    }

  };

  const weather = briefing?.weather;
  const verdict = briefing?.verdict;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <h1 className="text-5xl font-bold text-sky-400 mb-6">
          METAR Analysis
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
              onClick={fetchBriefing}
              className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg font-semibold"
            >
              Analyze METAR
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
        {weather && (

          <>

            {/* AIRPORT HEADER */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">

              <h2 className="text-3xl font-bold text-sky-300">
                {weather.airport}
              </h2>

              <p className="text-slate-400 mt-2">
                ICAO: {weather.icao}
              </p>

            </div>

            {/* RAW METAR */}

            <div className="bg-black border border-slate-700 rounded-xl p-4 mb-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-3">
                RAW METAR
              </h3>

              <pre className="text-green-400 font-mono whitespace-pre-wrap text-lg">
                {weather.raw_metar}
              </pre>

            </div>

            {/* PLAIN-ENGLISH BRIEFING */}
            <PlainEnglishBriefing icao={weather.icao || icao} reportType="METAR" />

            {/* DECODED WEATHER */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-5">
                DECODED WEATHER BRIEFING
              </h3>

              <div className="grid md:grid-cols-5 gap-4">

                <div>
                  <p className="text-slate-500 text-sm">Temperature</p>
                  <p className="text-amber-300 font-semibold text-lg">
                    {weather.temperature_c} °C
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Dewpoint</p>
                  <p className="text-amber-300 font-semibold text-lg">
                    {weather.dewpoint_c} °C
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Wind</p>
                  <p className="text-amber-300 font-semibold text-lg">
                    {weather.wind_dir_deg}° / {weather.wind_speed_kt} kt
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Visibility</p>
                  <p className="text-amber-300 font-semibold text-lg">
                    {weather.visibility_km} km
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Flight Category</p>
                  <p className="text-amber-300 font-semibold text-lg">
                    {weather.flight_category}
                  </p>
                </div>

              </div>

            </div>

            {/* ADDITIONAL INFORMATION */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-5">
                ADDITIONAL INFORMATION
              </h3>

              <div className="grid md:grid-cols-4 gap-4">

                <div>
                  <p className="text-slate-500 text-sm">Observation Time</p>
                  <p className="text-white">
                    {weather.observation_time}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Pressure (QNH)</p>
                  <p className="text-white">
                    {weather.pressure_hpa} hPa
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Airport Elevation</p>
                  <p className="text-white">
                    {weather.airport_elevation_ft} ft
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Cloud Layers</p>

                  {weather.cloud_layers?.length ? (

                    <ul className="text-white list-disc list-inside">

                      {weather.cloud_layers.map((layer, index) => (
                        <li key={index}>{layer}</li>
                      ))}

                    </ul>

                  ) : (

                    <p className="text-white">
                      None
                    </p>

                  )}

                </div>

              </div>

            </div>

            {/* OPERATIONAL DECISION */}

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">

              <h3 className="text-sky-300 text-lg font-semibold mb-4">
                OPERATIONAL DECISION
              </h3>

              <div className="flex items-center gap-4 mb-5">

                <span
                  className={`inline-block px-6 py-2 rounded-lg text-lg font-bold
                  ${
                    verdict.verdict === "GO"
                      ? "bg-green-600"
                      : verdict.verdict === "CAUTION"
                      ? "bg-yellow-500 text-black"
                      : "bg-red-600"
                  }`}
                >
                  {verdict.verdict}
                </span>

                <span className="text-slate-300">
                  Risk Level:
                  <span className="font-semibold text-white ml-2">
                    {verdict.risk_level}
                  </span>
                </span>

              </div>

              <div>

                <h4 className="text-slate-300 mb-2">
                  Reasons
                </h4>

                {verdict.reasons.length > 0 ? (

                  <ul className="list-disc list-inside text-red-300 space-y-1">

                    {verdict.reasons.map((reason, index) => (
                      <li key={index}>
                        {reason}
                      </li>
                    ))}

                  </ul>

                ) : (

                  <p className="text-green-400">
                    No operational concerns detected.
                  </p>

                )}

              </div>

            </div>

          </>

        )}

      </div>
    </div>
  );
}

export default Metar;