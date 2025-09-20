import React, { useState, useEffect } from 'react';
import ChartComponent from './ChartComponent';
import mockData from '../data/mockData';
import './Dashboard.css';
import { WeatherForecastPanel } from './WeatherForecastPanel.jsx';
import { fetchSites } from '../api/rebaseApi.js';

const Dashboard = () => {
  const [selectedSites, setSelectedSites] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolarSites();
  }, []);

  const loadSolarSites = async () => {
    try {
      const sites = await fetchSites();
      setAllSites(sites);
      setSelectedSites(sites.slice(0, 2));
      console.log('✅ Solar sites loaded from unified API:', sites.length);
    } catch (error) {
      console.error('❌ Failed to load solar sites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">🔄 Loading unified solar + weather platform...</div>;
  }

  return (
    <div className="dashboard" style={{ 
      background: '#f8fafb', 
      padding: '24px', 
      marginBottom: '24px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#1f2937', margin: '0 0 20px 0', fontSize: '1.5rem' }}>
        📊 Unified Solar + Weather Research Platform
      </h2>
      
      {/* Solar Data Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ color: '#4b5563', marginTop: 0 }}>☀️ Solar Production Data</h3>
        <ChartComponent data={mockData} />
        
        <div className="sites-info">
          <p><strong>Available Sites:</strong> {allSites.length} solar installations</p>
          <p><strong>Selected for Analysis:</strong> {selectedSites.length} sites with weather correlation</p>
        </div>
      </div>
      
      {/* Combined Weather + Solar Analysis */}
      <WeatherForecastPanel selectedSites={selectedSites} />
    </div>
  );
};

export default Dashboard;
