import React, { useState, useEffect } from 'react';
import { fetchEnergySites, fetchRebaseWeather } from '../api/rebaseApi'; // ✅ Only import what exists
import { fetchElectricityPrices, fetchSolarGeneration, fetchWindGeneration } from '../api/entsoeApi';
import { fetchCarbonIntensity, fetchPowerBreakdown } from '../api/electricityMapApi';
import { fetchCurrentWeather } from '../api/openWeatherApi';
import CarbonIntensityPanel from './CarbonIntensityPanel';
import ElectricityPricesPanel from './ElectricityPricesPanel';
import MultiWeatherPanel from './MultiWeatherPanel';
import GridGenerationPanel from './GridGenerationPanel';
import SiteSelector from './SiteSelector';
import './EnhancedDashboard.css';

let globalInitLock = false; // Prevent any duplicate initialization

const EnhancedDashboard = () => {
  // Add loading prevention state
  const [isInitializing, setIsInitializing] = useState(false);

  // ✅ EXISTING STATE VARIABLES
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [electricityPrices, setElectricityPrices] = useState(null);
  const [carbonIntensity, setCarbonIntensity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [error, setError] = useState(null);

  // ✅ DASHBOARD DATA STATE
  const [dashboardData, setDashboardData] = useState({
    carbonIntensity: null,
    electricityPrices: null,
    rebaseWeather: null,
    openWeather: null,
    solarGeneration: null,
    powerBreakdown: null,
    loading: {
      carbon: false,
      prices: false,
      weather: false,
      solar: false,
      power: false
    },
    lastUpdated: null
  });

  // ✅ FIXED LOAD ALL API DATA FUNCTION
  const loadAllAPIData = async () => {
    // Prevent concurrent calls
    if (isInitializing) {
      console.log('⏸️ API loading already in progress, skipping...');
      return;
    }
    
    try {
      setIsInitializing(true);
      console.log('🔄 Loading all API data...');
      
      // Set all loading states to true
      setDashboardData(prev => ({
        ...prev,
        loading: {
          carbon: true,
          prices: true,
          weather: true,
          rebaseWeather: true, // ✅ Add Rebase weather loading
          solar: true,
          power: true
        }
      }));
      
      setError(null);
      
      const results = await Promise.allSettled([
        fetchElectricityPrices(),
        fetchCarbonIntensity(),
        fetchSolarGeneration(),
        fetchCurrentWeather(),
        fetchPowerBreakdown(),
        fetchRebaseWeather('Stockholm') // ✅ Add Rebase weather call
      ]);

      const [pricesResult, carbonResult, solarResult, weatherResult, powerResult, rebaseWeatherResult] = results;
      
      // ✅ ADD DEBUGGING HERE:
      console.log('🔍 Debug - OpenWeather data:', weatherResult.value);
      console.log('🔍 Debug - Rebase weather data:', rebaseWeatherResult?.value);
      
      // Update dashboard data with results
      setDashboardData(prev => ({
        ...prev,
        electricityPrices: pricesResult.status === 'fulfilled' ? pricesResult.value : null,
        carbonIntensity: carbonResult.status === 'fulfilled' ? carbonResult.value : null,
        solarGeneration: solarResult.status === 'fulfilled' ? solarResult.value : null,
        openWeather: weatherResult.status === 'fulfilled' ? weatherResult.value : null,
        rebaseWeather: rebaseWeatherResult?.status === 'fulfilled' ? rebaseWeatherResult.value : null, // ✅ Add Rebase weather
        powerBreakdown: powerResult.status === 'fulfilled' ? powerResult.value : null,
        loading: {
          carbon: false,
          prices: false,
          weather: false,
          rebaseWeather: false, // ✅ Add Rebase weather loading state
          solar: false,
          power: false
        },
        lastUpdated: new Date().toISOString()
      }));

      // Also update individual state variables for compatibility
      if (pricesResult.status === 'fulfilled') {
        setElectricityPrices(pricesResult.value);
      }
      if (carbonResult.status === 'fulfilled') {
        setCarbonIntensity(carbonResult.value);
      }
      if (solarResult.status === 'fulfilled') {
        setSolarData(solarResult.value);
      }
      if (weatherResult.status === 'fulfilled') {
        setWeatherData(weatherResult.value);
      }

      console.log('✅ API data loading complete');

    } catch (error) {
      console.error('❌ Error loading API data:', error); 
      setError('Failed to load dashboard data');
      
      // Reset loading states on error
      setDashboardData(prev => ({
        ...prev,
        loading: {
          carbon: false,
          prices: false,
          weather: false,
          rebaseWeather: false, // ✅ Add Rebase weather loading state
          solar: false,
          power: false
        }
      }));
    } finally {
      setIsInitializing(false);
    }
  };

  // ✅ FIXED USE EFFECT
  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      // Global lock to prevent any duplicate execution
      if (!isMounted || globalInitLock) {
        console.log('🚫 Dashboard initialization blocked (already running)');
        return;
      }
      
      globalInitLock = true; // Set global lock
      console.log('🚀 Initializing dashboard (single load)...');
      
      try {
        // Load sites first
        const sitesData = await fetchEnergySites();
        if (!isMounted) return;
        
        setSites(sitesData);
        if (sitesData && sitesData.length > 0) {
          setSelectedSite(sitesData[0]);
        }
        
        // Then load API data
        await loadAllAPIData();
        
      } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
      } finally {
        // Keep lock for 2 seconds to prevent rapid re-initialization
        setTimeout(() => {
          globalInitLock = false;
        }, 2000);
      }
    };
    
    initializeDashboard();
    
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  const refreshAllData = () => {
    loadAllAPIData();
  };

  // Add to Dashboard component:
  const testRebaseAPI = async () => {
    const { testRebaseConnection } = await import('../api/rebaseApi');
    const result = await testRebaseConnection();
    
    if (result.success) {
      console.log('🎉 Rebase API is working!');
      alert('✅ Rebase API connection successful!');
    } else {
      console.error('❌ Rebase API test failed:', result.error);
      alert('❌ Rebase API connection failed: ' + result.error);
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
          <button onClick={testRebaseAPI} className="test-btn">
            🔌 Test Rebase API
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Site Info */}
      {selectedSite && (
        <div className="site-info">
          <h2>📍 {selectedSite.name}</h2>
          <div className="site-details">
            <span>🔋 {selectedSite.capacity} MW</span>
            <span>🌍 {selectedSite.location}</span>
            <span>⚡ {selectedSite.type}</span>
            <span>📊 {selectedSite.status}</span>
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
            <span className={`source ${dashboardData.rebaseWeather?.source || 'mock'}`}>
              Rebase {dashboardData.rebaseWeather?.source === 'real' ? '✅' : '🔶'}
            </span>
            <span className={`source ${dashboardData.openWeather?.source || 'real'}`}>
              OpenWeather {dashboardData.openWeather?.main ? '✅' : '🔶'}
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
