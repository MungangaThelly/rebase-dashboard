import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import { DebugPanel } from './components/DebugPanel';
import { ApiTest } from './components/ApiTest';
import "./App.css";

function App() {
  return (
    <div className="App">
      <DebugPanel />
      <Dashboard />
      <ApiTest />
    </div>
  );
}

export default App;