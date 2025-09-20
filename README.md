# 🌞 Rebase Energy Dashboard - Data Democratization Platform

A professional React-based energy monitoring dashboard that democratizes access to renewable energy data for researchers, academics, and industry professionals. Built with the Rebase Energy API to provide real-time site data, intelligent analytics, and production forecasting for advancing renewable energy research.

## 🎯 Mission: Energy Data Democratization

This platform aims to create a **"Hugging Face-like" ecosystem for energy data**, making renewable energy datasets and analytics accessible to the global research community. By providing standardized access to real energy production data, weather patterns, and forecasting models, we enable researchers to advance sustainable energy solutions.

### 🔬 **Research-Focused Features**
- **Open Data Access**: Standardized API access to renewable energy datasets
- **Academic Integration**: Support for university research projects and collaborations  
- **Reproducible Analytics**: Consistent data processing and visualization standards
- **Community Contributions**: Extensible platform for sharing energy models and insights
- **Citation & Attribution**: Proper data provenance for academic publications

## ✨ Core Features

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
- **Future**: Community-contributed ML forecasting models

### 🎨 **Professional Interface**
- Modern, responsive dashboard design with professional energy industry styling
- Dark theme with energy-specific color coding (blue for power, green for efficiency, yellow for solar)
- Professional typography and visual hierarchy
- Mobile-friendly layout with responsive grid system
- Industry-standard data visualization with Recharts
- CSS variable-based theming for consistent design language

## 🚀 Quick Start for Researchers

### Prerequisites
- Node.js (>=16.x recommended)
- npm or yarn package manager
- Rebase Energy API key (or use demo data)

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
# For researchers: Contact us for academic API access
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Access the research dashboard:**
Navigate to `http://localhost:5173` to view the professional energy dashboard with real renewable energy data.

## 🎓 For Researchers & Academics

### **Research Use Cases**
- **Energy Production Analysis**: Compare solar/wind efficiency across different geographic regions
- **Weather Impact Studies**: Correlate weather patterns with renewable energy output
- **Forecasting Model Development**: Access standardized datasets for ML model training
- **Policy Research**: Analyze renewable energy performance for policy recommendations
- **Academic Publications**: Citable, standardized energy datasets with proper attribution

### **Data Access Levels**
1. **Public Data**: Basic energy metrics and site information
2. **Research Access**: Detailed analytics and historical data
3. **Academic Partnership**: Full dataset access and collaboration opportunities

### **Future Research Platform Features** 🔮
- **Model Repository**: Share and discover energy forecasting models (like Hugging Face Models)
- **Dataset Hub**: Standardized renewable energy datasets for research
- **Community Notebooks**: Jupyter-style analysis sharing
- **Research Collaboration**: Multi-institutional project management
- **API Marketplace**: Extensible platform for energy data providers

## 🏗️ Project Structure

```
src/
├── api/                    # API integration
│   └── rebaseApi.js       # Rebase Energy API calls
├── components/            # React components
│   ├── auth/              # Authentication for researchers (planned)
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
├── App.css               # Global styles with energy theme
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
- `VITE_RESEARCH_MODE`: Enable additional research features (planned)

## 📱 Usage

### **For Energy Professionals**
1. **Site Selection**: Use the sidebar dropdown to select from your available energy sites
2. **Real-Time Data**: View live site specifications, capacity, and location information
3. **Production Analysis**: Monitor 7-day production trends and efficiency metrics
4. **Weather Monitoring**: Track environmental conditions affecting site performance
5. **Forecast Analysis**: View predictive energy production data

### **For Researchers**
1. **Data Exploration**: Access standardized renewable energy datasets
2. **Comparative Analysis**: Compare performance across different site types and regions
3. **Model Development**: Use consistent data formats for ML model training
4. **Publication Support**: Generate properly attributed data for academic papers

## 🛠️ Technical Stack

- **Frontend**: React 18+ with Vite for lightning-fast development
- **Charts**: Recharts for professional energy data visualization
- **Styling**: CSS with CSS Variables for consistent theming, energy industry color palette
- **HTTP Client**: Axios for robust API communication
- **Build Tool**: Vite for optimized production builds
- **Design System**: Professional energy dashboard theme with dark UI and energy-specific color coding
- **Future**: Authentication system for researcher access control

## 🌐 API Endpoints

The dashboard integrates with these Rebase Energy API endpoints:

- `GET /platform/v1/sites` - Fetch all available sites
- `GET /platform/v1/site/forecast/latest/{siteId}` - Get latest forecast data
- `GET /weather/v2/point/operational` - Weather data (when available)

**Research API Extensions (Planned)**:
- `GET /research/v1/datasets` - Browse available research datasets
- `GET /research/v1/models` - Community-contributed forecasting models
- `POST /research/v1/contribute` - Submit research data or models

## 🔒 Security & Data Ethics

- API keys are stored in environment variables
- CORS issues resolved through proxy configuration
- Secure HTTPS communication with Rebase Energy APIs
- **Research Ethics**: Proper data attribution and citation requirements
- **Privacy**: Anonymized data for research use when applicable

## 🎯 MVP Status & Roadmap

### **✅ Current MVP Features**
- Professional energy dashboard with real data integration
- Intelligent analytics and forecasting visualization
- Responsive design with energy industry styling
- CORS-resolved API integration with error handling

### **🔮 Research Platform Roadmap**
- **Phase 1**: User authentication for researchers
- **Phase 2**: Dataset repository and standardized exports
- **Phase 3**: Community model sharing (Hugging Face-style)
- **Phase 4**: Multi-institutional collaboration tools
- **Phase 5**: Full ecosystem platform for energy research

## 🤝 Contributing

We welcome contributions from the research community!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/research-enhancement`)
3. Commit your changes (`git commit -m 'Add research feature'`)
4. Push to the branch (`git push origin feature/research-enhancement`)
5. Open a Pull Request

### **Research Contributions**
- **Data Models**: Share standardized energy data processing models
- **Visualization Components**: Contribute new chart types for energy analysis
- **Research Use Cases**: Document academic applications and methodologies
- **API Extensions**: Propose new endpoints for research data access

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Citations

When using this platform for research, please cite:

```bibtex
@software{rebase_energy_dashboard,
  title={Rebase Energy Dashboard: Data Democratization Platform for Renewable Energy Research},
  author={[Your Name]},
  year={2025},
  url={https://github.com/[your-repo]/rebase-dashboard}
}
```

## 🙏 Acknowledgments

- [Rebase Energy](https://rebase.energy/) for providing the renewable energy API
- [RISE Research Institutes of Sweden](https://www.ri.se/) for supporting data democratization initiatives
- [Recharts](https://recharts.org/) for beautiful chart components
- [Vite](https://vitejs.dev/) for lightning-fast development experience
- The global renewable energy research community

## 📞 Support & Research Partnerships

- **Technical Support**: [Create an issue](https://github.com/[your-repo]/issues)
- **Research Collaborations**: Contact us for academic partnerships
- **Data Access**: Email for researcher API access
- **Rebase Energy API**: [Official Documentation](https://docs.rebase.energy/)

## 🌍 Vision: Building the Energy Research Ecosystem

Our goal is to create the **"Hugging Face for Energy Data"** - a collaborative platform where researchers, academics, and industry professionals can:

- **Discover** standardized renewable energy datasets
- **Share** forecasting models and analytical tools  
- **Collaborate** on multi-institutional research projects
- **Accelerate** sustainable energy innovation through open science

---

**Built with ❤️ for sustainable energy research and data democratization**

*Supporting the global transition to renewable energy through open, accessible data and collaborative research tools.*