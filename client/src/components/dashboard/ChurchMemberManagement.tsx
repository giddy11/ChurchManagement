import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Search,
  Users,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import { fetchUsers } from '@/lib/api';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { useChurch } from '@/components/church/ChurchProvider';

type ApiUser = {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role: string;
  is_active?: boolean;
};

const ChurchMemberManagement: React.FC = () => {
  const { user } = useAuth();
  const { currentChurch, currentBranch, effectiveRole } = useChurch();
  const [members, setMembers] = useState<ApiUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadMembers = async () => {
    try {
      const res = await fetchUsers();
      setMembers(res.data || []);
    } catch {
      setMembers([]);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentChurch]);

  const handleCreateSuccess = () => {
    setIsAddOpen(false);
    loadMembers();
  };

  const filtered = members.filter(m =>
    `${m.full_name || ''} ${m.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const canManage = effectiveRole === 'admin' || effectiveRole === 'super_admin';

  if (!currentChurch) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-gray-500">Please select a church first.</p>
      </div>
    );
  }

  const adminCount = members.filter(m => m.role === 'admin' || m.role === 'super_admin').length;
  const memberCount = members.length - adminCount;

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage members of {currentBranch?.name ?? currentChurch.denomination_name}
          </p>
        </div>

        {canManage && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Member to {currentBranch?.name ?? currentChurch.denomination_name}</DialogTitle>
              </DialogHeader>
              <RegisterForm
                onSwitchToLogin={() => setIsAddOpen(false)}
                onSuccess={handleCreateSuccess}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{members.filter(m => m.role === 'admin' || m.role === 'super_admin').length}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Member List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No members found</p>
              <p className="text-sm">Add members to your church to get started</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(member => (
            <Card key={member.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {(member.full_name || member.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {member.full_name || member.email}
                      </p>
                      <Badge
                        variant={member.role === 'admin' || member.role === 'super_admin' ? 'destructive' : 'secondary'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {member.email}
                      </span>
                      {member.phone_number && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {member.phone_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ChurchMemberManagement;
