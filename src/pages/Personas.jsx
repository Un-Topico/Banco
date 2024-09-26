import React from 'react';
import { FaPiggyBank, FaCreditCard, FaHome } from 'react-icons/fa';  // Importamos los íconos desde react-icons

export const Personas = () => {
  return (
    <div className="container-fluid personas-container">
      {/* Hero section */}
      <div className="row hero-section text-center text-white align-items-center">
        <div className="col-md-12">
          <h1 className="display-4">Soluciones Financieras para Personas</h1>
          <p className="lead">Encuentra el producto bancario que mejor se adapta a tus necesidades.</p>
        </div>
      </div>

      {/* Productos Financieros */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Nuestros Productos</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <FaPiggyBank size="3rem" className="mb-3" />
            <h5>Cuentas de Ahorro</h5>
            <p>Abre tu cuenta de ahorro y disfruta de excelentes tasas de interés.</p>
          </div>
          <div className="col-md-4 mb-4">
            <FaCreditCard size="3rem" className="mb-3" /> 
            <h5>Tarjetas de Crédito</h5>
            <p>Disfruta de nuestros programas de recompensas y bajos intereses.</p>
          </div>
          <div className="col-md-4 mb-4">
            <FaHome size="3rem" className="mb-3" /> 
            <h5>Créditos Hipotecarios</h5>
            <p>Obtén tu hogar soñado con nuestras opciones de crédito hipotecario.</p>
          </div>
        </div>
      </div>

      {/* Beneficios de ser Cliente */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Beneficios de ser Cliente</h2>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">Acceso a tasas preferenciales en todos nuestros productos.</li>
          <li className="list-group-item">Asesoría financiera personalizada.</li>
          <li className="list-group-item">Plataforma digital fácil de usar para la gestión de tus cuentas.</li>
          <li className="list-group-item">Promociones y descuentos exclusivos.</li>
        </ul>
      </div>

      {/* Llamada a la acción */}
      <div className="container text-center my-5">
        <a href="#contact" className="btn btn-primary btn-lg">Abre tu cuenta hoy</a>
      </div>
    </div>
  );
};
