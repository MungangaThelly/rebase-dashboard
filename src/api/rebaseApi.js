import axios from 'axios';

const API_KEY = import.meta.env.VITE_REBASE_API_KEY;

// FORCE MOCK MODE while we figure out the real API
const FORCE_MOCK = true; // 👈 Keep this true for now

const BASE_URL = import.meta.env.DEV && !FORCE_MOCK
  ? '/api'  
  : 'https://api.rebase.energy';

console.log('🔗 API Mode:', FORCE_MOCK ? 'MOCK DATA' : 'REAL API');
console.log('🔗 API Base URL:', BASE_URL);
console.log('🔑 API Key present:', !!API_KEY);

// Enhanced mock sites with more realistic data
const MOCK_SITES = [
  {
    id: 'se-stockholm-alpha',
    name: 'Stockholm Solar Alpha',
    location: { latitude: 59.3293, longitude: 18.0686 },
    capacity: 50.2,
    type: 'utility-scale',
    status: 'operational',
    commissioned: '2023-06-15',
    technology: 'crystalline-si'
  },
  {
    id: 'se-stockholm-beta', 
    name: 'Stockholm Solar Beta',
    location: { latitude: 59.3498, longitude: 18.0973 },
    capacity: 25.8,
    type: 'commercial',
    status: 'operational',
    commissioned: '2023-09-20',
    technology: 'thin-film'
  },
  {
    id: 'se-gothenburg-green',
    name: 'Gothenburg Green Energy Park',
    location: { latitude: 57.7089, longitude: 11.9746 },
    capacity: 35.4,
    type: 'utility-scale',
    status: 'operational',
    commissioned: '2024-01-10',
    technology: 'bifacial'
  },
  {
    id: 'se-malmo-renewable',
    name: 'Malmö Renewable Energy Hub',
    location: { latitude: 55.6050, longitude: 13.0038 },
    capacity: 42.1,
    type: 'industrial',
    status: 'operational',
    commissioned: '2023-11-08',
    technology: 'crystalline-si'
  },
  {
    id: 'se-uppsala-research',
    name: 'Uppsala Solar Research Facility',
    location: { latitude: 59.8586, longitude: 17.6389 },
    capacity: 18.7,
    type: 'research',
    status: 'operational',
    commissioned: '2024-03-15',
    technology: 'perovskite-tandem'
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
  // Use mock data for now
  if (FORCE_MOCK) {
    console.log('🎯 Using MOCK sites data:', MOCK_SITES.length, 'sites');
    return MOCK_SITES;
  }

  // When we know the real endpoint, we'll update this
  try {
    console.log('🔄 Fetching sites from:', `${BASE_URL}/sites`);
    
    const response = await fetch(`${BASE_URL}/sites`, {
      headers: {
        'GL-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
    });

    console.log('📡 Sites API Response:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Sites API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Sites loaded from API:', data?.length || 0);
    return data;
    
  } catch (error) {
    console.warn('⚠️ Sites API failed, using mock data:', error.message);
    return MOCK_SITES;
  }
}

export async function fetchLatestForecast(siteId) {
  // Mock forecast with realistic solar production curves
  console.log('🎯 Generating MOCK forecast for site:', siteId);
  
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

export async function fetchWeatherForecast(latitude, longitude, days = 2) {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);

  const startDateStr = today.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const params = new URLSearchParams({
    model: 'DWD_ICON-EU',
    'start-date': startDateStr,
    'end-date': endDateStr,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    variables: 'Temperature, WindSpeed, SolarDownwardRadiation, CloudCover, RelativeHumidity',
    'output-format': 'json'
  });

  try {
    let url = `${BASE_URL}/weather/v2/query?${params}`;
    console.log('🔄 Fetching weather from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok && BASE_URL === '/api') {
      // Try direct API
      console.log('🔄 Proxy failed, trying direct API...');
      url = `https://api.rebase.energy/weather/v2/query?${params}`;
      
      const directResponse = await fetch(url, {
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!directResponse.ok) {
        throw new Error(`Weather API Error: ${directResponse.status}`);
      }
      
      const data = await directResponse.json();
      console.log('✅ Weather data loaded from direct API');
      return processWeatherData(data, latitude, longitude);
    }

    if (!response.ok) {
      throw new Error(`Weather API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Weather data loaded via proxy');
    return processWeatherData(data, latitude, longitude);

  } catch (error) {
    console.error('💥 Weather API Request Failed:', error);
    
    // Generate mock weather data as fallback
    console.log('🎯 Using MOCK weather data for location:', latitude, longitude);
    return generateMockWeatherData(latitude, longitude);
  }
}

function generateMockWeatherData(latitude, longitude) {
  const now = new Date();
  const timeseries = Array.from({ length: 48 }, (_, i) => {
    const time = new Date(now.getTime() + i * 3600000); // Hourly intervals
    const hour = time.getHours();
    
    return {
      timestamp: time.toISOString(),
      temperature: 10 + 15 * Math.sin(((hour - 6) / 12) * Math.PI) + Math.random() * 3,
      windSpeed: 3 + Math.random() * 8,
      solarRadiation: hour >= 6 && hour <= 18 ? 100 + Math.random() * 700 : 0,
      cloudCover: 20 + Math.random() * 60,
      humidity: 60 + Math.random() * 30,
      referenceTime: now.toISOString()
    };
  });

  return {
    location: { latitude, longitude },
    model: 'Mock Weather Model',
    forecast_period: {
      start: timeseries[0].timestamp,
      end: timeseries[timeseries.length - 1].timestamp,
      hours: timeseries.length
    },
    timeseries: timeseries,
    summary: generateWeatherSummary(timeseries),
    research_ready: true,
    last_updated: new Date().toISOString()
  };
}

// ================================
// REST OF THE FUNCTIONS
// ================================

export async function fetchSiteWithWeather(siteId) {
  try {
    console.log('🔄 Loading combined data for site:', siteId);
    
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

export async function checkAPIStatus() {
  return {
    timestamp: new Date().toISOString(),
    mode: 'MOCK + REAL_WEATHER',
    base_url: BASE_URL,
    environment: import.meta.env.DEV ? 'development' : 'production',
    proxy_enabled: !FORCE_MOCK && import.meta.env.DEV,
    mock_sites_count: MOCK_SITES.length,
    combined_ready: true,
    features: {
      sites: 'mock_data',
      solar_forecasts: 'mock_data',
      weather: 'real_api_with_fallback',
      correlations: 'available',
      export: 'available'
    }
  };
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