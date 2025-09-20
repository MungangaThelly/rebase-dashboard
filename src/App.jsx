import React, { useState, useEffect } from 'react';
import ForecastChart from './components/ForecastChart';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { fetchSites } from './api/rebaseApi';
import './App.css';

export default function App() {
  const [siteId, setSiteId] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSites, setSelectedSites] = useState([]);
  const [allSites, setAllSites] = useState([]);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const sites = await fetchSites();
      setAllSites(sites);
      // Auto-select first few sites for demonstration
      setSelectedSites(sites.slice(0, 2));
    } catch (error) {
      console.error('Failed to load sites:', error);
    }
  };

  const handleSiteSelect = (siteId, siteData) => {
    setSiteId(siteId);
    setSelectedSite(siteData);
  };

  return (
    <>
      <Header />
      <div className="main-layout">
        <Sidebar onSelect={handleSiteSelect} />
        <main className="main-content">
          {/* ❌ Remove this line - it's causing the error */}
          {/* <RealEnergyDashboard selectedSite={selectedSite} /> */}
          
          <ForecastChart siteId={siteId} />

          {/* Site selection */}
          <div className="site-selector">
            <h3>Select Sites for Weather Analysis:</h3>
            {allSites.map(site => (
              <label key={site.id}>
                <input
                  type="checkbox"
                  checked={selectedSites.some(s => s.id === site.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSites([...selectedSites, site]);
                    } else {
                      setSelectedSites(selectedSites.filter(s => s.id !== site.id));
                    }
                  }}
                />
                {site.name || site.id}
              </label>
            ))}
          </div>

          {/* ✅ Keep this - your unified Dashboard with weather */}
          <Dashboard selectedSites={selectedSites} />
        </main>
      </div>
    </>
  );
}