import React, { useEffect } from 'react';

export function ApiTest() {
  useEffect(() => {
    const testApi = async () => {
      console.log('🧪 Testing Rebase API Root...');
      
      try {
        // Test root endpoint
        const response = await fetch('/api/rebase/');
        console.log('📊 Root API Response:', response.status, response.statusText);
        
        if (response.ok) {
          const text = await response.text();
          console.log('✅ Root API Success:', text.substring(0, 300));
        } else {
          console.log('❌ Root API Failed:', await response.text());
        }
      } catch (error) {
        console.log('🚨 API Test Error:', error);
      }
    };
    
    testApi();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      left: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      🧪 API Test Running - Check Console
    </div>
  );
}