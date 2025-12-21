import React from 'react';
import type { Person } from '@/types/person';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PeopleListProps {
  people: Person[];
  onDelete: (id: number) => void;
}

const PeopleList: React.FC<PeopleListProps> = ({ people, onDelete }) => {
  return (
    <>
      {/* Mobile view - Cards */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {people.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground text-gray-500 col-span-full">
            No people found.
          </p>
        ) : (
          people.map((person) => (
            <Card key={person.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{person.name}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span>{person.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>{person.mobile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-3 w-3 text-gray-400" />
                  <span>{person.homePhone}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block rounded-md border">
        <div className="relative w-full">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-gray-500">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-gray-500">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-gray-500">Mobile</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-gray-500">Home Phone</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {people.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground text-gray-500">
                    No people found.
                  </td>
                </tr>
              ) : (
                people.map((person) => (
                  <tr key={person.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{person.name}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {person.email}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {person.mobile}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Home className="h-3 w-3 text-gray-400" />
                        {person.homePhone}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(person.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PeopleList;
