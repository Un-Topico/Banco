import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import {Tarjetas} from "../components/Tarjetas"; 
import {Operaciones} from "../components/Operaciones"; 
import {Pagos} from "../components/Pagos"; 
import {Historial} from "../components/Historial"; 
import { EscanearQR } from '../components/EscanearQR';
import { Depositar } from '../components/Depositar';
import { Transferir } from '../components/Transferir';
import { Retirar } from '../components/Retirar';
import { DepositarQR } from '../components/DepositarQR';
export const InicioUsuario = () => {
    const [selectedOption, setSelectedOption] = useState('tarjetas'); // Opción inicial

    const renderComponent = () => {
        switch (selectedOption) {
            case 'tarjetas':
                return <Tarjetas />;
            case 'operaciones':
                return <Operaciones />;
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
            default:
                return <Tarjetas />;
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar selectedOption={selectedOption} onSelect={setSelectedOption} />
            <div className="main-content" style={{ marginLeft: '250px', padding: '20px' }}>
                {renderComponent()}
            </div>
        </div>
    );
};
