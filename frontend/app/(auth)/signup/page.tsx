'use client';

import { SignupForm } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Start your journey to interview success
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
