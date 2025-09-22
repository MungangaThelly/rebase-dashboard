// API Configuration
const BASE_URL = import.meta.env.VITE_REBASE_API_URL || 'https://api.rebase.energy/v1';
const API_KEY = import.meta.env.VITE_REBASE_API_KEY;
const ENABLE_TESTING = import.meta.env.VITE_ENABLE_TESTING === 'true';

// Enhanced API request function with authentication
const makeApiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log('🌐 Making Rebase API request to:', url);

  // Add API key to headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`, // or 'X-API-Key': API_KEY depending on Rebase format
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...options
    });

    console.log('📡 Rebase API response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Rebase API response received');
    return data;

  } catch (error) {
    console.error(`❌ Rebase API Error for ${endpoint}:`, error.message);
    throw error;
  }
};

// Test the new API key
export const testRebaseConnection = async () => {
  try {
    console.log('🔌 Testing Rebase API connection...');
    
    // Test basic connectivity (adjust endpoint based on Rebase docs)
    const testEndpoint = '/sites'; // or '/status' or '/health'
    const result = await makeApiRequest(testEndpoint);
    
    console.log('✅ Rebase API connection successful!');
    return { success: true, data: result };
    
  } catch (error) {
    console.error('❌ Rebase API connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Updated fetchEnergySites with real API
export const fetchEnergySites = async () => {
  // First test if we have a valid API key
  if (!API_KEY) {
    console.warn('⚠️ No Rebase API key found, using mock data');
    return getMockSites();
  }

  try {
    const sites = await makeApiRequest('/sites');
    console.log('✅ Real Rebase sites data received:', sites?.length || 0, 'sites');
    return sites;
    
  } catch (error) {
    console.log('📝 Falling back to mock data for sites:', error.message);
    return getMockSites();
  }
};

// Update to use correct Rebase API endpoints:

// Enhanced weather fetching function
export const fetchRebaseWeather = async (location = 'Stockholm') => {
  if (!API_KEY) {
    console.warn('⚠️ No Rebase API key found, using mock weather data');
    return getMockWeatherData();
  }

  try {
    console.log('🔄 Fetching Rebase weather data...');
    
    // Try different possible Rebase endpoints (check their API docs)
    let weather;
    try {
      // Try main weather endpoint
      weather = await makeApiRequest(`/weather?location=${location}`);
    } catch (error) {
      try {
        // Try alternative endpoint
        weather = await makeApiRequest(`/weather/current?location=${location}`);
      } catch (error2) {
        try {
          // Try coordinates-based endpoint for Stockholm
          weather = await makeApiRequest('/weather?lat=59.3293&lon=18.0686');
        } catch (error3) {
          throw new Error('No valid weather endpoint found');
        }
      }
    }
    
    console.log('✅ Real Rebase weather data received:', weather);
    return {
      source: 'real',
      current: weather.current || weather,
      forecast: weather.forecast || [],
      location: location,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.log('📝 Falling back to mock weather data:', error.message);
    return getMockWeatherData();
  }
};

// Mock data functions
const getMockSites = () => [
  {
    id: 'site-001',
    name: 'Stockholm Solar Farm',
    location: 'Stockholm, Sweden',
    coordinates: { lat: 59.3293, lng: 18.0686 },
    capacity: 50,
    type: 'solar',
    status: 'active',
    installation_date: '2023-06-15',
    currentGeneration: 35.2,
    efficiency: 87.5
  },
  {
    id: 'site-002', 
    name: 'Gotland Wind Farm',
    location: 'Gotland, Sweden',
    coordinates: { lat: 57.4684, lng: 18.4867 },
    capacity: 120, // MW
    type: 'wind',
    status: 'active',
    installation_date: '2022-09-22',
    currentGeneration: 89.4,
    efficiency: 74.5
  },
  {
    id: 'site-003',
    name: 'Malmö Offshore Wind',
    location: 'Malmö, Sweden', 
    coordinates: { lat: 55.6050, lng: 13.0038 },
    capacity: 200, // MW
    type: 'wind_offshore',
    status: 'active',
    installation_date: '2024-01-10',
    currentGeneration: 156.8,
    efficiency: 78.4
  },
  {
    id: 'site-004',
    name: 'Västerås Hydro Plant',
    location: 'Västerås, Sweden',
    coordinates: { lat: 59.6162, lng: 16.5528 },
    capacity: 75, // MW
    type: 'hydro',
    status: 'active',
    installation_date: '2021-03-18',
    currentGeneration: 68.9,
    efficiency: 91.9
  }
];

const getMockWeatherData = () => {
  console.log('🎭 Generating mock Rebase weather data...');
  return {
    source: 'mock',
    current: {
      temperature: 12 + Math.random() * 8,
      humidity: 45 + Math.random() * 30,
      windSpeed: 2 + Math.random() * 6,
      pressure: 1010 + Math.random() * 20
    },
    forecast: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      timestamp: new Date(Date.now() + i * 3600000).toISOString(),
      temperature: 10 + Math.random() * 12,
      humidity: 40 + Math.random() * 40,
      windSpeed: 1 + Math.random() * 8,
      pressure: 1005 + Math.random() * 25
    })),
    location: 'Stockholm',
    timestamp: new Date().toISOString()
  };
};

export { API_KEY, BASE_URL, ENABLE_TESTING };