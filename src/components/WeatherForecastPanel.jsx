import React from 'react';

const WeatherForecastPanel = ({ weatherData, siteLocation }) => {
  console.log('🌤️ WeatherForecastPanel props:', { weatherData, siteLocation });

  // Simple safe render - no complex logic
  if (!weatherData) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '6px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#4b5563', marginTop: 0 }}>🌤️ Weather Forecast</h3>
        <p style={{ color: '#6b7280' }}>Loading weather data...</p>
      </div>
    );
  }

  // Extract forecasts with maximum safety
  let forecasts = [];
  try {
    if (weatherData && weatherData.forecasts && Array.isArray(weatherData.forecasts)) {
      forecasts = weatherData.forecasts;
    } else if (Array.isArray(weatherData)) {
      forecasts = weatherData;
    }
  } catch (error) {
    console.log('Error extracting forecasts:', error);
    forecasts = [];
  }

  console.log('🌤️ Extracted forecasts count:', forecasts ? forecasts.length : 0);

  // Always show something, even if no forecasts
  const currentWeather = (forecasts && forecasts.length > 0) ? forecasts[0] : {};
  
  const safeGet = (obj, key, fallback = 'N/A') => {
    try {
      return (obj && typeof obj[key] === 'number') ? obj[key].toFixed(1) : fallback;
    } catch {
      return fallback;
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '6px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#4b5563', marginTop: 0 }}>
        🌤️ Weather Forecast
        {siteLocation && (
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>
            {' '}({siteLocation.latitude}°N, {siteLocation.longitude}°E)
          </span>
        )}
      </h3>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            {safeGet(currentWeather, 'temperature')}°C
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Temperature</div>
        </div>

        <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            {safeGet(currentWeather, 'windSpeed')} m/s
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Wind</div>
        </div>

        <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            {safeGet(currentWeather, 'solarRadiation')} W/m²
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Solar</div>
        </div>
      </div>

      <div style={{ 
        padding: '12px', 
        background: weatherData.source === 'mock' ? '#fef3c7' : '#f0fdf4', 
        borderRadius: '4px', 
        border: `1px solid ${weatherData.source === 'mock' ? '#f59e0b' : '#bbf7d0'}`
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: weatherData.source === 'mock' ? '#92400e' : '#166534' }}>
          {weatherData.source === 'mock' ? 
            '🎯 Mock weather data (demonstration mode)' : 
            '✅ Real weather data'
          }
          <br />
          📊 {forecasts ? forecasts.length : 0} forecasts available
        </p>
      </div>

      {forecasts && forecasts.length > 1 && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ color: '#4b5563', marginBottom: '8px', fontSize: '14px' }}>📈 Next 6 Hours</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '6px'
          }}>
            {forecasts.slice(0, 6).map((forecast, index) => (
              <div key={index} style={{ 
                padding: '6px', 
                background: '#f8fafc', 
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '10px'
              }}>
                <div style={{ fontWeight: 'bold' }}>+{index}h</div>
                <div>{safeGet(forecast, 'temperature')}°C</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastPanel;