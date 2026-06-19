'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.post<{ message: string; resetUrl?: string }>('/auth/forgot-password', data);
      if (result.resetUrl) setDevResetUrl(result.resetUrl);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your account email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {sent ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.
              </div>
              {devResetUrl && devResetUrl.startsWith('http') && (
                <div className="rounded-xl bg-muted px-4 py-3 text-xs break-all">
                  <p className="font-medium mb-1">Dev reset link (SMTP not configured):</p>
                  <a href={devResetUrl} className="text-primary hover:underline">{devResetUrl}</a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
