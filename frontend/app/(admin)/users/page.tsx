'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/features/admin/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const { users, getUsers, isLoading } = useAdmin();

  useEffect(() => {
    getUsers({ page: 1, limit: 20 });
  }, [getUsers]);

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

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Total users loaded: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

