// register.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../pages/Register';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../auth/authContext';
import { signUpWithEmail } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

// Mock de useNavigate para simular la navegación sin realizar cambios reales
const mockedUseNavigate = jest.fn();

// Mock de la librería 'react-router-dom' para interceptar el hook useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate, // Reemplaza el hook con una versión mockeada
}));

// Mock de funciones de autenticación para evitar llamadas reales al backend
jest.mock('../auth/auth', () => ({
  signUpWithEmail: jest.fn(),  // Mock de la función de registro por correo
  signInWithGoogle: jest.fn(), // Mock de la función de inicio de sesión con Google
}));

// Mock del componente de reCAPTCHA para evitar interacción real con Google
jest.mock('react-google-recaptcha', () => {
  const React = require('react');
  const MockReCAPTCHA = React.forwardRef(({ onChange }, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(), // Mock de la función de reset del reCAPTCHA
    }));
    return (
      <div data-testid="recaptcha-mock" onClick={() => onChange('mock-token')}>
        Mock ReCAPTCHA
      </div>
    );
  });
  return MockReCAPTCHA; // Devuelve el componente mockeado
});

describe('Componente de Registro', () => {
  // Limpiar los mocks antes de cada prueba para evitar efectos secundarios entre pruebas
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Prueba para verificar el renderizado correcto del componente Register
  test('Renderizado el componente de register', () => {
    render(
      <Router>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </Router>
    );

    // Verificar si los elementos clave del formulario se renderizan correctamente
    expect(screen.getByText(/Registrar cuenta/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByText(/Mock ReCAPTCHA/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear cuenta con Google/i)).toBeInTheDocument();
  });

  // Prueba de creación de cuenta exitosa con un mock de la función de registro
  test('Creacion de cuenta exitosa', async () => {
    // Simular el éxito del registro con los valores proporcionados
    signUpWithEmail.mockResolvedValue({ success: true });

    render(
      <Router>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </Router>
    );

    // Simular la entrada de datos en el formulario
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'alex@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
      target: { value: 'password123' },
    });

    // Simular clic en el checkbox y en el reCAPTCHA
    fireEvent.click(screen.getByRole('checkbox')); // Aceptar términos
    fireEvent.click(screen.getByTestId('recaptcha-mock')); // Selección del reCAPTCHA

    // Simular envío del formulario
    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    // Verificar que la función signUpWithEmail fue llamada correctamente con los parámetros correctos
    await waitFor(() => {
      expect(signUpWithEmail).toHaveBeenCalledWith(
        'alex@gmail.com',
        'password123',
        'mock-token' // Token generado por el mock de reCAPTCHA
      );
    });

    // Verificar que la función useNavigate fue llamada con la ruta correcta
    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith('/configurar-cuenta');
    });
  });

  // Prueba para verificar el caso cuando las contraseñas no coinciden
  test('La contraseña no coenciden', async () => {
    render(
      <Router>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </Router>
    );

    // Ingresar datos en el formulario con contraseñas no coincidentes
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'alex@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
      target: { value: 'differentPassword' },
    });

    // Intentar enviar el formulario con contraseñas no coincidentes
    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

  });
});
