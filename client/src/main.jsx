// --- LocalStorage Migration Logic ---
const runMigration = () => {
  const CANONICAL_HOST = 'syncro.tg-antinomy.kro.kr';
  const OLD_HOSTS = ['tg-antinomy.kro.kr', 'tg-antinomy.p-e.kr', 'syncro.tg-antinomy.p-e.kr'];
  const STORAGE_KEY = 'flow-storage'; // Zustand store key
  const MIGRATE_PARAM = 'migrate_data';

  const currentHost = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const migrationData = urlParams.get(MIGRATE_PARAM);

  // 1. Data Receiving Logic (on Canonical Host)
  if (currentHost === CANONICAL_HOST && migrationData) {
    try {
      const decodedData = decodeURIComponent(atob(migrationData));
      localStorage.setItem(STORAGE_KEY, decodedData);
      
      // Clean up URL
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete(MIGRATE_PARAM);
      history.replaceState(null, '', newUrl.toString());
    } catch (e) {
      console.error('Failed to migrate data:', e);
    }
  }

  // 2. Data Sending Logic (on Old Hosts)
  if (OLD_HOSTS.includes(currentHost)) {
    const localData = localStorage.getItem(STORAGE_KEY);
    const redirectUrl = new URL(`https://${CANONICAL_HOST}${window.location.pathname}${window.location.search}`);
    
    if (localData) {
      const encodedData = btoa(encodeURIComponent(localData));
      redirectUrl.searchParams.set(MIGRATE_PARAM, encodedData);
    }
    
    window.location.replace(redirectUrl.toString());
  }
};

// Run the migration logic before rendering the app
if (process.env.NODE_ENV === "production") {
    runMigration();
}
// --- End of Migration Logic ---

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/Landing/antimony_intro_page.jsx';
import MainApp from './pages/MainApp/MainApp.jsx';
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <MainApp />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
