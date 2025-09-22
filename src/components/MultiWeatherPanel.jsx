import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MultiWeatherPanel = ({ rebaseData, openWeatherData, loading }) => {
  const [metric, setMetric] = useState('temperature');
  const [chartData, setChartData] = useState([]);

  // ✅ DEBUG DATA ON COMPONENT MOUNT
  useEffect(() => {
    console.log('🔍 MultiWeatherPanel received data:');
    console.log('- Rebase data:', rebaseData);
    console.log('- OpenWeather data:', openWeatherData);
    console.log('- Loading:', loading);
  }, [rebaseData, openWeatherData, loading]);

  // ✅ IMPROVED DATA PREPARATION
  useEffect(() => {
    if (!openWeatherData && !rebaseData) {
      console.log('⚠️ No weather data available for chart');
      setChartData([]);
      return;
    }

    console.log('📊 Preparing chart data...');
    const preparedData = prepareChartData();
    console.log('📊 Chart data prepared:', preparedData.length, 'points');
    setChartData(preparedData);
  }, [rebaseData, openWeatherData, metric]);

  const prepareChartData = () => {
    const chartPoints = [];
    const now = new Date();
    
    // Generate 24-hour data
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(now.getHours() + i, 0, 0, 0);
      
      const point = {
        time: hour.getHours().toString().padStart(2, '0') + ':00',
        hour: hour.getHours(),
        timestamp: hour.toISOString()
      };

      // OpenWeather data (current with variation)
      if (openWeatherData?.main) {
        const baseValue = getMetricValue(openWeatherData, metric);
        const variation = (Math.random() - 0.5) * (baseValue * 0.1); // 10% variation
        point.openweather = Math.round((baseValue + variation) * 10) / 10;
      }

      // Rebase data (real or mock)
      if (rebaseData) {
        if (rebaseData.forecast && rebaseData.forecast[i]) {
          // Use forecast data if available
          point.rebase = getMetricValue(rebaseData.forecast[i], metric);
        } else if (rebaseData.current) {
          // Use current data with variation
          const baseValue = getMetricValue(rebaseData.current, metric);
          const variation = (Math.random() - 0.5) * (baseValue * 0.15); // 15% variation
          point.rebase = Math.round((baseValue + variation) * 10) / 10;
        }
      }

      // Only add point if we have at least one data source
      if (point.openweather !== undefined || point.rebase !== undefined) {
        chartPoints.push(point);
      }
    }
    
    return chartPoints;
  };

  const getMetricValue = (data, metric) => {
    if (!data) return undefined;
    
    switch (metric) {
      case 'temperature':
        return data.main?.temp || data.temperature || undefined;
      case 'humidity':
        return data.main?.humidity || data.humidity || undefined;
      case 'windSpeed':
        return data.wind?.speed || data.windSpeed || undefined;
      case 'pressure':
        return data.main?.pressure || data.pressure || undefined;
      default:
        return undefined;
    }
  };

  // ✅ CALCULATE STATISTICS
  const calculateStats = () => {
    if (chartData.length === 0) {
      return {
        averageDifference: 0,
        dataPoints: 0,
        agreement: 0
      };
    }

    const validPoints = chartData.filter(d => 
      d.openweather !== undefined && d.rebase !== undefined
    );

    if (validPoints.length === 0) {
      return {
        averageDifference: 0,
        dataPoints: chartData.length,
        agreement: 0
      };
    }

    const differences = validPoints.map(d => Math.abs(d.openweather - d.rebase));
    const avgDiff = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    const agreement = validPoints.filter(d => Math.abs(d.openweather - d.rebase) < 2).length / validPoints.length * 100;

    return {
      averageDifference: Math.round(avgDiff * 10) / 10,
      dataPoints: chartData.length,
      agreement: Math.round(agreement)
    };
  };

  const stats = calculateStats();
  
  const metricOptions = [
    { value: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
    { value: 'humidity', label: 'Humidity', unit: '%', icon: '💧' },
    { value: 'windSpeed', label: 'Wind Speed', unit: 'm/s', icon: '💨' },
    { value: 'pressure', label: 'Pressure', unit: 'hPa', icon: '📊' }
  ];

  const currentMetric = metricOptions.find(m => m.value === metric);

  return (
    <div className="api-panel weather-comparison">
      <div className="panel-header">
        <h3>🌤️ Multi-Source Weather</h3>
        <select 
          value={metric} 
          onChange={(e) => setMetric(e.target.value)}
          className="metric-selector"
        >
          {metricOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data Source Status */}
      <div className="data-sources">
        <div className={`source-status ${rebaseData ? 'connected' : 'disconnected'}`}>
          <span className="source-icon">🎯</span>
          <span>Rebase</span>
          <span className="status-indicator">{rebaseData ? '✅' : '❌'}</span>
        </div>
        <div className={`source-status ${openWeatherData ? 'connected' : 'disconnected'}`}>
          <span className="source-icon">☁️</span>
          <span>OpenWeather</span>
          <span className="status-indicator">{openWeatherData ? '✅' : '❌'}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading weather data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  value !== undefined ? `${value}${currentMetric?.unit}` : 'N/A', 
                  name === 'openweather' ? 'OpenWeather' : 'Rebase'
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              {chartData.some(d => d.rebase !== undefined) && (
                <Line 
                  type="monotone" 
                  dataKey="rebase" 
                  stroke="#ff6b6b" 
                  strokeWidth={2}
                  name="Rebase"
                  dot={{ fill: '#ff6b6b', r: 3 }}
                  connectNulls={false}
                />
              )}
              {chartData.some(d => d.openweather !== undefined) && (
                <Line 
                  type="monotone" 
                  dataKey="openweather" 
                  stroke="#4ecdc4" 
                  strokeWidth={2}
                  name="OpenWeather"
                  dot={{ fill: '#4ecdc4', r: 3 }}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>No weather data available</p>
            <small>Check API connections</small>
            <button onClick={() => window.location.reload()}>🔄 Refresh</button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="weather-stats">
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div>
            <div className="stat-label">Average Difference:</div>
            <div className="stat-value">{stats.averageDifference}{currentMetric?.unit}</div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📈</span>
          <div>
            <div className="stat-label">Data Points:</div>
            <div className="stat-value">{stats.dataPoints}/24</div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <div>
            <div className="stat-label">Agreement:</div>
            <div className="stat-value">{stats.agreement}%</div>    
          </div>
        </div>
      </div>

      {/* Current Values */}
      {(openWeatherData || rebaseData) && (
        <div className="current-values">
          <h4>Current {currentMetric?.label}</h4>
          <div className="value-comparison">
            {rebaseData && (
              <div className="source-value rebase">
                <span className="source-icon">🎯</span>
                <span className="source-name">Rebase</span>
                <span className="value">
                  {currentMetric?.icon} {getMetricValue(rebaseData.current, metric) || 'N/A'}{currentMetric?.unit}
                </span>
              </div>
            )}
            {openWeatherData && (
              <div className="source-value openweather">
                <span className="source-icon">☁️</span>
                <span className="source-name">OpenWeather</span>
                <span className="value">
                  {currentMetric?.icon} {getMetricValue(openWeatherData, metric) || 'N/A'}{currentMetric?.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiWeatherPanel;