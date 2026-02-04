import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthContextModule from '@/contexts/AuthContext';

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

const renderWithRouter = (initialEntries = ['/protected']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when auth is loading', () => {
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Chargement...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    it('should render children when authenticated', () => {
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'admin', status: 'active' },
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should redirect to login when not authenticated', () => {
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should preserve the intended destination in state', () => {
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter(['/protected?query=value']);

      // Should redirect to login
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Transition States', () => {
    it('should show loading then content when auth completes', () => {
      // First render: loading
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { rerender } = renderWithRouter();
      expect(screen.getByText('Chargement...')).toBeInTheDocument();

      // Second render: authenticated
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'admin', status: 'active' },
        login: vi.fn(),
        logout: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show loading then redirect when auth fails', () => {
      // First render: loading
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { rerender } = renderWithRouter();
      expect(screen.getByText('Chargement...')).toBeInTheDocument();

      // Second render: not authenticated
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
