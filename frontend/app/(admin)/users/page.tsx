'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  UserFilters,
  UserTable,
  UpdateStatusDialog,
  UsersPagination,
} from '@/components/admin/users';

export default function AdminUsersPage() {
  const {
    users,
    pagination,
    filters,
    isLoading,
    error,
    getUsers,
    updateUserStatus,
    setFilters,
    clearError,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserStatus, setSelectedUserStatus] = useState<string>('active');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    getUsers({ page: 1, limit: 20 });
  }, [getUsers]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({ ...filters, search: term });
    getUsers({
      page: 1,
      limit: pagination.limit,
      search: term,
      status: filters.status,
      role: filters.role,
    });
  };

  const handleFilterChange = (key: 'status' | 'role', value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    getUsers({
      page: 1,
      limit: pagination.limit,
      ...newFilters,
      search: searchTerm,
    });
  };

  const handlePageChange = (newPage: number) => {
    getUsers({
      page: newPage,
      limit: pagination.limit,
      search: filters.search,
      status: filters.status,
      role: filters.role,
    });
  };

  const handleStatusChange = (userId: string, status: string) => {
    setSelectedUser(userId);
    setSelectedUserStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (
    userId: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string
  ) => {
    const success = await updateUserStatus(userId, {
      status,
      reason,
    });

    if (success) {
      setStatusDialogOpen(false);
      setSelectedUser(null);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and permissions</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            Total users: {pagination.total} | Showing {users.length} of {pagination.total}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <UserFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
            />

            <UserTable users={users} onStatusChange={handleStatusChange} />

            <UsersPagination
              page={pagination.page}
              pages={pagination.pages}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

      <UpdateStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        userId={selectedUser}
        currentStatus={selectedUserStatus}
        onUpdate={handleStatusUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}
