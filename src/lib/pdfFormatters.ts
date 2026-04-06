interface PdfNumberFormatOptions {
  decimalSeparator?: '.' | ',';
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

export function formatPdfNumber(value: number, options: PdfNumberFormatOptions = {}) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const minimumFractionDigits = Math.max(0, options.minimumFractionDigits ?? 0);
  const maximumFractionDigits = Math.max(
    minimumFractionDigits,
    options.maximumFractionDigits ?? minimumFractionDigits,
  );
  const decimalSeparator = options.decimalSeparator ?? '.';

  const roundedValue = maximumFractionDigits > 0
    ? Number(safeValue.toFixed(maximumFractionDigits))
    : Math.round(safeValue);

  let [integerPart, decimalPart = ''] = Math.abs(roundedValue).toString().split('.');
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  if (maximumFractionDigits > 0) {
    decimalPart = decimalPart.padEnd(maximumFractionDigits, '0').slice(0, maximumFractionDigits);

    if (decimalPart.length > minimumFractionDigits) {
      decimalPart = decimalPart.replace(/0+$/, '');
    }

    if (decimalPart.length < minimumFractionDigits) {
      decimalPart = decimalPart.padEnd(minimumFractionDigits, '0');
    }
  }

  const sign = safeValue < 0 ? '-' : '';
  return decimalPart ? `${sign}${integerPart}${decimalSeparator}${decimalPart}` : `${sign}${integerPart}`;
}

export function formatPdfCurrency(
  value: number,
  currency: 'USD' | 'DZD' = 'DZD',
  options: PdfNumberFormatOptions = {},
) {
  const defaults = currency === 'USD'
    ? { decimalSeparator: '.' as const, maximumFractionDigits: 2, minimumFractionDigits: 0 }
    : { decimalSeparator: '.' as const, maximumFractionDigits: 0, minimumFractionDigits: 0 };

  const formattedValue = formatPdfNumber(value, { ...defaults, ...options });
  return currency === 'USD' ? `$${formattedValue}` : `${formattedValue} DZD`;
}

export function formatPdfDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const useUtcParts = typeof value === 'string';
  const day = String(useUtcParts ? date.getUTCDate() : date.getDate()).padStart(2, '0');
  const month = String((useUtcParts ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, '0');
  const year = String(useUtcParts ? date.getUTCFullYear() : date.getFullYear());

  return `${day}/${month}/${year}`;
}