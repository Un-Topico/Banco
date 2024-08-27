import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from './components/Header';
import { rutas } from './routers/appRoutes';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {rutas.map((ruta, i) => (
          <Route path={ruta.path} element={ruta.element} key={i} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
