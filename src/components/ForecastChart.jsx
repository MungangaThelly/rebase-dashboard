import React, { useEffect, useState } from 'react';
import { fetchLatestForecast } from '../api/rebaseApi';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ForecastChart({ siteId }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // Custom tooltip style for professional theme
  const tooltipStyle = {
    backgroundColor: 'var(--surface-bg)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    borderRadius: 6,
    padding: 8,
  };

  useEffect(() => {
    if (!siteId) return;

    fetchLatestForecast(siteId)
      .then((forecast) => {
        const parsed = forecast.valid_time.map((t, i) => ({
          time: t,
          value: forecast.forecast[i],
        }));
        setData(parsed);
        setError(null);
      })
      .catch((err) => {
        console.error('Fel vid hämtning av prognos:', err);
        setError('Kunde inte hämta prognos. Kontrollera API-nyckeln eller site ID.');
      });
  }, [siteId]);

  return (
    <div className="dashboard-card">
      <h2 style={{ color: 'var(--energy-blue)', margin: '0 0 20px 0', fontSize: '1.25rem' }}>
        ⚡ Forecast
      </h2>
      
      {!siteId ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontStyle: 'italic' }}>
          Välj en site från sidopanelen för att se prognosdata.
        </p>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : (
        <div className="chart-container">
          <h3 style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
            Prognosdata för vald site
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="var(--energy-blue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
