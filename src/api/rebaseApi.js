import axios from 'axios';

// Environment configuration
const API_KEY = import.meta.env.VITE_REBASE_API_KEY;
const API_BASE_URL = '/api';
const FORCE_MOCK = true;


// Cache system
const apiCache = new Map();
const CACHE_DURATION = 30000;

function getCacheKey(url) {
  return url;
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

// Mock data
const MOCK_SITES = [
  {
    id: 'se-stockholm-alpha',
    name: 'Stockholm Solar Alpha',
    type: 'solar',
    country: 'Sweden',
    location: { latitude: 59.3293, longitude: 18.0686 },
    capacity: 125.5,
    description: 'Large-scale solar installation in Stockholm region'
  },
  {
    id: 'de-bavaria-wind',
    name: 'Bavaria Wind Farm',
    type: 'wind',
    country: 'Germany',
    location: { latitude: 48.1351, longitude: 11.5820 },
    capacity: 89.2,
    description: 'Offshore wind farm in Bavaria'
  },
  {
    id: 'es-andalusia-solar',
    name: 'Andalusia Solar Complex',
    type: 'solar',
    country: 'Spain',
    location: { latitude: 37.3891, longitude: -5.9845 },
    capacity: 156.8,
    description: 'Major solar complex in southern Spain'
  },
  {
    id: 'fr-normandy-wind',
    name: 'Normandy Coastal Wind',
    type: 'wind',
    country: 'France',
    location: { latitude: 49.1829, longitude: -0.3707 },
    capacity: 78.3,
    description: 'Coastal wind farm in Normandy'
  },
  {
    id: 'it-sicily-solar',
    name: 'Sicily Solar Grid',
    type: 'solar',
    country: 'Italy',
    location: { latitude: 37.5079, longitude: 15.0830 },
    capacity: 92.1,
    description: 'Distributed solar grid across Sicily'
  }
];

// ================================
// API ENDPOINT DISCOVERY
// ================================

export async function discoverAPIEndpoints() {
  const testEndpoints = [
    '/sites',
    '/solar/sites',
    '/api/v1/sites',
    '/api/v2/sites',
    '/projects',
    '/installations', 
    '/assets',
    '/plants',
    '/'  // Root endpoint
  ];

  console.log('🔍 Testing API endpoints...');
  
  const results = {};
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`https://api.rebase.energy${endpoint}`, {
        method: 'GET',
        headers: {
          'GL-API-KEY': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      results[endpoint] = {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        exists: response.status !== 404
      };
      
      console.log(`📍 ${endpoint}: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      results[endpoint] = {
        status: 'ERROR',
        error: error.message,
        exists: false
      };
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

export async function checkAPIDocumentation() {
  try {
    console.log('🔍 Checking API documentation endpoints...');
    
    const docEndpoints = [
      '/',
      '/docs',
      '/api-docs', 
      '/swagger',
      '/openapi.json',
      '/v1/docs',
      '/v2/docs'
    ];
    
    for (const endpoint of docEndpoints) {
      try {
        const response = await fetch(`https://api.rebase.energy${endpoint}`, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/json,*/*'
          }
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`📖 Found docs at ${endpoint}: ${response.status} (${contentType})`);
          
          if (contentType?.includes('json')) {
            const data = await response.json();
            console.log('📋 API Docs content:', data);
          }
        }
        
      } catch (error) {
        // Ignore errors for doc discovery
      }
    }
    
  } catch (error) {
    console.error('Documentation check failed:', error);
  }
}

// ================================
// SITES API WITH FALLBACK
// ================================

export async function fetchSites() {
  const cacheKey = 'sites';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  if (FORCE_MOCK) {
    setCachedData(cacheKey, MOCK_SITES);
    return MOCK_SITES;
  }

  try {
    console.log('🔄 Fetching sites from:', `${API_BASE_URL}/sites`);
    const response = await fetch(`${API_BASE_URL}/sites`);
    
    console.log('📡 Sites API Response:', response.status, response.statusText);
    
    if (!response.ok) {
      console.log('⚠️ Sites API failed, using mock data: Sites API Error:', response.status);
      setCachedData(cacheKey, MOCK_SITES);
      return MOCK_SITES;
    }

    const data = await response.json();
    console.log('✅ Sites data received:', data);
    setCachedData(cacheKey, data);
    return data;
    
  } catch (error) {
    console.log('⚠️ Sites API failed, using mock data:', error.message);
    setCachedData(cacheKey, MOCK_SITES);
    return MOCK_SITES;
  }
}

export async function fetchLatestForecast(siteId) {
  // Mock forecast with realistic solar production curves
  
  const now = new Date();
  const site = MOCK_SITES.find(s => s.id === siteId);
  const capacity = site?.capacity || 30;
  
  return {
    site_id: siteId,
    forecast_time: now.toISOString(),
    model: 'Mock Solar Production Model v1.2',
    capacity_mw: capacity,
    values: Array.from({ length: 48 }, (_, i) => {
      const time = new Date(now.getTime() + i * 1800000); // 30-minute intervals
      const hour = time.getHours();
      const minute = time.getMinutes();
      
      // Realistic solar production curve
      let power = 0;
      if (hour >= 5 && hour <= 20) {
        const timeOfDay = hour + minute / 60;
        const sunAngle = Math.sin(((timeOfDay - 5) / 15) * Math.PI);
        const cloudiness = 0.8 + 0.2 * Math.sin(time.getTime() / 3600000); // Weather variation
        const efficiency = 0.85 + 0.1 * Math.random(); // System efficiency variation
        
        power = Math.max(0, sunAngle * cloudiness * efficiency * capacity);
      }
      
      return {
        time: time.toISOString(),
        power: Math.round(power * 100) / 100,
        irradiance: hour >= 6 && hour <= 18 ? Math.round((200 + Math.random() * 800)) : 0,
        temperature: 15 + 10 * Math.sin(((hour - 6) / 12) * Math.PI) + Math.random() * 5
      };
    })
  };
}

// ================================
// WEATHER API (Real API - try this)
// ================================

export async function fetchWeatherForecast(latitude, longitude) {
  const cacheKey = `weather_${latitude}_${longitude}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  // 🎯 FORCE MOCK MODE - This should bypass API calls entirely
  if (FORCE_MOCK) {
    const result = {
      source: 'mock',
      forecasts: generateMockWeatherData(latitude, longitude),
      error: 'Mock mode enabled'
    };
    setCachedData(cacheKey, result);
    return result;
  }

  // This code should NOT run when FORCE_MOCK = true
  try {
    console.log(`🔄 Fetching weather for: ${latitude}, ${longitude}`);
    console.log('🔑 API Key check:', API_KEY ? 'Present' : 'Missing');
    
    // Use shorter timeframe to avoid 413 error
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(today.getHours() + 6); // Only 6 hours
    
    const startDate = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Minimal variables to reduce request size
    const variables = ['Temperature', 'WindSpeed', 'SolarDownwardRadiation'].join(',');

    const params = new URLSearchParams({
      'model': 'DWD_ICON-EU',
      'start-date': startDate,
      'end-date': endDateStr,
      'latitude': latitude.toString(),
      'longitude': longitude.toString(),
      'variables': variables,
      'output-format': 'json'
    });

    const proxyUrl = `/api/weather/v2/query?${params}`;
    console.log(`🔄 Fetching weather from: ${proxyUrl}`);

    let response = await fetch(proxyUrl, {
      headers: {
        'GL-API-KEY': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('❌ API request failed with status:', response.status);
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      throw new Error(`Weather API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Weather data received:', data);

    const result = {
      source: 'real',
      forecasts: transformWeatherData(data),
      rawData: data
    };

    setCachedData(cacheKey, result);
    return result;

  } catch (error) {
    console.log('💥 Weather API Request Failed:', error);
    console.log('🎯 Using MOCK weather data for location:', latitude, longitude);
    
    const result = {
      source: 'mock',
      forecasts: generateMockWeatherData(latitude, longitude),
      error: error.message
    };

    setCachedData(cacheKey, result);
    return result;
  }
}

// Make sure this function exists
function generateMockWeatherData(lat, lon) {
  
  const forecasts = [];
  const baseTime = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
    
    forecasts.push({
      timestamp: timestamp.toISOString(),
      temperature: 15 + Math.sin(i * Math.PI / 12) * 5 + Math.random() * 2,
      windSpeed: 3 + Math.random() * 4,
      solarRadiation: Math.max(0, 400 * Math.sin((i - 6) * Math.PI / 12) + Math.random() * 100),
      cloudCover: Math.random() * 80,
      humidity: 60 + Math.random() * 30
    });
  }
  
  return forecasts;
}

// ================================
// REST OF THE FUNCTIONS
// ================================

export async function fetchSiteWithWeather(siteId) {
  try {
    
    const sites = await fetchSites();
    const site = sites.find(s => s.id === siteId);
    
    if (!site || !site.location) {
      throw new Error(`Site ${siteId} not found or missing location data`);
    }

    const [solarForecast, weatherForecast] = await Promise.allSettled([
      fetchLatestForecast(siteId),
      fetchWeatherForecast(site.location.latitude, site.location.longitude)
    ]);

    return {
      site: site,
      solar_forecast: solarForecast.status === 'fulfilled' ? solarForecast.value : null,
      weather_forecast: weatherForecast.status === 'fulfilled' ? weatherForecast.value : null,
      correlation_ready: solarForecast.status === 'fulfilled' && weatherForecast.status === 'fulfilled',
      last_updated: new Date().toISOString(),
      data_source: {
        mode: FORCE_MOCK ? 'mock' : 'api',
        sites: 'mock',
        solar_forecast: 'mock',
        weather_forecast: weatherForecast.status === 'fulfilled' ? 'api_or_mock' : 'failed'
      },
      errors: {
        solar: solarForecast.status === 'rejected' ? solarForecast.reason.message : null,
        weather: weatherForecast.status === 'rejected' ? weatherForecast.reason.message : null
      }
    };

  } catch (error) {
    console.error(`💥 Error fetching combined data for site ${siteId}:`, error);
    throw error;
  }
}

export async function fetchMultipleSitesWithWeather(siteIds = [], limit = 3) {
  try {
    const sites = await fetchSites();
    const selectedSites = siteIds.length > 0 
      ? sites.filter(site => siteIds.includes(site.id))
      : sites.slice(0, limit);

    const results = {};

    for (const site of selectedSites) {
      if (site.location) {
        try {
          results[site.id] = await fetchSiteWithWeather(site.id);
        } catch (error) {
          console.error(`Failed to load data for site ${site.id}:`, error);
          results[site.id] = {
            site: site,
            error: error.message,
            solar_forecast: null,
            weather_forecast: null
          };
        }
      }
    }

    return {
      sites_data: results,
      summary: {
        total_sites: selectedSites.length,
        successful_loads: Object.values(results).filter(r => !r.error).length,
        failed_loads: Object.values(results).filter(r => r.error).length,
        data_source: 'mock_mode'
      }
    };

  } catch (error) {
    console.error('Error fetching multiple sites with weather:', error);
    throw error;
  }
}

function processWeatherData(rawData, latitude, longitude) {
  const timeSeriesData = rawData.valid_datetime.map((time, index) => ({
    timestamp: time,
    temperature: rawData.Temperature?.[index] || null,
    windSpeed: rawData.WindSpeed?.[index] || null,
    solarRadiation: rawData.SolarDownwardRadiation?.[index] || null,
    cloudCover: rawData.CloudCover?.[index] || null,
    humidity: rawData.RelativeHumidity?.[index] || null,
    referenceTime: rawData.ref_datetime?.[index] || null
  }));

  return {
    location: { latitude, longitude },
    model: 'DWD_ICON-EU',
    forecast_period: {
      start: rawData.valid_datetime[0],
      end: rawData.valid_datetime[rawData.valid_datetime.length - 1],
      hours: rawData.valid_datetime.length
    },
    timeseries: timeSeriesData,
    summary: generateWeatherSummary(timeSeriesData),
    research_ready: true,
    last_updated: new Date().toISOString()
  };
}

function generateWeatherSummary(timeSeries) {
  const temperatures = timeSeries.map(d => d.temperature).filter(t => t !== null);
  const windSpeeds = timeSeries.map(d => d.windSpeed).filter(w => w !== null);

  if (temperatures.length === 0 || windSpeeds.length === 0) {
    return {
      temperature: { min: 0, max: 0, avg: 0, unit: '°C' },
      windSpeed: { min: 0, max: 0, avg: 0, unit: 'm/s' },
      dataQuality: { temperaturePoints: 0, windSpeedPoints: 0, completeness: 0 }
    };
  }

  return {
    temperature: {
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      unit: '°C'
    },
    windSpeed: {
      min: Math.min(...windSpeeds),
      max: Math.max(...windSpeeds),
      avg: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
      unit: 'm/s'
    },
    dataQuality: {
      temperaturePoints: temperatures.length,
      windSpeedPoints: windSpeeds.length,
      completeness: (temperatures.length / timeSeries.length) * 100
    }
  };
}

export async function checkAPIStatus(apiUrl, name) {
  try {
    console.log(`🔍 Checking API status for ${name}: ${apiUrl}`);
    
    // Use API_BASE_URL instead of BASE_URL
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'European-Energy-API-Discovery/1.0'
      }
    });

    const status = response.status;
    console.log(`📡 ${name} API status: ${status}`);

    return {
      name,
      url: apiUrl,
      status: status,
      available: status >= 200 && status < 300,
      error: null
    };
  } catch (error) {
    console.log(`❌ ${name} API check failed:`, error.message);
    return {
      name,
      url: apiUrl,
      status: null,
      available: false,
      error: error.message
    };
  }
}

export async function exportCombinedData(siteId, format = 'csv') {
  try {
    const combinedData = await fetchSiteWithWeather(siteId);
    
    switch (format) {
      case 'csv':
        return formatCombinedAsCSV(combinedData);
      case 'json':
        return JSON.stringify(combinedData, null, 2);
      default:
        return combinedData;
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

function formatCombinedAsCSV(combinedData) {
  const headers = [
    'timestamp',
    'temperature_c',
    'wind_speed_ms',
    'solar_radiation_wm2',
    'cloud_cover_percent',
    'humidity_percent',
    'solar_power_mw',
    'solar_irradiance_wm2',
    'site_id',
    'site_name',
    'latitude',
    'longitude',
    'capacity_mw',
    'data_source'
  ];

  const weatherData = combinedData.weather_forecast;
  const solarData = combinedData.solar_forecast;
  const siteData = combinedData.site;

  if (!weatherData || !weatherData.timeseries) {
    return `# No weather data available for site ${siteData.id}\n${headers.join(',')}\n`;
  }

  const rows = weatherData.timeseries.map((point, index) => {
    const solarPoint = solarData?.values?.[index];
    return [
      point.timestamp,
      point.temperature || '',
      point.windSpeed || '',
      point.solarRadiation || '',
      point.cloudCover || '',
      point.humidity || '',
      solarPoint?.power || '',
      solarPoint?.irradiance || '',
      siteData.id,
      siteData.name,
      siteData.location.latitude,
      siteData.location.longitude,
      siteData.capacity,
      combinedData.data_source?.mode || 'unknown'
    ];
  });

  return [
    `# Combined Solar + Weather Data for ${siteData.name}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Data Source: ${combinedData.data_source?.mode || 'unknown'}`,
    `# Correlation Ready: ${combinedData.correlation_ready}`,
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}