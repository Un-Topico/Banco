// src/App.test.js

import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './auth/authContext';

test('renders the header with Login when user is not authenticated', async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  const headerText = await screen.findByText(/Login/i);
  expect(headerText).toBeInTheDocument();
});
