import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export const MemberProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    const parts = name
      .split(' ')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2);

    if (parts.length === 0) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return parts.map((part) => part.charAt(0)).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const displayName = user.full_name?.trim()
    || [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    || user.email;
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name ?? 'member';
  const joinedAt = user.createdAt ?? user.created_at;
  const phoneNumber = user.phone_number;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Member Profile
          </CardTitle>
          <CardDescription>
            Your personal information and church membership details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {displayName}
                </h2>
                <Badge className={getRoleBadgeColor(roleName)}>
                  {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                
                {phoneNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{roleName === 'admin' ? 'Administrator access' : 'Member access'}</span>
                </div>

                {joinedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(joinedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membership Overview</CardTitle>
          <CardDescription>
            Summary of the profile details currently available for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span>Full name</span>
              <span className="font-medium text-foreground">{displayName}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span>Email</span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span>Role</span>
              <span className="font-medium text-foreground">{roleName}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span>Phone</span>
              <span className="font-medium text-foreground">{phoneNumber || 'Not provided'}</span>
            </div>
            <div className="rounded-lg border p-3">
              Attendance history is not included in the authenticated profile payload yet.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};