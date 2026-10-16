import WorldMap from "./layers/WorldMap";
import RadarGrid from "./layers/RadarGrid";
import FlightRoutes from "./layers/FlightRoutes";
import Aircraft from "./layers/Aircraft";
import AirportPulse from "./layers/AirportPulse";

export default function Scene() {
  return (
    <svg
      className="scene"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
    >
      <WorldMap />

      <RadarGrid />

      <FlightRoutes />

      <Aircraft />

      <AirportPulse />
    </svg>
  );
}