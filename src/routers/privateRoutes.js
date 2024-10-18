import React from 'react';
import { Profile } from "../pages/Profile";
import { CreateAccount } from '../pages/CreateAccount';
import AdminUsers from "../components/userComponents/AdminUsers";
import { TransactionDetail } from "../components/transactionComponents/TransactionDetail";
import { SoporteChat } from "../components/chatComponents/SoporteChat";
import { PaymentDetails } from '../pages/PaymentDetails';
import ServicePaymentForm from '../pages/ServicePaymentForm';
import { InicioUsuario } from '../pages/InicioUsuario';
import { EditarPerfil } from '../pages/EditarPerfil';
export const privateRoutes = [
    { path: "/perfil", element: <Profile />, protected:true },
    { path: "/transaccion/:id", element: <TransactionDetail />, protected:true },
    { path: "/configurar-cuenta", element: <CreateAccount />, protected:true },
    { path: "/admin/users", element: <AdminUsers />, protected:true },
    { path: "/soporte", element: <SoporteChat />, protected:true },
    { path: "/pagos", element: <PaymentDetails />, protected:true },
    { path: "/pago-servicio", element: <ServicePaymentForm />, protected:true },
    { path: "/inicio-usuario", element: <InicioUsuario />, protected:true },
    { path: "/editar-perfil", element: <EditarPerfil />, protected:true },

];
