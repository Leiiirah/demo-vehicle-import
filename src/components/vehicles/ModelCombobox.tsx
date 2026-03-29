import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ModelComboboxProps {
  value: string;
  onChange: (value: string) => void;
  brand?: string;
  id?: string;
  placeholder?: string;
}

export function ModelCombobox({ value, onChange, brand, id, placeholder = 'Ex: Land Cruiser' }: ModelComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
  });

  const existingModels = useMemo(() => {
    const models = new Set<string>();
    vehicles.forEach((v: any) => {
      if (v.model && (!brand || v.brand?.toLowerCase() === brand.toLowerCase())) {
        models.add(v.model);
      }
    });
    return Array.from(models).sort();
  }, [vehicles, brand]);

  const filtered = useMemo(() => {
    if (!inputValue) return existingModels;
    return existingModels.filter((m) =>
      m.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [existingModels, inputValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
          {filtered.map((model) => (
            <button
              key={model}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                model === value && 'bg-accent text-accent-foreground font-medium'
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                setInputValue(model);
                onChange(model);
                setOpen(false);
              }}
            >
              {model}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
