import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ElectricityPricesPanel = ({ data, loading }) => {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

  if (loading) {
    return (
      <div className="panel prices-panel">
        <div className="panel-header">
          <h3>💰 Electricity Prices</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading price data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.prices) {
    return (
      <div className="panel prices-panel">
        <div className="panel-header">
          <h3>💰 Electricity Prices</h3>
        </div>
        <div className="error-state">
          <p>❌ Electricity price data unavailable</p>
        </div>
      </div>
    );
  }

  const prices = data.prices;
  const currentPrice = prices[new Date().getHours()] || prices[0];
  const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
  const minPrice = Math.min(...prices.map(p => p.price));
  const maxPrice = Math.max(...prices.map(p => p.price));

  const getPriceLevel = (price) => {
    if (price < avgPrice * 0.8) return { level: 'Low', color: '#22c55e', icon: '🟢' };
    if (price < avgPrice * 1.2) return { level: 'Normal', color: '#84cc16', icon: '🟡' };
    if (price < avgPrice * 1.5) return { level: 'High', color: '#f59e0b', icon: '🟠' };
    return { level: 'Very High', color: '#ef4444', icon: '🔴' };
  };

  const priceLevel = getPriceLevel(currentPrice.price);

  return (
    <div className="panel prices-panel">
      <div className="panel-header">
        <h3>💰 Electricity Prices</h3>
        <div className="panel-controls">
          <span className="data-source">{data.source}</span>
          <button 
            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            📊
          </button>
          <button 
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋
          </button>
        </div>
      </div>

      <div className="prices-content">
        {/* Current Price */}
        <div className="price-current">
          <div className="price-value" style={{ color: priceLevel.color }}>
            {priceLevel.icon} {Math.round(currentPrice.price * 100) / 100}
          </div>
          <div className="price-unit">{currentPrice.currency}</div>
          <div className="price-level" style={{ color: priceLevel.color }}>
            {priceLevel.level}
          </div>
        </div>

        {/* Price Statistics */}
        <div className="price-stats">
          <div className="stat-item">
            <span className="stat-label">Average:</span>
            <span className="stat-value">{Math.round(avgPrice * 100) / 100} EUR/MWh</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Range:</span>
            <span className="stat-value">{Math.round(minPrice)} - {Math.round(maxPrice)} EUR/MWh</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Points:</span>
            <span className="stat-value">{data.total}</span>
          </div>
        </div>

        {/* Chart or Table View */}
        {viewMode === 'chart' ? (
          <div className="prices-chart">
            <h4>24h Price Forecast</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={prices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Hour ${value}:00`}
                  formatter={(value) => [Math.round(value * 100) / 100, 'EUR/MWh']}
                />
                <Bar 
                  dataKey="price" 
                  fill="#3b82f6"
                  name="Price"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="prices-table">
            <h4>Hourly Prices</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Hour</th>
                    <th>Price</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.slice(0, 12).map((price, index) => {
                    const level = getPriceLevel(price.price);
                    return (
                      <tr key={index} className={price.hour === new Date().getHours() + 1 ? 'current-hour' : ''}>
                        <td>{price.hour}:00</td>
                        <td>{Math.round(price.price * 100) / 100}</td>
                        <td style={{ color: level.color }}>
                          {level.icon} {level.level}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Price Optimization Tips */}
        <div className="price-tips">
          <h4>💡 Optimization Tips</h4>
          <div className="tips-list">
            {minPrice < avgPrice * 0.7 && (
              <div className="tip">
                <span className="tip-icon">⚡</span>
                <span>Best time to charge: Hour {prices.find(p => p.price === minPrice)?.hour}:00</span>
              </div>
            )}
            {maxPrice > avgPrice * 1.3 && (
              <div className="tip">
                <span className="tip-icon">🔋</span>
                <span>Avoid usage: Hour {prices.find(p => p.price === maxPrice)?.hour}:00</span>
              </div>
            )}
            <div className="tip">
              <span className="tip-icon">💰</span>
              <span>Potential savings: {Math.round((maxPrice - minPrice) * 100) / 100} EUR/MWh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricityPricesPanel;