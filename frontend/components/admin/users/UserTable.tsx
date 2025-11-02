'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserManagement } from '@/features/admin/types/admin.types';
import { UserActionsDropdown } from './UserActionsDropdown';

interface UserTableProps {
  users: UserManagement[];
  onStatusChange: (userId: string, status: string) => void;
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const variants = {
    active: 'default',
    suspended: 'secondary',
    banned: 'destructive',
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const getRoleBadge = (role: string) => {
  const colors = {
    admin: 'bg-purple-500',
    moderator: 'bg-blue-500',
    user: 'bg-gray-500',
  } as const;

  return (
    <Badge className={colors[role as keyof typeof colors] || 'bg-gray-500'}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

export function UserTable({ users, onStatusChange }: UserTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{formatDate(user.lastLogin)}</TableCell>
                <TableCell className="text-right">
                  <UserActionsDropdown
                    userId={user._id}
                    currentStatus={user.status}
                    onStatusChange={onStatusChange}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

