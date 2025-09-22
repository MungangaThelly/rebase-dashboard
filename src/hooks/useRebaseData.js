// src/hooks/useRebaseData.js
import { useState, useEffect, useRef } from 'react';
import { fetchEnergySites, fetchEnergyProduction, fetchWeatherData } from '../api/rebaseApi';

export function useRebaseData(endpoint, delay = 10000) { // 10 second delay
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      
      try {
        let result;
        
        // Map endpoints to your existing functions
        switch (endpoint) {
          case '/sites':
            result = await fetchEnergySites();
            break;
          case '/production':
            result = await fetchEnergyProduction();
            break;
          case '/weather':
            result = await fetchWeatherData();
            break;
          default:
            throw new Error(`Unknown endpoint: ${endpoint}`);
        }
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      }
      
      setLoading(false);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [endpoint, delay]);

  return { data, loading, error };
}