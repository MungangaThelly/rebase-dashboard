import axios from 'axios';

const API_KEY = import.meta.env.VITE_REBASE_API_KEY;
const BASE_URL = '/api/platform/v1'; // Updated to use proxy

// Hämta alla sites
export const fetchSites = async () => {
  const res = await axios.get(`${BASE_URL}/sites`, {
    headers: { 'GL-API-KEY': API_KEY },
  });
  return res.data;
};

// Hämta senaste prognos för given site
export const fetchLatestForecast = async (siteId, type = 'prioritized') => {
  const res = await axios.get(`${BASE_URL}/site/forecast/latest/${siteId}`, {
    headers: { 'GL-API-KEY': API_KEY },
    params: { type },
  });
  return res.data;
};

// Hämta WeatherForcast
export const fetchWeatherOperational = async (lat, lon) => {
  const res = await axios.get('/api/weather/v2/point/operational', {
    headers: {
      'GL-API-KEY': API_KEY,
    },
    params: {
      model: 'ECMWF_HRES_OPERATIONAL',
      latitude: lat,
      longitude: lon,
      variables: 'Temperature,WindSpeed:10,GHI,DNI,DHI',
    },
  });

  return res.data;
};

// Hämta historisk data för en site
export const fetchHistoricalData = async (siteId, startDate, endDate) => {
  const res = await axios.get(`${BASE_URL}/site/historical/${siteId}`, {
    headers: { 'GL-API-KEY': API_KEY },
    params: { 
      start_date: startDate,
      end_date: endDate,
      resolution: 'hourly'
    },
  });
  return res.data;
};