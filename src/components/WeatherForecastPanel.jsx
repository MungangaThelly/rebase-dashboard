import React, { useState, useEffect } from 'react';
import { 
  fetchMultipleSitesWithWeather, 
  exportCombinedData,
  checkAPIStatus 
} from '../api/rebaseApi.js';
import './WeatherForecastPanel.css';

export function WeatherForecastPanel({ selectedSites }) {
  const [combinedData, setCombinedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    checkAPIs();
  }, []);

  useEffect(() => {
    if (selectedSites.length > 0) {
      loadCombinedData();
    }
  }, [selectedSites]);

  const checkAPIs = async () => {
    try {
      const status = await checkAPIStatus();
      setApiStatus(status);
    } catch (error) {
      console.error('API status check failed:', error);
    }
  };

  const loadCombinedData = async () => {
    setLoading(true);
    try {
      const siteIds = selectedSites.map(site => site.id);
      const data = await fetchMultipleSitesWithWeather(siteIds, 3);
      setCombinedData(data.sites_data);
      console.log('✅ Combined solar + weather data loaded:', data);
    } catch (error) {
      console.error('❌ Failed to load combined data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (siteId) => {
    try {
      const exportData = await exportCombinedData(siteId, exportFormat);
      
      const blob = new Blob([exportData], { 
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `combined_solar_weather_${siteId}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return <div className="loading">🌦️ Loading combined solar + weather data...</div>;
  }

  return (
    <div className="weather-forecast-panel">
      <h3>🌦️ Combined Solar + Weather Analysis</h3>
      
      {/* API Status */}
      {apiStatus && (
        <div className="api-status">
          <div className={apiStatus.combined_ready ? 'status-success' : 'status-warning'}>
            {apiStatus.combined_ready ? '✅' : '⚠️'} 
            <strong>API Status:</strong> Solar {apiStatus.solar_api ? '✅' : '❌'} | Weather {apiStatus.weather_api ? '✅' : '❌'}
          </div>
        </div>
      )}
      
      <div className="export-controls">
        <label>Export Format:</label>
        <select 
          value={exportFormat} 
          onChange={(e) => setExportFormat(e.target.value)}
        >
          <option value="csv">CSV (Excel/Python/R)</option>
          <option value="json">JSON (Web/APIs)</option>
          <option value="matlab">MATLAB (.m file)</option>
        </select>
      </div>

      {Object.entries(combinedData).map(([siteId, data]) => {
        if (data.error) {
          return (
            <div key={siteId} className="site-error">
              <h4>❌ {data.site?.name || siteId}</h4>
              <p>Error: {data.error}</p>
            </div>
          );
        }

        const { site, weather_forecast, solar_forecast } = data;
        
        return (
          <div key={siteId} className="weather-site-forecast">
            <h4>📍 {site?.name || siteId}</h4>
            <p className="location">
              📍 {site.location.latitude.toFixed(3)}, {site.location.longitude.toFixed(3)}
            </p>
            
            <div className="combined-summary">
              <div className="summary-grid">
                <div className="metric">
                  <strong>🌡️ Weather</strong>
                  <div>Temp: {weather_forecast.summary.temperature.min.toFixed(1)}°C - {weather_forecast.summary.temperature.max.toFixed(1)}°C</div>
                  <div>Wind: {weather_forecast.summary.windSpeed.avg.toFixed(1)} m/s avg</div>
                </div>
                <div className="metric">
                  <strong>☀️ Solar Data</strong>
                  <div>Site: {site.type || 'Solar Installation'}</div>
                  <div>Forecast: {solar_forecast ? 'Available' : 'Loading...'}</div>
                </div>
                <div className="metric">
                  <strong>🔬 Research</strong>
                  <div>{weather_forecast.forecast_period.hours} weather points</div>
                  <div>Correlation ready: ✅</div>
                </div>
              </div>
            </div>

            <div className="forecast-timeline">
              <h5>📈 Next 24 Hours</h5>
              <div className="timeline-grid">
                {weather_forecast.timeseries.slice(0, 24).map((point, index) => (
                  <div key={index} className="timeline-point">
                    <div className="time">{new Date(point.timestamp).getHours()}h</div>
                    <div className="temp">{point.temperature?.toFixed(1)}°C</div>
                    <div className="wind">{point.windSpeed?.toFixed(1)}m/s</div>
                    <div className="solar">{point.solarRadiation?.toFixed(0)}W/m²</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="research-actions">
              <button 
                onClick={() => handleExport(siteId)}
                className="export-btn"
              >
                📊 Export Combined Data ({exportFormat.toUpperCase()})
              </button>
              
              <div className="research-applications">
                <strong>🔬 Research Applications:</strong>
                <ul>
                  <li>Solar production vs weather correlation</li>
                  <li>Cloud impact on generation efficiency</li>
                  <li>Wind patterns and panel cooling effects</li>
                  <li>Seasonal performance analysis</li>
                  <li>Grid integration forecasting</li>
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
