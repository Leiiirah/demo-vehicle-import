import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users,
  Building2,
  
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookUser,
  ShoppingCart,
  Package,
  FolderOpen,
  Container,
  Receipt,
  Wallet,
  Warehouse,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Navigation structure
const importItems = [
  { name: 'Fournisseurs', href: '/suppliers', icon: Building2 },
  { name: 'Passeports', href: '/passeports', icon: BookUser },
  { name: 'Dossiers', href: '/dossiers', icon: FolderOpen },
  { name: 'Conteneurs', href: '/conteneurs', icon: Container },
  { name: 'Véhicules', href: '/vehicles', icon: Car },
  { name: 'Modèles', href: '/models', icon: BookOpen },
  { name: 'Stock', href: '/stock', icon: Warehouse },
  { name: 'Clients', href: '/clients', icon: Users },
];

const comptabiliteItems = [
  { name: 'Caisse', href: '/caisse', icon: Wallet },
  { name: 'Ventes Clients', href: '/client-sales', icon: ShoppingCart },
  { name: 'Ventes & Marges', href: '/sales', icon: TrendingUp },
  { name: 'Rapports', href: '/reports', icon: FileText },
];

const secondaryNav = [
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [importOpen, setImportOpen] = useState(true);
  const [comptaOpen, setComptaOpen] = useState(true);
  const location = useLocation();

  const isActive = (href: string) => 
    location.pathname === href || (href !== '/' && location.pathname.startsWith(href + '/'));

  const NavItem = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const active = isActive(item.href);
    return (
      <li>
        <NavLink
          to={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
            active
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>{item.name}</span>}
        </NavLink>
      </li>
    );
  };

  const GroupHeader = ({ 
    label, 
    icon: Icon, 
    open, 
    onToggle 
  }: { 
    label: string; 
    icon: any; 
    open: boolean; 
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all',
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </>
      )}
    </button>
  );

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
        {/* Tableau de bord - Solo */}
        <ul className="space-y-1">
          <NavItem item={{ name: 'Tableau de bord', href: '/', icon: LayoutDashboard }} />
        </ul>

        {/* Import Group */}
        <div className="mt-4">
          <GroupHeader 
            label="Import" 
            icon={Package} 
            open={importOpen} 
            onToggle={() => setImportOpen(!importOpen)} 
          />
          {(importOpen || collapsed) && (
            <ul className={cn('space-y-1 mt-1', !collapsed && 'ml-2')}>
              {importItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Comptabilité Group */}
        <div className="mt-4">
          <GroupHeader 
            label="Comptabilité" 
            icon={Receipt} 
            open={comptaOpen} 
            onToggle={() => setComptaOpen(!comptaOpen)} 
          />
          {(comptaOpen || collapsed) && (
            <ul className={cn('space-y-1 mt-1', !collapsed && 'ml-2')}>
              {comptabiliteItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-sidebar-border" />

        {/* Secondary Navigation */}
        <ul className="space-y-1">
          {secondaryNav.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
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