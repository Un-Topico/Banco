// register.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../pages/Register';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../auth/authContext';
import { signUpWithEmail } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

// Mock de useNavigate
const mockedUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));

// Mock de funciones de autenticación
jest.mock('../auth/auth', () => ({
  signUpWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

// Mock correcto de ReCAPTCHA que maneja refs
jest.mock('react-google-recaptcha', () => {
  const React = require('react');
  const MockReCAPTCHA = React.forwardRef(({ onChange }, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(),
    }));
    return (
      <div data-testid="recaptcha-mock" onClick={() => onChange('mock-token')}>
        Mock ReCAPTCHA
      </div>
    );
  });
  return MockReCAPTCHA;
});

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renderizado el componente de register', () => {
    render(
      <Router>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </Router>
    );

    // Verificar elementos básicos del formulario
    expect(screen.getByText(/Registrar cuenta/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByText(/Mock ReCAPTCHA/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear cuenta con Google/i)).toBeInTheDocument();
  });

  test('Creacion de cuenta exitosa', async () => {
    // Simular registro exitoso
    signUpWithEmail.mockResolvedValue({ success: true });

    render(
      <Router>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </Router>
    );

    // Completar el formulario
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'testuser@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
      target: { value: 'password123' },
    });

    // Click en el checkbox y reCAPTCHA
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByTestId('recaptcha-mock'));

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    // Verificar que la función de registro fue llamada correctamente
    await waitFor(() => {
      expect(signUpWithEmail).toHaveBeenCalledWith(
        'testuser@example.com',
        'password123',
        'mock-token'
      );
    });

    // Verificar que navigate fue llamado con "/configurar-cuenta"
    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith('/configurar-cuenta');
    });
  });

  test('La contraseña no coenciden', async () => {
    render(
      <Router>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </Router>
    );

    // Completar el formulario con contraseñas que no coinciden
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'testuser@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
      target: { value: 'differentPassword' },
    });

    // Intentar enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

  });
});
