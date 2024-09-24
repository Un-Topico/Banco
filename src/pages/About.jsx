import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faEye, faHandshake } from '@fortawesome/free-solid-svg-icons';

//import '../styles/about.css';

export const About = () => {
  return (
    <div className="container-fluid about-container">
      {/* Hero section */}
      <div className="row hero-section text-center text-white align-items-center">
        <div className="col-md-12">
          <h1 className="display-4">Sobre Nosotros</h1>
          <p className="lead">Conoce nuestra misión, visión y al equipo que nos impulsa a avanzar.</p>
        </div>
      </div>

      {/* Misión, Visión, Valores */}
      <div className="container my-5">
        <div className="row text-center">
          <div className="col-md-4">
            <FontAwesomeIcon icon={faBullseye} size="3x" className="my-3" />
            <h3>Misión</h3>
            <p>Proporcionar soluciones financieras accesibles y efectivas para todos.</p>
          </div>
          <div className="col-md-4">
            <FontAwesomeIcon icon={faEye} size="3x" className="my-3" />
            <h3>Visión</h3>
            <p>Ser líderes en innovación bancaria a nivel global.</p>
          </div>
          <div className="col-md-4">
            <FontAwesomeIcon icon={faHandshake} size="3x" className="my-3" />
            <h3>Valores</h3>
            <p>Compromiso, integridad y confianza son nuestros pilares.</p>
          </div>
        </div>
      </div>

      {/* Historia de la empresa */}
      <div className="container mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <h2>Nuestra Historia</h2>
            <p>
              Fundados en el año 2024, hemos crecido para convertirnos en uno de los principales bancos que ofrecen soluciones financieras
              a nivel global. Nuestro enfoque en la innovación y el servicio al cliente ha sido clave para nuestro éxito.
            </p>
          </div>
        </div>
      </div>

      {/* Nuestro equipo */}
      <div className="container mb-5">
        <h2 className="text-center">Nuestro Equipo</h2>
        <div className="row text-center">
          <div className="col-md-4">
            <div className="team-member">
              <img src="https://via.placeholder.com/150" className="rounded-circle" alt="CEO" />
              <h5>John Doe</h5>
              <p>CEO</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="team-member">
              <img src="https://via.placeholder.com/150" className="rounded-circle" alt="CFO" />
              <h5>Jane Smith</h5>
              <p>CFO</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="team-member">
              <img src="https://via.placeholder.com/150" className="rounded-circle" alt="CTO" />
              <h5>Mark Johnson</h5>
              <p>CTO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
