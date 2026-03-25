import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateVehicle } from '@/hooks/useApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'ordered', label: 'En stock', className: 'badge-info' },
  { value: 'in_transit', label: 'Chargée', className: 'badge-pending' },
  { value: 'arrived', label: 'Arrivé', className: 'badge-profit' },
  { value: 'sold', label: 'Vendu', className: 'bg-muted text-muted-foreground' },
];

interface VehicleStatusSelectProps {
  vehicleId: string;
  currentStatus: string;
}

export function VehicleStatusSelect({ vehicleId, currentStatus }: VehicleStatusSelectProps) {
  const updateVehicle = useUpdateVehicle();

  const handleChange = (newStatus: string) => {
    if (newStatus === currentStatus) return;
    updateVehicle.mutate(
      { id: vehicleId, data: { status: newStatus as any } },
      {
        onSuccess: () => toast.success('Statut mis à jour'),
        onError: () => toast.error('Erreur lors de la mise à jour'),
      }
    );
  };

  const current = statusOptions.find((s) => s.value === currentStatus);

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger
        className={cn('h-7 w-[120px] text-xs font-medium border-0 px-2.5 py-0.5 rounded-full', current?.className)}
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent onClick={(e) => e.stopPropagation()}>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
