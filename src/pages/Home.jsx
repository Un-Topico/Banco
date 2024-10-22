import React from 'react';
import { FaCreditCard, FaRegCreditCard, FaMoneyBill } from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';  
import { Link } from "react-router-dom";
import DialogFlowChat from "../components/chatComponents/DialogFlowChat";
import '../styles/home.css';
import Background from '../components/Background';
import { Footer } from '../components/Footer';

export const Home = () => {
    return (
      <Background imageUrl='https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fbackground.png?alt=media&token=be8da9c7-644d-4e5d-ad39-92fc70d13fa4'>
      
      <div className="container-fluid home-container">
        {/* Sección de bienvenida con texto e imagen */}
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="display-4"><strong>UnTópico</strong></h1>
            <p className="lead">Un banco a tu medida.</p>
            <p>
              Libera tu dinero. Gestiona tus finanzas de forma rápida, segura y sin límites, desde cualquier lugar.
              Todo el control en tus manos, sin complicaciones.
            </p>
            <button className="btn btn-success btn-lg">Únete a tu libertad</button>
          </div>
          <div className="col-md-6">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fliberacion.jpg?alt=media&token=62cb6736-0427-4808-a945-04019972cb71"
              alt="Persona disfrutando de la libertad financiera"
              className="img-fluid rounded float-end my-3"
            />
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
              {/* Tarjeta de crédito */}
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center">
                  <FaCreditCard size="3em" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Tarjeta de Crédito</h5>
                    <p className="card-text">Descubre nuestros beneficios.</p>
                    <Link className="btn btn-info" to="/TarjetaCredito">Ver más</Link>
                  </div>
                </div>
              </div>
              {/* Tarjeta de débito */}
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center">
                  <FaRegCreditCard size="3em" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Tarjeta de débito</h5>
                    <p className="card-text">Descubre nuestros beneficios.</p>
                    <Link className="btn btn-info" to="/TarjetaDebito">Ver más</Link>
                  </div>
                </div>
              </div>
              {/* Cuenta de ahorro */}
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center">
                  <GiReceiveMoney size="3em" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Cuenta de ahorro</h5>
                    <p className="card-text">Descubre nuestros beneficios.</p>
                    <Link className="btn btn-info" to="/cuentaAhorro">Ver más</Link>
                  </div>
                </div>
              </div>
              {/* Cambio de divisa */}
              <div className="col-md-3 col-sm-6 mb-4">
                <div className="card text-center" style={{ width: '18rem' }}>
                  <FaMoneyBill size="3rem" className="my-3" /> 
                  <div className="card-body">
                    <h5 className="card-title">Cambio de divisa</h5>
                    <p className="card-text">Recibe la mejor tasa.</p>
                    <Link className="btn btn-info" to="/cambioDivisa">Ver más</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de galería de imágenes */}
        <div>
          <div>
            <div id="imageCarousel" className="carousel slide mb-6" data-bs-ride="carousel" data-bs-interval="3000">
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
                    <div className="carousel-caption text-start">
                        <h1>Cuenta de ahorro para los mejores</h1>
                        <p className="opacity-75">La cuenta con mayor beneficio en el mundo.</p>
                    </div>
                </div>
                <div className="carousel-item" data-bs-interval="10000">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fimagen%202.png?alt=media&token=c683e186-dca2-4c72-87e6-e484c1b8d485" 
                    className="d-block w-100 img-fluid" 
                    alt="Imagen 2" />
                    <div className="carousel-caption">
                        <h1>Cuenta Gold para clientes Gold</h1>
                        <p className="opacity-75">Con nuestra tarjeta de crédito gold, disfruta de grandes compras.</p>
                    </div>
                </div>
                <div className="carousel-item" data-bs-interval="10000">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fimagen%203.png?alt=media&token=302cd44c-b3d4-40f2-85cb-1a40861ed6f5" 
                    className="d-block w-100 img-fluid" 
                    alt="Imagen 3" />
                    <div className="carousel-caption text-end">
                        <h1>Viaja y gana con nuestras tarjetas</h1>
                        <p className="opacity-75">Con nuestras tarjetas, acumula puntos y obtén recompensas.</p>
                    </div>
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#imageCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#imageCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Siguiente</span>
              </button>
            </div>
          </div>
        </div>

         {/* Sección promocional móvil */}
         <section className="section-promocion-movil-container mt-5">
          <div className="container text-center">
            <div className="row align-items-center">
              {/* Texto de promoción */}
              <div className="col-md-6 mb-4">
                <h2 className="display-5">Descarga nuestra aplicación móvil</h2>
                <p className="lead">
                  Lleva tu banco en la palma de tu mano. Realiza transacciones, consulta
                  saldos y mucho más con nuestra app para dispositivos móviles.
                </p>
                <div className="d-flex justify-content-center">
                  <a href="#playStore" className="btn btn-primary btn-lg me-3">Google Play</a>
                  <a href="#appStore" className="btn btn-secondary btn-lg">App Store</a>
                </div>
              </div>
              {/* Imagen promocional */}
              <div className="col-md-6">
                <img
                  src='https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Fmobile.png?alt=media&token=e01ecbd7-4dde-4c91-9d8f-91d6794bf037'
                  alt="Promoción móvil"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </section>

        <DialogFlowChat />
        <Footer />
      </div>
      
      </Background>
      
    );
}
