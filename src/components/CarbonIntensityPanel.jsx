import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CarbonIntensityPanel = ({ data, loading }) => {
  
  const getCarbonLevel = (intensity) => {
    if (intensity < 100) return { level: 'Very Low', color: '#22c55e', icon: '🟢' };
    if (intensity < 200) return { level: 'Low', color: '#84cc16', icon: '🟡' };
    if (intensity < 400) return { level: 'Medium', color: '#f59e0b', icon: '🟠' };
    if (intensity < 600) return { level: 'High', color: '#ef4444', icon: '🔴' };
    return { level: 'Very High', color: '#991b1b', icon: '⚫' };
  };

  if (loading) {
    return (
      <div className="panel carbon-panel">
        <div className="panel-header">
          <h3>🌿 Carbon Intensity</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading carbon data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel carbon-panel">
        <div className="panel-header">
          <h3>🌿 Carbon Intensity</h3>
        </div>
        <div className="error-state">
          <p>❌ Carbon intensity data unavailable</p>
        </div>
      </div>
    );
  }

  const carbonLevel = getCarbonLevel(data.carbonIntensity);

  return (
    <div className="panel carbon-panel">
      <div className="panel-header">
        <h3>🌿 Carbon Intensity</h3>
        <span className="data-source">{data.source}</span>
      </div>

      <div className="carbon-content">
        {/* Current Carbon Intensity */}
        <div className="carbon-current">
          <div className="carbon-value" style={{ color: carbonLevel.color }}>
            {carbonLevel.icon} {Math.round(data.carbonIntensity)}
          </div>
          <div className="carbon-unit">{data.unit}</div>
          <div className="carbon-level" style={{ color: carbonLevel.color }}>
            {carbonLevel.level}
          </div>
        </div>

        {/* Carbon Impact Info */}
        <div className="carbon-info">
          <div className="info-item">
            <span className="label">Zone:</span>
            <span className="value">{data.zone || 'SE'}</span>
          </div>
          <div className="info-item">
            <span className="label">Updated:</span>
            <span className="value">
              {data.datetime ? new Date(data.datetime).toLocaleTimeString() : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Carbon History Chart (if available) */}
        {data.history && (
          <div className="carbon-chart">
            <h4>24h Carbon Intensity Trend</h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={data.history.slice(-24)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="datetime" 
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value) => [Math.round(value), 'gCO2eq/kWh']}
                />
                <Line 
                  type="monotone" 
                  dataKey="carbonIntensity" 
                  stroke={carbonLevel.color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Environmental Impact */}
        <div className="environmental-impact">
          <h4>🌍 Environmental Impact</h4>
          <div className="impact-grid">
            <div className="impact-item">
              <span className="impact-label">1 kWh produces:</span>
              <span className="impact-value">{Math.round(data.carbonIntensity)}g CO₂</span>
            </div>
            <div className="impact-item">
              <span className="impact-label">Daily footprint (10 kWh):</span>
              <span className="impact-value">{Math.round(data.carbonIntensity * 10 / 1000)}kg CO₂</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonIntensityPanel;