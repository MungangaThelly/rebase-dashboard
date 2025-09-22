import React, { useState, useEffect } from 'react';
import { fetchSites } from '../api/rebaseApi';
import { fetchElectricityPrices } from '../api/entsoeApi';
import { fetchCarbonIntensity } from '../api/electricityMapApi';
import { fetchCurrentWeather } from '../api/openWeatherApi';

const EnhancedDashboard = () => {
  const [apiData, setApiData] = useState({
    sites: null,
    prices: null,
    carbon: null,
    weather: null
  });

  useEffect(() => {
    const testAllAPIs = async () => {
      console.log('🧪 Testing all 4 APIs...');
      
      try {
        // Test Rebase API
        const sites = await fetchSites();
        console.log('🎯 Rebase sites:', sites);
        
        // Test ENTSO-E API
        const prices = await fetchElectricityPrices();
        console.log('⚡ ENTSO-E prices:', prices);
        
        // Test ElectricityMap API
        const carbon = await fetchCarbonIntensity('SE');
        console.log('🌿 ElectricityMap carbon:', carbon);
        
        // Test OpenWeather API (Stockholm coordinates)
        const weather = await fetchCurrentWeather(59.3293, 18.0686);
        console.log('☁️ OpenWeather:', weather);
        
        setApiData({ sites, prices, carbon, weather });
        
      } catch (error) {
        console.error('❌ API test error:', error);
      }
    };

    testAllAPIs();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🌍 Multi-API Energy Dashboard</h1>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Rebase Sites */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>🎯 Rebase Sites</h3>
          {apiData.sites ? (
            <p>✅ Found {apiData.sites.length} sites</p>
          ) : (
            <p>🔄 Loading...</p>
          )}
        </div>

        {/* ENTSO-E Prices */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>⚡ Electricity Prices</h3>
          {apiData.prices ? (
            <div>
              <p>✅ Source: {apiData.prices.source}</p>
              <p>📊 Data points: {apiData.prices.total}</p>
            </div>
          ) : (
            <p>🔄 Loading...</p>
          )}
        </div>

        {/* ElectricityMap Carbon */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>🌿 Carbon Intensity</h3>
          {apiData.carbon ? (
            <div>
              <p>✅ Source: {apiData.carbon.source}</p>
              <p>🔥 {apiData.carbon.carbonIntensity} {apiData.carbon.unit}</p>
            </div>
          ) : (
            <p>🔄 Loading...</p>
          )}
        </div>

        {/* OpenWeather */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>☁️ Weather</h3>
          {apiData.weather ? (
            <div>
              <p>✅ Source: {apiData.weather.source}</p>
              <p>🌡️ {Math.round(apiData.weather.current.temperature)}°C</p>
              <p>💨 {apiData.weather.current.windSpeed} m/s</p>
            </div>
          ) : (
            <p>🔄 Loading...</p>
          )}
        </div>

      </div>

      {/* Debug Info */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🔍 Debug Info</h3>
        <p>Check the browser console for detailed API logs!</p>
        <p>APIs will fallback to mock data if real APIs fail.</p>
      </div>
    </div>
  );
};

export default EnhancedDashboard;