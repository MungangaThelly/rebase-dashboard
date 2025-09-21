import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MultiWeatherPanel = ({ rebaseData, openWeatherData, loading }) => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  if (loading) {
    return (
      <div className="panel weather-panel">
        <div className="panel-header">
          <h3>🌤️ Multi-Source Weather</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (!rebaseData && !openWeatherData) {
    return (
      <div className="panel weather-panel">
        <div className="panel-header">
          <h3>🌤️ Multi-Source Weather</h3>
        </div>
        <div className="error-state">
          <p>❌ Weather data unavailable from both sources</p>
        </div>
      </div>
    );
  }

  // Prepare comparison data
  const comparisonData = [];
  const maxLength = Math.max(
    rebaseData?.forecasts?.length || 0,
    openWeatherData?.hourly?.length || 0
  );

  for (let i = 0; i < Math.min(maxLength, 24); i++) {
    const rebasePoint = rebaseData?.forecasts?.[i];
    const openWeatherPoint = openWeatherData?.hourly?.[i];
    
    const dataPoint = {
      hour: i,
      timestamp: rebasePoint?.timestamp || openWeatherPoint?.timestamp,
      rebase_temp: rebasePoint?.temperature,
      openweather_temp: openWeatherPoint?.temperature,
      rebase_wind: rebasePoint?.windSpeed,
      openweather_wind: openWeatherPoint?.windSpeed,
      rebase_humidity: rebasePoint?.humidity,
      openweather_humidity: openWeatherPoint?.humidity,
      rebase_solar: rebasePoint?.solarRadiation,
      openweather_clouds: openWeatherPoint?.cloudCover
    };
    
    comparisonData.push(dataPoint);
  }

  const getMetricConfig = (metric) => {
    switch (metric) {
      case 'temperature':
        return {
          title: 'Temperature (°C)',
          rebaseKey: 'rebase_temp',
          openWeatherKey: 'openweather_temp',
          unit: '°C'
        };
      case 'wind':
        return {
          title: 'Wind Speed (m/s)',
          rebaseKey: 'rebase_wind',
          openWeatherKey: 'openweather_wind',
          unit: 'm/s'
        };
      case 'humidity':
        return {
          title: 'Humidity (%)',
          rebaseKey: 'rebase_humidity',
          openWeatherKey: 'openweather_humidity',
          unit: '%'
        };
      default:
        return {
          title: 'Temperature (°C)',
          rebaseKey: 'rebase_temp',
          openWeatherKey: 'openweather_temp',
          unit: '°C'
        };
    }
  };

  const metricConfig = getMetricConfig(selectedMetric);

  // Calculate differences
  const differences = comparisonData
    .filter(d => d[metricConfig.rebaseKey] && d[metricConfig.openWeatherKey])
    .map(d => Math.abs(d[metricConfig.rebaseKey] - d[metricConfig.openWeatherKey]));
  
  const avgDifference = differences.length > 0 
    ? differences.reduce((a, b) => a + b, 0) / differences.length 
    : 0;

  return (
    <div className="panel weather-panel">
      <div className="panel-header">
        <h3>🌤️ Multi-Source Weather</h3>
        <div className="panel-controls">
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-selector"
          >
            <option value="temperature">🌡️ Temperature</option>
            <option value="wind">💨 Wind Speed</option>
            <option value="humidity">💧 Humidity</option>
          </select>
        </div>
      </div>

      <div className="weather-content">
        {/* Data Source Status */}
        <div className="weather-sources">
          <div className={`source-status ${rebaseData ? 'active' : 'inactive'}`}>
            <span className="source-name">🎯 Rebase</span>
            <span className="source-indicator">
              {rebaseData ? (rebaseData.source === 'real' ? '✅' : '🔶') : '❌'}
            </span>
          </div>
          <div className={`source-status ${openWeatherData ? 'active' : 'inactive'}`}>
            <span className="source-name">☁️ OpenWeather</span>
            <span className="source-indicator">
              {openWeatherData ? (openWeatherData.source === 'real' ? '✅' : '🔶') : '❌'}
            </span>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="weather-chart">
          <h4>{metricConfig.title} Comparison</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `Hour ${value}:00`}
                formatter={(value, name) => [
                  value ? Math.round(value * 10) / 10 : 'N/A', 
                  name.includes('rebase') ? 'Rebase' : 'OpenWeather'
                ]}
              />
              <Legend />
              {rebaseData && (
                <Line 
                  type="monotone" 
                  dataKey={metricConfig.rebaseKey}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Rebase"
                  connectNulls={false}
                />
              )}
              {openWeatherData && (
                <Line 
                  type="monotone" 
                  dataKey={metricConfig.openWeatherKey}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="OpenWeather"
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Statistics */}
        <div className="weather-stats">
          <h4>📊 Comparison Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Average Difference:</span>
              <span className="stat-value">
                {Math.round(avgDifference * 10) / 10} {metricConfig.unit}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Data Points:</span>
              <span className="stat-value">{differences.length}/24</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Agreement:</span>
              <span className="stat-value">
                {differences.length > 0 ? Math.round((1 - avgDifference / 100) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="current-conditions">
          <h4>🎯 Current Conditions</h4>
          <div className="conditions-grid">
            {rebaseData?.forecasts?.[0] && (
              <div className="condition-source">
                <h5>Rebase Energy</h5>
                <div className="condition-values">
                  <span>🌡️ {Math.round(rebaseData.forecasts[0].temperature)}°C</span>
                  <span>💨 {Math.round(rebaseData.forecasts[0].windSpeed)}m/s</span>
                  <span>☀️ {Math.round(rebaseData.forecasts[0].solarRadiation)}W/m²</span>
                </div>
              </div>
            )}
            {openWeatherData?.current && (
              <div className="condition-source">
                <h5>OpenWeather</h5>
                <div className="condition-values">
                  <span>🌡️ {Math.round(openWeatherData.current.temperature)}°C</span>
                  <span>💨 {Math.round(openWeatherData.current.windSpeed)}m/s</span>
                  <span>☁️ {Math.round(openWeatherData.current.cloudCover)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiWeatherPanel;