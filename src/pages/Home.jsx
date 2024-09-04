import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faCreditCard } from '@fortawesome/free-solid-svg-icons';

import '../styles/home.css';

export const Home = () => {
    return (
      <div className="container-fluid home-container">
        
        {/* Sección de galería de imágenes */}
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <div id="imageCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
              <div className="carousel-indicators">
                <button type="button" data-bs-target="#imageCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#imageCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#imageCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
              </div>
              <div className="carousel-inner">
                <div className="carousel-item active" data-bs-interval="10000">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fimagen%201.png?alt=media&token=878d33e7-cab3-4c24-bed8-bc98daf90a45" 
                    className="d-block w-100 img-fluid" 
                    alt="Imagen 1" />
                    <div class="carousel-caption d-none d-md-block">
                        <h5>Cuenta de ahorro para los mejores</h5>
                        <p>La cuenta con mayor beneficio en el mundo.</p>
                    </div>
                </div>
                <div className="carousel-item active" data-bs-interval="10000">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fimagen%202.png?alt=media&token=c683e186-dca2-4c72-87e6-e484c1b8d485" 
                    className="d-block w-100 img-fluid" 
                    alt="Imagen 2" />
                    <div class="carousel-caption d-none d-md-block">
                        <h5>Cuenta Gold para clientes Gold</h5>
                        <p>Con nuestra tarjeta de credito gold, disfruta de grandes compras.</p>
                    </div>
                </div>
                <div className="carousel-item active" data-bs-interval="10000">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fimagen%203.png?alt=media&token=85465cda-42a9-4c19-a41c-9b22ec210a24" 
                    className="d-block w-100 img-fluid" 
                    alt="Imagen 3" />
                    <div class="carousel-caption d-none d-md-block">
                        <h5>Liberate de la tensión</h5>
                        <p>Con nuestros asesores nunca tendras que volver a preocuparte por el manejo de tus cuentas.</p>
                    </div>
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#imageCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#imageCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
  
        {/* Sección de texto de bienvenida */}
        <div className="row justify-content-center align-items-center vh-100">
          <div className="col-md-8 text-center">
            <h1 className="display-4 text-dark mb-4">El banco que está de tu lado</h1>
            <p className="lead text-dark">Bienvenido a nuestra plataforma. Explora nuestros servicios y productos.</p>
            <a href="#explore" className="btn btn-primary btn-lg mt-4">Explorar</a>
          </div>
        </div>

        {/* Sección nav de opciones extra */}
        <section class="section-nuestros-productos-container">
            <div className="container-nuestros productos">
                <h3>Nuestros productos</h3>
                <div className="items">
                    <a href="" className="item">
                        <FontAwesomeIcon icon={['fa-regular fa-credit-card']} />
                        <p className="p-btn-nues-prod"></p>
                    </a>
                    <a href="" className="item">
                        <img src="" alt="" />
                        <p className="p-btn-nues-prod"></p>
                    </a>
                    <a href="" className="item">
                        <img src="" alt="" />
                        <p className="p-btn-nues-prod"></p>
                    </a>
                    <a href="" className="item">
                        <img src="" alt="" />
                        <p className="p-btn-nues-prod"></p>
                    </a>
                    <a href="" className="item">
                        <img src="" alt="" />
                        <p className="p-btn-nues-prod"></p>
                    </a>
                </div>
            </div>
        </section>
  
      </div>
    );
  };