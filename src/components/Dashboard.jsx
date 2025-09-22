import React, { useState, useEffect } from 'react';
import { fetchEnergySites, fetchRebaseWeather } from '../api/rebaseApi';
import { fetchElectricityPrices, fetchSolarGeneration, fetchWindGeneration } from '../api/entsoeApi';
import { fetchCarbonIntensity, fetchPowerBreakdown } from '../api/electricityMapApi';
import { fetchCurrentWeather } from '../api/openWeatherApi';
import CarbonIntensityPanel from './CarbonIntensityPanel';
import ElectricityPricesPanel from './ElectricityPricesPanel';
import MultiWeatherPanel from './MultiWeatherPanel';
import GridGenerationPanel from './GridGenerationPanel';
import SiteSelector from './SiteSelector';
import './EnhancedDashboard.css';

let globalInitLock = false;

const EnhancedDashboard = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState([]); // ✅ Keep this for SiteSelector
  const [error, setError] = useState(null);

  // ✅ CONSOLIDATED STATE - Remove duplicates
  const [dashboardData, setDashboardData] = useState({
    sites: [], // ✅ Add sites to dashboardData
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
      rebaseWeather: false,
      solar: false,
      power: false
    },
    lastUpdated: null
  });

  const loadAllAPIData = async () => {
    if (isInitializing) {
      console.log('⏸️ API loading already in progress, skipping...');
      return;
    }
    
    try {
      setIsInitializing(true);
      console.log('🔄 Loading all API data...');
      
      setDashboardData(prev => ({
        ...prev,
        loading: {
          carbon: true,
          prices: true,
          weather: true,
          rebaseWeather: true,
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
        fetchRebaseWeather(59.3293, 18.0686)
      ]);

      const [pricesResult, carbonResult, solarResult, weatherResult, powerResult, rebaseWeatherResult] = results;
      
      console.log('🔍 Debug - OpenWeather data:', weatherResult.value);
      console.log('🔍 Debug - Rebase weather data:', rebaseWeatherResult?.value);
      
      setDashboardData(prev => ({
        ...prev,
        electricityPrices: pricesResult.status === 'fulfilled' ? pricesResult.value : null,
        carbonIntensity: carbonResult.status === 'fulfilled' ? carbonResult.value : null,
        solarGeneration: solarResult.status === 'fulfilled' ? solarResult.value : null,
        openWeather: weatherResult.status === 'fulfilled' ? weatherResult.value : null,
        rebaseWeather: rebaseWeatherResult?.status === 'fulfilled' ? rebaseWeatherResult.value : null,
        powerBreakdown: powerResult.status === 'fulfilled' ? powerResult.value : null,
        loading: {
          carbon: false,
          prices: false,
          weather: false,
          rebaseWeather: false,
          solar: false,
          power: false
        },
        lastUpdated: new Date().toISOString()
      }));

      console.log('✅ API data loading complete');

    } catch (error) {
      console.error('❌ Error loading API data:', error); 
      setError('Failed to load dashboard data');
      
      setDashboardData(prev => ({
        ...prev,
        loading: {
          carbon: false,
          prices: false,
          weather: false,
          rebaseWeather: false,
          solar: false,
          power: false
        }
      }));
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      if (!isMounted || globalInitLock) {
        console.log('🚫 Dashboard initialization blocked (already running)');
        return;
      }
      
      globalInitLock = true;
      console.log('🚀 Initializing dashboard (single load)...');
      
      try {
        // Load sites first
        const sitesData = await fetchEnergySites();
        if (!isMounted) return;
        
        // ✅ Update both sites state and dashboardData.sites
        setSites(sitesData);
        setDashboardData(prev => ({
          ...prev,
          sites: sitesData
        }));
        
        if (sitesData && sitesData.length > 0) {
          setSelectedSite(sitesData[0]);
        }
        
        // Then load API data
        await loadAllAPIData();
        
      } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
      } finally {
        setTimeout(() => {
          globalInitLock = false;
        }, 2000);
      }
    };
    
    initializeDashboard();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshAllData = () => {
    loadAllAPIData();
  };

  const testRebaseAPI = async () => {
    try {
      const { testRebaseAuth } = await import('../api/rebaseApi');
      const result = await testRebaseAuth();
      
      if (result.success) {
        console.log('🎉 Rebase API is working!');
        alert('✅ Rebase API connection successful!');
      } else {
        console.error('❌ Rebase API test failed:', result.error);
        alert('❌ Rebase API connection failed: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error testing Rebase API:', error);
      alert('❌ Error testing Rebase API: ' + error.message);
    }
  };

  const testRebaseEndpoints = async () => {
    try {
      const { testRebaseWeatherEndpoint } = await import('../api/rebaseApi');
      const endpoints = ['query', 'point/operational', 'point/historical', 'area/operational'];
      
      console.log('🧪 Testing all Rebase Weather endpoints...');
      
      for (const endpoint of endpoints) {
        const result = await testRebaseWeatherEndpoint(endpoint);
        console.log(`${endpoint}:`, result.success ? '✅' : '❌', result.error || 'Success');
      }
    } catch (error) {
      console.error('❌ Error testing endpoints:', error);
    }
  };

  // ✅ Fixed handleSiteSelect function
  const handleSiteSelect = (site) => {
    console.log('🏗️ Site selected:', site);
    setSelectedSite(site);
  };

  return (
    <div className="enhanced-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🌍 Multi-API Renewable Energy Dashboard</h1>
        <div className="header-controls">
          {/* ✅ Fixed SiteSelector - use sites state, not dashboardData.sites */}
          {sites && sites.length > 0 && (
            <SiteSelector 
              sites={sites}
              selectedSite={selectedSite}
              onSiteSelect={handleSiteSelect}
            />
          )}
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
          <button onClick={testRebaseEndpoints} className="test-btn">
            🧪 Test Rebase Endpoints
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
          loading={dashboardData.loading.weather || dashboardData.loading.rebaseWeather}
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
              ElectricityMap Carbon {dashboardData.carbonIntensity?.source === 'real' ? '✅' : '🔶'}
            </span>
            
            <span className={`source ${dashboardData.powerBreakdown?.source}`}>
              ElectricityMap Power {dashboardData.powerBreakdown?.source === 'real' ? '✅' : '🔶'}
            </span>
            
            <span className={`source ${dashboardData.electricityPrices?.source}`}>
              ENTSO-E Prices {dashboardData.electricityPrices?.source === 'real' ? '✅' : '🔶'}
            </span>
            
            <span className={`source ${dashboardData.solarGeneration?.source}`}>
              ENTSO-E Solar {dashboardData.solarGeneration?.source === 'real' ? '✅' : '🔶'}
            </span>
            
            <span className={`source ${dashboardData.rebaseWeather?.source || 'mock'}`}>
              Rebase Weather {dashboardData.rebaseWeather?.source === 'real' ? '✅' : '🔶'}
            </span>
            
            <span className={`source ${dashboardData.openWeather?.source || 'real'}`}>
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
