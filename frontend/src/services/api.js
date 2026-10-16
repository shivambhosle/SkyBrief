import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export const getBriefing = (icao) => {
  return API.get(`/briefing/${icao}`);
};

export const getTaf = (icao) => {
  return API.get(`/taf/${icao}`);
};

export const getBriefingSummary = (icao, reportType = "METAR") => {
  return API.post("/api/briefing/summary", {
    icao,
    report_type: reportType,
  });
};

export default API;