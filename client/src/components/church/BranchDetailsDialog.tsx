import React from 'react';
import type { BranchDTO } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, CalendarDays, MapPin, Star, User } from 'lucide-react';

interface BranchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: BranchDTO | null;
}

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const Field: React.FC<{ label: string; value?: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-lg border border-app-primary-light/70 bg-gradient-to-b from-white to-app-primary-light/20 px-3 py-2">
    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-app-selected-text/80">{label}</p>
    <p className="flex items-center gap-2 text-sm text-app-selected-text">
      {icon}
      <span className="break-words">{value && value.trim() ? value : 'N/A'}</span>
    </p>
  </div>
);

const BranchDetailsDialog: React.FC<BranchDetailsDialogProps> = ({ open, onOpenChange, branch }) => {
  if (!branch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80dvh] overflow-hidden bg-white p-0 flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-app-primary-light bg-gradient-to-r from-app-primary-light/70 via-white to-app-primary-light/30 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 rounded-lg border border-app-primary-light shadow-sm">
                  <AvatarImage src={branch.image || ''} alt={branch.name} className="object-cover rounded-lg" />
                  <AvatarFallback className="bg-app-primary-light/60 rounded-lg text-app-selected-text">
                    <Building2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl font-semibold leading-tight text-app-selected-text">{branch.name}</DialogTitle>
                  <p className="mt-1 text-sm text-app-selected-text/80">Branch profile overview</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {branch.is_headquarters ? (
                  <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-500">
                    <Star className="h-3 w-3 mr-1" />HQ
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-app-primary-light text-app-selected-text">Branch</Badge>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto space-y-4 px-6 py-5">
          {/* Branch Info */}
          <Card className="border border-app-primary-light shadow-none">
            <CardContent className="space-y-3 p-4">
              <h3 className="text-sm font-semibold text-app-selected-text">Branch Information</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Branch Name" value={branch.name} icon={<Building2 className="h-4 w-4 text-app-primary" />} />
                <Field label="Pastor / Leader" value={branch.pastor_name} icon={<User className="h-4 w-4 text-app-primary" />} />
                <Field label="Headquarters" value={branch.is_headquarters ? 'Yes' : 'No'} />
                <Field label="Created" value={formatDate(branch.created_at)} icon={<CalendarDays className="h-4 w-4 text-app-primary" />} />
                {branch.description && (
                  <div className="sm:col-span-2">
                    <Field label="Description" value={branch.description} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border border-app-primary-light shadow-none">
            <CardContent className="space-y-3 p-4">
              <h3 className="text-sm font-semibold text-app-selected-text">Location</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Country" value={branch.country} icon={<MapPin className="h-4 w-4 text-app-primary" />} />
                <Field label="State / Region" value={branch.state} icon={<MapPin className="h-4 w-4 text-app-primary" />} />
                <Field label="City" value={branch.city} icon={<MapPin className="h-4 w-4 text-app-primary" />} />
                <div className="sm:col-span-2">
                  <Field label="Address" value={branch.address} icon={<MapPin className="h-4 w-4 text-app-primary" />} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BranchDetailsDialog;
