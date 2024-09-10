import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faSearch } from '@fortawesome/free-solid-svg-icons';
//import '../styles/encuentraSucursal.css';

export const EncuentraSucursal = () => {
  return (
    <div className="container-fluid encuentra-sucursal-container">
      {/* Título */}
      <div className="row justify-content-center text-center my-5">
        <div className="col-md-8">
          <h1 className="display-4">Encuentra tu Sucursal</h1>
          <p className="lead">Encuentra la sucursal más cercana a ti</p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-6">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por ciudad o código postal" 
              aria-label="Buscar" 
            />
            <button className="btn btn-primary" type="button">
              <FontAwesomeIcon icon={faSearch} /> Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-10">
          <div className="map-container">
            {/* Aquí iría el mapa interactivo (puedes usar Google Maps API) */}
            <img src="https://via.placeholder.com/800x400" alt="Mapa" className="img-fluid" />
          </div>
        </div>
      </div>

      {/* Lista de sucursales */}
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h3 className="text-center mb-4">Sucursales Cercanas</h3>
          <div className="row">
            {/* Tarjeta de Sucursal 1 */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title"><FontAwesomeIcon icon={faMapMarkerAlt} /> Sucursal Centro</h5>
                  <p className="card-text">Calle Principal #123, Centro, Ciudad</p>
                  <p><FontAwesomeIcon icon={faClock} /> Horario: Lunes a Viernes, 9:00 AM - 5:00 PM</p>
                  <a href="#sucursal-detalles" className="btn btn-outline-primary">Ver detalles</a>
                </div>
              </div>
            </div>

            {/* Tarjeta de Sucursal 2 */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title"><FontAwesomeIcon icon={faMapMarkerAlt} /> Sucursal Norte</h5>
                  <p className="card-text">Avenida Norte #456, Zona Norte, Ciudad</p>
                  <p><FontAwesomeIcon icon={faClock} /> Horario: Lunes a Sábado, 10:00 AM - 6:00 PM</p>
                  <a href="#sucursal-detalles" className="btn btn-outline-primary">Ver detalles</a>
                </div>
              </div>
            </div>

            {/* Tarjeta de Sucursal 3 */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title"><FontAwesomeIcon icon={faMapMarkerAlt} /> Sucursal Sur</h5>
                  <p className="card-text">Calle Sur #789, Zona Sur, Ciudad</p>
                  <p><FontAwesomeIcon icon={faClock} /> Horario: Lunes a Viernes, 8:00 AM - 4:00 PM</p>
                  <a href="#sucursal-detalles" className="btn btn-outline-primary">Ver detalles</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
