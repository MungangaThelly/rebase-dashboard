import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CarbonIntensityPanel = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="api-panel loading">
        <div className="panel-header">
          <h3>🌱 Carbon Intensity</h3>
        </div>
        <div className="panel-content">
          <div className="loading-spinner">Loading carbon data...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="api-panel error">
        <div className="panel-header">
          <h3>🌱 Carbon Intensity</h3>
        </div>
        <div className="panel-content">
          <div className="error-message">
            <p>⚠️ Carbon intensity data unavailable</p>
            <small>Using fallback data or check API configuration</small>
          </div>
        </div>
      </div>
    );
  }

  const intensity = data.intensity || 0;
  const source = data.source || 'unknown';
  
  // ✅ Get intensity level for color coding
  const getIntensityLevel = (value) => {
    if (value < 100) return 'low';
    if (value < 200) return 'medium';
    return 'high';
  };

  const intensityLevel = getIntensityLevel(intensity);

  // ✅ Generate trend data for mini chart (similar to your electricity prices chart)
  const generateTrendData = () => {
    const currentHour = new Date().getHours();
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      time: `${String(i).padStart(2, '0')}:00`,
      intensity: intensity + (Math.random() - 0.5) * 30 // Small variations around current value
    }));
  };

  const trendData = generateTrendData();

  return (
    <div className="api-panel">
      <div className="panel-header">
        <h3>🌱 Carbon Intensity</h3>
        <div className="source-indicator">
          {source === 'real' ? '✅ Live API' : '🔶 Mock Data'}
        </div>
      </div>
      
      <div className="panel-content">
        {/* ✅ Main intensity display (like electricity price display) */}
        <div className="main-metric">
          <div className={`metric-value ${intensityLevel}`}>
            <span className="value">{Math.round(intensity)}</span>
            <span className="unit">g CO₂/kWh</span>
          </div>
          <div className="metric-label">
            {intensityLevel === 'low' ? '🟢 Low Emissions' : 
             intensityLevel === 'medium' ? '🟡 Moderate' : '🔴 High Emissions'}
          </div>
        </div>

        {/* ✅ Mini trend chart (like your electricity prices chart) */}
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#e5e7eb'
                }}
                formatter={(value) => [`${Math.round(value)} g CO₂/kWh`, 'Carbon Intensity']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke={intensityLevel === 'low' ? '#10b981' : 
                       intensityLevel === 'medium' ? '#f59e0b' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Summary info (like your electricity prices summary) */}
        <div className="summary-info">
          <div className="info-row">
            <span className="info-label">Zone:</span>
            <span className="info-value">{data.zone || 'SE'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Grid Status:</span>
            <span className={`info-value status-${intensityLevel}`}>
              {intensityLevel === 'low' ? 'Clean Energy Dominant' : 
               intensityLevel === 'medium' ? 'Mixed Sources' : 'High Carbon Sources'}
            </span>
          </div>
          {data.note && (
            <div className="info-row">
              <span className="info-note">{data.note}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="panel-footer">
        <small>
          Updated: {data.datetime ? new Date(data.datetime).toLocaleTimeString() : 'N/A'}
        </small>
      </div>
    </div>
  );
};

export default CarbonIntensityPanel;