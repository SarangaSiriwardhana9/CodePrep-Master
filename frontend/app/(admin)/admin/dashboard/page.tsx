'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/features/admin/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, Activity, Flag, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const { dashboard, getDashboard, isLoading } = useAdmin();

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  if (isLoading && !dashboard) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalProblems || 0}</div>
            <p className="text-xs text-muted-foreground">Active problems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">Code submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalContests || 0}</div>
            <p className="text-xs text-muted-foreground">Active contests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.pendingReports || 0}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.systemHealth?.uptime ? 
                `${Math.floor(dashboard.systemHealth.uptime / 3600)}h` : '0h'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg response: {dashboard?.systemHealth?.avgResponseTime || 0}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {dashboard?.systemHealth && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Response Time</span>
              <span className="text-sm text-muted-foreground">
                {dashboard.systemHealth.avgResponseTime}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="text-sm text-muted-foreground">
                {dashboard.systemHealth.errorRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">System Status</span>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

