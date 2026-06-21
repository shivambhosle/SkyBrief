import { useState } from "react";
import { getBriefing } from "./services/api";

import SearchBar from "./components/SearchBar";
import BriefingCard from "./components/BriefingCard";

function App() {
  const [briefing, setBriefing] = useState(null);

  const fetchBriefing = async (icao) => {
    try {
      const res = await getBriefing(icao);

      setBriefing(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>✈ Aviation Weather Briefing System</h1>

      <SearchBar onSearch={fetchBriefing} />

      <BriefingCard data={briefing} />
    </div>
  );
}

export default App;