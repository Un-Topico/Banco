import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from './components/Header';
// import { Footer } from './components/Footer';
import { rutas } from './routers/appRoutes';
import { privateRoutes } from './routers/privateRoutes';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthProvider } from './auth/authContext';
import { Error } from './pages/Error';

function App() {
  return (
    <AuthProvider>
      <Router>
      <div>
    Texto de prueba en App.js
  </div>
  
      </Router>
    </AuthProvider>
  );
}

export default App;