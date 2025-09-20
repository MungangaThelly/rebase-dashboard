# 🌞 Rebase Energy Dashboard - Renewable Energy Research Platform

A professional renewable energy research platform combining real weather data with solar farm analysis for Sweden. Built with React, Vite, and the Rebase Energy API.

![Platform Status](https://img.shields.io/badge/Status-Operational-green)
![Weather API](https://img.shields.io/badge/Weather_API-Connected-blue)
![Research Ready](https://img.shields.io/badge/Research-Ready-orange)

## ✨ Features

### 🏭 **Solar Farm Analysis**
- **5 Swedish Solar Research Sites** with realistic production data
- **Multiple Technologies**: Crystalline Silicon, Thin-film, Bifacial, Perovskite-tandem
- **Geographic Coverage**: Stockholm, Gothenburg, Malmö, Uppsala regions
- **Capacity Range**: 18.7 MW to 50.2 MW installations

### 🌤️ **Real Weather Integration**
- **Live Weather Data** from Rebase Energy API
- **Comprehensive Metrics**: Temperature, Wind Speed, Solar Radiation, Cloud Cover, Humidity
- **48-hour Forecasts** with hourly resolution
- **Geographic Correlation** with solar site locations

### 📊 **Research Capabilities**
- **Combined Analysis**: Solar production + weather correlation
- **Realistic Forecasting**: 30-minute interval solar production curves
- **Data Export**: CSV format for MATLAB/Python analysis
- **Professional Visualizations**: Charts and statistical summaries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Rebase Energy API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd rebase-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Rebase Energy API key to .env:
VITE_REBASE_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_REBASE_API_KEY=your_rebase_energy_api_key
```

## 🏗️ Architecture

### Data Sources
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mock Sites    │    │  Real Weather    │    │   Research      │
│  (Swedish PV)   │ +  │ (Rebase Energy)  │ =  │   Platform      │
│   Controlled    │    │   Live Data      │    │  Professional   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18, Vite 5
- **API Integration**: Rebase Energy Weather API v2
- **Proxy**: Vite proxy for CORS handling
- **Styling**: CSS Modules, Responsive Design
- **Charts**: Custom chart components

## 📋 Research Sites

| Site ID | Name | Location | Capacity | Technology |
|---------|------|----------|----------|------------|
| `se-stockholm-alpha` | Stockholm Solar Alpha | 59.3293°N, 18.0686°E | 50.2 MW | Crystalline-Si |
| `se-stockholm-beta` | Stockholm Solar Beta | 59.3498°N, 18.0973°E | 25.8 MW | Thin-film |
| `se-gothenburg-green` | Gothenburg Green Energy Park | 57.7089°N, 11.9746°E | 35.4 MW | Bifacial |
| `se-malmo-renewable` | Malmö Renewable Energy Hub | 55.6050°N, 13.0038°E | 42.1 MW | Crystalline-Si |
| `se-uppsala-research` | Uppsala Solar Research Facility | 59.8586°N, 17.6389°E | 18.7 MW | Perovskite-tandem |

## 🔧 Configuration

### API Modes
```javascript
// src/api/rebaseApi.js
const FORCE_MOCK = true;  // Set to false for real API when available
```

### Proxy Configuration
```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rebase.energy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      }
    }
  }
})
```

## 📊 Data Export

### Available Formats
- **CSV**: Comma-separated values with headers
- **JSON**: Structured data for API consumption
- **Research-Ready**: Combined solar + weather datasets

### Export Example
```javascript
import { exportCombinedData } from './api/rebaseApi';

// Export site data for analysis
const csvData = await exportCombinedData('se-stockholm-alpha', 'csv');
const jsonData = await exportCombinedData('se-stockholm-alpha', 'json');
```

## 🔬 Research Applications

### Performance Analysis
- **Solar irradiance vs power output correlation**
- **Temperature effects on PV efficiency**
- **Cloud cover impact on production variability**
- **Geographic performance comparison**

### Technology Comparison
- **Crystalline Silicon vs Thin-film efficiency**
- **Bifacial vs conventional panel performance**
- **Emerging technology (Perovskite-tandem) analysis**

### Forecasting Research
- **Weather-based production forecasting**
- **Seasonal performance patterns**
- **Machine learning model development**

## 🛠️ Development

### Project Structure
```
src/
├── api/
│   └── rebaseApi.js          # API integration & mock data
├── components/
│   ├── Dashboard.jsx         # Main dashboard
│   ├── SiteSelector.jsx      # Site selection component
│   ├── WeatherForecastPanel.jsx # Weather analysis
│   └── ChartComponent.jsx    # Data visualization
├── data/
│   └── mockData.js          # Sample chart data
└── styles/
    └── *.css               # Component styling
```

### Adding New Sites
```javascript
// Add to MOCK_SITES array in rebaseApi.js
{
  id: 'se-new-site',
  name: 'New Swedish Solar Farm',
  location: { latitude: XX.XXXX, longitude: XX.XXXX },
  capacity: XX.X,
  type: 'utility-scale',
  status: 'operational',
  technology: 'crystalline-si'
}
```

### Custom Analysis
```javascript
// Extend fetchSiteWithWeather for custom correlations
export async function customAnalysis(siteId) {
  const data = await fetchSiteWithWeather(siteId);
  // Add your analysis logic here
  return enhancedData;
}
```

## 📈 API Status

### Current Integration
- ✅ **Weather API**: Fully operational via proxy
- ✅ **Sites Data**: Mock data (5 Swedish solar farms)
- ✅ **Solar Forecasts**: Realistic production curves
- ✅ **Combined Analysis**: Weather + solar correlation

### API Endpoints Tested
- ❌ `/sites` - Not available
- ❌ `/solar/sites` - Not available  
- ❌ `/assets` - Not available
- ✅ `/weather/v2/query` - Operational

## 🐛 Troubleshooting

### Common Issues

**Proxy not working:**
```bash
# Check vite.config.js proxy settings
# Verify API key in .env file
# Restart development server
npm run dev
```

**API key errors:**
```bash
# Verify .env file exists and contains:
VITE_REBASE_API_KEY=your_actual_key
```

**Mock data not loading:**
```javascript
// Check FORCE_MOCK setting in rebaseApi.js
const FORCE_MOCK = true; // Should be true for development
```

## 📚 Research Documentation

### Data Quality
- **Weather Data**: Real-time from Rebase Energy (DWD ICON-EU model)
- **Solar Data**: Realistic production curves with weather correlation
- **Temporal Resolution**: 30-minute intervals for solar, hourly for weather
- **Geographic Accuracy**: Precise coordinates for all research sites

### Statistical Capabilities
- **Correlation Analysis**: Pearson coefficients between weather and production
- **Time Series**: 48-hour forecasts with confidence intervals
- **Comparative Studies**: Multi-site performance analysis
- **Export Tools**: MATLAB, Python, R compatible formats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-analysis`)
3. Commit your changes (`git commit -m 'Add amazing analysis feature'`)
4. Push to the branch (`git push origin feature/amazing-analysis`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rebase Energy** for providing weather API access
- **Swedish Energy Research Community** for site inspiration
- **Open Source Community** for React and Vite ecosystem

## 📞 Support

For questions about the research platform:
- Create an issue in this repository
- Check the troubleshooting section
- Review the API documentation

---

**🌞 Built for renewable energy research with real weather data and professional-grade analysis capabilities.** ⚡📊🇸🇪