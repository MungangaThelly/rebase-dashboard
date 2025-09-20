import React from 'react';
import ChartComponent from './ChartComponent';
import mockData from '../data/mockData';
import './Dashboard.css';

const Dashboard = () => (
  <div className="dashboard" style={{ 
    background: '#f8fafb', 
    padding: '24px', 
    marginBottom: '24px', 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <h2 style={{ color: '#1f2937', margin: '0 0 20px 0', fontSize: '1.5rem' }}>📊 Dashboard</h2>
    <div style={{ background: 'white', padding: '20px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ color: '#4b5563', marginTop: 0 }}>Wind Speed Data</h3>
      <ChartComponent data={mockData} />
    </div>
  </div>
);

export default Dashboard;
