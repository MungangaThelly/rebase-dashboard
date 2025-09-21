import React, { useEffect, useState } from 'react';
import { fetchSites } from '../api/rebaseApi';
import './SiteSelector.css'; // 👈 Add this line

const SiteSelector = ({ selectedSite, onSiteChange }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sitesData = await fetchSites();
        
        // Ensure we have an array
        if (Array.isArray(sitesData)) {
          setSites(sitesData);
        } else {
          console.error('❌ Sites data is not an array:', sitesData);
          setSites([]);
        }
        
      } catch (err) {
        console.error('❌ SiteSelector: Error loading sites:', err);
        setError(err.message);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, []);

  const handleSiteChange = (event) => {
    const siteId = event.target.value;
    if (siteId && onSiteChange) {
      const site = sites.find(s => s.id === siteId);
      console.log('🔄 SiteSelector: Site changed to:', site);
      onSiteChange(site);
    }
  };

  if (loading) {
    return (
      <div className="site-selector">
        <label htmlFor="site-select">Select Solar Site:</label>
        <select disabled>
          <option>Loading sites...</option>
        </select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-selector">
        <label htmlFor="site-select">Select Solar Site:</label>
        <select disabled>
          <option>Error loading sites</option>
        </select>
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="site-selector">
        <label htmlFor="site-select">Select Solar Site:</label>
        <select disabled>
          <option>No sites available</option>
        </select>
      </div>
    );
  }

  return (
    <div className="site-selector">
      <label htmlFor="site-select">Select Solar Site:</label>
      <select 
        id="site-select"
        value={selectedSite?.id || ''} 
        onChange={handleSiteChange}
        className="site-select"
      >
        <option value="">Choose a solar site...</option>
        {sites.map((site) => {
          // Safety check for each site
          if (!site || !site.id) {
            console.warn('⚠️ Invalid site data:', site);
            return null;
          }
          
          return (
            <option key={site.id} value={site.id}>
              {site.name || site.id} 
              {site.capacity ? ` (${site.capacity} MW)` : ''}
              {site.location ? ` - ${site.location.latitude?.toFixed(2)}, ${site.location.longitude?.toFixed(2)}` : ''}
            </option>
          );
        })}
      </select>
      
      {selectedSite && (
        <div className="selected-site-info">
          <h4>{selectedSite.name}</h4>
          <p>📍 Location: {selectedSite.location?.latitude?.toFixed(4)}, {selectedSite.location?.longitude?.toFixed(4)}</p>
          <p>⚡ Capacity: {selectedSite.capacity} MW</p>
          <p>🏭 Type: {selectedSite.type}</p>
          {selectedSite.status && <p>🔧 Status: {selectedSite.status}</p>}
        </div>
      )}
    </div>
  );
};

export default SiteSelector;
