// src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './auth/authContext';
import { MemoryRouter } from 'react-router-dom';

test('renders Header component', () => {
  const { container } = render(
    <AuthProvider>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </AuthProvider>
  );

  console.log(container.innerHTML); // Para ver qué se está renderizando

  const headerElement = screen.getByRole('banner'); // Asumiendo que <Header /> usa <header>
  expect(headerElement).toBeInTheDocument();
});

test('renders Error page on unknown route', () => {
  const { container } = render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/ruta-desconocida']}>
        <App />
      </MemoryRouter>
    </AuthProvider>
  );

  console.log(container.innerHTML); // Para ver qué se está renderizando

  const errorElement = screen.getByText(/error/i); // Asegúrate de que la página Error tenga un texto identificable
  expect(errorElement).toBeInTheDocument();
});
