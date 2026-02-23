import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'USD' | 'DZD' = 'DZD'): string {
  const formatWithSpaces = (num: number) => {
    const parts = Math.abs(Math.round(num)).toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (num < 0 ? '-' : '') + parts.join('.');
  };
  if (currency === 'USD') {
    return '$' + formatWithSpaces(amount);
  }
  return formatWithSpaces(amount) + ' DZD';
}
