import React, { useState, useEffect } from 'react';
import { fetchEnergySites, fetchEnergyProduction, fetchWeatherData, testEnergySubEndpoints, testAllEndpoints, debugApiConfig } from '../api/rebaseApi';
import { fetchElectricityPrices, fetchSolarGeneration, fetchWindGeneration } from '../api/entsoeApi';
import { fetchCarbonIntensity, fetchPowerBreakdown } from '../api/electricityMapApi';
import { fetchCurrentWeather } from '../api/openWeatherApi';
import CarbonIntensityPanel from './CarbonIntensityPanel';
import ElectricityPricesPanel from './ElectricityPricesPanel';
import MultiWeatherPanel from './MultiWeatherPanel';
import GridGenerationPanel from './GridGenerationPanel';
import SiteSelector from './SiteSelector';
import './EnhancedDashboard.css';

const EnhancedDashboard = () => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    carbonIntensity: null,
    electricityPrices: null,
    powerBreakdown: null,
    solarGeneration: null,
    rebaseWeather: null,
    openWeather: null,
    loading: {
      carbon: false,
      prices: false,
      power: false,
      solar: false,
      weather: false
    },
    lastUpdated: null
  });

  // Load sites on component mount
  useEffect(() => {
    loadSites();
  }, []);

  // Load all API data when site is selected
  useEffect(() => {
    if (selectedSite?.location) {
      loadAllAPIData(selectedSite);
    }
  }, [selectedSite]);

  // Test all APIs on mount - UPDATED
  useEffect(() => {
    const testAllAPIs = async () => {
      console.log('🧪 Testing all APIs...');
      
      // Debug API config first
      debugApiConfig();
      
      // Test all Rebase endpoints
      const rebaseResults = await testAllEndpoints();
      console.log('🎯 Rebase test results:', rebaseResults);
      
      // Test other APIs
      try {
        const prices = await fetchElectricityPrices();
        console.log('⚡ Electricity prices:', prices);
      } catch (error) {
        console.log('❌ ENTSO-E error:', error.message);
      }
      
      try {
        const carbon = await fetchCarbonIntensity('SE');
        console.log('🌿 Carbon intensity:', carbon);
      } catch (error) {
        console.log('❌ ElectricityMap error:', error.message);
      }
      
      try {
        const weather = await fetchCurrentWeather(59.3293, 18.0686);
        console.log('☁️ Weather:', weather);
      } catch (error) {
        console.log('❌ OpenWeather error:', error.message);
      }
    };
    
    testAllAPIs();
  }, []);

  // Test energy sub-endpoints - SIMPLIFIED
  useEffect(() => {
    const testEnergyPaths = async () => {
      console.log('🧪 Testing energy sub-endpoints...');
      try {
        const results = await testEnergySubEndpoints();
        console.log('🎯 Energy sub-endpoint results:', results);
        
        // Look for successful endpoints
        const workingEndpoints = Object.entries(results)
          .filter(([path, result]) => result.success)
          .map(([path, result]) => ({ path, ...result }));
        
        if (workingEndpoints.length > 0) {
          console.log('🎉 Found working energy endpoints:', workingEndpoints);
        }
      } catch (error) {
        console.error('❌ Error testing energy endpoints:', error);
      }
    };
    
    testEnergyPaths();
  }, []);

  const loadSites = async () => {
    try {
      const sitesData = await fetchEnergySites(); // UPDATED
      setSites(sitesData);
      if (sitesData.length > 0) {
        setSelectedSite(sitesData[0]);
      }
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadAllAPIData = async (site) => {
    const { latitude, longitude } = site.location;
    
    // Set all loading states
    setDashboardData(prev => ({
      ...prev,
      loading: {
        carbon: true,
        prices: true,
        power: true,
        solar: true,
        weather: true
      }
    }));

    // Load data from all APIs in parallel - UPDATED
    const apiPromises = [
      fetchCarbonIntensity('SE').then(data => ({ carbon: data })),
      fetchElectricityPrices().then(data => ({ prices: data })),
      fetchPowerBreakdown('SE').then(data => ({ power: data })),
      fetchSolarGeneration().then(data => ({ solar: data })),
      fetchWeatherData(latitude, longitude).then(data => ({ rebaseWeather: data })), // UPDATED
      fetchCurrentWeather(latitude, longitude).then(data => ({ openWeather: data })) // UPDATED
    ];

    // Process results as they come in
    try {
      const results = await Promise.allSettled(apiPromises);
      
      let newData = {
        carbonIntensity: null,
        electricityPrices: null,
        powerBreakdown: null,
        solarGeneration: null,
        rebaseWeather: null,
        openWeather: null,
        loading: {
          carbon: false,
          prices: false,
          power: false,
          solar: false,
          weather: false
        },
        lastUpdated: new Date().toISOString()
      };

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          if (data.carbon) newData.carbonIntensity = data.carbon;
          if (data.prices) newData.electricityPrices = data.prices;
          if (data.power) newData.powerBreakdown = data.power;
          if (data.solar) newData.solarGeneration = data.solar;
          if (data.rebaseWeather) newData.rebaseWeather = data.rebaseWeather;
          if (data.openWeather) newData.openWeather = data.openWeather;
        }
      });

      setDashboardData(newData);

    } catch (error) {
      console.error('Error loading API data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: {
          carbon: false,
          prices: false,
          power: false,
          solar: false,
          weather: false
        }
      }));
    }
  };

  const refreshAllData = () => {
    if (selectedSite) {
      loadAllAPIData(selectedSite);
    }
  };

  return (
    <div className="enhanced-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🌍 Multi-API Renewable Energy Dashboard</h1>
        <div className="header-controls">
          <SiteSelector 
            sites={sites}
            selectedSite={selectedSite}
            onSiteChange={setSelectedSite}
          />
          <button 
            className="refresh-btn"
            onClick={refreshAllData}
            disabled={Object.values(dashboardData.loading).some(loading => loading)}
          >
            🔄 Refresh All Data
          </button>
        </div>
      </div>

      {/* Site Info */}
      {selectedSite && (
        <div className="site-info">
          <h2>📍 {selectedSite.name}</h2>
          <div className="site-details">
            <span>🔋 {selectedSite.capacity} MW</span>
            <span>🌍 {selectedSite.location.latitude}°N, {selectedSite.location.longitude}°E</span>
            <span>🏁 {selectedSite.country}</span>
          </div>
        </div>
      )}

      {/* API Data Panels */}
      <div className="api-panels-grid">
        
        {/* Carbon Intensity Panel */}
        <CarbonIntensityPanel 
          data={dashboardData.carbonIntensity}
          loading={dashboardData.loading.carbon}
        />

        {/* Electricity Prices Panel */}
        <ElectricityPricesPanel 
          data={dashboardData.electricityPrices}
          loading={dashboardData.loading.prices}
        />

        {/* Multi-Weather Comparison */}
        <MultiWeatherPanel 
          rebaseData={dashboardData.rebaseWeather}
          openWeatherData={dashboardData.openWeather}
          loading={dashboardData.loading.weather}
        />

        {/* Grid Generation Panel */}
        <GridGenerationPanel 
          solarData={dashboardData.solarGeneration}
          powerBreakdown={dashboardData.powerBreakdown}
          loading={dashboardData.loading.solar || dashboardData.loading.power}
        />

      </div>

      {/* Footer with Data Sources */}
      <div className="dashboard-footer">
        <div className="data-sources">
          <h3>📡 Data Sources:</h3>
          <div className="source-indicators">
            <span className={`source ${dashboardData.carbonIntensity?.source}`}>
              ElectricityMap {dashboardData.carbonIntensity?.source === 'real' ? '✅' : '🔶'}
            </span>
            <span className={`source ${dashboardData.electricityPrices?.source}`}>
              ENTSO-E {dashboardData.electricityPrices?.source === 'real' ? '✅' : '🔶'}
            </span>
            <span className={`source ${dashboardData.rebaseWeather?.source}`}>
              Rebase {dashboardData.rebaseWeather?.source === 'real' ? '✅' : '🔶'}
            </span>
            <span className={`source ${dashboardData.openWeather?.source}`}>
              OpenWeather {dashboardData.openWeather?.source === 'real' ? '✅' : '🔶'}
            </span>
          </div>
        </div>
        {dashboardData.lastUpdated && (
          <div className="last-updated">
            Last updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;
