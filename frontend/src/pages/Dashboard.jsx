import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-5xl md:text-6xl font-bold text-sky-400 mb-6">
          SkyBrief
        </h1>

        <Navbar />

        <div className="max-w-4xl mb-12">

            <p className="text-slate-300 text-xl leading-relaxed">
                SkyBrief is an operational weather
                intelligence platform designed for pilots, dispatchers,
                aviation students and flight planners.
            </p>

            <p className="text-slate-400 mt-4 leading-relaxed">
                The system provides real-time METAR analysis, TAF
                forecast interpretation and route weather assessment
                to support informed flight decision-making.
            </p>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <Link
            to="/metar"
            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-sky-500 transition"
          >
            <h2 className="text-2xl font-bold text-sky-400 mb-3">
              METAR
            </h2>

            <p className="text-slate-400">
              Current airport weather analysis, METAR decoding and operational assessment.
            </p>
          </Link>

          <Link
            to="/taf"
            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-sky-500 transition"
          >
            <h2 className="text-2xl font-bold text-sky-400 mb-3">
              TAF
            </h2>

            <p className="text-slate-400">
              Forecast weather briefing and future flight condition assessment.
            </p>
          </Link>

          <Link
            to="/route"
            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-sky-500 transition"
          >
            <h2 className="text-2xl font-bold text-sky-400 mb-3">
              Route Briefing
            </h2>

            <p className="text-slate-400">
              Departure, destination and route weather evaluation.
            </p>
          </Link>

        </div>

        <div className="mt-16">

            <h2 className="text-3xl font-bold text-sky-400 mb-6">
                Capabilities
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">
                    METAR Decoding
                </h3>

                <p className="text-slate-400">
                    Decode and interpret real-time airport weather
                    reports with operational assessment.
                </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">
                    Forecast Analysis
                </h3>

                <p className="text-slate-400">
                    Analyze forecast weather conditions and identify
                    future operational risks.
                </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">
                    Route Assessment
                </h3>

                <p className="text-slate-400">
                    Evaluate departure and destination weather for
                    flight planning decisions.
                </p>
            </div>

            </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;