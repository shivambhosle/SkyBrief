import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getBriefing = (icao) => {
  return API.get(`/briefing/${icao}`);
};

export const getTaf = (icao) => {
  return API.get(`/taf/${icao}`);
};

export default API;