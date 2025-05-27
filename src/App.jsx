import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import AppRouter from './router/AppRouter';
import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;