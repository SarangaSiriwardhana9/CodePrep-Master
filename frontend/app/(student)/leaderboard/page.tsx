'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          See how you rank against other students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Rankings</CardTitle>
          <CardDescription>Top performers on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Leaderboard rankings coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

