import React from "react";
import { FaBullseye, FaEye, FaHandshake } from "react-icons/fa";  // Importamos los íconos desde react-icons

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
          <div className="col-md-4 mb-4">
            <FaBullseye size="3rem" className="my-3" />
            <h3>Misión</h3>
            <p>Proporcionar soluciones financieras accesibles y efectivas para todos.</p>
          </div>
          <div className="col-md-4 mb-4">
            <FaEye size="3rem" className="my-3" />
            <h3>Visión</h3>
            <p>Ser líderes en innovación bancaria a nivel global.</p>
          </div>
          <div className="col-md-4 mb-4">
            <FaHandshake size="3rem" className="my-3" />
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
              Fundados en el año 2000, hemos crecido para convertirnos en uno de los principales bancos que ofrecen soluciones financieras
              a nivel global. Nuestro enfoque en la innovación y el servicio al cliente ha sido clave para nuestro éxito.
            </p>
          </div>
        </div>
      </div>

      {/* Nuestro equipo */}
      {/*
          No supe cómo ajustar correctamente el tamaño de la imagen y le puse Max-width Att:César
      */}
      <div className="container mb-5">
        <h2 className="text-center">Nuestro Equipo</h2>

        <div className="row text-center g-1">

          <div className="col-md-3 mb-4">
            <div className="team-member">
              <img src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fgabo.jpeg?alt=media&token=6581e226-31d2-46e8-ad3c-b9d711544073"
                className="rounded-circle w-65" 
                style={{ maxWidth: '250px', height: 'auto' }} 
                alt="CEO" />
              <h5>Gabriel Feregrino</h5>
              <p>CEO</p>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="team-member">
              <img src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2FAlexis.jpg?alt=media&token=3c226615-fde3-4b03-88b6-b570234b8747"
                className="rounded-circle w-65"
                style={{ maxWidth: '250px', height: 'auto' }} 
                alt="CFO" />
              <h5>Alexis Pathé</h5>
              <p>CFO</p>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="team-member">
              <img src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fcesar.jpg?alt=media&token=20372cee-f0eb-4cc4-8cf5-7f872c325a9a"
                className="rounded-circle w-65"
                style={{ maxWidth: '250px', height: 'auto' }} 
                alt="CTO" />
              <h5>Cesar Pescador</h5>
              <p>CTO</p>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="team-member">
              <img src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2FEinar.jpg?alt=media&token=d17c1da8-036e-41d8-8196-ef9df0736131"
                className="rounded-circle w-65"
                style={{ maxWidth: '250px', height: 'auto' }} 
                alt="Founder" />
              <h5>Einar Rodríguez</h5>
              <p>Founder</p>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
};
