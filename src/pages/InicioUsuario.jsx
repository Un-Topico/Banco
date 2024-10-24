import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import {Tarjetas} from "../components/Tarjetas"; 
import {Pagos} from "../components/Pagos"; 
import {Historial} from "../components/Historial"; 
import { EscanearQR } from '../components/EscanearQR';
import { Depositar } from '../components/Depositar';
import { Transferir } from '../components/Transferir';
import { Retirar } from '../components/Retirar';
import { DepositarQR } from '../components/DepositarQR';
import { PaymentDetails } from './PaymentDetails';
import DialogFlowChat from '../components/chatComponents/DialogFlowChat';
export const InicioUsuario = () => {
    const [selectedOption, setSelectedOption] = useState('tarjetas'); // Opción inicial

    const renderComponent = () => {
        switch (selectedOption) {
            case 'tarjetas':
                return <Tarjetas />;
            case 'pagos':
                return <Pagos />;
            case 'historial':
                return <Historial />;
                case 'escanearQR':
                return <EscanearQR />;
                case 'depositar':
                return <Depositar />;
                case 'depositarQR':
                return <DepositarQR />;
                case 'retirar':
                return <Retirar />;
                case 'transferir':
                return <Transferir />;
                case 'historialPagos':
                    return <PaymentDetails />;
            default:
                return <Tarjetas />;
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar selectedOption={selectedOption} onSelect={setSelectedOption} />
            <div className="w-100" style={{ marginLeft: '250px', padding: '20px' }}>
                {renderComponent()}
            </div>
            <DialogFlowChat/>
        </div>
    );
};
