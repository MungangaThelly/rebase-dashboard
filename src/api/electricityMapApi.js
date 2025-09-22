const API_KEY = import.meta.env.VITE_ELECTRICITYMAP_API_KEY;

// ✅ FIXED: Use direct API calls for production (Netlify)
const BASE_URL = import.meta.env.PROD 
  ? 'https://api.electricitymap.org/v3' 
  : '/api/electricitymap';

const makeElectricityMapRequest = async (endpoint) => {
  // ✅ Enhanced error handling for production
  if (!API_KEY && import.meta.env.PROD) {
    console.warn('⚠️ No ElectricityMap API key found in production, using mock data');
    throw new Error('No API key available');
  }

  const url = `${BASE_URL}${endpoint}`;
  console.log('🌐 ElectricityMap API request:', url);

  const headers = {
    'Content-Type': 'application/json'
  };

  // ✅ Add API key to headers if available
  if (API_KEY) {
    headers['auth-token'] = API_KEY;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      // ✅ Add timeout for production
      signal: AbortSignal.timeout(10000)
    });

    console.log('📡 ElectricityMap response status:', response.status);

    if (!response.ok) {
      // ✅ Better error messages for different status codes
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 403) {
        throw new Error('API access forbidden - check your plan');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('✅ ElectricityMap data received');
    return data;

  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.error('⏰ ElectricityMap API timeout');
      throw new Error('API request timeout');
    }
    console.error(`❌ ElectricityMap API Error:`, error.message);
    throw error;
  }
};

// ✅ Enhanced carbon intensity with better fallback
export const fetchCarbonIntensity = async () => {
  try {
    console.log('🔄 Fetching carbon intensity data...');
    
    const data = await makeElectricityMapRequest('/carbon-intensity/latest?countryCode=SE');
    
    console.log('✅ Real carbon intensity data received:', data);
    
    return {
      source: 'real',
      intensity: data.carbonIntensity || data.data?.carbonIntensity || 85,
      zone: data.zone || data.data?.zone || 'SE',
      datetime: data.datetime || data.data?.datetime || new Date().toISOString(),
      updatedAt: data.updatedAt || data.data?.updatedAt || new Date().toISOString(),
      raw: data
    };
    
  } catch (error) {
    console.log('📝 Using mock carbon intensity data:', error.message);
    return getMockCarbonIntensity();
  }
};

// ✅ Enhanced power breakdown with better fallback
export const fetchPowerBreakdown = async () => {
  try {
    console.log('🔄 Fetching power breakdown data...');
    
    const data = await makeElectricityMapRequest('/power-breakdown/latest?countryCode=SE');
    
    console.log('✅ Real power breakdown data received:', data);
    
    const powerBreakdown = data.powerConsumptionBreakdown || data.data?.powerConsumptionBreakdown || {};
    
    return {
      source: 'real',
      zone: data.zone || data.data?.zone || 'SE',
      datetime: data.datetime || data.data?.datetime || new Date().toISOString(),
      breakdown: {
        nuclear: powerBreakdown.nuclear || 0,
        hydro: powerBreakdown.hydro || 0,
        wind: powerBreakdown.wind || 0,
        solar: powerBreakdown.solar || 0,
        biomass: powerBreakdown.biomass || 0,
        coal: powerBreakdown.coal || 0,
        gas: powerBreakdown.gas || 0,
        oil: powerBreakdown.oil || 0,
        unknown: powerBreakdown.unknown || 0
      },
      raw: data
    };
    
  } catch (error) {
    console.log('📝 Using mock power breakdown data:', error.message);
    return getMockPowerBreakdown();
  }
};

// ✅ Enhanced mock data functions
const getMockCarbonIntensity = () => ({
  source: 'mock',
  intensity: 85 + Math.random() * 30, // 85-115 g CO2/kWh for Sweden
  zone: 'SE',
  datetime: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  note: 'Mock data - typical Swedish grid carbon intensity'
});

const getMockPowerBreakdown = () => ({
  source: 'mock',
  zone: 'SE', 
  datetime: new Date().toISOString(),
  breakdown: {
    nuclear: 35 + Math.random() * 10,     // 35-45% nuclear
    hydro: 25 + Math.random() * 15,       // 25-40% hydro
    wind: 10 + Math.random() * 10,        // 10-20% wind
    solar: 1 + Math.random() * 3,         // 1-4% solar
    biomass: 8 + Math.random() * 5,       // 8-13% biomass
    coal: 0 + Math.random() * 2,          // 0-2% coal
    gas: 1 + Math.random() * 3,           // 1-4% gas
    oil: 0 + Math.random() * 1,           // 0-1% oil
    unknown: 1 + Math.random() * 2        // 1-3% unknown
  },
  note: 'Mock data - typical Swedish power generation mix'
});