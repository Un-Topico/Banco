import React from 'react';
import { FaMoneyCheckAlt, FaCreditCard, FaTools, FaHistory, FaCode, FaFileAlt } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({ selectedOption, onSelect }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Untopico</h2>
                <p>Proyecto de software</p>
            </div>
            <div className="menu-section">
                <h3>PLANIFICACIÓN</h3>
                <ul>
                    <li className={selectedOption === 'tarjetas' ? 'active' : ''} onClick={() => onSelect('tarjetas')}>
                        <FaCreditCard /> Tarjetas
                    </li>
                    <li className={selectedOption === 'operaciones' ? 'active' : ''} onClick={() => onSelect('operaciones')}>
                        <FaMoneyCheckAlt /> Operaciones
                    </li>
                    <li className={selectedOption === 'pagos' ? 'active' : ''} onClick={() => onSelect('pagos')}>
                        <FaTools /> Pagos de servicios
                    </li>
                    <li className={selectedOption === 'escanearQR' ? 'active' : ''} onClick={() => onSelect('escanearQR')}>
                        <FaTools /> Escanear Codigo QR
                    </li>
                    <li className={selectedOption === 'historial' ? 'active' : ''} onClick={() => onSelect('historial')}>
                        <FaHistory /> Historial de transacciones
                    </li>
                </ul>
            </div>
            <div className="menu-section">
                <h3>DESARROLLO</h3>
                <ul>
                    <li><FaCode /> Código</li>
                    <li><FaFileAlt /> Páginas del proyecto</li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
