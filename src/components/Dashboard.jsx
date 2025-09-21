import React, { useState, useEffect } from 'react';
import SiteSelector from './SiteSelector';
// Try default import, fallback to named import
import WeatherForecastPanel from './WeatherForecastPanel';
import ForecastChart from './ForecastChart';
import { fetchSites, fetchSiteWithWeather, exportCombinedData } from '../api/rebaseApi';
import { discoverAllEuropeanEnergyAPIs } from '../api/europeanEnergyApi';
import './Dashboard.css';

const Dashboard = () => {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // European API Discovery state
  const [apiDiscovery, setApiDiscovery] = useState({
    results: null,
    loading: false,
    lastTested: null,
    expanded: false
  });

  // Load sites on component mount
  useEffect(() => {
    loadSites();
  }, []);

  // Load site data when selection changes
  useEffect(() => {
    if (selectedSite) {
      loadSiteData(selectedSite.id);
    }
  }, [selectedSite]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const sitesData = await fetchSites();
      setSites(sitesData);
      if (sitesData.length > 0) {
        setSelectedSite(sitesData[0]);
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
      setError('Failed to load renewable energy sites');
    } finally {
      setLoading(false);
    }
  };

  const loadSiteData = async (siteId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSiteWithWeather(siteId);
      setSiteData(data);
    } catch (err) {
      console.error('Failed to load site data:', err);
      setError('Failed to load site and weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleSiteChange = (site) => {
    setSelectedSite(site);
    setSiteData(null);
  };

  const handleExportData = async (format = 'csv') => {
    if (!selectedSite) return;
    
    try {
      const data = await exportCombinedData(selectedSite.id, format);
      
      // Create download
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSite.id}_combined_data.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Exported ${selectedSite.name} data as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export data');
    }
  };

  // European API Discovery function
  const discoverEuropeanAPIs = async () => {
    setApiDiscovery(prev => ({ ...prev, loading: true, results: null }));
    
    try {
      console.log('🌍 Starting European renewable energy API discovery...');
      const discoveryResults = await discoverAllEuropeanEnergyAPIs();
      
      setApiDiscovery({
        results: discoveryResults,
        loading: false,
        lastTested: new Date().toISOString(),
        expanded: true
      });
      
      console.log('✅ API Discovery completed:', discoveryResults);
      
    } catch (error) {
      console.error('❌ API Discovery failed:', error);
      setApiDiscovery({
        results: { 
          success: false, 
          error: error.message,
          summary: { totalAPIs: 0, successfulProviders: 0 }
        },
        loading: false,
        lastTested: new Date().toISOString(),
        expanded: true
      });
    }
  };

  const toggleDiscoveryExpanded = () => {
    setApiDiscovery(prev => ({ ...prev, expanded: !prev.expanded }));
  };

  if (loading && !sites.length) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading renewable energy research platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🌞 Renewable Energy Research Platform</h1>
        <p>Real-time weather data integration with Swedish solar farm analysis</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* European API Discovery Section */}
      <div className="api-discovery-section">
        <div className="section-header" onClick={toggleDiscoveryExpanded}>
          <h3>🌍 European Real Data Discovery</h3>
          <div className="section-controls">
            <button 
              onClick={discoverEuropeanAPIs}
              disabled={apiDiscovery.loading}
              className="discovery-button"
            >
              {apiDiscovery.loading ? '🔄 Discovering...' : '🔍 Discover European Energy APIs'}
            </button>
            <button 
              onClick={toggleDiscoveryExpanded}
              className="expand-button"
            >
              {apiDiscovery.expanded ? '📦 Collapse' : '📋 View Results'}
            </button>
          </div>
        </div>

        {apiDiscovery.expanded && apiDiscovery.results && (
          <div className="discovery-results">
            {/* Summary Stats */}
            <div className="discovery-summary">
              <div className="summary-stat">
                <span className="stat-number">{apiDiscovery.results.summary?.totalAPIs || 0}</span>
                <span className="stat-label">APIs Tested</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">{apiDiscovery.results.summary?.successfulProviders || 0}</span>
                <span className="stat-label">Working Providers</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">{apiDiscovery.results.summary?.successfulEndpoints || 0}</span>
                <span className="stat-label">Available Endpoints</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">{Math.round((apiDiscovery.results.summary?.testDuration || 0) / 1000)}s</span>
                <span className="stat-label">Test Duration</span>
              </div>
            </div>

            {/* API Provider Results */}
            {apiDiscovery.results.results && (
              <div className="api-providers">
                {Object.entries(apiDiscovery.results.results).map(([key, provider]) => (
                  <div key={key} className={`api-provider ${provider.summary?.successful > 0 ? 'success' : 'failed'}`}>
                    <div className="provider-header">
                      <h4>
                        {getProviderIcon(provider.provider)} {provider.provider}
                      </h4>
                      <div className="provider-status">
                        {provider.summary?.successful > 0 ? (
                          <span className="status-success">✅ {provider.summary.successful} endpoints working</span>
                        ) : provider.apiKeyRequired ? (
                          <span className="status-auth">🔑 API key required</span>
                        ) : (
                          <span className="status-failed">❌ Not accessible</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="provider-description">{provider.description}</p>
                    
                    {provider.website && (
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="provider-link">
                        🔗 Visit {provider.provider}
                      </a>
                    )}

                    {/* Show working endpoints */}
                    {provider.results && provider.results.filter(r => r.success).length > 0 && (
                      <div className="working-endpoints">
                        <h5>Working Endpoints:</h5>
                        <ul>
                          {provider.results.filter(r => r.success).map((endpoint, idx) => (
                            <li key={idx}>
                              <strong>{endpoint.endpoint}</strong>
                              {endpoint.location && ` - ${endpoint.location}`}
                              {endpoint.country && ` (${endpoint.country})`}
                              {endpoint.solarMetrics && (
                                <div className="solar-metrics">
                                  Solar data: {JSON.stringify(endpoint.solarMetrics)}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {apiDiscovery.results.recommendations && (
              <div className="api-recommendations">
                <h4>🎯 Integration Recommendations</h4>
                <div className="recommendations-grid">
                  {apiDiscovery.results.recommendations
                    .sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority))
                    .map((rec, idx) => (
                    <div key={idx} className={`recommendation priority-${rec.priority}`}>
                      <div className="rec-status">{rec.status}</div>
                      <div className="rec-api">{rec.api}</div>
                      <div className="rec-reason">{rec.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {apiDiscovery.lastTested && (
              <p className="last-tested">
                Last tested: {new Date(apiDiscovery.lastTested).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Dashboard Content */}
      <div className="main-content">
        <div className="control-panel">
          <SiteSelector 
            sites={sites}
            selectedSite={selectedSite}
            onSiteChange={handleSiteChange}
          />
          
          <div className="export-controls">
            <button 
              onClick={() => handleExportData('csv')}
              disabled={!siteData}
              className="export-button"
            >
              📊 Export CSV
            </button>
            <button 
              onClick={() => handleExportData('json')}
              disabled={!siteData}
              className="export-button"
            >
              📁 Export JSON
            </button>
          </div>
        </div>

        {selectedSite && (
          <div className="site-overview">
            <h2>{selectedSite.name}</h2>
            <div className="site-details">
              <div className="detail-item">
                <span className="label">📍 Location:</span>
                <span className="value">{selectedSite.location.latitude}°N, {selectedSite.location.longitude}°E</span>
              </div>
              <div className="detail-item">
                <span className="label">⚡ Capacity:</span>
                <span className="value">{selectedSite.capacity} MW</span>
              </div>
              <div className="detail-item">
                <span className="label">🔧 Technology:</span>
                <span className="value">{selectedSite.technology}</span>
              </div>
              <div className="detail-item">
                <span className="label">📊 Type:</span>
                <span className="value">{selectedSite.type}</span>
              </div>
              <div className="detail-item">
                <span className="label">✅ Status:</span>
                <span className="value status-operational">{selectedSite.status}</span>
              </div>
            </div>
          </div>
        )}

        {loading && selectedSite && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading site data and weather forecast...</p>
          </div>
        )}

        {siteData && (
          <div className="data-panels">
            <WeatherForecastPanel 
              weatherData={siteData.weather}
              siteLocation={selectedSite.location}
            />
            
            <div className="forecast-section">
              <h3>📈 Combined Solar Production & Weather Forecast</h3>
              <ForecastChart 
                solarData={siteData.solar}
                weatherData={siteData.weather}
                siteName={selectedSite.name}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function getProviderIcon(providerName) {
  const icons = {
    'ENTSO-E': '🌍',
    'Swedish National Grid': '🇸🇪',
    'Energy Charts': '⚡',
    'ElectricityMap': '🔋',
    'PVGis': '🌞',
    'OpenWeatherMap': '🌤️'
  };
  return icons[providerName] || '🔧';
}

function getPriorityOrder(priority) {
  const order = { high: 1, medium: 2, low: 3 };
  return order[priority] || 4;
}

export default Dashboard;
