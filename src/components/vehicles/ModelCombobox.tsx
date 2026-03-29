import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

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

  // Fetch from car models catalog
  const { data: carModels = [] } = useQuery({
    queryKey: ['car-models'],
    queryFn: () => api.getCarModels(),
  });

  // Fallback: also get models from existing vehicles
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
  });

  const allModels = useMemo(() => {
    const models = new Set<string>();
    // Car models catalog (filtered by brand)
    carModels.forEach((m) => {
      if (m.model && (!brand || m.brand?.toLowerCase() === brand?.toLowerCase())) {
        models.add(m.model);
      }
    });
    // Existing vehicles (filtered by brand)
    vehicles.forEach((v: any) => {
      if (v.model && (!brand || v.brand?.toLowerCase() === brand?.toLowerCase())) {
        models.add(v.model);
      }
    });
    return Array.from(models).sort();
  }, [carModels, vehicles, brand]);

  const filtered = useMemo(() => {
    if (!inputValue) return allModels;
    return allModels.filter((m) =>
      m.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [allModels, inputValue]);

  useEffect(() => { setInputValue(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
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
          className="pr-8"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen(!open)}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-52 overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
          {filtered.map((model) => (
            <button
              key={model}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/50 last:border-0',
                model === value && 'bg-primary/10 text-primary font-medium'
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
