'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }

    const result = await resetPassword({
      token,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });
    
    if (result) {
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) clearError();
  };

  const passwordsMatch = !formData.confirmPassword || formData.newPassword === formData.confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          value={formData.newPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          At least 8 characters with 1 uppercase, 1 lowercase, and 1 number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          autoComplete="new-password"
        />
        {!passwordsMatch && (
          <p className="text-sm text-destructive">Passwords do not match</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !passwordsMatch}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>

      <Link href="/login" className="block">
        <Button type="button" variant="ghost" className="w-full">
          Back to Login
        </Button>
      </Link>
    </form>
  );
}

