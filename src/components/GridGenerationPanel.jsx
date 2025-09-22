import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GridGenerationPanel = ({ generationData, powerBreakdown, loading }) => {
  const [viewMode, setViewMode] = useState('generation'); // 'generation' or 'breakdown'

  if (loading) {
    return (
      <div className="panel grid-panel">
        <div className="panel-header">
          <h3>⚡ Grid Generation</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading grid data...</p>
        </div>
      </div>
    );
  }

  if (!generationData && !powerBreakdown) {
    return (
      <div className="panel grid-panel">
        <div className="panel-header">
          <h3>⚡ Grid Generation</h3>
        </div>
        <div className="error-state">
          <p>❌ Grid generation data unavailable</p>
        </div>
      </div>
    );
  }

  // Prepare power breakdown for pie chart
  const breakdownData = powerBreakdown?.powerProductionBreakdown ? 
    Object.entries(powerBreakdown.powerProductionBreakdown)
      .filter(([key, value]) => value && value > 0)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: Math.round(value),
        percentage: Math.round((value / Object.values(powerBreakdown.powerProductionBreakdown).reduce((a, b) => a + (b || 0), 0)) * 100)
      }))
    : [];

  // Colors for different energy sources
  const energyColors = {
    'Hydro': '#2563eb',
    'Nuclear': '#7c3aed',
    'Solar': '#f59e0b',
    'Wind': '#10b981',
    'Biomass': '#84cc16',
    'Coal': '#6b7280',
    'Gas': '#ef4444',
    'Oil': '#991b1b',
    'Unknown': '#9ca3af'
  };

  const getEnergyIcon = (type) => {
    const icons = {
      'hydro': '💧',
      'nuclear': '⚛️',
      'solar': '☀️',
      'wind': '💨',
      'biomass': '🌿',
      'coal': '⚫',
      'gas': '🔥',
      'oil': '🛢️',
      'unknown': '❓'
    };
    return icons[type.toLowerCase()] || '⚡';
  };

  // Ensure data exists and has the right structure
  const safeData = generationData?.data || generationData?.energyData || [];

  // Chart data preparation
  const chartData = safeData.map((item, index) => ({
    time: item.timestamp ? new Date(item.timestamp).getHours() : index,
    generation: item.generation || item.value || 0,
    ...item
  }));

  return (
    <div className="panel grid-panel">
      <div className="panel-header">
        <h3>⚡ Grid Generation</h3>
        <div className="panel-controls">
          <button 
            className={`view-btn ${viewMode === 'generation' ? 'active' : ''}`}
            onClick={() => setViewMode('generation')}
          >
            📈 Generation
          </button>
          <button 
            className={`view-btn ${viewMode === 'breakdown' ? 'active' : ''}`}
            onClick={() => setViewMode('breakdown')}
          >
            🥧 Mix
          </button>
        </div>
      </div>

      <div className="grid-content">
        
        {viewMode === 'generation' && generationData ? (
          <div className="generation-view">
            {/* Solar Generation Chart */}
            <div className="generation-chart">
              <h4>☀️ Solar Generation Forecast</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `Hour ${value}:00`}
                    formatter={(value) => [Math.round(value), 'MW']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="generation" 
                    stroke="#f59e0b"
                    fill="#fef3c7"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Generation Statistics */}
            <div className="generation-stats">
              <h4>📊 Solar Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Peak Generation:</span>
                  <span className="stat-value">
                    {Math.max(...chartData.map(g => g.generation))} MW
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Daily Total:</span>
                  <span className="stat-value">
                    {Math.round(chartData.reduce((sum, g) => sum + g.generation, 0))} MWh
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Data Source:</span>
                  <span className="stat-value">
                    {generationData.source === 'real' ? '✅ ENTSO-E' : '🔶 Mock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="breakdown-view">
            {/* Power Mix Pie Chart */}
            {breakdownData.length > 0 && (
              <div className="breakdown-chart">
                <h4>🔋 Current Power Mix</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={energyColors[entry.name] || '#9ca3af'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'MW']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Power Breakdown List */}
            <div className="breakdown-list">
              <h4>⚡ Generation Sources</h4>
              <div className="sources-list">
                {breakdownData.map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-info">
                      <span className="source-icon">{getEnergyIcon(source.name)}</span>
                      <span className="source-name">{source.name}</span>
                    </div>
                    <div className="source-values">
                      <span className="source-power">{source.value} MW</span>
                      <span className="source-percentage">{source.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Renewable Percentage */}
            {powerBreakdown && (
              <div className="renewable-stats">
                <h4>🌿 Renewable Energy</h4>
                <div className="renewable-grid">
                  <div className="renewable-item">
                    <span className="renewable-label">Renewable:</span>
                    <span className="renewable-value green">
                      {Math.round(powerBreakdown.renewablePercentage || 0)}%
                    </span>
                  </div>
                  <div className="renewable-item">
                    <span className="renewable-label">Fossil Free:</span>
                    <span className="renewable-value green">
                      {Math.round(powerBreakdown.fossilFreePercentage || 0)}%
                    </span>
                  </div>
                  <div className="renewable-item">
                    <span className="renewable-label">Zone:</span>
                    <span className="renewable-value">{powerBreakdown.zone || 'SE'}</span>
                  </div>
                  <div className="renewable-item">
                    <span className="renewable-label">Updated:</span>
                    <span className="renewable-value">
                      {powerBreakdown.datetime ? 
                        new Date(powerBreakdown.datetime).toLocaleTimeString() : 
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GridGenerationPanel;