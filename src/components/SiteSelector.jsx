import React from 'react';
import './SiteSelector.css'; // 👈 Add this line

const SiteSelector = ({ sites, selectedSite, onSiteSelect }) => {
  // Keep only the render logic
  return (
    <div className="site-selector">
      <h3>📍 Energy Sites</h3>
      {sites && sites.length > 0 ? (
        <select 
          value={selectedSite?.id || ''} 
          onChange={(e) => {
            const site = sites.find(s => s.id === e.target.value);
            onSiteSelect(site);
          }}
        >
          {sites.map(site => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.location})
            </option>
          ))}
        </select>
      ) : (
        <div>Loading sites...</div>
      )}
    </div>
  );
};

export default SiteSelector;
