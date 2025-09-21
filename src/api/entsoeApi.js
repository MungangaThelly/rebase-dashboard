const ENTSOE_API_BASE = 'https://web-api.tp.entsoe.eu/api';
const API_TOKEN = import.meta.env.VITE_ENTSOE_API_KEY;

// Swedish electricity domains for ENTSO-E
export const SWEDISH_DOMAINS = {
  SE1: '10Y1001A1001A44P', // Northern Sweden
  SE2: '10Y1001A1001A45N', // Central Sweden  
  SE3: '10Y1001A1001A46L', // Southern Sweden
  SE4: '10Y1001A1001A47J'  // Malmö area
};

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

export const fetchElectricityPrices = async (domain = SWEDISH_DOMAINS.SE3, periodStart, periodEnd) => {
  try {
    const params = new URLSearchParams({
      securityToken: API_TOKEN,
      documentType: DOCUMENT_TYPES.PRICES,
      in_Domain: domain,
      out_Domain: domain,
      periodStart: periodStart || formatDateForEntsoe(new Date()),
      periodEnd: periodEnd || formatDateForEntsoe(new Date(Date.now() + 24 * 60 * 60 * 1000))
    });

    console.log('🔄 Fetching ENTSO-E electricity prices...');
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

export const fetchSolarGeneration = async (domain = SWEDISH_DOMAINS.SE3, periodStart, periodEnd) => {
  try {
    const params = new URLSearchParams({
      securityToken: API_TOKEN,
      documentType: DOCUMENT_TYPES.ACTUAL_GENERATION,
      in_Domain: domain,
      periodStart: periodStart || formatDateForEntsoe(new Date()),
      periodEnd: periodEnd || formatDateForEntsoe(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      psrType: PSR_TYPES.SOLAR
    });

    console.log('🔄 Fetching ENTSO-E solar generation...');
    const response = await fetch(`/api/entsoe?${params}`);
    
    if (!response.ok) {
      console.warn(`⚠️ ENTSO-E solar API error: ${response.status}`);
      throw new Error(`ENTSO-E API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parsedData = parseEntsoeGenerationXML(xmlText);
    
    console.log('✅ ENTSO-E solar generation received:', parsedData.generation?.length || 0, 'data points');
    return parsedData;
    
  } catch (error) {
    console.error('❌ Error fetching solar generation:', error);
    return generateMockSolarGeneration();
  }
};

export const fetchWindGeneration = async (domain = SWEDISH_DOMAINS.SE3, periodStart, periodEnd) => {
  try {
    const params = new URLSearchParams({
      securityToken: API_TOKEN,
      documentType: DOCUMENT_TYPES.ACTUAL_GENERATION,
      in_Domain: domain,
      periodStart: periodStart || formatDateForEntsoe(new Date()),
      periodEnd: periodEnd || formatDateForEntsoe(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      psrType: PSR_TYPES.WIND_ONSHORE
    });

    console.log('🔄 Fetching ENTSO-E wind generation...');
    const response = await fetch(`/api/entsoe?${params}`);
    
    if (!response.ok) {
      console.warn(`⚠️ ENTSO-E wind API error: ${response.status}`);
      throw new Error(`ENTSO-E API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parsedData = parseEntsoeGenerationXML(xmlText);
    
    console.log('✅ ENTSO-E wind generation received:', parsedData.generation?.length || 0, 'data points');
    return parsedData;
    
  } catch (error) {
    console.error('❌ Error fetching wind generation:', error);
    return generateMockWindGeneration();
  }
};

export const fetchSystemLoad = async (domain = SWEDISH_DOMAINS.SE3, periodStart, periodEnd) => {
  try {
    const params = new URLSearchParams({
      securityToken: API_TOKEN,
      documentType: DOCUMENT_TYPES.LOAD,
      in_Domain: domain,
      out_Domain: domain,
      periodStart: periodStart || formatDateForEntsoe(new Date()),
      periodEnd: periodEnd || formatDateForEntsoe(new Date(Date.now() + 24 * 60 * 60 * 1000))
    });

    console.log('🔄 Fetching ENTSO-E system load...');
    const response = await fetch(`/api/entsoe?${params}`);
    
    if (!response.ok) {
      console.warn(`⚠️ ENTSO-E load API error: ${response.status}`);
      throw new Error(`ENTSO-E API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parsedData = parseEntsoeLoadXML(xmlText);
    
    console.log('✅ ENTSO-E system load received:', parsedData.load?.length || 0, 'data points');
    return parsedData;
    
  } catch (error) {
    console.error('❌ Error fetching system load:', error);
    return generateMockSystemLoad();
  }
};

// Helper functions
const formatDateForEntsoe = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}${month}${day}${hour}00`;
};

const parseEntsoePriceXML = (xmlText) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for errors
    const errorResponse = xmlDoc.getElementsByTagName('Reason');
    if (errorResponse.length > 0) {
      console.warn('⚠️ ENTSO-E API returned error:', errorResponse[0].textContent);
      throw new Error('ENTSO-E API error response');
    }
    
    const timeSeries = xmlDoc.getElementsByTagName('TimeSeries')[0];
    if (!timeSeries) {
      console.warn('⚠️ No TimeSeries found in ENTSO-E response');
      throw new Error('No TimeSeries in response');
    }
    
    const points = timeSeries.getElementsByTagName('Point');
    const prices = [];
    
    for (let point of points) {
      const position = point.getElementsByTagName('position')[0]?.textContent;
      const price = point.getElementsByTagName('price.amount')[0]?.textContent;
      
      if (position && price) {
        prices.push({
          hour: parseInt(position),
          price: parseFloat(price),
          currency: 'EUR/MWh',
          timestamp: new Date(Date.now() + (parseInt(position) - 1) * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    return { 
      source: 'real', 
      prices, 
      total: prices.length,
      domain: 'SE3',
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error parsing ENTSO-E price XML:', error);
    throw error;
  }
};

const parseEntsoeGenerationXML = (xmlText) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for errors
    const errorResponse = xmlDoc.getElementsByTagName('Reason');
    if (errorResponse.length > 0) {
      console.warn('⚠️ ENTSO-E API returned error:', errorResponse[0].textContent);
      throw new Error('ENTSO-E API error response');
    }
    
    const timeSeries = xmlDoc.getElementsByTagName('TimeSeries')[0];
    if (!timeSeries) {
      console.warn('⚠️ No TimeSeries found in ENTSO-E response');
      throw new Error('No TimeSeries in response');
    }
    
    const points = timeSeries.getElementsByTagName('Point');
    const generation = [];
    
    for (let point of points) {
      const position = point.getElementsByTagName('position')[0]?.textContent;
      const quantity = point.getElementsByTagName('quantity')[0]?.textContent;
      
      if (position && quantity) {
        generation.push({
          hour: parseInt(position),
          generation: parseFloat(quantity),
          unit: 'MW',
          timestamp: new Date(Date.now() + (parseInt(position) - 1) * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    return { 
      source: 'real', 
      generation, 
      total: generation.length,
      domain: 'SE3',
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error parsing ENTSO-E generation XML:', error);
    throw error;
  }
};

const parseEntsoeLoadXML = (xmlText) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const timeSeries = xmlDoc.getElementsByTagName('TimeSeries')[0];
    if (!timeSeries) throw new Error('No TimeSeries in response');
    
    const points = timeSeries.getElementsByTagName('Point');
    const load = [];
    
    for (let point of points) {
      const position = point.getElementsByTagName('position')[0]?.textContent;
      const quantity = point.getElementsByTagName('quantity')[0]?.textContent;
      
      if (position && quantity) {
        load.push({
          hour: parseInt(position),
          load: parseFloat(quantity),
          unit: 'MW',
          timestamp: new Date(Date.now() + (parseInt(position) - 1) * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    return { 
      source: 'real', 
      load, 
      total: load.length,
      domain: 'SE3',
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error parsing ENTSO-E load XML:', error);
    throw error;
  }
};

// Mock data functions
function generateMockElectricityPrices() {
  const basePrice = 45; // EUR/MWh typical for Sweden
  const prices = Array.from({ length: 24 }, (_, i) => {
    // Simulate typical daily price curve with morning and evening peaks
    const hourlyVariation = Math.sin((i - 6) * Math.PI / 12) * 15; // Peak around 6 PM
    const peakHourBonus = (i >= 7 && i <= 9) || (i >= 17 && i <= 20) ? 10 : 0;
    const nightDiscount = (i >= 23 || i <= 6) ? -8 : 0;
    
    return {
      hour: i + 1,
      price: Math.round((basePrice + hourlyVariation + peakHourBonus + nightDiscount + Math.random() * 8) * 100) / 100,
      currency: 'EUR/MWh',
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
    };
  });
  
  return { 
    source: 'mock', 
    prices, 
    total: prices.length,
    domain: 'SE3',
    fetchedAt: new Date().toISOString()
  };
}

function generateMockSolarGeneration() {
  const generation = Array.from({ length: 24 }, (_, i) => {
    // Solar generation curve: 0 at night, peak around noon
    const solarCurve = Math.max(0, Math.sin((i - 6) * Math.PI / 12));
    const maxGeneration = 1200; // MW peak for Sweden
    const seasonalFactor = 0.7; // Winter reduction
    const cloudFactor = 0.9; // Light clouds
    
    return {
      hour: i + 1,
      generation: Math.round(solarCurve * maxGeneration * seasonalFactor * cloudFactor * (0.9 + Math.random() * 0.2)),
      unit: 'MW',
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
    };
  });
  
  return { 
    source: 'mock', 
    generation, 
    total: generation.length,
    domain: 'SE3',
    fetchedAt: new Date().toISOString()
  };
}

function generateMockWindGeneration() {
  const generation = Array.from({ length: 24 }, (_, i) => {
    // Wind is more variable and doesn't follow daily patterns as much
    const baseWind = 2500; // MW typical for Sweden
    const variability = (Math.random() - 0.5) * 1000; // ±500 MW variation
    const hourlyTrend = Math.sin(i * Math.PI / 8) * 300; // Some daily variation
    
    return {
      hour: i + 1,
      generation: Math.max(100, Math.round(baseWind + variability + hourlyTrend)),
      unit: 'MW',
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
    };
  });
  
  return { 
    source: 'mock', 
    generation, 
    total: generation.length,
    domain: 'SE3',
    fetchedAt: new Date().toISOString()
  };
}

function generateMockSystemLoad() {
  const load = Array.from({ length: 24 }, (_, i) => {
    // Typical daily load pattern: low at night, peaks in morning and evening
    const baseLoad = 12000; // MW typical for Sweden
    const morningPeak = (i >= 7 && i <= 9) ? 2000 : 0;
    const eveningPeak = (i >= 17 && i <= 21) ? 2500 : 0;
    const nightReduction = (i >= 23 || i <= 6) ? -2000 : 0;
    const randomVariation = (Math.random() - 0.5) * 500;
    
    return {
      hour: i + 1,
      load: Math.round(baseLoad + morningPeak + eveningPeak + nightReduction + randomVariation),
      unit: 'MW',
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
    };
  });
  
  return { 
    source: 'mock', 
    load, 
    total: load.length,
    domain: 'SE3',
    fetchedAt: new Date().toISOString()
  };
}

// Domain helper functions
export const getDomainName = (domainCode) => {
  const domainNames = {
    [SWEDISH_DOMAINS.SE1]: 'Northern Sweden (SE1)',
    [SWEDISH_DOMAINS.SE2]: 'Central Sweden (SE2)',
    [SWEDISH_DOMAINS.SE3]: 'Southern Sweden (SE3)',
    [SWEDISH_DOMAINS.SE4]: 'Malmö area (SE4)'
  };
  return domainNames[domainCode] || domainCode;
};

export const getAllSwedishDomains = () => {
  return Object.entries(SWEDISH_DOMAINS).map(([key, value]) => ({
    code: value,
    name: getDomainName(value),
    shortName: key
  }));
};