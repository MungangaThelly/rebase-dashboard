// European Renewable Energy APIs Integration
// Comprehensive testing and integration for real European energy data

// =============================================================================
// API CONFIGURATION
// =============================================================================

// ENTSO-E Transparency Platform API
const ENTSOE_BASE_URL = 'https://web-api.tp.entsoe.eu/api';

// European EIC codes (Energy Identification Codes)
const EIC_CODES = {
  sweden: '10Y1001A1001A46L',
  denmark: '10Y1001A1001A65H', 
  norway: '10Y1001A1001A48H',
  finland: '10Y1001A1001A47J',
  germany: '10Y1001A1001A83F',
  netherlands: '10Y1001A1001A92E',
  poland: '10Y1001A1001A39I',
  france: '10Y1001A1001A92E'
};

// PSR Types (Power System Resource Types)
const PSR_TYPES = {
  solar: 'B16',
  wind_onshore: 'B19', 
  wind_offshore: 'B18',
  hydro: 'B12',
  nuclear: 'B14',
  fossil: 'B15',
  biomass: 'B01',
  geothermal: 'B09'
};

// Document Types for ENTSO-E
const DOCUMENT_TYPES = {
  actual_generation: 'A75',
  day_ahead_prices: 'A44',
  load_forecast: 'A65',
  wind_solar_forecast: 'A69'
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatDateTime(date) {
  return date.toISOString().replace(/[-:]/g, '').slice(0, 12);
}

function getTodayDateRange() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    start: formatDateTime(today),
    end: formatDateTime(tomorrow)
  };
}

// =============================================================================
// ENTSO-E TRANSPARENCY PLATFORM API
// =============================================================================

export async function testENTSOEAPI() {
  console.log('🌍 Testing ENTSO-E European Grid API...');
  
  const dateRange = getTodayDateRange();
  
  const testEndpoints = [
    // Health check
    {
      url: `${ENTSOE_BASE_URL}/health`,
      description: 'Health Check',
      requiresAuth: false
    },
    
    // Public data endpoints
    {
      url: `${ENTSOE_BASE_URL}?documentType=${DOCUMENT_TYPES.actual_generation}&in_Domain=${EIC_CODES.sweden}&psrType=${PSR_TYPES.solar}&periodStart=${dateRange.start}&periodEnd=${dateRange.end}`,
      description: 'Sweden Solar Generation',
      requiresAuth: true
    },
    
    {
      url: `${ENTSOE_BASE_URL}?documentType=${DOCUMENT_TYPES.actual_generation}&in_Domain=${EIC_CODES.sweden}&psrType=${PSR_TYPES.wind_onshore}&periodStart=${dateRange.start}&periodEnd=${dateRange.end}`,
      description: 'Sweden Wind Generation', 
      requiresAuth: true
    },
    
    {
      url: `${ENTSOE_BASE_URL}?documentType=${DOCUMENT_TYPES.day_ahead_prices}&out_Domain=${EIC_CODES.sweden}&periodStart=${dateRange.start}&periodEnd=${dateRange.end}`,
      description: 'Sweden Day-Ahead Prices',
      requiresAuth: true
    }
  ];

  const results = [];

  for (const endpoint of testEndpoints) {
    try {
      const headers = {
        'Accept': 'application/xml',
        'User-Agent': 'RebaseEnergyResearch/1.0'
      };

      // Add API key if available
      const entsoeToken = import.meta.env.VITE_ENTSOE_API_KEY;
      if (entsoeToken && endpoint.requiresAuth) {
        endpoint.url += `&securityToken=${entsoeToken}`;
      }

      const response = await fetch(endpoint.url, { 
        method: 'GET', 
        headers 
      });

      const result = {
        endpoint: endpoint.description,
        url: endpoint.url.replace(/securityToken=[^&]*/, 'securityToken=***'),
        status: response.status,
        statusText: response.statusText,
        requiresAuth: endpoint.requiresAuth,
        success: response.ok
      };

      if (response.ok) {
        const data = await response.text();
        result.dataPreview = data.substring(0, 200) + '...';
        result.dataLength = data.length;
        console.log(`✅ ENTSO-E ${endpoint.description}: SUCCESS`, result);
      } else {
        result.error = `HTTP ${response.status}`;
        console.log(`❌ ENTSO-E ${endpoint.description}: ${response.status} ${response.statusText}`);
      }

      results.push(result);
      
    } catch (error) {
      const result = {
        endpoint: endpoint.description,
        url: endpoint.url,
        error: error.message,
        success: false
      };
      results.push(result);
      console.log(`❌ ENTSO-E ${endpoint.description}: ${error.message}`);
    }
  }
  
  return {
    provider: 'ENTSO-E',
    description: 'European Grid Transparency Platform',
    website: 'https://transparency.entsoe.eu/',
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      needsApiKey: results.some(r => r.requiresAuth && r.status === 401)
    }
  };
}

// =============================================================================
// SWEDISH NATIONAL GRID APIs
// =============================================================================

export async function testSwedishGridAPI() {
  console.log('🇸🇪 Testing Swedish National Grid APIs...');
  
  const swedishAPIs = [
    // Svenska Kraftnät (Swedish TSO)
    {
      url: 'https://www.svk.se/api/v1/production',
      description: 'SVK Production API',
      provider: 'Svenska Kraftnät'
    },
    {
      url: 'https://www.svk.se/api/v1/solar',
      description: 'SVK Solar API',
      provider: 'Svenska Kraftnät'
    },
    {
      url: 'https://www.svk.se/api/v1/renewable',
      description: 'SVK Renewable API', 
      provider: 'Svenska Kraftnät'
    },
    {
      url: 'https://mimer.svk.se/ProductionConsumption/api/ProductionConsumption',
      description: 'SVK Mimer Production API',
      provider: 'Svenska Kraftnät'
    },
    
    // Energimarknadsinspektionen (Swedish Energy Markets Inspectorate)
    {
      url: 'https://www.ei.se/api/v1/statistics',
      description: 'EI Statistics API',
      provider: 'Energimarknadsinspektionen'
    },
    {
      url: 'https://www.ei.se/api/v1/renewable',
      description: 'EI Renewable API',
      provider: 'Energimarknadsinspektionen'
    },
    
    // Open data portals
    {
      url: 'https://opendata.svk.se/api/v1/production',
      description: 'SVK Open Data Production',
      provider: 'Svenska Kraftnät Open Data'
    },
    {
      url: 'https://data.gov.se/api/datasets/renewable-energy',
      description: 'Government Open Data',
      provider: 'Swedish Government'
    },
    
    // Alternative endpoints
    {
      url: 'https://www.svk.se/services/controlroom/v2/situation-awareness',
      description: 'SVK Situation Awareness',
      provider: 'Svenska Kraftnät'
    }
  ];

  const results = [];

  for (const api of swedishAPIs) {
    try {
      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RebaseEnergyResearch/1.0'
        }
      });

      const result = {
        endpoint: api.description,
        provider: api.provider,
        url: api.url,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };

      if (response.ok) {
        try {
          const data = await response.json();
          result.dataPreview = JSON.stringify(data).substring(0, 200) + '...';
          result.dataType = 'JSON';
          console.log(`✅ SWEDISH GRID ${api.description}: SUCCESS`, data);
        } catch (jsonError) {
          const textData = await response.text();
          result.dataPreview = textData.substring(0, 200) + '...';
          result.dataType = 'TEXT/HTML';
        }
      } else {
        result.error = `HTTP ${response.status}`;
        console.log(`❌ SWEDISH GRID ${api.description}: ${response.status} ${response.statusText}`);
      }

      results.push(result);
      
    } catch (error) {
      const result = {
        endpoint: api.description,
        provider: api.provider,
        url: api.url,
        error: error.message,
        success: false
      };
      results.push(result);
      console.log(`❌ SWEDISH GRID ${api.description}: ${error.message}`);
    }
  }
  
  return {
    provider: 'Swedish National Grid',
    description: 'Swedish TSO and Energy Authority APIs',
    website: 'https://www.svk.se/',
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      providers: [...new Set(results.map(r => r.provider))]
    }
  };
}

// =============================================================================
// ENERGY CHARTS API (European Renewable Data)
// =============================================================================

export async function testEnergyChartsAPI() {
  console.log('⚡ Testing Energy Charts API (European renewable data)...');
  
  const energyChartsEndpoints = [
    // Public renewable energy data
    {
      url: 'https://api.energy-charts.info/public_power',
      description: 'Public Power Data',
      country: 'All'
    },
    {
      url: 'https://api.energy-charts.info/renewable_power', 
      description: 'Renewable Power Data',
      country: 'All'
    },
    {
      url: 'https://api.energy-charts.info/solar_power',
      description: 'Solar Power Data',
      country: 'All'
    },
    {
      url: 'https://api.energy-charts.info/wind_power',
      description: 'Wind Power Data', 
      country: 'All'
    },
    
    // Sweden-specific data
    {
      url: 'https://api.energy-charts.info/public_power?country=se',
      description: 'Sweden Public Power',
      country: 'Sweden'
    },
    {
      url: 'https://api.energy-charts.info/renewable_power?country=se',
      description: 'Sweden Renewable Power',
      country: 'Sweden'
    },
    {
      url: 'https://api.energy-charts.info/solar_power?country=se',
      description: 'Sweden Solar Power',
      country: 'Sweden'
    },
    
    // Other Nordic countries
    {
      url: 'https://api.energy-charts.info/renewable_power?country=dk',
      description: 'Denmark Renewable Power',
      country: 'Denmark'
    },
    {
      url: 'https://api.energy-charts.info/renewable_power?country=no',
      description: 'Norway Renewable Power',
      country: 'Norway'
    }
  ];

  const results = [];

  for (const endpoint of energyChartsEndpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RebaseEnergyResearch/1.0'
        }
      });

      const result = {
        endpoint: endpoint.description,
        country: endpoint.country,
        url: endpoint.url,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };

      if (response.ok) {
        const data = await response.json();
        result.dataPreview = JSON.stringify(data).substring(0, 200) + '...';
        result.dataLength = JSON.stringify(data).length;
        console.log(`✅ ENERGY CHARTS ${endpoint.description}: SUCCESS`, data);
      } else {
        result.error = `HTTP ${response.status}`;
        console.log(`❌ ENERGY CHARTS ${endpoint.description}: ${response.status} ${response.statusText}`);
      }

      results.push(result);
      
    } catch (error) {
      const result = {
        endpoint: endpoint.description,
        country: endpoint.country,
        url: endpoint.url,
        error: error.message,
        success: false
      };
      results.push(result);
      console.log(`❌ ENERGY CHARTS ${endpoint.description}: ${error.message}`);
    }
  }
  
  return {
    provider: 'Energy Charts',
    description: 'European Renewable Energy Data Platform',
    website: 'https://energy-charts.info/',
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      countries: [...new Set(results.map(r => r.country))]
    }
  };
}

// =============================================================================
// ELECTRICITYMAP API 
// =============================================================================

export async function testElectricityMapAPI() {
  console.log('🔋 Testing ElectricityMap API...');
  
  const electricityMapEndpoints = [
    // Public/free endpoints
    {
      url: 'https://api.electricitymap.org/health',
      description: 'Health Check',
      requiresAuth: false
    },
    
    // Data endpoints (most require API key)
    {
      url: 'https://api.electricitymap.org/v3/carbon-intensity/latest?zone=SE',
      description: 'Sweden Carbon Intensity',
      requiresAuth: true
    },
    {
      url: 'https://api.electricitymap.org/v3/power-breakdown/latest?zone=SE',
      description: 'Sweden Power Breakdown',
      requiresAuth: true
    },
    {
      url: 'https://api.electricitymap.org/v3/power-breakdown/latest?zone=DK-DK1',
      description: 'Denmark West Power Breakdown',
      requiresAuth: true
    },
    {
      url: 'https://api.electricitymap.org/v3/carbon-intensity/latest?zone=NO-NO1',
      description: 'Norway South Carbon Intensity',
      requiresAuth: true
    }
  ];

  const results = [];
  const apiKey = import.meta.env.VITE_ELECTRICITYMAP_API_KEY;

  for (const endpoint of electricityMapEndpoints) {
    try {
      const headers = {
        'Accept': 'application/json',
        'User-Agent': 'RebaseEnergyResearch/1.0'
      };

      if (endpoint.requiresAuth && apiKey) {
        headers['auth-token'] = apiKey;
      }

      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers
      });

      const result = {
        endpoint: endpoint.description,
        url: endpoint.url,
        status: response.status,
        statusText: response.statusText,
        requiresAuth: endpoint.requiresAuth,
        success: response.ok
      };

      if (response.ok) {
        const data = await response.json();
        result.dataPreview = JSON.stringify(data).substring(0, 200) + '...';
        console.log(`✅ ELECTRICITYMAP ${endpoint.description}: SUCCESS`, data);
      } else if (response.status === 401) {
        result.error = 'Authentication required - API key needed';
        console.log(`🔑 ELECTRICITYMAP ${endpoint.description}: Needs API key`);
      } else {
        result.error = `HTTP ${response.status}`;
        console.log(`❌ ELECTRICITYMAP ${endpoint.description}: ${response.status} ${response.statusText}`);
      }

      results.push(result);
      
    } catch (error) {
      const result = {
        endpoint: endpoint.description,
        url: endpoint.url,
        error: error.message,
        success: false
      };
      results.push(result);
      console.log(`❌ ELECTRICITYMAP ${endpoint.description}: ${error.message}`);
    }
  }
  
  return {
    provider: 'ElectricityMap',
    description: 'Real-time electricity carbon intensity and power breakdown',
    website: 'https://electricitymap.org/',
    apiKeyRequired: true,
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      needsApiKey: results.filter(r => r.status === 401).length
    }
  };
}

// =============================================================================
// PVGIS API (European Solar Resource)
// =============================================================================

export async function testPVGisAPI() {
  console.log('🌞 Testing PVGis European Solar Resource API...');
  
  // Test locations across Sweden
  const testLocations = [
    { name: 'Stockholm', lat: 59.3293, lon: 18.0686 },
    { name: 'Gothenburg', lat: 57.7089, lon: 11.9746 },
    { name: 'Malmö', lat: 55.6050, lon: 13.0038 },
    { name: 'Uppsala', lat: 59.8586, lon: 17.6389 },
    { name: 'Kiruna (Northern)', lat: 67.8558, lon: 20.2253 }
  ];

  const results = [];

  for (const location of testLocations) {
    try {
      const endpoint = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?` +
        `lat=${location.lat}&lon=${location.lon}&raddatabase=PVGIS-SARAH2&` +
        `outputformat=json&peakpower=1&loss=14&pvtechchoice=crystSi&` +
        `mountingplace=free&angle=35&aspect=0`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RebaseEnergyResearch/1.0'
        }
      });

      const result = {
        endpoint: `PVGis Solar Resource - ${location.name}`,
        location: location.name,
        coordinates: `${location.lat}, ${location.lon}`,
        url: endpoint,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };

      if (response.ok) {
        const data = await response.json();
        result.dataPreview = JSON.stringify(data).substring(0, 300) + '...';
        
        // Extract key solar metrics
        if (data.outputs && data.outputs.totals) {
          result.solarMetrics = {
            yearlyPVout: data.outputs.totals.fixed?.E_y || 'N/A',
            averageDailyPVout: data.outputs.totals.fixed?.E_d || 'N/A',
            solarIrradiation: data.outputs.totals.fixed?.H_sun || 'N/A'
          };
        }
        
        console.log(`✅ PVGIS ${location.name}: SUCCESS`, data);
      } else {
        result.error = `HTTP ${response.status}`;
        console.log(`❌ PVGIS ${location.name}: ${response.status} ${response.statusText}`);
      }

      results.push(result);
      
    } catch (error) {
      const result = {
        endpoint: `PVGis Solar Resource - ${location.name}`,
        location: location.name,
        coordinates: `${location.lat}, ${location.lon}`,
        error: error.message,
        success: false
      };
      results.push(result);
      console.log(`❌ PVGIS ${location.name}: ${error.message}`);
    }
  }
  
  return {
    provider: 'PVGis',
    description: 'European Commission Solar Resource Assessment',
    website: 'https://re.jrc.ec.europa.eu/pvg_tools/en/',
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      locations: testLocations.map(l => l.name)
    }
  };
}

// =============================================================================
// OPENWEATHERMAP ONECALL API (Alternative Weather Source)
// =============================================================================

export async function testOpenWeatherMapAPI() {
  console.log('🌤️ Testing OpenWeatherMap OneCall API...');
  
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    return {
      provider: 'OpenWeatherMap',
      description: 'Weather data including solar radiation',
      website: 'https://openweathermap.org/api/one-call-api',
      error: 'API key not found in environment variables',
      results: []
    };
  }

  // Test locations
  const testLocations = [
    { name: 'Stockholm', lat: 59.3293, lon: 18.0686 },
    { name: 'Gothenburg', lat: 57.7089, lon: 11.9746 }
  ];

  const results = [];

  for (const location of testLocations) {
    try {
      const endpoint = `https://api.openweathermap.org/data/3.0/onecall?` +
        `lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&` +
        `exclude=minutely,alerts&units=metric`;

      const response = await fetch(endpoint);

      const result = {
        endpoint: `OpenWeather OneCall - ${location.name}`,
        location: location.name,
        coordinates: `${location.lat}, ${location.lon}`,
        url: endpoint.replace(apiKey, '***'),
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };

      if (response.ok) {
        const data = await response.json();
        result.dataPreview = JSON.stringify(data).substring(0, 200) + '...';
        
        // Extract relevant weather metrics
        if (data.current) {
          result.weatherMetrics = {
            temperature: data.current.temp,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_speed,
            cloudCover: data.current.clouds,
            uvIndex: data.current.uvi
          };
        }
        
        console.log(`✅ OPENWEATHER ${location.name}: SUCCESS`);
      } else {
        result.error = `HTTP ${response.status}`;
        console.log(`❌ OPENWEATHER ${location.name}: ${response.status} ${response.statusText}`);
      }

      results.push(result);
      
    } catch (error) {
      const result = {
        endpoint: `OpenWeather OneCall - ${location.name}`,
        location: location.name,
        error: error.message,
        success: false
      };
      results.push(result);
      console.log(`❌ OPENWEATHER ${location.name}: ${error.message}`);
    }
  }
  
  return {
    provider: 'OpenWeatherMap',
    description: 'Weather data including solar radiation and UV index',
    website: 'https://openweathermap.org/api/one-call-api',
    apiKeyRequired: true,
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      locations: testLocations.map(l => l.name)
    }
  };
}

// =============================================================================
// MASTER DISCOVERY FUNCTION
// =============================================================================

export async function discoverAllEuropeanEnergyAPIs() {
  console.log('🌍 STARTING COMPREHENSIVE EUROPEAN ENERGY API DISCOVERY...');
  
  const startTime = Date.now();
  
  try {
    // Test all APIs in parallel
    const [
      entsoeResult,
      swedishGridResult, 
      energyChartsResult,
      electricityMapResult,
      pvgisResult,
      openWeatherResult
    ] = await Promise.allSettled([
      testENTSOEAPI(),
      testSwedishGridAPI(),
      testEnergyChartsAPI(),
      testElectricityMapAPI(),
      testPVGisAPI(),
      testOpenWeatherMapAPI()
    ]);

    const results = {
      entsoe: entsoeResult.value || { error: entsoeResult.reason },
      swedishGrid: swedishGridResult.value || { error: swedishGridResult.reason },
      energyCharts: energyChartsResult.value || { error: energyChartsResult.reason },
      electricityMap: electricityMapResult.value || { error: electricityMapResult.reason },
      pvgis: pvgisResult.value || { error: pvgisResult.reason },
      openWeather: openWeatherResult.value || { error: openWeatherResult.reason }
    };

    const summary = {
      totalAPIs: 6,
      successfulProviders: Object.values(results).filter(r => r.summary?.successful > 0).length,
      totalEndpoints: Object.values(results).reduce((sum, r) => sum + (r.summary?.total || 0), 0),
      successfulEndpoints: Object.values(results).reduce((sum, r) => sum + (r.summary?.successful || 0), 0),
      testDuration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    console.log('✅ EUROPEAN ENERGY API DISCOVERY COMPLETE!', summary);

    return {
      success: true,
      results,
      summary,
      recommendations: generateAPIRecommendations(results)
    };
    
  } catch (error) {
    console.error('❌ API Discovery failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateAPIRecommendations(results) {
  const recommendations = [];

  // Check which APIs are working
  Object.entries(results).forEach(([key, result]) => {
    if (result.summary?.successful > 0) {
      recommendations.push({
        api: result.provider,
        status: '✅ Ready to integrate',
        reason: `${result.summary.successful} working endpoints found`,
        priority: 'high'
      });
    } else if (result.summary?.needsApiKey || result.apiKeyRequired) {
      recommendations.push({
        api: result.provider,
        status: '🔑 Needs API key',
        reason: 'Free registration required',
        priority: 'medium'
      });
    } else {
      recommendations.push({
        api: result.provider,
        status: '❌ Not accessible',
        reason: result.error || 'All endpoints failed',
        priority: 'low'
      });
    }
  });

  return recommendations;
}

// =============================================================================
// INTEGRATION HELPERS
// =============================================================================

export async function fetchRealSwedishSolarData(location) {
  // Try PVGis first (most reliable for solar resource data)
  try {
    const pvgisResult = await testPVGisAPI();
    const locationData = pvgisResult.results.find(r => 
      r.location.toLowerCase().includes(location.toLowerCase()) && r.success
    );
    
    if (locationData && locationData.solarMetrics) {
      return {
        source: 'PVGis',
        data: locationData.solarMetrics,
        success: true
      };
    }
  } catch (error) {
    console.log('PVGis fetch failed:', error);
  }

  // Fallback to other sources
  return {
    source: 'none',
    data: null,
    success: false,
    message: 'No real solar data sources available'
  };
}

export async function fetchRealEuropeanGridData(country = 'sweden') {
  // Try Energy Charts first
  try {
    const energyChartsResult = await testEnergyChartsAPI();
    const countryData = energyChartsResult.results.find(r => 
      r.country.toLowerCase().includes(country.toLowerCase()) && r.success
    );
    
    if (countryData) {
      return {
        source: 'Energy Charts',
        data: countryData.dataPreview,
        success: true
      };
    }
  } catch (error) {
    console.log('Energy Charts fetch failed:', error);
  }

  return {
    source: 'none', 
    data: null,
    success: false,
    message: 'No real grid data sources available'
  };
}