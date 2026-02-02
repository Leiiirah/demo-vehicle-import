import { Bell, LogOut, RefreshCw, User, Wallet } from 'lucide-react';
import { exchangeRate, kpiData } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Header() {
  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'DZD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-full items-center justify-between px-6">
        {/* Exchange Rate */}
        <div className="flex items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium text-foreground">1 USD = </span>
                  <span className="font-semibold text-info">{exchangeRate.USD_DZD} DZD</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated: {exchangeRate.lastUpdated}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Stats & User */}
        <div className="flex items-center gap-4">
          {/* Global Balance */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(kpiData.totalProfit)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total profit across all operations</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Debts:</span>
                  <span className="font-semibold text-danger">
                    {formatCurrency(kpiData.outstandingDebts, 'USD')}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Outstanding supplier debts</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-[10px] font-medium text-danger-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">Full Access</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
