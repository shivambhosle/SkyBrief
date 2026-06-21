import { useState } from "react";

function SearchBar({ onSearch }) {
  const [icao, setIcao] = useState("");

  return (
    <div>
      <input
        value={icao}
        onChange={(e) => setIcao(e.target.value.toUpperCase())}
        placeholder="Enter ICAO (e.g. VABB)"
      />

      <button onClick={() => onSearch(icao)}>
        Get Briefing
      </button>
    </div>
  );
}

export default SearchBar;