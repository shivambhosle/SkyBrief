import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getBriefing = (icao) => {
  return API.get(`/briefing/${icao}`);
};

export const getTaf = (icao) => {
  return API.get(`/taf/${icao}`);
};