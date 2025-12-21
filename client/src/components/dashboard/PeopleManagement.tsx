import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Download, 
  Upload, 
  Search, 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddPersonDialog from './AddPersonDialog';
import PeopleList from './PeopleList';
import type { Person } from '@/types/person';

// Mock data
const initialPeople: Person[] = [
  { id: 1, firstName: 'John', lastName: 'Doe', name: 'John Doe', email: 'john@example.com', mobile: '+1234567890', homePhone: '+1987654321' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', email: 'jane@example.com', mobile: '+1234567891', homePhone: '+1987654322' },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', name: 'Alice Johnson', email: 'alice@example.com', mobile: '+1234567892', homePhone: '+1987654323' },
  { id: 4, firstName: 'Bob', lastName: 'Brown', name: 'Bob Brown', email: 'bob@example.com', mobile: '+1234567893', homePhone: '+1987654324' },
  { id: 5, firstName: 'Charlie', lastName: 'Davis', name: 'Charlie Davis', email: 'charlie@example.com', mobile: '+1234567894', homePhone: '+1987654325' },
  { id: 6, firstName: 'Eve', lastName: 'Wilson', name: 'Eve Wilson', email: 'eve@example.com', mobile: '+1234567895', homePhone: '+1987654326' },
  { id: 7, firstName: 'John', lastName: 'Doe', name: 'John Doe', email: 'john@example.com', mobile: '+1234567890', homePhone: '+1987654321' },
  { id: 8, firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', email: 'jane@example.com', mobile: '+1234567891', homePhone: '+1987654322' },
  { id: 9, firstName: 'Alice', lastName: 'Johnson', name: 'Alice Johnson', email: 'alice@example.com', mobile: '+1234567892', homePhone: '+1987654323' },
  { id: 10, firstName: 'Bob', lastName: 'Brown', name: 'Bob Brown', email: 'bob@example.com', mobile: '+1234567893', homePhone: '+1987654324' },
  { id: 11, firstName: 'Charlie', lastName: 'Davis', name: 'Charlie Davis', email: 'charlie@example.com', mobile: '+1234567894', homePhone: '+1987654325' },
  { id: 12, firstName: 'Eve', lastName: 'Wilson', name: 'Eve Wilson', email: 'eve@example.com', mobile: '+1234567895', homePhone: '+1987654326' }
];

const PeopleManagement = () => {
  const [people, setPeople] = useState(initialPeople);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredPeople = people.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.mobile && person.mobile.includes(searchTerm))
  );

  const handleAddPerson = (newPersonData: Omit<Person, 'id' | 'name'>) => {
    const fullName = `${newPersonData.firstName} ${newPersonData.lastName}`;
    const newPerson: Person = {
      id: Date.now(),
      ...newPersonData,
      name: fullName,
    };
    setPeople([...people, newPerson]);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      setPeople(people.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">People</h2>
          <p className="text-muted-foreground text-gray-500">Manage your church members and visitors.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
          <AddPersonDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAddPerson={handleAddPerson}
          />
        </div>
      </div>

      <Card className="flex flex-col h-[600px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">All People</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground text-gray-500" />
              <Input
                placeholder="Search by name, email, mobile..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <PeopleList people={filteredPeople} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PeopleManagement;
