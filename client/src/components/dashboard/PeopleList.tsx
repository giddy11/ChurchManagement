import React from 'react';
import type { Person } from '@/types/person';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PeopleListProps {
  people: Person[];
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onConvert: (person: Person) => void;
}

function fullName(p: Person) {
  return `${p.first_name} ${p.last_name}`;
}

const PeopleList: React.FC<PeopleListProps> = ({ people, onEdit, onDelete, onConvert }) => {
  console.log('Rendering PeopleList with people:', people);
  if (people.length === 0) {
    return <p className="p-4 text-center text-gray-500">No people found.</p>;
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {people.map((p) => (
          <MobileCard key={p.id} person={p} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} />
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden md:block rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b hover:bg-muted/50">
              <th className="h-12 px-4 text-left font-medium text-gray-500">Name</th>
              <th className="h-12 px-4 text-left font-medium text-gray-500">Email</th>
              <th className="h-12 px-4 text-left font-medium text-gray-500">Phone</th>
              <th className="h-12 px-4 text-left font-medium text-gray-500">Gender</th>
              <th className="h-12 px-4 text-left font-medium text-gray-500">Status</th>
              <th className="h-12 px-4 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {people.map((p) => (
              <DesktopRow key={p.id} person={p} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PeopleList;

/* ─── Sub-components ──────────────────────────────────────────────────── */

const MobileCard: React.FC<{ person: Person; onEdit: (p: Person) => void; onDelete: (p: Person) => void; onConvert: (p: Person) => void }> = ({ person, onEdit, onDelete, onConvert }) => (
  <Card className="p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold">{fullName(person)}</h3>
        {person.converted_user_id && <Badge variant="secondary" className="text-xs mt-1">Member</Badge>}
      </div>
      <ActionButtons person={person} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} />
    </div>
    <div className="space-y-2 text-sm text-gray-600">
      {person.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-gray-400" /><span>{person.email}</span></div>}
      {person.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-gray-400" /><span>{person.phone}</span></div>}
    </div>
  </Card>
);

const DesktopRow: React.FC<{ person: Person; onEdit: (p: Person) => void; onDelete: (p: Person) => void; onConvert: (p: Person) => void }> = ({ person, onEdit, onDelete, onConvert }) => (
  <tr className="border-b hover:bg-muted/50">
    <td className="p-4 font-medium">{fullName(person)}</td>
    <td className="p-4">{person.email && <span className="flex items-center gap-2"><Mail className="h-3 w-3 text-gray-400" />{person.email}</span>}</td>
    <td className="p-4">{person.phone && <span className="flex items-center gap-2"><Phone className="h-3 w-3 text-gray-400" />{person.phone}</span>}</td>
    <td className="p-4 capitalize">{person.gender || '—'}</td>
    <td className="p-4">{person.converted_user_id ? <Badge variant="secondary">Member</Badge> : <Badge variant="outline">Person</Badge>}</td>
    <td className="p-4 text-right"><ActionButtons person={person} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} /></td>
  </tr>
);

const ActionButtons: React.FC<{ person: Person; onEdit: (p: Person) => void; onDelete: (p: Person) => void; onConvert: (p: Person) => void }> = ({ person, onEdit, onDelete, onConvert }) => (
  <div className="flex gap-1">
    {!person.converted_user_id && (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50" title="Convert to Member" onClick={() => onConvert(person)}>
        <UserPlus className="h-4 w-4" />
      </Button>
    )}
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(person)}>
      <Edit className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(person)}>
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);
