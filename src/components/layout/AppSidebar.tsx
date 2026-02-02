import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users,
  Building2,
  UserCircle,
  Calculator,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Ship,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Véhicules', href: '/vehicles', icon: Car },
  { name: 'Calculateur', href: '/calculator', icon: Calculator },
  { name: 'Fournisseurs', href: '/suppliers', icon: Building2 },
  { name: 'Clients', href: '/clients', icon: UserCircle },
  { name: 'Ventes & Marges', href: '/sales', icon: TrendingUp },
  { name: 'Rapports', href: '/reports', icon: FileText },
];

const secondaryNav = [
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-lg font-bold text-sidebar-primary-foreground">N</span>
            </div>
            <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">
              NGB
            </span>
          </div>
        )}
        {collapsed && (
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
            <span className="text-lg font-bold text-sidebar-primary-foreground">N</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0')} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-sidebar-border" />

        {/* Secondary Navigation */}
        <ul className="space-y-1">
          {secondaryNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </aside>
  );
}
