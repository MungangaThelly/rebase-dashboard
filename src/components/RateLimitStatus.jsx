// src/components/RateLimitStatus.jsx
import React, { useState, useEffect } from 'react';
import { getRateLimitStatus } from '../api/rebaseApi';

export function RateLimitStatus() {
  const [status, setStatus] = useState({
    rebaseRequests: 0,
    rebaseLimit: 50,
    resetTime: null,
    disabled: false
  });

  useEffect(() => {
    // Set reset time to next midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    setStatus(prev => ({
      ...prev,
      resetTime: tomorrow
    }));

    // Update status every second
    const interval = setInterval(() => {
      const rateLimitStatus = getRateLimitStatus();
      setStatus(prev => ({
        ...prev,
        rebaseRequests: rateLimitStatus.requestCount,
        disabled: rateLimitStatus.disabled
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeToReset = status.resetTime ? 
    Math.ceil((status.resetTime - new Date()) / (1000 * 60 * 60)) : 0;

  const isLimited = status.rebaseRequests >= 45 || status.disabled;

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: isLimited ? '#f44336' : '#4CAF50',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      minWidth: '150px'
    }}>
      <div>🔑 Rebase: {status.rebaseRequests}/50</div>
      <div>⏰ Reset: ~{timeToReset}h</div>
      {isLimited && (
        <div style={{ color: '#ffeb3b', fontWeight: 'bold' }}>
          🚫 RATE LIMITED
        </div>
      )}
      <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8 }}>
        Session limit: 45
      </div>
    </div>
  );
}