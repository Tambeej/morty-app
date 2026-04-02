import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import { AuthProvider } from '../../../context/AuthContext';
import { ToastProvider } from '../../common/Toast';

// Mock the api module
jest.mock('../../../services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  defaults: { headers: { common: {} } },
}));

const renderRegisterForm = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('RegisterForm', () => {
  it('renders all required fields', () => {
    renderRegisterForm();
    expect(screen.getByPlaceholderText('Yoav Cohen')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('050-1234567')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min. 8 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat your password')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    renderRegisterForm();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation error for empty full name', async () => {
    renderRegisterForm();
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid phone number', async () => {
    renderRegisterForm();
    const phoneInput = screen.getByPlaceholderText('050-1234567');
    await userEvent.type(phoneInput, '12345');
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(
        screen.getByText(/valid Israeli phone number/i)
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderRegisterForm();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    await userEvent.type(emailInput, 'not-an-email');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    renderRegisterForm();
    const passwordInput = screen.getByPlaceholderText(/min. 8 characters/i);
    const confirmInput = screen.getByPlaceholderText('Repeat your password');

    await userEvent.type(passwordInput, 'Password123');
    await userEvent.type(confirmInput, 'DifferentPass123');
    fireEvent.blur(confirmInput);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows sign in link', () => {
    renderRegisterForm();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('accepts valid Israeli phone numbers', async () => {
    renderRegisterForm();
    const phoneInput = screen.getByPlaceholderText('050-1234567');
    await userEvent.type(phoneInput, '050-1234567');
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(
        screen.queryByText(/valid Israeli phone number/i)
      ).not.toBeInTheDocument();
    });
  });
});
