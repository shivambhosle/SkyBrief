import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  const [zuluTime, setZuluTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      setZuluTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItemClass = ({ isActive }) =>
    `px-4 py-1.5 text-xs font-medium tracking-wide transition-colors rounded-md ${
      isActive
        ? "bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-inner"
        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
    }`;

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm mb-8 -mx-6 px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-base font-bold tracking-wider text-zinc-100 group-hover:text-white">
              SKYBRIEF
            </span>
            <span className="font-mono text-[10px] tracking-widest text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              DISPATCH
            </span>
          </NavLink>
        </div>

        {/* Segmented Navigation Controls */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-lg">
          <NavLink to="/" className={navItemClass}>
            Dashboard
          </NavLink>
          <NavLink to="/metar" className={navItemClass}>
            METAR
          </NavLink>
          <NavLink to="/taf" className={navItemClass}>
            TAF
          </NavLink>
          <NavLink to="/route" className={navItemClass}>
            Route Briefing
          </NavLink>
        </nav>

        {/* Live Flight Deck Telemetry & Zulu Clock */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-zinc-400">AWC FEED</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs tracking-wider">
            {zuluTime || "--:--:-- UTC"}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;