import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import Notifications from './components/Notifications';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
      <Notifications />
    </AppProvider>
  </React.StrictMode>,
);
