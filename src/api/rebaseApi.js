// Updated to use correct Rebase Weather API v2

// API Configuration - Use v2 weather API
const BASE_URL = '/api/rebase'; // Proxy route
const WEATHER_BASE_URL = '/api/rebase/weather'; // Weather-specific proxy
const API_KEY = import.meta.env.VITE_REBASE_API_KEY;
const ENABLE_TESTING = import.meta.env.VITE_ENABLE_TESTING === 'true';

// Enhanced API request function with correct authentication
const makeApiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log('🌐 Making Rebase API request to:', url);

  // Correct authentication format: Authorization: your_api_key
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': API_KEY, // ✅ Correct format from docs
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

// Weather-specific API request function
const makeWeatherApiRequest = async (endpoint, options = {}) => {
  const url = `${WEATHER_BASE_URL}${endpoint}`;
  console.log('🌐 Making Rebase Weather API request to:', url);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': API_KEY,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...options
    });

    console.log('📡 Rebase Weather API response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Rebase Weather API response received');
    return data;

  } catch (error) {
    console.error(`❌ Rebase Weather API Error for ${endpoint}:`, error.message);
    throw error;
  }
};

// Updated weather fetching with correct parameters
const fetchRebaseWeather = async (lat = 59.3293, lon = 18.0686) => {
  if (!API_KEY) {
    console.warn('⚠️ No Rebase API key found, using mock weather data');
    return getMockWeatherData();
  }

  try {
    console.log('🔄 Fetching Rebase weather data...');
    console.log('📍 Coordinates:', { lat, lon }); // ✅ Add debug info
    
    // Try different Rebase Weather API endpoints with NUMERIC coordinates
    let weatherData;
    
    try {
      // 1. Try query endpoint (most flexible)
      console.log('🔍 Trying query endpoint...');
      weatherData = await makeWeatherApiRequest(`/query?latitude=${lat}&longitude=${lon}`); // ✅ Fixed params
    } catch (error) {
      try {
        // 2. Try point/operational endpoint
        console.log('🔍 Trying point/operational endpoint...');
        weatherData = await makeWeatherApiRequest(`/point/operational?latitude=${lat}&longitude=${lon}`); // ✅ Fixed params
      } catch (error2) {
        try {
          // 3. Try point/historical endpoint
          console.log('🔍 Trying point/historical endpoint...');
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          weatherData = await makeWeatherApiRequest(
            `/point/historical?latitude=${lat}&longitude=${lon}&start=${startDate}&end=${endDate}` // ✅ Fixed params
          );
        } catch (error3) {
          try {
            // 4. Try area/operational endpoint
            console.log('🔍 Trying area/operational endpoint...');
            weatherData = await makeWeatherApiRequest(`/area/operational?latitude=${lat}&longitude=${lon}`); // ✅ Fixed params
          } catch (error4) {
            // 5. Try simpler endpoints without location
            try {
              console.log('🔍 Trying simple query endpoint...');
              weatherData = await makeWeatherApiRequest('/query');
            } catch (error5) {
              throw new Error('No valid Rebase weather endpoint found');
            }
          }
        }
      }
    }
    
    console.log('✅ Real Rebase weather data received:', weatherData);
    
    // Transform Rebase data to our expected format
    return transformRebaseWeatherData(weatherData);
    
  } catch (error) {
    console.log('📝 Falling back to mock weather data:', error.message);
    return getMockWeatherData();
  }
};

// Transform Rebase API response to our expected format
const transformRebaseWeatherData = (rebaseData) => {
  console.log('🔄 Transforming Rebase weather data...');
  
  // Handle different possible Rebase response formats
  let current, forecast;
  
  if (rebaseData.data && Array.isArray(rebaseData.data)) {
    // If data is an array (time series)
    const latestData = rebaseData.data[rebaseData.data.length - 1];
    current = {
      temperature: latestData.temperature || latestData.temp || 15,
      humidity: latestData.humidity || latestData.rh || 50,
      windSpeed: latestData.windSpeed || latestData.ws || 3,
      pressure: latestData.pressure || latestData.mslp || 1013
    };
    
    // Use the array as forecast data
    forecast = rebaseData.data.map((item, index) => ({
      hour: index,
      timestamp: item.timestamp || item.time || new Date(Date.now() + index * 3600000).toISOString(),
      temperature: item.temperature || item.temp || 15,
      humidity: item.humidity || item.rh || 50,
      windSpeed: item.windSpeed || item.ws || 3,
      pressure: item.pressure || item.mslp || 1013
    }));
  } else if (rebaseData.temperature !== undefined || rebaseData.temp !== undefined) {
    // If data is a single object
    current = {
      temperature: rebaseData.temperature || rebaseData.temp || 15,
      humidity: rebaseData.humidity || rebaseData.rh || 50,
      windSpeed: rebaseData.windSpeed || rebaseData.ws || 3,
      pressure: rebaseData.pressure || rebaseData.mslp || 1013
    };
    
    // Generate forecast from current data
    forecast = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      timestamp: new Date(Date.now() + i * 3600000).toISOString(),
      temperature: current.temperature + (Math.random() - 0.5) * 4,
      humidity: current.humidity + (Math.random() - 0.5) * 20,
      windSpeed: current.windSpeed + (Math.random() - 0.5) * 2,
      pressure: current.pressure + (Math.random() - 0.5) * 10
    }));
  } else {
    throw new Error('Unrecognized Rebase data format');
  }
  
  return {
    source: 'real',
    current,
    forecast,
    location: 'Stockholm',
    timestamp: new Date().toISOString(),
    raw: rebaseData // Keep original for debugging
  };
};

// Test specific endpoint
const testRebaseWeatherEndpoint = async (endpoint = 'query', lat = 59.3293, lon = 18.0686) => {
  if (!API_KEY) {
    return { success: false, error: 'No API key found' };
  }

  try {
    console.log(`🔌 Testing Rebase Weather endpoint: ${endpoint}`);
    
    let testUrl;
    switch (endpoint) {
      case 'query':
        testUrl = `/query?latitude=${lat}&longitude=${lon}`;
        break;
      case 'point/operational':
        testUrl = `/point/operational?latitude=${lat}&longitude=${lon}`;
        break;
      case 'point/historical':
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        testUrl = `/point/historical?latitude=${lat}&longitude=${lon}&start=${startDate}&end=${endDate}`;
        break;
      case 'area/operational':
        testUrl = `/area/operational?latitude=${lat}&longitude=${lon}`;
        break;
      case 'area/historical':
        const endDate2 = new Date().toISOString().split('T')[0];
        const startDate2 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        testUrl = `/area/historical?latitude=${lat}&longitude=${lon}&start=${startDate2}&end=${endDate2}`;
        break;
      default:
        testUrl = `/${endpoint}`;
    }
    
    const result = await makeWeatherApiRequest(testUrl);
    console.log('✅ Rebase Weather endpoint test successful!');
    return { success: true, data: result, endpoint };
    
  } catch (error) {
    console.error('❌ Rebase Weather endpoint test failed:', error);
    return { success: false, error: error.message, endpoint };
  }
};

// Keep existing functions
const fetchEnergySites = async () => {
  if (!API_KEY) {
    console.warn('⚠️ No Rebase API key found, using mock data');
    return getMockSites();
  }

  try {
    const sites = await makeApiRequest('/v1/sites');
    console.log('✅ Real Rebase sites data received:', sites?.length || 0, 'sites');
    return sites;
    
  } catch (error) {
    console.log('📝 Falling back to mock data for sites:', error.message);
    return getMockSites();
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
    capacity: 120,
    type: 'wind',
    status: 'active',
    installation_date: '2022-09-22',
    currentGeneration: 89.4,
    efficiency: 74.5
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

// ✅ SINGLE EXPORT STATEMENT - All exports in one place
export { 
  API_KEY, 
  BASE_URL, 
  ENABLE_TESTING, 
  testRebaseWeatherEndpoint,
  fetchEnergySites,
  fetchRebaseWeather
};