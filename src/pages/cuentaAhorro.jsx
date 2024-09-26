import React from "react";
import { FaPiggyBank, FaChartLine, FaShieldAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export const CuentaAhorro = () => {
  return (
    <div className="container my-5">
      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1>Cuentas de Ahorro</h1>
        <p className="lead">
          La forma más segura y fácil de hacer crecer tus ahorros.
        </p>
      </div>

      {/* Sección de Beneficios */}
      <div className="row text-center">
        <div className="col-md-4 mb-4">
          <FaPiggyBank size="3rem" className="mb-3" />
          <h5>Ahorro Seguro</h5>
          <p>
            Tus ahorros están protegidos y garantizados, con acceso a ellos en
            cualquier momento.
          </p>
        </div>
        <div className="col-md-4 mb-4">
          <FaChartLine size="3rem" className="mb-3" />
          <h5>Intereses Competitivos</h5>
          <p>
            Gana más con tasas de interés atractivas que se adaptan a tus metas
            de ahorro.
          </p>
        </div>
        <div className="col-md-4 mb-4">
          <FaShieldAlt size="3rem" className="mb-3" />
          <h5>Protección y Seguridad</h5>
          <p>
            Tu dinero está asegurado con la mayor seguridad bancaria del mercado.
          </p>
        </div>
      </div>

      {/* Detalle de la cuenta de ahorro */}
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            {/* Icono */}
            <div className="d-flex justify-content-center my-4">
              <FaPiggyBank size="4rem" />
            </div>

            {/* Contenido de la tarjeta */}
            <div className="card-body">
              <h5 className="card-title">Cuenta de Ahorro Premium</h5>
              <p className="card-text">
                La mejor opción para hacer crecer tus ahorros con los beneficios
                más exclusivos.
              </p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  Tasas de interés superiores al promedio del mercado.
                </li>
                <li className="list-group-item">
                  Sin costo de apertura ni cuotas de mantenimiento.
                </li>
                <li className="list-group-item">
                  Acceso a tu dinero en cualquier momento sin penalizaciones.
                </li>
              </ul>
              <a href="#more-info" className="btn btn-primary mt-4">
                Más Información
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendación de ahorro */}
      <div className="text-center mt-5">
        <h3>Consejo de Ahorro</h3>
        <p className="lead">
          "El mejor momento para empezar a ahorrar es ahora. Establece un objetivo mensual y haz que tu dinero trabaje para ti."
        </p>
      </div>
    </div>
  );
};
