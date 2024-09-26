import React from 'react';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Register } from '../pages/Register';
import { ResetPassword } from '../pages/ResetPassword';
import { About }  from '../pages/About';
import { PyMes } from '../pages/PyMes';
import { EncuentraSucursal } from '../pages/sucursales';
import { Personas } from '../pages/Personas';
export const rutas = [
    { path: "/", element: <Home  />,  protected:false },
    { path: "/login", element: <Login />,  protected:false  },
    { path: "/crear-cuenta", element: <Register />,  protected:false  },
    { path: "/restablecer-contraseña", element: <ResetPassword />,  protected:false  },
    { path: "/about", element: <About />,  protected:false  },
    { path: "/PyMes", element: <PyMes/>, protected:false},
    { path: "/Sucursales", element: <EncuentraSucursal/>, protected:false},
    { path: "/Personas", element: <Personas/>, protected:false},
];
