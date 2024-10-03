import React from 'react';
import { Profile } from "../pages/Profile";
import { CreateAccount } from '../pages/CreateAccount';
import AdminUsers from "../components/AdminUsers";
import { TransactionDetail } from "../components/TransactionDetail";
import { SoporteChatScreen } from "../pages/SoporteChatScreen";
import { PaymentDetails } from '../pages/PaymentDetails';
export const privateRoutes = [
    { path: "/perfil", element: <Profile />, protected:true },
    { path: "/transaccion/:id", element: <TransactionDetail />, protected:true },
    { path: "/configurar-cuenta", element: <CreateAccount />, protected:true },
    { path: "/admin/users", element: <AdminUsers />, protected:true },
    { path: "/soporte", element: <SoporteChatScreen />, protected:true },
    { path: "/pagos", element: <PaymentDetails />, protected:true },



];
