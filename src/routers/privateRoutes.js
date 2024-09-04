import React from 'react';
import { Profile } from "../pages/Profile";
import { CreateAccount } from '../pages/CreateAccount';

export const privateRoutes = [
    { path: "/perfil", element: <Profile />, protected:true },
    { path: "/crear-cuenta", element: <CreateAccount />, protected:true }

];
