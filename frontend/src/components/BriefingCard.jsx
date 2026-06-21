import VerdictBadge from "./VerdictBadge";

function BriefingCard({ data }) {
  if (!data) return null;

  const weather = data.weather;

  return (
    <div
      style={{
        marginTop: "20px",
        border: "1px solid #333",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <h2>{weather.airport}</h2>

      <p>ICAO: {weather.icao}</p>

      <p>Temperature: {weather.temperature_c}°C</p>

      <p>
        Wind: {weather.wind_dir_deg}° @ {weather.wind_speed_kt} kt
      </p>

      <p>Visibility: {weather.visibility_km} km</p>

      <p>Flight Category: {weather.flight_category}</p>

      <VerdictBadge verdict={data.verdict.verdict} />
    </div>
  );
}

export default BriefingCard;