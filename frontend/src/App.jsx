import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Metar from "./pages/Metar";
import Taf from "./pages/Taf";
import RouteBriefing from "./pages/RouteBriefing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/metar"
          element={<Metar />}
        />

        <Route
          path="/taf"
          element={<Taf />}
        />

        <Route
          path="/route"
          element={<RouteBriefing />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;