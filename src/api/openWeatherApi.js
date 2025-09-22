const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Add default coordinates for Stockholm
const DEFAULT_COORDS = { lat: 59.3293, lon: 18.0686 };

export const fetchCurrentWeather = async (lat = DEFAULT_COORDS.lat, lon = DEFAULT_COORDS.lon) => {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OpenWeather API key not found, using mock data');
      throw new Error('API key not configured');
    }
    
    // Fix: Use direct API call (not proxy) for OpenWeather
    console.log('🔄 Fetching OpenWeather current weather...');
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenWeather data received:', data);
    
    return {
      source: 'real',
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: { lat: data.coord.lat, lon: data.coord.lon }
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.deg || 0,
        description: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
        visibility: data.visibility || 10000
      },
      timestamp: new Date().toISOString(),
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error fetching current weather:', error);
    return getMockWeatherData();
  }
};

export const fetchWeatherForecast = async (lat = DEFAULT_COORDS.lat, lon = DEFAULT_COORDS.lon) => {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OpenWeather API key not found, using mock data');
      throw new Error('API key not configured');
    }
    
    console.log('🔄 Fetching OpenWeather forecast...');
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=40`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeather forecast API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenWeather forecast received:', data);
    
    return {
      source: 'real',
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: { lat: data.city.coord.lat, lon: data.city.coord.lon }
      },
      forecast: data.list.map(item => ({
        datetime: new Date(item.dt * 1000).toISOString(),
        temperature: Math.round(item.main.temp),
        humidity: item.main.humidity,
        windSpeed: item.wind?.speed || 0,
        description: item.weather[0]?.description || 'Unknown',
        icon: item.weather[0]?.icon || '01d'
      })),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error fetching weather forecast:', error);
    return getMockForecastData();
  }
};

function getMockWeatherData() {
  return {
    source: 'mock',
    location: {
      name: 'Stockholm',
      country: 'SE',
      coordinates: { lat: 59.3293, lon: 18.0686 }
    },
    current: {
      temperature: Math.round(5 + Math.random() * 15), // 5-20°C typical for Sweden
      feelsLike: Math.round(3 + Math.random() * 17),
      humidity: Math.round(60 + Math.random() * 30), // 60-90%
      pressure: Math.round(1010 + Math.random() * 20), // 1010-1030 hPa
      windSpeed: Math.round(Math.random() * 10), // 0-10 m/s
      windDirection: Math.round(Math.random() * 360),
      description: ['partly cloudy', 'overcast', 'light rain', 'clear sky'][Math.floor(Math.random() * 4)],
      icon: '03d',
      visibility: Math.round(8000 + Math.random() * 2000) // 8-10km
    },
    timestamp: new Date().toISOString(),
    sunrise: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    sunset: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()  // 18 hours from now
  };
}

function getMockForecastData() {
  const forecast = [];
  for (let i = 0; i < 40; i++) {
    const time = new Date(Date.now() + i * 3 * 60 * 60 * 1000); // Every 3 hours
    forecast.push({
      datetime: time.toISOString(),
      temperature: Math.round(5 + Math.random() * 15),
      humidity: Math.round(60 + Math.random() * 30),
      windSpeed: Math.round(Math.random() * 10),
      description: ['partly cloudy', 'overcast', 'light rain', 'clear sky'][Math.floor(Math.random() * 4)],
      icon: '03d'
    });
  }
  
  return {
    source: 'mock',
    location: {
      name: 'Stockholm',
      country: 'SE',
      coordinates: { lat: 59.3293, lon: 18.0686 }
    },
    forecast,
    timestamp: new Date().toISOString()
  };
}