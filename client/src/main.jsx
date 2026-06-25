import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Chatbot from './pages/Chatbot';
import './styles/index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster 
              position="top-right"
              toastOptions={{
                style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(99,102,241,0.3)' },
                iconTheme: { primary: '#6366f1', secondary: '#fff' }
              }}
            />
            <Chatbot />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);