import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex gap-8 mb-8">
      <NavLink to="/">Dashboard</NavLink>

      <NavLink to="/metar">METAR</NavLink>

      <NavLink to="/taf">TAF</NavLink>

      <NavLink to="/route">
        Route Briefing
      </NavLink>
    </nav>
  );
}

export default Navbar;