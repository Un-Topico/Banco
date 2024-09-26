import React from "react";
import { FaMoneyCheckAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export const TarjetaDebito = () => {
  return (
    <div className="container my-5">
      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1>Tarjeta de Débito</h1>
        <p className="lead">
          Controla tus finanzas con la tarjeta de débito perfecta para tus necesidades.
        </p>
      </div>

      {/* Sección de Beneficios */}
      <div className="row text-center">
        <div className="col-md-4 mb-4">
          <h5>Acceso a tu dinero 24/7</h5>
          <p>Realiza retiros y pagos en cualquier momento con nuestra amplia red de cajeros automáticos.</p>
        </div>
        <div className="col-md-4 mb-4">
          <h5>Sin comisiones</h5>
          <p>Disfruta de una tarjeta sin costos adicionales por mantenimiento ni comisiones ocultas.</p>
        </div>
        <div className="col-md-4 mb-4">
          <h5>Pagos Internacionales</h5>
          <p>Usa tu tarjeta de débito en cualquier parte del mundo sin complicaciones.</p>
        </div>
      </div>

      {/* Tarjeta de débito destacada */}
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            {/* Icono */}
            <div className="d-flex justify-content-center my-4">
              <FaMoneyCheckAlt size="4rem" />
            </div>

            {/* Contenido de la tarjeta */}
            <div className="card-body">
              <h5 className="card-title">Tarjeta de Débito Internacional</h5>
              <p className="card-text">
                La opción perfecta para gestionar tu dinero de manera fácil y segura.
              </p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Retiro sin comisiones en cajeros de la red</li>
                <li className="list-group-item">Sin costo por apertura ni anualidad</li>
                <li className="list-group-item">Cobertura para uso internacional</li>
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
