import React from 'react';
import SiteSelector from './SiteSelector'; // ✅ Import SiteSelector
import './Sidebar.css';

const Sidebar = ({ onSelect }) => (
  <aside className="sidebar">
    <h2>Inställningar</h2>
    <SiteSelector onSelect={onSelect} /> {/* ✅ Add here */}
  </aside>
);

export default Sidebar;
