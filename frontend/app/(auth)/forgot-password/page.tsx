'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a password reset link
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert>
            <AlertDescription>
              If an account exists with that email, you will receive a password reset link shortly.
              Please check your inbox and spam folder.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ForgotPasswordForm onSuccess={() => setSuccess(true)} />
      </CardContent>
    </Card>
  );
}
