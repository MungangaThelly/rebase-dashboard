# 🌍 Multi-API Renewable Energy Dashboard

*Built by **[Munganga Thelly](https://www.linkedin.com/in/thelly660/)** for the renewable energy transition*

A comprehensive real-time renewable energy research platform that integrates multiple European energy APIs to provide actionable insights for the clean energy transition.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![APIs](https://img.shields.io/badge/APIs-6%20Integrated-orange)
![License](https://img.shields.io/badge/License-MIT-green)

🌐 **[Live Demo](https://datademocracy.netlify.app)** | 📁 **[GitHub Repository](https://github.com/MungangaThelly/rebase-dashboard)** | 💼 **[LinkedIn Profile](https://www.linkedin.com/in/thelly660/)**

## 🚀 **Overview**

This dashboard provides real-time insights for energy researchers, grid operators, and renewable energy professionals by aggregating data from multiple European energy market APIs into a unified, interactive platform.

### **🎯 Key Features**

- **🔌 Multi-API Integration**: 6 different energy APIs with robust error handling
- **⚡ Real-time Data**: Live Swedish electricity market and carbon intensity data
- **🌤️ Weather Comparison**: Dual-source weather analysis (OpenWeather + Rebase)
- **📊 Interactive Visualizations**: Professional charts with Recharts
- **🏗️ Site Management**: Energy installation management system
- **🇪🇺 European Focus**: Swedish energy market with ENTSO-E integration
- **🔄 Graceful Fallbacks**: Smart mock data systems for unavailable APIs

## 📊 **Integrated APIs**

| API | Status | Data Type | Purpose |
|-----|--------|-----------|---------|
| **ElectricityMap** | ✅ Live | Carbon Intensity & Power Breakdown | Grid composition analysis |
| **ENTSO-E** | ✅ Live | Electricity Prices | European energy market data |
| **OpenWeather** | ✅ Live | Weather Conditions | Real weather impact analysis |
| **Rebase Weather** | 🔶 Mock | Weather Forecasts | Research weather comparison |
| **Rebase Sites** | 🔶 Mock | Energy Installations | Site management system |
| **ENTSO-E Solar** | 🔶 Mock | Solar Generation | Renewable generation data |

## 🛠️ **Technology Stack**

- **Frontend**: React 18.x with modern hooks
- **Styling**: CSS3 with responsive design
- **Charts**: Recharts for interactive visualizations
- **APIs**: RESTful integration with Promise.allSettled
- **State Management**: Consolidated React state with custom hooks
- **Build Tool**: Vite for fast development
- **Deployment**: Netlify with continuous integration

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+ and npm
- API keys for external services (optional - fallbacks available)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/MungangaThelly/rebase-dashboard.git
cd rebase-dashboard

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env
# Add your API keys to .env file

# Start development server
npm run dev
```

### **Environment Variables**

```env
# Optional - Dashboard works with mock data if not provided
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_REBASE_API_KEY=your_rebase_key
VITE_ELECTRICITYMAP_API_KEY=your_electricitymap_key
VITE_ENTSOE_API_KEY=your_entsoe_key
```

## 📱 **Dashboard Components**

### **🏠 Main Dashboard**
- **Header**: Site selector and control buttons
- **Carbon Intensity Panel**: Real-time grid carbon emissions
- **Electricity Prices Panel**: Swedish market pricing (46 data points)
- **Multi-Weather Panel**: Comparative weather analysis with charts
- **Grid Generation Panel**: Power breakdown by source
- **Footer**: Data source indicators with status

### **🌤️ Weather Comparison**
- **Dual-source analysis**: OpenWeather (real) vs Rebase (research)
- **24-hour forecasts**: Temperature, humidity, wind speed
- **Statistical comparison**: Agreement percentage and differences
- **Interactive charts**: Professional Recharts visualizations

### **🏗️ Site Management**
- **Energy installations**: Solar farms and wind installations
- **Site details**: Capacity, location, type, operational status
- **Geographic focus**: Stockholm and Gotland, Sweden

## 🔧 **API Integration Details**

### **Real-time Data Sources**
```javascript
// ElectricityMap - Live carbon intensity
const carbonData = await fetchCarbonIntensity();

// ENTSO-E - Swedish electricity prices
const priceData = await fetchElectricityPrices();

// OpenWeather - Stockholm weather
const weatherData = await fetchCurrentWeather();
```

### **Error Handling & Fallbacks**
```javascript
// Robust error handling with graceful degradation
const results = await Promise.allSettled([
  fetchElectricityPrices(),
  fetchCarbonIntensity(),
  fetchCurrentWeather(),
  // ... other APIs
]);

// Automatic fallback to high-quality mock data
if (apiResult.status === 'rejected') {
  return getMockData();
}
```

## 📊 **Data Visualization**

### **Chart Types**
- **Line Charts**: 24-hour weather forecasts
- **Bar Charts**: Power generation breakdown
- **Area Charts**: Electricity price trends
- **Comparison Charts**: Multi-source weather analysis

### **Interactive Features**
- **Hover tooltips**: Detailed data points
- **Responsive design**: Mobile and desktop optimized
- **Real-time updates**: Live data refresh
- **Statistical analysis**: Automatic difference calculations

## 🌍 **Geographic Focus**

### **Sweden Energy Market**
- **ENTSO-E Integration**: European grid data
- **ElectricityMap**: Nordic power system
- **Coordinates**: Stockholm (59.3293°N, 18.0686°E)
- **Sites**: Stockholm Solar Farm, Gotland Wind Farm

## 📈 **Use Cases**

### **🔬 Energy Research**
- **Market analysis**: Real-time electricity pricing trends
- **Weather impact**: Correlation between weather and energy demand
- **Grid composition**: Live renewable energy mix monitoring
- **Carbon tracking**: Real-time emissions analysis

### **⚡ Grid Operations**
- **Power breakdown**: Current generation by source
- **Market monitoring**: Swedish electricity market data
- **Weather planning**: Multi-source weather forecasting
- **Site management**: Renewable installation monitoring

### **📊 Business Intelligence**
- **Energy trading**: Real-time market data for decisions
- **Sustainability reporting**: Carbon intensity tracking
- **Weather risk**: Multi-source weather comparison
- **Portfolio management**: Energy site performance

## 🛡️ **Reliability Features**

### **Robust Error Handling**
- **API timeouts**: Graceful handling of slow responses
- **Fallback systems**: High-quality mock data when APIs unavailable
- **User feedback**: Clear status indicators for all data sources
- **Retry logic**: Automatic retry for failed requests

### **Production Ready**
- **Environment configuration**: Flexible API key management
- **Build optimization**: Vite production builds
- **Responsive design**: Mobile and desktop support
- **Professional UX**: Loading states and error messages

## 📦 **Project Structure**

```
src/
├── components/           # React components
│   ├── Dashboard.jsx    # Main dashboard orchestrator
│   ├── CarbonIntensityPanel.jsx
│   ├── ElectricityPricesPanel.jsx
│   ├── MultiWeatherPanel.jsx
│   ├── GridGenerationPanel.jsx
│   └── SiteSelector.jsx
├── api/                 # API integration modules
│   ├── rebaseApi.js     # Rebase Energy APIs
│   ├── entsoeApi.js     # ENTSO-E European grid data
│   ├── electricityMapApi.js  # ElectricityMap carbon data
│   └── openWeatherApi.js     # OpenWeather weather data
├── styles/              # CSS stylesheets
└── utils/               # Utility functions
```

## 🚀 **Deployment**

### **Live Application**
🌐 **[datademocracy.netlify.app](https://datademocracy.netlify.app)**

### **Build for Production**
```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Deploy to Netlify (automated via GitHub)
git push origin main
```

## 🤝 **Contributing**

### **Development Guidelines**
1. **Component Structure**: Follow existing modular pattern
2. **API Integration**: Use consistent error handling
3. **Styling**: Maintain responsive design principles
4. **Testing**: Add console logging for debugging

### **Adding New APIs**
```javascript
// Example: Adding a new energy API
export const fetchNewEnergyData = async () => {
  try {
    const response = await fetch('/api/new-energy-source');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ New API Error:', error);
    return getMockEnergyData(); // Always provide fallback
  }
};
```

## 📝 **License**

MIT License - feel free to use this project for research, education, or commercial purposes.

## 🌟 **Acknowledgments**

- **ElectricityMap**: Real-time carbon intensity data
- **ENTSO-E**: European electricity market transparency
- **OpenWeather**: Reliable weather data services
- **Rebase Energy**: Advanced energy research APIs
- **React Community**: Amazing ecosystem and tools

## 📞 **Contact & Support**

### **Developer: Munganga Thelly**

- 🌐 **Live Demo**: [datademocracy.netlify.app](https://datademocracy.netlify.app)
- 📁 **GitHub**: [MungangaThelly/rebase-dashboard](https://github.com/MungangaThelly/rebase-dashboard)
- 💼 **LinkedIn**: [linkedin.com/in/thelly660](https://www.linkedin.com/in/thelly660/)
- 📱 **Phone**: [+46 704810377](tel:+46704810377)

### **Professional Inquiries**
- **Energy Research Collaborations**
- **API Integration Projects**
- **Renewable Energy Consulting**
- **React Development Services**

### **Technical Support**
- **GitHub Issues**: For bugs and feature requests
- **LinkedIn DM**: For professional discussions
- **Phone**: For urgent project inquiries

---

## 🎯 **Project Status: Production Ready** ✅

This renewable energy dashboard successfully demonstrates:
- ✅ **Multi-API integration** with professional error handling
- ✅ **Real-time data visualization** for energy market analysis  
- ✅ **European energy market focus** with Swedish grid data
- ✅ **Research-grade weather comparison** capabilities
- ✅ **Professional UX/UI** with responsive design
- ✅ **Robust architecture** ready for production deployment

**Perfect for energy researchers, grid operators, and clean technology professionals!** 🌞⚡📊

---

*Built with ❤️ for the renewable energy transition by [Munganga Thelly](https://www.linkedin.com/in/thelly660/)*

**🌍 Deployed at: [datademocracy.netlify.app](https://datademocracy.netlify.app)**