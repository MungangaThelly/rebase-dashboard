import React from 'react';
import './SiteSelector.css'; // 👈 Add this line

const SiteSelector = ({ sites = [], selectedSite, onSiteSelect }) => {
  console.log('🔍 SiteSelector props:', { 
    sites: sites?.length || 0, 
    selectedSite, 
    onSiteSelect: typeof onSiteSelect 
  });

  // ✅ Add safety check for onSiteSelect function
  const handleSiteChange = (event) => {
    const siteId = event.target.value;
    console.log('🔄 Site selection changed:', siteId);
    
    // ✅ Check if onSiteSelect is a function before calling
    if (typeof onSiteSelect === 'function') {
      const site = sites.find(s => s.id === siteId);
      onSiteSelect(site);
    } else {
      console.warn('⚠️ onSiteSelect is not a function:', typeof onSiteSelect);
    }
  };

  // ✅ Add loading state if sites are empty
  if (!sites || sites.length === 0) {
    return (
      <div className="site-selector">
        <label htmlFor="site-select">🏗️ Energy Sites:</label>
        <select id="site-select" disabled>
          <option>Loading sites...</option>
        </select>
      </div>
    );
  }

  return (
    <div className="site-selector">
      <label htmlFor="site-select">🏗️ Select Energy Site:</label>
      <select 
        id="site-select"
        value={selectedSite?.id || ''}
        onChange={handleSiteChange}
      >
        <option value="">Select a site...</option>
        {sites.map(site => (
          <option key={site.id} value={site.id}>
            {site.name} ({site.type}) - {site.capacity}MW
          </option>
        ))}
      </select>
    </div>
  );
};

export default SiteSelector;
