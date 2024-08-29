import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from './components/Header';
import { rutas } from './routers/appRoutes';
import { privateRoutes } from './routers/privateRoutes';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './auth/authContex';
import { Error } from './pages/Error';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {rutas.map((ruta, i) => (
            <Route path={ruta.path} element={ruta.element} key={i} />
          ))}

          {privateRoutes.map((ruta, i) => (
            <Route
              path={ruta.path}
              element={<ProtectedRoute>{ruta.element}</ProtectedRoute>}
              key={i}
            />
          ))}
          <Route
              path='*'
              element={ <Error  />}
            />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
