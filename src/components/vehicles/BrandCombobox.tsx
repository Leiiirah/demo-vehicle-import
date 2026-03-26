import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function BrandCombobox({ value, onChange, id, placeholder = 'Ex: Toyota' }: BrandComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
  });

  // Extract unique brands
  const existingBrands = useMemo(() => {
    const brands = new Set<string>();
    vehicles.forEach((v: any) => {
      if (v.brand) brands.add(v.brand);
    });
    return Array.from(brands).sort();
  }, [vehicles]);

  // Filter brands based on input
  const filtered = useMemo(() => {
    if (!inputValue) return existingBrands;
    return existingBrands.filter((b) =>
      b.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [existingBrands, inputValue]);

  // Sync external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {filtered.map((brand) => (
            <button
              key={brand}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                brand === value && 'bg-accent text-accent-foreground font-medium'
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                setInputValue(brand);
                onChange(brand);
                setOpen(false);
              }}
            >
              {brand}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
