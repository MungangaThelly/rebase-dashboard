import React, { useState } from 'react';
import ForecastChart from './components/ForecastChart';
import RealEnergyDashboard from './components/RealEnergyDashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

export default function App() {
  const [siteId, setSiteId] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
          <RealEnergyDashboard selectedSite={selectedSite} />
          <ForecastChart siteId={siteId} />
        </main>
      </div>
    </>
  );
}