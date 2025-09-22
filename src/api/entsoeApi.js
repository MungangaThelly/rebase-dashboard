const ENTSOE_API_BASE = 'https://web-api.tp.entsoe.eu/api';
const API_TOKEN = import.meta.env.VITE_ENTSOE_API_KEY;
const API_KEY = import.meta.env.VITE_ENTSOE_API_KEY || '5af65803-e6f3-4378-9d63-737edac43cab';

// Swedish electricity domains for ENTSO-E
export const SWEDISH_DOMAINS = {
  SE1: '10Y1001A1001A44P', // Northern Sweden
  SE2: '10Y1001A1001A45N', // Central Sweden  
  SE3: '10Y1001A1001A46L', // Southern Sweden
  SE4: '10Y1001A1001A47J'  // Malmö area
};

const SWEDEN_DOMAIN = SWEDISH_DOMAINS.SE3; // Default domain

// Document types for ENTSO-E API
export const DOCUMENT_TYPES = {
  PRICES: 'A44',           // Day-ahead prices
  ACTUAL_GENERATION: 'A75', // Actual generation per type
  LOAD: 'A65',             // System load
  FORECAST_GENERATION: 'A71' // Generation forecast
};

// Production source types
export const PSR_TYPES = {
  BIOMASS: 'B01',
  FOSSIL_BROWN_COAL: 'B02',
  FOSSIL_COAL: 'B03',
  FOSSIL_GAS: 'B04',
  FOSSIL_HARD_COAL: 'B05',
  FOSSIL_OIL: 'B06',
  GEOTHERMAL: 'B09',
  HYDRO_PUMPED_STORAGE: 'B11',
  HYDRO_RUN_OF_RIVER: 'B12',
  HYDRO_WATER_RESERVOIR: 'B13',
  NUCLEAR: 'B14',
  OTHER_RENEWABLE: 'B15',
  SOLAR: 'B16',
  WASTE: 'B17',
  WIND_OFFSHORE: 'B18',
  WIND_ONSHORE: 'B19',
  OTHER: 'B20'
};

// ✅ FIXED: Date formatting functions
const formatDateForEntsoe = (date) => {
  if (!date) date = new Date();
  const d = new Date(date);

  // ENTSO-E expects format: YYYYMMDDHHMM (UTC)
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hour = String(d.getUTCHours()).padStart(2, '0');
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}`;
};

// ✅ FIXED: Added missing formatDateForAPI function
const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}${month}${day}${hour}00`;
};

const getCountryCode = (country) => {
  const countryCodes = {
    'SE': SWEDISH_DOMAINS.SE3, // Default to SE3
    'Sweden': SWEDISH_DOMAINS.SE3,
    'NO': '10YNO-0--------C', // Norway
    'DK': '10Y1001A1001A65H', // Denmark
    'FI': '10YFI-1--------U', // Finland
    'DE': '10Y1001A1001A83F'  // Germany
  };
  return countryCodes[country] || SWEDISH_DOMAINS.SE3;
};

// XML Parser for Price Data
const parseEntsoePriceXML = (xmlText) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for errors
    const errorElements = xmlDoc.querySelectorAll('Reason');
    if (errorElements.length > 0) {
      const errorText = errorElements[0].textContent;
      console.warn('⚠️ ENTSO-E API Error:', errorText);
      throw new Error(`ENTSO-E API Error: ${errorText}`);
    }

    const timeSeries = xmlDoc.querySelectorAll('TimeSeries');
    const prices = [];
    let domain = 'SE3';

    timeSeries.forEach(series => {
      // Get domain from TimeSeries
      const domainElement = series.querySelector('in_Domain\\.mRID');
      if (domainElement) {
        const domainId = domainElement.textContent;
        domain = Object.keys(SWEDISH_DOMAINS).find(key => SWEDISH_DOMAINS[key] === domainId) || 'SE3';
      }

      const periods = series.querySelectorAll('Period');
      periods.forEach(period => {
        const startTime = period.querySelector('timeInterval start')?.textContent;
        const points = period.querySelectorAll('Point');
        
        points.forEach(point => {
          const position = parseInt(point.querySelector('position')?.textContent || '0');
          const priceAmount = parseFloat(point.querySelector('price\\.amount')?.textContent || '0');
          
          if (startTime && position && priceAmount) {
            const timestamp = new Date(startTime);
            timestamp.setUTCHours(timestamp.getUTCHours() + position - 1);
            
            prices.push({
              timestamp: timestamp.toISOString(),
              price: priceAmount, // EUR/MWh
              position,
              hour: timestamp.getUTCHours()
            });
          }
        });
      });
    });

    // Sort by timestamp
    prices.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      source: 'real',
      prices,
      total: prices.length,
      domain,
      fetchedAt: new Date().toISOString(),
      currency: 'EUR',
      unit: 'MWh',
      summary: {
        average: prices.length > 0 ? prices.reduce((sum, p) => sum + p.price, 0) / prices.length : 0,
        min: prices.length > 0 ? Math.min(...prices.map(p => p.price)) : 0,
        max: prices.length > 0 ? Math.max(...prices.map(p => p.price)) : 0,
        peakHours: prices.filter(p => p.hour >= 17 && p.hour <= 20).length,
        offPeakHours: prices.filter(p => p.hour >= 0 && p.hour <= 6).length
      }
    };
  } catch (error) {
    console.error('❌ Error parsing ENTSO-E price XML:', error);
    throw error;
  }
};

// XML Parser for Energy Data
const parseEntsoeEnergyXML = (xmlText) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const timeSeries = xmlDoc.querySelectorAll('TimeSeries');
    const energyData = [];

    timeSeries.forEach(series => {
      const periods = series.querySelectorAll('Period');
      periods.forEach(period => {
        const startTime = period.querySelector('timeInterval start')?.textContent;
        const points = period.querySelectorAll('Point');
        
        points.forEach(point => {
          const position = parseInt(point.querySelector('position')?.textContent || '0');
          const quantity = parseFloat(point.querySelector('quantity')?.textContent || '0');
          
          if (startTime && position) {
            const timestamp = new Date(startTime);
            timestamp.setUTCHours(timestamp.getUTCHours() + position - 1);
            
            energyData.push({
              timestamp: timestamp.toISOString(),
              value: quantity,
              position
            });
          }
        });
      });
    });

    return {
      source: 'real',
      energyData,
      total: energyData.length,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error parsing ENTSO-E energy XML:', error);
    throw error;
  }
};

// Mock Data Generators
const generateMockElectricityPrices = () => {
  const prices = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(i, 0, 0, 0);
    
    // Price pattern: higher during peak hours (17-20), lower at night
    let basePrice = 30; // Base price EUR/MWh
    const hour = i;
    
    if (hour >= 17 && hour <= 20) {
      basePrice += 15; // Peak hours
    } else if (hour >= 0 && hour <= 6) {
      basePrice -= 10; // Off-peak hours
    }
    
    // Add some random variation
    const variation = (Math.random() - 0.5) * 10;
    const price = Math.max(5, basePrice + variation);
    
    prices.push({
      timestamp: timestamp.toISOString(),
      price: Math.round(price * 100) / 100,
      position: i + 1,
      hour
    });
  }
  
  return {
    source: 'mock',
    prices,
    total: prices.length,
    domain: 'SE3',
    fetchedAt: new Date().toISOString(),
    currency: 'EUR',
    unit: 'MWh',
    summary: {
      average: prices.reduce((sum, p) => sum + p.price, 0) / prices.length,
      min: Math.min(...prices.map(p => p.price)),
      max: Math.max(...prices.map(p => p.price)),
      peakHours: prices.filter(p => p.hour >= 17 && p.hour <= 20).length,
      offPeakHours: prices.filter(p => p.hour >= 0 && p.hour <= 6).length
    }
  };
};

const generateMockEnergyData = () => {
  const energyData = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(i, 0, 0, 0);
    
    // Energy consumption pattern
    let baseConsumption = 5000; // Base consumption MW
    const hour = i;
    
    if (hour >= 8 && hour <= 18) {
      baseConsumption += 2000; // Daytime increase
    }
    
    const variation = (Math.random() - 0.5) * 1000;
    const consumption = Math.max(3000, baseConsumption + variation);
    
    energyData.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(consumption),
      position: i + 1
    });
  }
  
  return {
    source: 'mock',
    energyData,
    total: energyData.length,
    fetchedAt: new Date().toISOString()
  };
};

const generateMockSolarGeneration = () => {
  const data = [];
  const now = new Date();
  
  // Generate 24 hours of mock solar data
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(i, 0, 0, 0);
    
    // Solar generation pattern (peaks at noon)
    const hour = i;
    let generation = 0;
    
    if (hour >= 6 && hour <= 18) {
      // Daylight hours - create a bell curve
      const normalizedHour = (hour - 12) / 6; // -1 to 1
      generation = Math.max(0, 800 * Math.exp(-2 * normalizedHour * normalizedHour));
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      generation: Math.round(generation),
      value: Math.round(generation), // Added for compatibility
      position: i + 1
    });
  }
  
  return {
    source: 'mock',
    data,
    total: data.length,
    domain: 'SE3',
    fetchedAt: new Date().toISOString(),
    unit: 'MW',
    summary: {
      maxGeneration: Math.max(...data.map(d => d.generation)),
      avgGeneration: data.reduce((sum, d) => sum + d.generation, 0) / data.length,
      totalEnergy: data.reduce((sum, d) => sum + d.generation, 0)
    }
  };
};

const generateMockWindGeneration = () => {
  const data = [];
  const now = new Date();
  
  // Generate 24 hours of mock wind data
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(i, 0, 0, 0);
    
    // Wind generation - more variable than solar, can happen at night
    const baseWind = 1200; // Base wind capacity
    const variability = 0.6; // 60% variability
    const generation = Math.round(baseWind * (0.2 + Math.random() * variability));
    
    data.push({
      timestamp: timestamp.toISOString(),
      generation,
      value: generation, // Added for compatibility
      position: i + 1
    });
  }
  
  return {
    source: 'mock',
    data,
    total: data.length,
    domain: 'SE3',
    fetchedAt: new Date().toISOString(),
    unit: 'MW',
    summary: {
      maxGeneration: Math.max(...data.map(d => d.generation)),
      avgGeneration: data.reduce((sum, d) => sum + d.generation, 0) / data.length,
      totalEnergy: data.reduce((sum, d) => sum + d.generation, 0)
    }
  };
};

// Main API Functions
export async function fetchEnergyData(country = 'SE', startDate, endDate) {
  try {
    const apiKey = import.meta.env.VITE_ENTSOE_API_KEY || API_KEY;
    
    const params = new URLSearchParams({
      securityToken: apiKey,
      documentType: DOCUMENT_TYPES.PRICES,
      in_Domain: getCountryCode(country),
      out_Domain: getCountryCode(country),
      periodStart: formatDateForEntsoe(startDate),
      periodEnd: formatDateForEntsoe(endDate)
    });

    console.log('🔄 Fetching ENTSO-E energy data via proxy...');
    const response = await fetch(`/api/entsoe?${params}`);
    
    if (!response.ok) {
      console.warn(`⚠️ ENTSO-E energy data API error: ${response.status}`);
      throw new Error(`ENTSO-E API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    console.log('📋 ENTSO-E XML response sample:', xmlText.substring(0, 200) + '...');
    
    const parsedData = parseEntsoeEnergyXML(xmlText);
    
    console.log('✅ ENTSO-E energy data received:', parsedData.energyData?.length || 0, 'data points');
    return parsedData;
    
  } catch (error) {
    console.error('❌ Error fetching energy data:', error);
    return generateMockEnergyData();
  }
}

export const fetchElectricityPrices = async (domain = SWEDISH_DOMAINS.SE3, periodStart, periodEnd) => {
  try {
    const apiKey = API_TOKEN || API_KEY;
    
    const params = new URLSearchParams({
      securityToken: apiKey,
      documentType: DOCUMENT_TYPES.PRICES,
      in_Domain: domain,
      out_Domain: domain,
      periodStart: periodStart || formatDateForEntsoe(new Date()),
      periodEnd: periodEnd || formatDateForEntsoe(new Date(Date.now() + 24 * 60 * 60 * 1000))
    });

    console.log('🔄 Fetching ENTSO-E electricity prices via proxy...');
    const response = await fetch(`/api/entsoe?${params}`);
    
    if (!response.ok) {
      console.warn(`⚠️ ENTSO-E prices API error: ${response.status}`);
      throw new Error(`ENTSO-E API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parsedData = parseEntsoePriceXML(xmlText);
    
    console.log('✅ ENTSO-E electricity prices received:', parsedData.prices?.length || 0, 'data points');
    return parsedData;
    
  } catch (error) {
    console.error('❌ Error fetching electricity prices:', error);
    return generateMockElectricityPrices();
  }
};

// ✅ FIXED: Complete Solar Generation Function
export const fetchSolarGeneration = async () => {
  try {
    // Get current date in Stockholm timezone
    const now = new Date();
    const stockholmTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Stockholm"}));
    
    // Use yesterday's date to ensure data availability
    const yesterday = new Date(stockholmTime);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const start = formatDateForAPI(yesterday);
    const end = formatDateForAPI(stockholmTime);
    
    console.log('🔄 Fetching ENTSO-E solar generation via proxy...');
    console.log('📅 Date range:', { start, end, domain: SWEDEN_DOMAIN });

    const params = new URLSearchParams({
      securityToken: API_KEY,
      documentType: 'A75', // Actual generation per type
      in_Domain: SWEDEN_DOMAIN,
      periodStart: start,
      periodEnd: end,
      psrType: 'B16' // Solar
    });

    const response = await fetch(`/api/entsoe?${params}`);

    if (!response.ok) {
      console.warn(`⚠️ ENTSO-E solar API error: ${response.status}`);
      console.log('📝 Using mock solar data');
      return generateMockSolarGeneration();
    }

    const xmlText = await response.text();
    console.log('✅ ENTSO-E solar generation XML received');

    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for acknowledgement (error) response
    const acknowledgement = xmlDoc.querySelector('Acknowledgement_MarketDocument');
    if (acknowledgement) {
      const reason = xmlDoc.querySelector('Reason text')?.textContent || 'Unknown error';
      console.warn('⚠️ ENTSO-E solar acknowledgement:', reason);
      return generateMockSolarGeneration();
    }

    // Parse time series data
    const timeSeries = xmlDoc.querySelectorAll('TimeSeries');
    const solarData = [];

    timeSeries.forEach(series => {
      const periods = series.querySelectorAll('Period');
      periods.forEach(period => {
        const startTime = period.querySelector('timeInterval start')?.textContent;
        const points = period.querySelectorAll('Point');
        
        points.forEach(point => {
          const position = parseInt(point.querySelector('position')?.textContent || '0');
          const quantity = parseFloat(point.querySelector('quantity')?.textContent || '0');
          
          if (startTime && position) {
            const timestamp = new Date(startTime);
            timestamp.setUTCHours(timestamp.getUTCHours() + position - 1);
            
            solarData.push({
              timestamp: timestamp.toISOString(),
              generation: quantity, // MW
              value: quantity, // For compatibility
              position
            });
          }
        });
      });
    });

    if (solarData.length === 0) {
      console.warn('⚠️ No solar generation data found in response');
      return generateMockSolarGeneration();
    }

    // Sort by timestamp
    solarData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log(`✅ ENTSO-E solar generation received: ${solarData.length} data points`);
    
    return {
      source: 'real',
      data: solarData,
      total: solarData.length,
      domain: SWEDEN_DOMAIN,
      fetchedAt: new Date().toISOString(),
      unit: 'MW',
      summary: {
        maxGeneration: Math.max(...solarData.map(d => d.generation)),
        avgGeneration: solarData.reduce((sum, d) => sum + d.generation, 0) / solarData.length,
        totalEnergy: solarData.reduce((sum, d) => sum + d.generation, 0)
      }
    };

  } catch (error) {
    console.error('❌ Error fetching solar generation:', error);
    return generateMockSolarGeneration();
  }
};

export const fetchWindGeneration = async (domain = SWEDISH_DOMAINS.SE3, periodStart, periodEnd) => {
  try {
    // Use a more reliable date range - yesterday to today
    const now = new Date();
    
    // Start: Yesterday at 00:00 UTC
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);
    
    // End: Today at current hour UTC
    const today = new Date(now);
    today.setUTCMinutes(0, 0, 0); // Round to current hour
    
    const params = new URLSearchParams({
      securityToken: API_TOKEN || API_KEY,
      documentType: DOCUMENT_TYPES.ACTUAL_GENERATION,
      in_Domain: domain,
      periodStart: periodStart || formatDateForEntsoe(yesterday),
      periodEnd: periodEnd || formatDateForEntsoe(today),
      psrType: PSR_TYPES.WIND_ONSHORE // Wind onshore
    });

    const url = `/api/entsoe?${params}`;
    console.log('🔄 Fetching ENTSO-E wind generation via proxy...');
    console.log('💨 Date range:', {
      start: periodStart || formatDateForEntsoe(yesterday),
      end: periodEnd || formatDateForEntsoe(today),
      domain
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('⚠️ ENTSO-E wind API error:', response.status);
      throw new Error(`ENTSO-E API error: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log('✅ ENTSO-E wind generation XML received');

    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for acknowledgement (error) response
    const acknowledgement = xmlDoc.querySelector('Acknowledgement_MarketDocument');
    if (acknowledgement) {
      const reason = xmlDoc.querySelector('Reason text')?.textContent || 'Unknown error';
      console.warn('⚠️ ENTSO-E wind acknowledgement:', reason);
      throw new Error(`ENTSO-E API acknowledgement: ${reason}`);
    }

    // Parse time series data
    const timeSeries = xmlDoc.querySelectorAll('TimeSeries');
    const windData = [];

    timeSeries.forEach(series => {
      const periods = series.querySelectorAll('Period');
      periods.forEach(period => {
        const startTime = period.querySelector('timeInterval start')?.textContent;
        const points = period.querySelectorAll('Point');
        
        points.forEach(point => {
          const position = parseInt(point.querySelector('position')?.textContent || '0');
          const quantity = parseFloat(point.querySelector('quantity')?.textContent || '0');
          
          if (startTime && position) {
            const timestamp = new Date(startTime);
            timestamp.setUTCHours(timestamp.getUTCHours() + position - 1);
            
            windData.push({
              timestamp: timestamp.toISOString(),
              generation: quantity, // MW
              value: quantity, // For compatibility
              position
            });
          }
        });
      });
    });

    if (windData.length === 0) {
      console.warn('⚠️ No wind generation data found in response');
      throw new Error('No wind data in response');
    }

    // Sort by timestamp
    windData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log(`✅ ENTSO-E wind generation received: ${windData.length} data points`);
    
    return {
      source: 'real',
      data: windData,
      total: windData.length,
      domain,
      fetchedAt: new Date().toISOString(),
      unit: 'MW',
      summary: {
        maxGeneration: Math.max(...windData.map(d => d.generation)),
        avgGeneration: windData.reduce((sum, d) => sum + d.generation, 0) / windData.length,
        totalEnergy: windData.reduce((sum, d) => sum + d.generation, 0) // MWh (assuming hourly data)
      }
    };

  } catch (error) {
    console.error('❌ Error fetching wind generation:', error);
    return generateMockWindGeneration();
  }
};

// ✅ Additional utility exports
export { formatDateForEntsoe, formatDateForAPI, getCountryCode };