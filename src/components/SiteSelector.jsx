import React, { useEffect, useState } from 'react';
import { fetchSites } from '../api/rebaseApi';

// Fallback test sites for development
const testSites = [
  { site_id: 'test-1', name: 'Test Solar Site 1', type: 'solar' },
  { site_id: 'test-2', name: 'Test Wind Farm 1', type: 'wind' },
  { site_id: 'test-3', name: 'Test Hydro Plant 1', type: 'hydro' },
  { site_id: 'test-4', name: 'Test Battery Storage 1', type: 'battery' },
];

export default function SiteSelector({ onSelect }) {
  const [sites, setSites] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    fetchSites()
      .then((apiSites) => {
        if (!apiSites || apiSites.length === 0) {
          console.log('No real sites found, using test data');
          setSites(testSites);
          setError('Inga sites tillgängliga');
        } else {
          setSites(apiSites);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching sites:', err);
        setSites(testSites);
        setError('Använder testdata (API ej tillgänglig)');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <h3>Välj en site för att se prognos.</h3>
      
      {isLoading ? (
        <p>Laddar sites...</p>
      ) : (
        <>
          {error && (
            <p style={{ color: 'orange', fontSize: '0.9em' }}>{error}</p>
          )}
          <select onChange={(e) => {
            const selectedSiteId = e.target.value;
            const selectedSiteData = sites.find(s => s.site_id === selectedSiteId);
            onSelect(selectedSiteId, selectedSiteData);
          }} defaultValue="">
            <option value="">-- Välj --</option>
            {sites.map((s) => (
              <option key={s.site_id} value={s.site_id}>
                {s.name} ({s.type}) - {s.capacity[0].value}W
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
