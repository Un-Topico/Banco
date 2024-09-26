import React from "react";
import { FaCreditCard } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export const TarjetaCredito = () => {
  return (
    <div className="container my-5">
      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1>Tarjeta de Crédito</h1>
        <p className="lead">
          Disfruta de nuestros programas de recompensas y tasas de interés competitivas.
        </p>
      </div>

      {/* Sección de Beneficios */}
      <div className="row text-center">
        <div className="col-md-4 mb-4">
          <h5>Recompensas</h5>
          <p>Acumula puntos con cada compra y canjéalos por productos o viajes.</p>
        </div>
        <div className="col-md-4 mb-4">
          <h5>Bajas tasas de interés</h5>
          <p>Aprovecha nuestras tasas de interés bajas para compras y pagos.</p>
        </div>
        <div className="col-md-4 mb-4">
          <h5>Seguridad</h5>
          <p>Protege tus compras con tecnología de seguridad avanzada.</p>
        </div>
      </div>

      {/* Tarjeta de crédito destacada */}
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            {/* Icono */}
            <div className="d-flex justify-content-center my-4">
              <FaCreditCard size="4rem" />
            </div>

            {/* Contenido de la tarjeta */}
            <div className="card-body">
              <h5 className="card-title">Tarjeta de Crédito Platino</h5>
              <p className="card-text">
                La mejor opción para obtener grandes beneficios con cada compra.
              </p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Tasa de interés: 12% anual</li>
                <li className="list-group-item">Sin costo de anualidad el primer año</li>
                <li className="list-group-item">Protección contra fraudes</li>
              </ul>
              <a href="#more-info" className="btn btn-primary mt-4">
                Más Información
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
