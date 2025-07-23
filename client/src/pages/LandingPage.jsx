import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h1>Welcome to Antinomy</h1>
      <p>This is the landing page.</p>
      <Link to="/app">Go to App</Link>
    </div>
  );
}

export default LandingPage;