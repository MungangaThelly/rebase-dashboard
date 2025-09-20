import React, { useState, useEffect } from 'react';
import ChartComponent from './ChartComponent';
import mockData from '../data/mockData';
import './Dashboard.css';
import { WeatherForecastPanel } from './WeatherForecastPanel.jsx';
import { fetchSites } from '../api/rebaseApi.js'; // 👈 Single unified API

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

  const testRealAPI = async () => {
    console.log('🔍 Testing real Rebase API endpoints...');
    
    const endpoints = [
      '/sites',
      '/solar/sites', 
      '/assets',
      '/projects',
      '/installations',
      '/plants',
      '/portfolio',
      '/solar/assets',
      '/api/v1/sites',
      '/api/v2/sites'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`/api${endpoint}`, {
          headers: {
            'GL-API-KEY': import.meta.env.VITE_REBASE_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📍 ${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ FOUND WORKING ENDPOINT: ${endpoint}`, data);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
      
      await new Promise(r => setTimeout(r, 200)); // Rate limiting
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
      
      {/* Add this temporary button to discover real API endpoints */}
      <button 
        onClick={testRealAPI}
        style={{
          background: 'green', 
          color: 'white', 
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        🔍 Discover Real API Endpoints
      </button>
    </div>
  );
};

export default Dashboard;
