import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Car, Eye, EyeOff, Loader2 } from 'lucide-react';
import { DEMO_ACCOUNTS } from '@/mocks/seedData';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@hub.com');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur Vehicle Import Hub',
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Email ou mot de passe incorrect',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <Car className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Import Hub</h1>
          <p className="text-muted-foreground mt-2">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@vehicleimporthub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </div>

        {/* Comptes de démonstration */}
        <div className="mt-6 bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">Comptes de démonstration</p>
          <p className="text-xs text-muted-foreground mb-3">
            Cliquez sur un compte pour pré-remplir les champs. N'importe quel email/mot de passe fonctionne.
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                disabled={isLoading}
                className="w-full text-left rounded-lg border border-border bg-muted/40 hover:bg-muted px-3 py-2 text-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{acc.email}</span>
                  <span className="text-muted-foreground capitalize">{acc.role}</span>
                </div>
                <span className="text-muted-foreground">Mot de passe : {acc.password}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
