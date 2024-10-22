// src/components/Background.js
import React from 'react';
import PropTypes from 'prop-types';
//import './background.css'; // Puedes personalizar el estilo si lo prefieres en un archivo CSS separado

const Background = ({ imageUrl, children }) => {
  const backgroundStyle = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%',
    position: 'relative', // Para que los hijos se posicionen dentro
  };

  return (
    <div style={backgroundStyle}>
      {children} {/* Esto renderiza cualquier contenido que pases como hijo */}
    </div>
  );
};

// Validar que `imageUrl` sea obligatoria
Background.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  children: PropTypes.node, // Para que acepte otros componentes dentro
};

export default Background;
