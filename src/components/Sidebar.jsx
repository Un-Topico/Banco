import React from 'react';
import {  FaCreditCard, FaTools, FaHistory, FaQrcode, FaDollarSign, FaFileInvoiceDollar, FaRegMoneyBillAlt } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({ selectedOption, onSelect }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Untopico</h2>
                <p>La mejor banca en linea</p>
            </div>
            <div className="menu-section">
                <h3>DETALLES</h3>
                <ul>
                    <li className={selectedOption === 'tarjetas' ? 'active' : ''} onClick={() => onSelect('tarjetas')}>
                        <FaCreditCard /> Tarjetas
                    </li>
                </ul>
            </div>
            <div className="menu-section">
                <h3>OPERACIONES</h3>
                <ul>
                    <li className={selectedOption === 'depositar' ? 'active' : ''} onClick={() => onSelect('depositar')}>
                        <FaDollarSign /> Depositar 
                    </li>
                    <li className={selectedOption === 'transferir' ? 'active' : ''} onClick={() => onSelect('transferir')}>
                        <FaRegMoneyBillAlt /> Transferir
                    </li>
                    <li className={selectedOption === 'retirar' ? 'active' : ''} onClick={() => onSelect('retirar')}>
                        <FaFileInvoiceDollar /> Retirar
                    </li>
                    <li className={selectedOption === 'depositarQR' ? 'active' : ''} onClick={() => onSelect('depositarQR')}>
                        <FaQrcode /> Depositar QR
                    </li>
                    <li className={selectedOption === 'pagos' ? 'active' : ''} onClick={() => onSelect('pagos')}>
                        <FaTools /> Pagos de servicios
                    </li>
                    <li className={selectedOption === 'escanearQR' ? 'active' : ''} onClick={() => onSelect('escanearQR')}>
                        <FaQrcode /> Escanear Codigo QR
                    </li>
                    <li className={selectedOption === 'historial' ? 'active' : ''} onClick={() => onSelect('historial')}>
                        <FaHistory /> Historial de transacciones
                    </li>
                    <li className={selectedOption === 'historialPagos' ? 'active' : ''} onClick={() => onSelect('historialPagos')}>
                        <FaHistory /> Historial de pagos
                    </li>
                </ul>
            </div>
           
        </div>
    );
};

export default Sidebar;
