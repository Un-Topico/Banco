import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './auth/authContext';

// Mock del contexto de autenticación
const MockAuthProvider = ({ children, currentUser = { email: "testuser@example.com" } }) => {
  const mockAuthContextValue = {
    currentUser, // Simula un usuario autenticado
  };

  return (
    <AuthProvider value={mockAuthContextValue}>
      {children}
    </AuthProvider>
  );
};

test('renders App component with test text when user is authenticated', async () => {
  render(
    <MockAuthProvider>
      <App />
    </MockAuthProvider>
  );

  // Espera que el texto de prueba esté presente
  const testText = await screen.findByText(/UnTopicoBanco/i);
  expect(testText).toBeInTheDocument();
});
