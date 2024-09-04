import React from 'react';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
export const rutas = [
    { path: "/", element: <Home  />,  protected:false },
    { path: "/login", element: <Login />,  protected:false  },
];
