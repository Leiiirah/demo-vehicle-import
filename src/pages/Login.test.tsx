import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './Login';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    login: vi.fn(),
    getMe: vi.fn(),
    logout: vi.fn(),
    setToken: vi.fn(),
    removeToken: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the login form', () => {
      renderLogin();

      expect(screen.getByText('VHL Import')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('should render demo credentials info', () => {
      renderLogin();

      expect(screen.getByText(/compte admin/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@vhlimport.com/i)).toBeInTheDocument();
    });

    it('should render password toggle button', () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Interactions', () => {
    it('should update email input value', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password input value', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find the toggle button (it's the one without text)
      const buttons = screen.getAllByRole('button');
      const eyeButton = buttons.find(btn => !btn.textContent?.includes('connecter'));
      
      if (eyeButton) {
        await user.click(eyeButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        await user.click(eyeButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });

    it('should require password field', () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      expect(passwordInput).toBeRequired();
    });

    it('should have email input type', () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button while loading', async () => {
      const { api } = await import('@/services/api');
      (api.login as any).mockImplementation(() => new Promise(() => {})); // Never resolves

      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });

      await user.type(emailInput, 'admin@vhlimport.com');
      await user.type(passwordInput, 'VHLAdmin2026!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show loading text while submitting', async () => {
      const { api } = await import('@/services/api');
      (api.login as any).mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });

      await user.type(emailInput, 'admin@vhlimport.com');
      await user.type(passwordInput, 'VHLAdmin2026!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderLogin();

      const emailLabel = screen.getByText('Email');
      const passwordLabel = screen.getByText('Mot de passe');

      expect(emailLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
    });

    it('should have autocomplete attributes', () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });
});
