import React, { useEffect, useState } from 'react';
//import { fetchWeatherOperational } from '../api/rebaseApi';

function WeatherForecast({ latitude, longitude }) {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    fetchWeatherOperational(latitude, longitude)
      .then(data => {
        setWeatherData(data);
        setError(null);
      })
      .catch(() => setError('Kunde inte hämta väderdata.'));
  }, [latitude, longitude]);

  if (error) return <div className="error">{error}</div>;
  if (!weatherData) return <div>Laddar väderdata...</div>;

  // Exempel på hur du kan visa data, beroende på API-svar
  return (
    <div>
      <h3>Väderprognos</h3>
      <p>Temperatur: {weatherData.temperature} °C</p>
      <p>Vind: {weatherData.windSpeed} m/s</p>
      {/* Lägg till graf eller fler värden här */}
    </div>
  );
}

export default WeatherForecast;
