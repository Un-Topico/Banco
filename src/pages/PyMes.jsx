import React from "react";
import { FaBriefcase, FaChartLine, FaHandshake } from 'react-icons/fa';  // Importamos los íconos desde react-icons

export const PyMes = () => {
  return (
    <div className="container-fluid pymes-container">
      {/* Hero Section */}
      <div className="row hero-section text-center text-white align-items-center">
        <div className="col-md-12">
          <h1 className="display-4">Soluciones para PyMEs</h1>
          <p className="lead">Empresas pequeñas, grandes soluciones.</p>
        </div>
      </div>

      {/* Características y Beneficios */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Nuestros Servicios</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <FaBriefcase size="3x" className="mb-3" /> {/* Reemplazamos FontAwesomeIcon por FaBriefcase */}
            <h5>Créditos PyMEs</h5>
            <p>Financiamiento rápido y seguro para tu negocio.</p>
          </div>
          <div className="col-md-4 mb-4">
            <FaChartLine size="3x" className="mb-3" /> {/* Reemplazamos FontAwesomeIcon por FaChartLine */}
            <h5>Soluciones Financieras</h5>
            <p>Productos adaptados para impulsar el crecimiento de tu empresa.</p>
          </div>
          <div className="col-md-4 mb-4">
            <FaHandshake size="3x" className="mb-3" /> {/* Reemplazamos FontAwesomeIcon por FaHandshake */}
            <h5>Asesoría Personalizada</h5>
            <p>Te ayudamos a tomar las mejores decisiones para tu empresa.</p>
          </div>
        </div>
      </div>

      {/* Testimonios */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Testimonios de Clientes</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <blockquote className="blockquote">
              <p className="mb-0">“Gracias a los créditos PyME, nuestro negocio creció un 30% en menos de un año.”</p>
              <footer className="blockquote-footer">Carlos Martínez, <cite title="Source Title">CEO de Tienda Local</cite></footer>
            </blockquote>
          </div>
          <div className="col-md-4 mb-4">
            <blockquote className="blockquote">
              <p className="mb-0">“La asesoría financiera me ayudó a mejorar la gestión de mi empresa.”</p>
              <footer className="blockquote-footer">María Gómez, <cite title="Source Title">Propietaria de Café Express</cite></footer>
            </blockquote>
          </div>
          <div className="col-md-4 mb-4">
            <blockquote className="blockquote">
              <p className="mb-0">“Los servicios financieros son una gran herramienta para nuestro crecimiento.”</p>
              <footer className="blockquote-footer">Luis Pérez, <cite title="Source Title">Dueño de Taller Mecánico</cite></footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Llamada a la acción */}
      <div className="container text-center my-5">
        <a href="#contact" className="btn btn-primary btn-lg">Solicita más información</a>
      </div>
    </div>
  );
};
