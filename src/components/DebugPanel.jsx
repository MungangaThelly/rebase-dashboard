import React from 'react';

export function DebugPanel() {
  const checkEnv = () => {
    console.log('🔧 Environment Variables Check:');
    console.log('MODE:', import.meta.env.MODE);
    console.log('DEV:', import.meta.env.DEV);
    
    const rebaseKey = import.meta.env.VITE_REBASE_API_KEY;
    const electricityKey = import.meta.env.VITE_ELECTRICITYMAP_API_KEY;
    const entsoeKey = import.meta.env.VITE_ENTSOE_API_KEY;
    const weatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    console.log('🔑 Rebase Key:', rebaseKey ? 
      `${rebaseKey.substring(0, 12)}...` : '❌ MISSING');
    console.log('🔑 ElectricityMap Key:', electricityKey ? 
      `${electricityKey.substring(0, 8)}...` : '❌ MISSING');
    console.log('🔑 ENTSO-E Key:', entsoeKey ? 
      `${entsoeKey.substring(0, 8)}...` : '❌ MISSING');
    console.log('🔑 OpenWeather Key:', weatherKey ? 
      `${weatherKey.substring(0, 8)}...` : '❌ MISSING');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '15px',
      borderRadius: '8px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <button 
        onClick={checkEnv} 
        style={{ 
          background: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🔧 Check Environment
      </button>
      <div style={{ marginTop: '8px', fontSize: '10px' }}>
        Expected Keys:<br/>
        • Rebase: 8Su5nbBnRKS_...<br/>
        • ElectricityMap: UiEDBtlD...<br/>
        • ENTSO-E: 5af65803...<br/>
        • OpenWeather: b1fac259...
      </div>
    </div>
  );
}