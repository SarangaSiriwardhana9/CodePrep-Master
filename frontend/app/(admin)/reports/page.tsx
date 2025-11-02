'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminReportsPage() {
  const { reports, getReports, isLoading } = useAdmin();

  useEffect(() => {
    getReports({ page: 1, limit: 20 });
  }, [getReports]);

  if (isLoading && reports.length === 0) {
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
        <h1 className="text-3xl font-bold">Moderation Reports</h1>
        <p className="text-muted-foreground">Review and resolve user reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Queue</CardTitle>
          <CardDescription>Total reports loaded: {reports.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Reports interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

