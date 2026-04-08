import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import type { ChurchDTO } from '@/lib/api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church: ChurchDTO | null;
}

const ChurchViewDialog: React.FC<Props> = ({ open, onOpenChange, church }) => {
  if (!church) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{church.denomination_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {church.description && (
            <p className="text-sm text-muted-foreground">{church.description}</p>
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={church.address} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={church.location} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="State" value={church.state} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Country" value={church.country} />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Admin"
              value={church.admin?.full_name || church.admin?.email}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Created"
              value={church.created_at ? format(new Date(church.created_at), 'PPP') : undefined}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({
  icon, label, value,
}) => (
  <div className="flex items-start gap-2">
    <span className="text-muted-foreground mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  </div>
);

export default ChurchViewDialog;
