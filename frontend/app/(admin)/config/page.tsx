'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminConfigPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">Manage system settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure platform behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">System configuration interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

