import React from "react";
import { Modal, Button } from "react-bootstrap";

const TermsAndConditions = ({ show, onHide, onAccept }) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Términos y Condiciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Términos y Condiciones de Uso</h4>
        <p>Al acceder y utilizar nuestra plataforma de banca en línea, el usuario acepta y se obliga a cumplir con los presentes términos y condiciones. Si el usuario no está de acuerdo con alguno de estos términos, deberá abstenerse de utilizar nuestros servicios.</p>
        <h5>1. Aceptación de los Términos</h5>
        <p>Al acceder y utilizar nuestra plataforma de banca en línea, el usuario acepta y se obliga a cumplir con los presentes términos y condiciones. Si el usuario no está de acuerdo con alguno de estos términos, deberá abstenerse de utilizar nuestros servicios.</p>
        <h5>2. Servicios Ofrecidos</h5>
        <ul>
          <li>Registrar tarjetas de débito.</li>
          <li>Realizar pagos de servicios como agua, luz, etc.</li>
          <li>Hacer compras y retiros.</li>
          <li>Realizar depósitos y transferencias entre usuarios de la misma plataforma.</li>
        </ul>
        <h5>3. Registro de Cuenta</h5>
        <p>Para utilizar nuestros servicios, el usuario debe registrarse proporcionando su nombre, correo electrónico y número de teléfono. El registro se puede realizar mediante correo y contraseña, o a través de autenticación con Google o Facebook.</p>
        <h5>4. Responsabilidad del Usuario</h5>
        <p>El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña. Además, el usuario se compromete a no utilizar la plataforma para actividades ilegales o fraudulentas.</p>
        <h5>5. Limitación de Responsabilidad</h5>
        <p>La plataforma es un proyecto escolar y, por lo tanto, no se ofrece ninguna garantía sobre la disponibilidad continua de los servicios ni sobre la seguridad completa de los datos. El uso de la plataforma es bajo el propio riesgo del usuario.</p>
        <h5>6. Modificaciones</h5>
        <p>Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Cualquier cambio será notificado a los usuarios a través del sitio web.</p>
        <h5>7. Terminación de Cuenta</h5>
        <p>Podemos suspender o cancelar el acceso de un usuario si se determina que ha violado los términos y condiciones establecidos.</p>
        <h4>Política de Privacidad</h4>
        <h5>1. Información que Recopilamos</h5>
        <ul>
          <li><strong>Nombre:</strong> Para identificar al usuario en la plataforma.</li>
          <li><strong>Correo Electrónico:</strong> Para el registro de la cuenta, autenticación y envío de notificaciones importantes.</li>
          <li><strong>Número de Teléfono:</strong> Para propósitos de seguridad y comunicación.</li>
          <li><strong>Datos de Autenticación:</strong> Pueden incluir el uso de Google o Facebook para facilitar el acceso.</li>
        </ul>
        <h5>2. Uso de la Información</h5>
        <p>Los datos personales recopilados serán utilizados para:</p>
        <ul>
          <li>Proporcionar acceso a los servicios de la plataforma.</li>
          <li>Realizar transacciones financieras (depósitos, retiros, transferencias, etc.).</li>
          <li>Notificar al usuario sobre actividades relevantes en su cuenta (como movimientos o actualizaciones).</li>
        </ul>
        <h5>3. Protección de los Datos</h5>
        <p>Nos comprometemos a proteger la información personal de los usuarios mediante medidas de seguridad razonables. Sin embargo, debido a la naturaleza del proyecto, no garantizamos la seguridad total de los datos.</p>
        <h5>4. Compartir Información</h5>
        <p>No compartimos la información personal de los usuarios con terceros, salvo que sea requerido por ley o en casos necesarios para cumplir con las obligaciones legales.</p>
        <h5>5. Derechos del Usuario</h5>
        <p>Los usuarios tienen derecho a acceder, rectificar y cancelar sus datos personales. Para ejercer estos derechos, pueden ponerse en contacto a través de la plataforma.</p>
        <h5>6. Uso de Cookies</h5>
        <p>Podemos utilizar cookies para mejorar la experiencia del usuario. Estas cookies se utilizan para recordar preferencias y facilitar el uso de la plataforma.</p>
        <h5>7. Cambios en la Política de Privacidad</h5>
        <p>Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento. Los usuarios serán informados de cualquier cambio a través de la plataforma.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => { onAccept(); onHide(); }}>
          Acepto los términos y condiciones
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TermsAndConditions;