'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminProblemsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Problem Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage coding problems</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problems List</CardTitle>
          <CardDescription>Manage all platform problems</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Problem management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

