// src/components/transactionComponents/QrDepositForm.test.jsx

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QrDepositForm } from './QrDepositForm';
import { useAuth } from '../../auth/authContext';
import { verifyCardOwnershipAndBalance, saveQrCode } from '../../api/qrDepositApi';
import { reauthenticateWithGoogle } from '../../auth/auth';

// Mockear el hook useAuth
jest.mock('../../auth/authContext', () => ({
  useAuth: jest.fn(),
}));

// Mockear funciones de la API
jest.mock('../../api/qrDepositApi', () => ({
  verifyCardOwnershipAndBalance: jest.fn(),
  saveQrCode: jest.fn(),
}));

// Mockear la función de reautenticación con Google
jest.mock('../../auth/auth', () => ({
  reauthenticateWithGoogle: jest.fn(),
}));

describe('QrDepositForm Component', () => {
  const mockUser = { 
    uid: 'user123', 
    email: 'test@example.com',
    displayName: 'Test User',
    providerData: [{ providerId: 'google.com' }] 
  };

  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: mockUser });
    jest.clearAllMocks(); // Limpiar mocks antes de cada prueba
  });

  describe('Rendering', () => {
    it('should render input and button elements correctly', () => {
      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={jest.fn()} />);

      expect(screen.getByPlaceholderText('Ingresa el monto')).toBeInTheDocument();
      expect(screen.getByText('Generar Código QR')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error when amount is invalid', async () => {
      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={jest.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Ingresa el monto'), { target: { value: '-10' } });
      fireEvent.click(screen.getByText('Generar Código QR'));

      await waitFor(() => {
        expect(screen.getByText('Por favor, ingresa una cantidad válida (número positivo con hasta dos decimales).')).toBeInTheDocument();
      });
    });

    it('should show error when amount exceeds maximum limit', async () => {
      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={jest.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Ingresa el monto'), { target: { value: '10001' } });
      fireEvent.click(screen.getByText('Generar Código QR'));

      await waitFor(() => {
        expect(screen.getByText('El monto máximo permitido es 10,000.')).toBeInTheDocument();
      });
    });

    it('should show error when balance is insufficient', async () => {
      verifyCardOwnershipAndBalance.mockRejectedValue(new Error('No tienes suficiente saldo para generar el código QR.'));

      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={jest.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Ingresa el monto'), { target: { value: '10000' } });
      fireEvent.click(screen.getByText('Generar Código QR'));

      await waitFor(() => {
        expect(screen.getByText('No tienes suficiente saldo para generar el código QR.')).toBeInTheDocument();
      });
    });

    it('should show error if reauthentication fails', async () => {
      reauthenticateWithGoogle.mockRejectedValue(new Error('Error en la reautenticación.'));

      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={jest.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Ingresa el monto'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Generar Código QR'));

      // Hacer clic en el botón de reautenticación
      await act(async () => {
        fireEvent.click(screen.getByText('Reautenticarse con Google'));
      });

      await waitFor(() => {
        expect(screen.getByText('Error en la reautenticación.')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Scenarios', () => {
    it('should call verifyCardOwnershipAndBalance and saveQrCode when valid amount is provided', async () => {
      verifyCardOwnershipAndBalance.mockResolvedValue({ balance: 5000 });
      saveQrCode.mockResolvedValue();
      reauthenticateWithGoogle.mockResolvedValue({ success: true });

      const mockOnBalanceUpdate = jest.fn();

      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={mockOnBalanceUpdate} />);

      fireEvent.change(screen.getByPlaceholderText('Ingresa el monto'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Generar Código QR'));

      // Hacer clic en el botón de reautenticación
      await act(async () => {
        fireEvent.click(screen.getByText('Reautenticarse con Google'));
      });

      await waitFor(() => {
        expect(verifyCardOwnershipAndBalance).toHaveBeenCalledWith('card123', 'user123', 100);
        expect(saveQrCode).toHaveBeenCalled();
        expect(screen.getByText('Código QR generado exitosamente.')).toBeInTheDocument();
        expect(mockOnBalanceUpdate).toHaveBeenCalledWith(4900); // 5000 - 100
      });
    });

    it('should reset amount after successful QR generation', async () => {
      verifyCardOwnershipAndBalance.mockResolvedValue({ balance: 5000 });
      saveQrCode.mockResolvedValue();
      reauthenticateWithGoogle.mockResolvedValue({ success: true });

      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={jest.fn()} />);

      const input = screen.getByPlaceholderText('Ingresa el monto');
      fireEvent.change(input, { target: { value: '100' } });
      fireEvent.click(screen.getByText('Generar Código QR'));

      // Hacer clic en el botón de reautenticación
      await act(async () => {
        fireEvent.click(screen.getByText('Reautenticarse con Google'));
      });

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should open reauthentication modal when generating QR', async () => {
      render(<QrDepositForm selectedCardId="card123" onBalanceUpdate={jest.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Ingresa el monto'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Generar Código QR'));

      expect(screen.getByText('Reautenticación Requerida')).toBeInTheDocument();
    });
  });
});
