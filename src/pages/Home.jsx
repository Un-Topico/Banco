import React from 'react';
import { FaCreditCard, FaRegCreditCard, FaMoneyBill} from 'react-icons/fa';
import {GiReceiveMoney} from 'react-icons/gi';  

import '../styles/home.css';

export const Home = () => {
    return (
      <div className="container-fluid home-container">
        
        {/* Sección de galería de imágenes */}
        <div className="row justify-content-center align-items-center mt-5">
          <div className="col-md-8">
            <div id="imageCarousel" className="carousel carousel-dark slide" data-bs-ride="carousel" data-bs-interval="3000">
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
                    src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fliberacion.jpg?alt=media&token=62cb6736-0427-4808-a945-04019972cb71" 
                    className="d-block w-100 img-fluid" 
                    alt="Imagen 3" />
                    <div class="carousel-caption d-none d-md-block">
                        <h5 className='text-black'>Liberate de la tensión</h5>
                        <p className='text-black'>Con nuestros asesores nunca tendras que volver a preocuparte por el manejo de tus cuentas.</p>
                    </div>
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#imageCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#imageCarousel" data-bs-slide="next" >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
  
        {/* Sección de texto de bienvenida */}
        <div className="row justify-content-center align-items-center mt-5">
          <div className="col-md-8 text-center">
            <h1 className="display-4 text-dark mb-4">El banco que está de tu lado</h1>
            <p className="lead text-dark">Bienvenido a nuestra plataforma. Explora nuestros servicios y productos.</p>
          </div>
        </div>

        {/* Sección nav de opciones extra */}
        <section className="section-nuestros-productos-container mt-5">
          <div className="container">
            <h3 className="text-center mb-4">Nuestros productos</h3>
            <div className="row justify-content-center">
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center">
                  <FaCreditCard size="3em" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Tarjeta de Crédito</h5>
                    <p className="card-text">Descubre nuestros beneficios.</p>
                    <a href="#tarjeta-credito" className="btn btn-info">Ver más</a>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center">
                  <FaRegCreditCard size="3em" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Producto 2</h5>
                    <p className="card-text">Detalles del producto 2.</p>
                    <a href="#producto2" className="btn btn-info">Ver más</a>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center">
                  <GiReceiveMoney size="3em" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Producto 3</h5>
                    <p className="card-text">Detalles del producto 3.</p>
                    <a href="#producto2" className="btn btn-info">Ver más</a>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center">
                  <FaMoneyBill size="3rem" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Producto 4</h5>
                    <p className="card-text">Detalles del producto 4.</p>
                    <a href="#producto2" className="btn btn-info">Ver más</a>
                  </div>
                </div>
              </div>
              
              {/* Puedes añadir más tarjetas como estas */}
            </div>
          </div>
        </section>
  
      </div>
    );
  };
