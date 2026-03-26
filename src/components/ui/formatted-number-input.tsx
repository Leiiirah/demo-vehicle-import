import * as React from 'react';
import { Input } from '@/components/ui/input';

interface FormattedNumberInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'type'> {
  value: string | number;
  onValueChange: (numericValue: number) => void;
  /** If true, allows decimal values (default: false) */
  allowDecimals?: boolean;
}

function formatWithSpaces(val: string | number): string {
  const str = String(val).replace(/\s/g, '');
  if (!str || str === '-') return str;
  
  // Split integer and decimal parts
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
}

function stripSpaces(val: string): string {
  return val.replace(/\s/g, '');
}

const FormattedNumberInput = React.forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ value, onValueChange, allowDecimals = false, ...props }, ref) => {
    const displayValue = React.useMemo(() => {
      if (value === '' || value === 0) return '';
      return formatWithSpaces(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = stripSpaces(e.target.value);
      
      // Allow empty
      if (raw === '') {
        onValueChange(0);
        return;
      }

      // Validate: only digits, optional decimal point, optional leading minus
      const pattern = allowDecimals ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
      if (!pattern.test(raw)) return;

      const num = allowDecimals ? parseFloat(raw) : parseInt(raw, 10);
      if (!isNaN(num)) {
        onValueChange(num);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

FormattedNumberInput.displayName = 'FormattedNumberInput';

export { FormattedNumberInput, formatWithSpaces, stripSpaces };
