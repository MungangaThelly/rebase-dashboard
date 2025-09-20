# 🌞 Rebase Energy Dashboard

A professional React-based energy monitoring dashboard that integrates with the Rebase Energy API to provide real-time site data, intelligent analytics, and production forecasting for renewable energy installations.

## ✨ Features

### 🏭 **Real Energy Site Management**
- Live integration with Rebase Energy API
- Real site data including capacity, location, and specifications
- Support for solar, wind, hydro, and battery storage sites
- Dynamic site selection with detailed information display

### 📊 **Intelligent Analytics**
- 7-day production analysis with site-specific calculations
- Efficiency monitoring based on actual site capacity
- Location-aware performance modeling
- Seasonal and daily variation analysis

### 🌤️ **Weather & Environmental Data**
- Location-based weather condition estimates
- Temperature and wind speed modeling
- Solar irradiance data (GHI, DNI, DHI) for solar sites
- 12-hour weather forecasting

### ⚡ **Real-Time Forecasting**
- Live energy production forecasts from Rebase Energy
- Predictive analytics for site performance
- Interactive forecast visualization charts

### 🎨 **Professional Interface**
- Modern, responsive dashboard design with professional energy industry styling
- Dark theme with energy-specific color coding (blue for power, green for efficiency, yellow for solar)
- Professional typography and visual hierarchy
- Mobile-friendly layout with responsive grid system
- Industry-standard data visualization with Recharts
- CSS variable-based theming for consistent design language

## 🚀 Getting Started

### Prerequisites
- Node.js (>=16.x recommended)
- npm or yarn package manager
- Rebase Energy API key

### Installation

1. **Clone the repository:**
```bash
git clone <your-repository-url>
cd rebase-dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
VITE_REBASE_API_KEY=your_rebase_energy_api_key_here
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173` to view the professional energy dashboard

The dashboard will load with a professional dark theme specifically designed for energy industry applications, featuring real-time data visualization and intelligent analytics.

## 🏗️ Project Structure

```
src/
├── api/                    # API integration
│   └── rebaseApi.js       # Rebase Energy API calls
├── components/            # React components
│   ├── Header.jsx         # Navigation header
│   ├── Sidebar.jsx        # Site selection sidebar
│   ├── SiteSelector.jsx   # Site dropdown component
│   ├── ForecastChart.jsx  # Energy forecast visualization
│   ├── RealEnergyDashboard.jsx  # Main dashboard component
│   ├── Dashboard.jsx      # Legacy dashboard (backup)
│   └── ChartComponent.jsx # Chart utilities
├── data/                  # Static/mock data
│   └── mockData.js       # Fallback data
├── App.jsx               # Main application component
├── App.css               # Global styles
└── main.jsx              # Application entry point
```

## 🔧 Configuration

### API Integration
The dashboard uses a Vite proxy to handle CORS issues with the Rebase Energy API:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rebase.energy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      }
    }
  }
})
```

### Environment Variables
- `VITE_REBASE_API_KEY`: Your Rebase Energy API key for authentication

## 📱 Usage

1. **Site Selection**: Use the sidebar dropdown to select from your available energy sites
2. **Real-Time Data**: View live site specifications, capacity, and location information
3. **Production Analysis**: Monitor 7-day production trends and efficiency metrics
4. **Weather Monitoring**: Track environmental conditions affecting site performance
5. **Forecast Analysis**: View predictive energy production data

## 🛠️ Technical Stack

- **Frontend**: React 18+ with Vite for lightning-fast development
- **Charts**: Recharts for professional energy data visualization
- **Styling**: CSS with CSS Variables for consistent theming, energy industry color palette
- **HTTP Client**: Axios for robust API communication
- **Build Tool**: Vite for optimized production builds
- **Design System**: Professional energy dashboard theme with dark UI and energy-specific color coding

## 🌐 API Endpoints

The dashboard integrates with these Rebase Energy API endpoints:

- `GET /platform/v1/sites` - Fetch all available sites
- `GET /platform/v1/site/forecast/latest/{siteId}` - Get latest forecast data
- `GET /weather/v2/point/operational` - Weather data (when available)

## 🔒 Security

- API keys are stored in environment variables
- CORS issues resolved through proxy configuration
- Secure HTTPS communication with Rebase Energy APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Rebase Energy](https://rebase.energy/) for providing the renewable energy API
- [Recharts](https://recharts.org/) for beautiful chart components
- [Vite](https://vitejs.dev/) for lightning-fast development experience

## 📞 Support

For questions about the Rebase Energy API, visit [Rebase Energy Documentation](https://docs.rebase.energy/)

---

**Built with ❤️ for sustainable energy monitoring**