const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const fetchCurrentWeather = async (lat, lon) => {
  try {
    console.log('🔄 Fetching OpenWeather current weather...');
    
    const response = await fetch(
      `/api/openweather/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      console.warn(`⚠️ OpenWeather current API error: ${response.status}`);
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenWeather current weather received:', data);
    
    return {
      source: 'real',
      location: { lat, lon },
      current: {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.deg || 0,
        windGust: data.wind?.gust || null,
        cloudCover: data.clouds?.all || 0,
        visibility: data.visibility || null,
        weather: data.weather[0]?.description || 'unknown',
        weatherMain: data.weather[0]?.main || 'unknown',
        icon: data.weather[0]?.icon || '01d'
      },
      timestamp: new Date(data.dt * 1000).toISOString(),
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null,
      cityName: data.name,
      country: data.sys?.country,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching current weather:', error);
    return generateMockCurrentWeather(lat, lon);
  }
};

export const fetchWeatherForecast = async (lat, lon) => {
  try {
    console.log('🔄 Fetching OpenWeather forecast...');
    
    const response = await fetch(
      `/api/openweather/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      console.warn(`⚠️ OpenWeather forecast API error: ${response.status}`);
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenWeather forecast received:', data.list?.length || 0, 'data points');
    
    const forecasts = data.list.map(item => ({
      timestamp: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind?.speed || 0,
      windDirection: item.wind?.deg || 0,
      windGust: item.wind?.gust || null,
      cloudCover: item.clouds?.all || 0,
      weather: item.weather[0]?.description || 'unknown',
      weatherMain: item.weather[0]?.main || 'unknown',
      icon: item.weather[0]?.icon || '01d',
      pop: item.pop || 0, // Probability of precipitation
      rain: item.rain?.['3h'] || 0, // Rain in last 3h
      snow: item.snow?.['3h'] || 0  // Snow in last 3h
    }));
    
    return {
      source: 'real',
      location: { lat, lon },
      forecasts,
      city: data.city?.name,
      country: data.city?.country,
      totalForecasts: forecasts.length,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching weather forecast:', error);
    return generateMockWeatherForecast(lat, lon);
  }
};

export const fetchOneCallWeather = async (lat, lon) => {
  try {
    console.log('🔄 Fetching OpenWeather OneCall...');
    
    const response = await fetch(
      `/api/openweather/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`
    );
    
    if (!response.ok) {
      console.warn(`⚠️ OpenWeather OneCall API error: ${response.status}`);
      throw new Error(`OpenWeather OneCall API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenWeather OneCall received:', data);
    
    return {
      source: 'real',
      location: { lat, lon },
      current: {
        temperature: data.current.temp,
        feelsLike: data.current.feels_like,
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        windSpeed: data.current.wind_speed,
        windDirection: data.current.wind_deg || 0,
        windGust: data.current.wind_gust || null,
        cloudCover: data.current.clouds,
        uvIndex: data.current.uvi,
        visibility: data.current.visibility || null,
        dewPoint: data.current.dew_point,
        weather: data.current.weather[0]?.description || 'unknown',
        weatherMain: data.current.weather[0]?.main || 'unknown',
        icon: data.current.weather[0]?.icon || '01d'
      },
      hourly: data.hourly?.slice(0, 48).map(hour => ({
        timestamp: new Date(hour.dt * 1000).toISOString(),
        temperature: hour.temp,
        feelsLike: hour.feels_like,
        humidity: hour.humidity,
        pressure: hour.pressure,
        windSpeed: hour.wind_speed,
        windDirection: hour.wind_deg || 0,
        windGust: hour.wind_gust || null,
        cloudCover: hour.clouds,
        uvIndex: hour.uvi,
        visibility: hour.visibility || null,
        dewPoint: hour.dew_point,
        weather: hour.weather[0]?.description || 'unknown',
        weatherMain: hour.weather[0]?.main || 'unknown',
        icon: hour.weather[0]?.icon || '01d',
        pop: hour.pop || 0,
        rain: hour.rain?.['1h'] || 0,
        snow: hour.snow?.['1h'] || 0
      })) || [],
      daily: data.daily?.slice(0, 7).map(day => ({
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        sunrise: new Date(day.sunrise * 1000).toISOString(),
        sunset: new Date(day.sunset * 1000).toISOString(),
        moonrise: day.moonrise ? new Date(day.moonrise * 1000).toISOString() : null,
        moonset: day.moonset ? new Date(day.moonset * 1000).toISOString() : null,
        moonPhase: day.moon_phase,
        tempMin: day.temp.min,
        tempMax: day.temp.max,
        tempMorning: day.temp.morn,
        tempDay: day.temp.day,
        tempEvening: day.temp.eve,
        tempNight: day.temp.night,
        feelsLikeMin: day.feels_like.morn,
        feelsLikeMax: day.feels_like.day,
        humidity: day.humidity,
        pressure: day.pressure,
        windSpeed: day.wind_speed,
        windDirection: day.wind_deg || 0,
        windGust: day.wind_gust || null,
        cloudCover: day.clouds,
        uvIndex: day.uvi,
        weather: day.weather[0]?.description || 'unknown',
        weatherMain: day.weather[0]?.main || 'unknown',
        icon: day.weather[0]?.icon || '01d',
        pop: day.pop || 0,
        rain: day.rain || 0,
        snow: day.snow || 0
      })) || [],
      timestamp: new Date().toISOString(),
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching OneCall weather:', error);
    return generateMockOneCallWeather(lat, lon);
  }
};

export const fetchAirPollution = async (lat, lon) => {
  try {
    console.log('🔄 Fetching OpenWeather air pollution...');
    
    const response = await fetch(
      `/api/openweather/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      console.warn(`⚠️ OpenWeather air pollution API error: ${response.status}`);
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenWeather air pollution received:', data);
    
    return {
      source: 'real',
      location: { lat, lon },
      current: {
        aqi: data.list[0]?.main?.aqi, // Air Quality Index (1-5)
        co: data.list[0]?.components?.co,     // Carbon monoxide μg/m³
        no: data.list[0]?.components?.no,     // Nitric oxide μg/m³
        no2: data.list[0]?.components?.no2,   // Nitrogen dioxide μg/m³
        o3: data.list[0]?.components?.o3,     // Ozone μg/m³
        so2: data.list[0]?.components?.so2,   // Sulphur dioxide μg/m³
        pm2_5: data.list[0]?.components?.pm2_5, // PM2.5 μg/m³
        pm10: data.list[0]?.components?.pm10,    // PM10 μg/m³
        nh3: data.list[0]?.components?.nh3       // Ammonia μg/m³
      },
      timestamp: new Date(data.list[0]?.dt * 1000).toISOString(),
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching air pollution:', error);
    return generateMockAirPollution(lat, lon);
  }
};

// Solar radiation calculation helper
export const calculateSolarRadiation = (weatherData) => {
  if (!weatherData.current) return null;
  
  const { cloudCover, uvIndex } = weatherData.current;
  
  if (typeof uvIndex !== 'number') return null;
  
  // Estimate solar radiation from UV index and cloud cover
  const maxRadiation = 1000; // W/m² typical peak solar radiation
  const uvFactor = Math.min(uvIndex / 10, 1); // Normalize UV index
  const cloudFactor = 1 - (cloudCover / 100) * 0.75; // Clouds reduce radiation
  
  return Math.round(maxRadiation * uvFactor * cloudFactor);
};

// Weather condition helpers
export const getWeatherIcon = (iconCode) => {
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '🌨️', '13n': '🌨️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return iconMap[iconCode] || '🌤️';
};

export const getAirQualityLevel = (aqi) => {
  switch (aqi) {
    case 1: return { level: 'Good', color: '#22c55e', icon: '🟢' };
    case 2: return { level: 'Fair', color: '#84cc16', icon: '🟡' };
    case 3: return { level: 'Moderate', color: '#f59e0b', icon: '🟠' };
    case 4: return { level: 'Poor', color: '#ef4444', icon: '🔴' };
    case 5: return { level: 'Very Poor', color: '#991b1b', icon: '⚫' };
    default: return { level: 'Unknown', color: '#6b7280', icon: '❓' };
  }
};

// Mock data functions
function generateMockCurrentWeather(lat, lon) {
  const temp = 15 + Math.random() * 10; // 15-25°C typical for Sweden
  
  return {
    source: 'mock',
    location: { lat, lon },
    current: {
      temperature: Math.round(temp * 10) / 10,
      feelsLike: Math.round((temp + (Math.random() - 0.5) * 3) * 10) / 10,
      humidity: Math.round(60 + Math.random() * 30),
      pressure: Math.round(1010 + Math.random() * 20),
      windSpeed: Math.round((2 + Math.random() * 8) * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      windGust: Math.random() > 0.7 ? Math.round((5 + Math.random() * 10) * 10) / 10 : null,
      cloudCover: Math.round(Math.random() * 100),
      visibility: Math.round(8000 + Math.random() * 2000),
      weather: 'partly cloudy',
      weatherMain: 'Clouds',
      icon: '02d'
    },
    timestamp: new Date().toISOString(),
    sunrise: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    sunset: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    cityName: 'Mock City',
    country: 'SE',
    fetchedAt: new Date().toISOString()
  };
}

function generateMockWeatherForecast(lat, lon) {
  const forecasts = Array.from({ length: 40 }, (_, i) => {
    const baseTemp = 15;
    const dailyVariation = Math.sin((i % 8) * Math.PI / 4) * 5; // Daily temperature cycle
    const randomVariation = (Math.random() - 0.5) * 3;
    const temp = baseTemp + dailyVariation + randomVariation;
    
    return {
      timestamp: new Date(Date.now() + i * 3 * 60 * 60 * 1000).toISOString(),
      temperature: Math.round(temp * 10) / 10,
      feelsLike: Math.round((temp + (Math.random() - 0.5) * 2) * 10) / 10,
      humidity: Math.round(60 + Math.random() * 30),
      pressure: Math.round(1010 + Math.random() * 20),
      windSpeed: Math.round((2 + Math.random() * 8) * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      windGust: Math.random() > 0.7 ? Math.round((5 + Math.random() * 10) * 10) / 10 : null,
      cloudCover: Math.round(Math.random() * 100),
      weather: 'partly cloudy',
      weatherMain: 'Clouds',
      icon: '02d',
      pop: Math.round(Math.random() * 30) / 100,
      rain: Math.random() > 0.8 ? Math.round(Math.random() * 5 * 10) / 10 : 0,
      snow: 0
    };
  });
  
  return {
    source: 'mock',
    location: { lat, lon },
    forecasts,
    city: 'Mock City',
    country: 'SE',
    totalForecasts: forecasts.length,
    fetchedAt: new Date().toISOString()
  };
}

function generateMockOneCallWeather(lat, lon) {
  const currentMock = generateMockCurrentWeather(lat, lon);
  
  return {
    source: 'mock',
    location: { lat, lon },
    current: {
      ...currentMock.current,
      uvIndex: Math.max(0, Math.round((Math.sin(Date.now() / (1000 * 60 * 60 * 2)) + 1) * 5)),
      dewPoint: currentMock.current.temperature - 5 + Math.random() * 3
    },
    hourly: Array.from({ length: 48 }, (_, i) => {
      const baseTemp = 15;
      const hourlyVariation = Math.sin((i - 6) * Math.PI / 12) * 5;
      const temp = baseTemp + hourlyVariation + Math.random() * 3;
      
      return {
        timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
        temperature: Math.round(temp * 10) / 10,
        feelsLike: Math.round((temp + (Math.random() - 0.5) * 2) * 10) / 10,
        humidity: Math.round(60 + Math.random() * 30),
        pressure: Math.round(1010 + Math.random() * 20),
        windSpeed: Math.round((2 + Math.random() * 8) * 10) / 10,
        windDirection: Math.round(Math.random() * 360),
        windGust: Math.random() > 0.7 ? Math.round((5 + Math.random() * 10) * 10) / 10 : null,
        cloudCover: Math.round(Math.random() * 100),
        uvIndex: Math.max(0, Math.round(Math.sin((i - 6) * Math.PI / 12) * 8)),
        visibility: Math.round(8000 + Math.random() * 2000),
        dewPoint: Math.round((temp - 5 + Math.random() * 3) * 10) / 10,
        weather: 'partly cloudy',
        weatherMain: 'Clouds',
        icon: '02d',
        pop: Math.round(Math.random() * 30) / 100,
        rain: Math.random() > 0.8 ? Math.round(Math.random() * 3 * 10) / 10 : 0,
        snow: 0
      };
    }),
    daily: Array.from({ length: 7 }, (_, i) => {
      const minTemp = 10 + Math.random() * 5;
      const maxTemp = minTemp + 8 + Math.random() * 7;
      
      return {
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sunrise: new Date(Date.now() + i * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        sunset: new Date(Date.now() + i * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
        moonrise: new Date(Date.now() + i * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(),
        moonset: new Date(Date.now() + i * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        moonPhase: Math.random(),
        tempMin: Math.round(minTemp * 10) / 10,
        tempMax: Math.round(maxTemp * 10) / 10,
        tempMorning: Math.round((minTemp + 2) * 10) / 10,
        tempDay: Math.round((maxTemp - 1) * 10) / 10,
        tempEvening: Math.round((minTemp + 4) * 10) / 10,
        tempNight: Math.round(minTemp * 10) / 10,
        feelsLikeMin: Math.round((minTemp - 1) * 10) / 10,
        feelsLikeMax: Math.round((maxTemp + 1) * 10) / 10,
        humidity: Math.round(60 + Math.random() * 30),
        pressure: Math.round(1010 + Math.random() * 20),
        windSpeed: Math.round((2 + Math.random() * 8) * 10) / 10,
        windDirection: Math.round(Math.random() * 360),
        windGust: Math.random() > 0.7 ? Math.round((5 + Math.random() * 10) * 10) / 10 : null,
        cloudCover: Math.round(Math.random() * 100),
        uvIndex: Math.round(3 + Math.random() * 5),
        weather: 'partly cloudy',
        weatherMain: 'Clouds',
        icon: '02d',
        pop: Math.round(Math.random() * 40) / 100,
        rain: Math.random() > 0.7 ? Math.round(Math.random() * 10 * 10) / 10 : 0,
        snow: 0
      };
    }),
    timestamp: new Date().toISOString(),
    fetchedAt: new Date().toISOString()
  };
}

function generateMockAirPollution(lat, lon) {
  // Sweden typically has good air quality
  return {
    source: 'mock',
    location: { lat, lon },
    current: {
      aqi: Math.random() > 0.8 ? 2 : 1, // Mostly good, sometimes fair
      co: 200 + Math.random() * 100,     // μg/m³
      no: 0.1 + Math.random() * 0.5,     // μg/m³
      no2: 10 + Math.random() * 20,      // μg/m³
      o3: 50 + Math.random() * 50,       // μg/m³
      so2: 1 + Math.random() * 5,        // μg/m³
      pm2_5: 5 + Math.random() * 10,     // μg/m³
      pm10: 10 + Math.random() * 15,     // μg/m³
      nh3: 1 + Math.random() * 3         // μg/m³
    },
    timestamp: new Date().toISOString(),
    fetchedAt: new Date().toISOString()
  };
}

// Export commonly used functions
export default {
  fetchCurrentWeather,
  fetchWeatherForecast,
  fetchOneCallWeather,
  fetchAirPollution,
  calculateSolarRadiation,
  getWeatherIcon,
  getAirQualityLevel
};