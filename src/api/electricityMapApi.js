const API_BASE_URL = 'https://api.electricitymap.org/v3';
const API_KEY = import.meta.env.VITE_ELECTRICITYMAP_API_KEY;

const headers = {
  'auth-token': API_KEY,
  'Content-Type': 'application/json'
};

// Update the API calls to use correct endpoints
export async function fetchCarbonIntensity(zone = 'SE') {
  try {
    const response = await fetch(`/api/electricitymap/carbon-intensity/latest?zone=${zone}`, {
      headers: {
        'auth-token': import.meta.env.VITE_ELECTRICITYMAP_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`ElectricityMap API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('🔋 ElectricityMap API failed, using mock data:', error);
    return getMockCarbonIntensity();
  }
}

export const fetchPowerBreakdown = async (zone = 'SE') => {
  try {
    console.log('🔄 Fetching ElectricityMap power breakdown...');
    
    const response = await fetch(`/api/electricitymap/power-breakdown/latest?zone=${zone}`, {
      headers
    });
    
    if (!response.ok) {
      console.warn(`⚠️ ElectricityMap power API error: ${response.status}`);
      throw new Error(`ElectricityMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ ElectricityMap power breakdown received:', data);
    
    return {
      source: 'real',
      zone,
      powerConsumptionBreakdown: data.powerConsumptionBreakdown,
      powerProductionBreakdown: data.powerProductionBreakdown,
      renewablePercentage: data.renewablePercentage,
      fossilFreePercentage: data.fossilFreePercentage,
      datetime: data.datetime,
      updatedAt: data.updatedAt,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching power breakdown:', error);
    return generateMockPowerBreakdown(zone);
  }
};

export const fetchCarbonIntensityHistory = async (zone = 'SE', start, end) => {
  try {
    const params = new URLSearchParams({
      zone,
      start: start || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: end || new Date().toISOString()
    });
    
    console.log('🔄 Fetching ElectricityMap carbon history...');
    
    const response = await fetch(`/api/electricitymap/carbon-intensity/history?${params}`, {
      headers
    });
    
    if (!response.ok) {
      console.warn(`⚠️ ElectricityMap history API error: ${response.status}`);
      throw new Error(`ElectricityMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ ElectricityMap carbon history received:', data.history?.length || 0, 'data points');
    
    return {
      source: 'real',
      zone,
      history: data.history,
      unit: 'gCO2eq/kWh',
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching carbon intensity history:', error);
    return generateMockCarbonHistory(zone);
  }
};

export const fetchExchanges = async (zone = 'SE') => {
  try {
    console.log('🔄 Fetching ElectricityMap exchanges...');
    
    const response = await fetch(`/api/electricitymap/exchanges/latest?zone=${zone}`, {
      headers
    });
    
    if (!response.ok) {
      console.warn(`⚠️ ElectricityMap exchanges API error: ${response.status}`);
      throw new Error(`ElectricityMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ ElectricityMap exchanges received:', data);
    
    return {
      source: 'real',
      zone,
      exchanges: data.exchanges,
      datetime: data.datetime,
      updatedAt: data.updatedAt,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching exchanges:', error);
    return generateMockExchanges(zone);
  }
};

// Swedish electricity zones for ElectricityMap
export const SWEDISH_ZONES = {
  SE: 'Sweden (National)',
  'SE-1': 'Northern Sweden',
  'SE-2': 'Central Sweden', 
  'SE-3': 'Southern Sweden',
  'SE-4': 'Malmö area'
};

export const EUROPEAN_ZONES = {
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  DE: 'Germany',
  PL: 'Poland',
  FR: 'France',
  GB: 'Great Britain',
  NL: 'Netherlands',
  BE: 'Belgium'
};

// Carbon intensity classification
export const getCarbonLevel = (intensity) => {
  if (intensity < 100) return { 
    level: 'Very Low', 
    color: '#22c55e', 
    icon: '🟢',
    description: 'Excellent - Very clean energy'
  };
  if (intensity < 200) return { 
    level: 'Low', 
    color: '#84cc16', 
    icon: '🟡',
    description: 'Good - Mostly clean energy'
  };
  if (intensity < 400) return { 
    level: 'Medium', 
    color: '#f59e0b', 
    icon: '🟠',
    description: 'Moderate - Mixed energy sources'
  };
  if (intensity < 600) return { 
    level: 'High', 
    color: '#ef4444', 
    icon: '🔴',
    description: 'Poor - High carbon footprint'
  };
  return { 
    level: 'Very High', 
    color: '#991b1b', 
    icon: '⚫',
    description: 'Critical - Very high emissions'
  };
};

// Mock data functions
function generateMockCarbonIntensity(zone) {
  // Sweden typically has very low carbon intensity due to hydro and nuclear
  const swedishCarbon = 40 + Math.random() * 60; // 40-100 gCO2eq/kWh
  
  return {
    source: 'mock',
    zone,
    carbonIntensity: Math.round(swedishCarbon),
    datetime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unit: 'gCO2eq/kWh',
    fetchedAt: new Date().toISOString()
  };
}

function generateMockPowerBreakdown(zone) {
  // Realistic Swedish power mix
  const totalProduction = 15000 + Math.random() * 5000; // 15-20 GW
  
  const swedishMix = {
    hydro: 0.40 + Math.random() * 0.15,      // 40-55% hydro
    nuclear: 0.35 + Math.random() * 0.10,    // 35-45% nuclear
    wind: 0.10 + Math.random() * 0.15,       // 10-25% wind
    solar: 0.01 + Math.random() * 0.04,      // 1-5% solar
    biomass: 0.05 + Math.random() * 0.05,    // 5-10% biomass
    fossil: 0.01 + Math.random() * 0.03      // 1-4% fossil
  };
  
  // Normalize to 100%
  const total = Object.values(swedishMix).reduce((a, b) => a + b, 0);
  Object.keys(swedishMix).forEach(key => {
    swedishMix[key] = (swedishMix[key] / total) * totalProduction;
  });
  
  const renewablePercentage = ((swedishMix.hydro + swedishMix.wind + swedishMix.solar + swedishMix.biomass) / totalProduction) * 100;
  const fossilFreePercentage = ((totalProduction - swedishMix.fossil) / totalProduction) * 100;
  
  return {
    source: 'mock',
    zone,
    powerConsumptionBreakdown: {
      'battery discharge': null,
      hydro: Math.round(swedishMix.hydro),
      nuclear: Math.round(swedishMix.nuclear),
      solar: Math.round(swedishMix.solar),
      wind: Math.round(swedishMix.wind),
      biomass: Math.round(swedishMix.biomass),
      coal: Math.round(swedishMix.fossil * 0.3),
      gas: Math.round(swedishMix.fossil * 0.7)
    },
    powerProductionBreakdown: {
      hydro: Math.round(swedishMix.hydro),
      nuclear: Math.round(swedishMix.nuclear),
      solar: Math.round(swedishMix.solar),
      wind: Math.round(swedishMix.wind),
      biomass: Math.round(swedishMix.biomass),
      coal: Math.round(swedishMix.fossil * 0.3),
      gas: Math.round(swedishMix.fossil * 0.7)
    },
    renewablePercentage: Math.round(renewablePercentage),
    fossilFreePercentage: Math.round(fossilFreePercentage),
    datetime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString()
  };
}

function generateMockCarbonHistory(zone) {
  const history = Array.from({ length: 24 }, (_, i) => {
    // Swedish carbon intensity varies with renewable availability
    const baseCarbon = 50;
    const hourlyVariation = Math.sin(i * Math.PI / 12) * 20; // Higher during peak hours
    const randomVariation = (Math.random() - 0.5) * 30;
    
    return {
      datetime: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      carbonIntensity: Math.max(20, Math.round(baseCarbon + hourlyVariation + randomVariation))
    };
  });
  
  return {
    source: 'mock',
    zone,
    history,
    unit: 'gCO2eq/kWh',
    fetchedAt: new Date().toISOString()
  };
}

function generateMockExchanges(zone) {
  // Mock electricity exchanges for Sweden
  const exchanges = {
    'SE->NO': 500 + Math.random() * 1000,    // Export to Norway
    'SE->FI': 200 + Math.random() * 500,     // Export to Finland
    'SE->DK': -100 + Math.random() * 400,    // Import/Export to Denmark
    'SE->DE': -50 + Math.random() * 200,     // Import/Export to Germany
    'SE->PL': 100 + Math.random() * 300      // Export to Poland
  };
  
  return {
    source: 'mock',
    zone,
    exchanges,
    datetime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString()
  };
}

// Utility functions
export const calculateCarbonFootprint = (energyConsumption, carbonIntensity) => {
  // energyConsumption in kWh, carbonIntensity in gCO2eq/kWh
  return (energyConsumption * carbonIntensity) / 1000; // kg CO2eq
};

export const getZoneName = (zoneCode) => {
  return SWEDISH_ZONES[zoneCode] || EUROPEAN_ZONES[zoneCode] || zoneCode;
};

export const getAllSwedishZones = () => {
  return Object.entries(SWEDISH_ZONES).map(([code, name]) => ({
    code,
    name
  }));
};