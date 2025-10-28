'use client';

import { Navbar } from '@/components/common';
import { useAuthContext } from '@/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Start solving problems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Due</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Problems to review</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your dashboard is ready! More features coming soon:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Browse and solve coding problems</li>
              <li>Track your progress and statistics</li>
              <li>Review problems with spaced repetition</li>
              <li>View concept mastery charts</li>
              <li>Compete on leaderboards</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
