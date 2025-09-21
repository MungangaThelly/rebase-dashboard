import axios from 'axios';

// Environment configuration
const API_BASE_URL = '/api/rebase';  // Use the proxy instead of direct URL
const API_KEY = import.meta.env.VITE_REBASE_API_KEY;
const FORCE_MOCK = false; // Changed to false to try real API first

// Cache system
const apiCache = new Map();
const CACHE_DURATION = 30000;

function getCacheKey(url) {
  return `${url}_${Date.now()}`;
}

function getCachedData(key) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Mock data generators
function generateMockSites() {
  return [
    {
      id: 'mock-1',
      name: 'Stockholm Solar Farm',
      type: 'solar',
      capacity: 50,
      location: { lat: 59.3293, lng: 18.0686 },
      status: 'active'
    },
    {
      id: 'mock-2', 
      name: 'Gothenburg Wind Park',
      type: 'wind',
      capacity: 120,
      location: { lat: 57.7089, lng: 11.9746 },
      status: 'active'
    },
    {
      id: 'mock-3',
      name: 'Malmö Renewable Hub',
      type: 'hybrid',
      capacity: 75,
      location: { lat: 55.6059, lng: 13.0007 },
      status: 'maintenance'
    }
  ];
}

function generateMockProduction() {
  const now = new Date();
  const data = [];
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      solar: Math.random() * 100,
      wind: Math.random() * 150,
      total: Math.random() * 250
    });
  }
  
  return data;
}

function generateMockWeather() {
  const now = new Date();
  const data = [];
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      temperature: 15 + Math.random() * 10,
      windSpeed: Math.random() * 20,
      solarRadiation: Math.random() * 1000,
      cloudCover: Math.random() * 100,
      humidity: 30 + Math.random() * 40
    });
  }
  
  return data;
}

// Transform functions
function transformWeatherData(rawData) {
  if (!rawData || !rawData.valid_datetime) {
    return [];
  }
  
  return rawData.valid_datetime.map((time, index) => ({
    timestamp: time,
    temperature: rawData.Temperature?.[index] || null,
    windSpeed: rawData.WindSpeed?.[index] || null,
    solarRadiation: rawData.SolarDownwardRadiation?.[index] || null,
    cloudCover: rawData.CloudCover?.[index] || null,
    humidity: rawData.RelativeHumidity?.[index] || null
  }));
}

// API helper function
async function makeApiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = getCacheKey(url);
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log(`🎯 Using cached data for ${endpoint}`);
    return cachedData;
  }

  try {
    console.log(`🌐 Making API request to: ${url}`);
    
    // Let the proxy handle authentication headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });

    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success for ${endpoint}:`, data);
    
    // Cache the successful response
    setCachedData(cacheKey, data);
    
    return data;
    
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error.message);
    throw error;
  }
}

// Energy sub-endpoints testing function
export async function testEnergySubEndpoints() {
  console.log('🔍 Testing /energy sub-endpoints...');
  
  const energyEndpoints = [
    '/energy/sites',
    '/energy/projects', 
    '/energy/installations',
    '/energy/facilities',
    '/energy/data',
    '/energy/assets',
    '/energy/generation',
    '/energy/production',
    '/energy/solar',
    '/energy/wind',
    '/energy/api',
    '/energy/v1'
  ];

  const results = {};
  
  for (const endpoint of energyEndpoints) {
    try {
      console.log(`🧪 Testing: ${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'GL-API-KEY': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      results[endpoint] = {
        status: response.status,
        contentType: response.headers.get('content-type'),
        success: response.status < 400
      };
      
      if (response.status < 400) {
        console.log(`✅ SUCCESS: ${endpoint} → ${response.status}`);
        
        // Try to get sample data
        try {
          if (response.headers.get('content-type')?.includes('json')) {
            const data = await response.json();
            console.log(`📊 ${endpoint} data sample:`, Object.keys(data), data);
            results[endpoint].sampleData = data;
          }
        } catch (e) {
          console.log(`📄 ${endpoint}: Valid response but couldn't parse JSON`);
        }
      } else {
        console.log(`❌ ${endpoint}: ${response.status}`);
      }
      
    } catch (error) {
      results[endpoint] = { error: error.message };
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    
    // Small delay to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

// Main API functions
export async function fetchEnergySites() {
  if (FORCE_MOCK) {
    console.log('🎭 Using mock energy sites');
    return generateMockSites();
  }

  try {
    // First test the basic energy endpoint
    console.log('🔍 Testing basic /energy endpoint first...');
    await makeApiRequest('/energy');
    
    // Then try sites
    const data = await makeApiRequest('/energy/sites');
    return Array.isArray(data) ? data : (data.sites || []);
    
  } catch (error) {
    console.warn('⚠️ Energy sites API failed, using mock data:', error.message);
    return generateMockSites();
  }
}

export async function fetchEnergyProduction() {
  if (FORCE_MOCK) {
    console.log('🎭 Using mock energy production');
    return generateMockProduction();
  }

  try {
    const data = await makeApiRequest('/energy/production');
    return Array.isArray(data) ? data : (data.production || generateMockProduction());
    
  } catch (error) {
    console.warn('⚠️ Energy production API failed, using mock data:', error.message);
    return generateMockProduction();
  }
}

export async function fetchWeatherData() {
  if (FORCE_MOCK) {
    console.log('🎭 Using mock weather data');
    return generateMockWeather();
  }

  try {
    const data = await makeApiRequest('/weather');
    
    // If we get structured weather data, transform it
    if (data && data.valid_datetime) {
      return transformWeatherData(data);
    }
    
    // Otherwise return as-is or fallback
    return Array.isArray(data) ? data : generateMockWeather();
    
  } catch (error) {
    console.warn('⚠️ Weather API failed, using mock data:', error.message);
    return generateMockWeather();
  }
}

// Test all endpoints function
export async function testAllEndpoints() {
  console.log('🧪 Testing all Rebase API endpoints...');
  
  const endpoints = [
    '/energy',
    '/energy/sites',
    '/energy/production', 
    '/energy/data',
    '/weather',
    '/weather/current',
    '/weather/forecast'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      const data = await makeApiRequest(endpoint);
      results[endpoint] = { success: true, data };
      console.log(`✅ ${endpoint}: Success`);
    } catch (error) {
      results[endpoint] = { success: false, error: error.message };
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return results;
}

// Debug function to check API configuration
export function debugApiConfig() {
  console.log('🔧 Rebase API Configuration:');
  console.log('📍 Base URL:', API_BASE_URL);
  console.log('🔑 API Key:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'NOT SET');
  console.log('🎭 Force Mock:', FORCE_MOCK);
  console.log('🌐 Environment:', import.meta.env.MODE);
}

// New endpoint testing function
export async function testRebaseEndpoints() {
  console.log('🧪 Testing Rebase API endpoints...');
  
  const endpoints = [
    '/api/rebase/',           // Root API
    '/api/rebase/docs',       // Documentation
    '/api/rebase/openapi.json', // API schema
    '/api/rebase/health',     // Health check
    '/api/rebase/v1/',        // Version 1 root
    '/api/rebase/api/v1/',    // Alternative v1 path
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      console.log(`📊 ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`✅ Success! Response preview:`, text.substring(0, 200));
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error -`, error.message);
    }
  }
}