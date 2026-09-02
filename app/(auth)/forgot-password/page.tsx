"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/primitives";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for <span className="font-medium text-ink">{email}</span>, we&apos;ve
          sent a link to reset your password.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-sm text-danger-600" role="alert">
            {error}
          </div>
        )}
        <Field label="Email" htmlFor="email" required>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Send reset link
        </Button>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
        Back to log in
      </Link>
    </div>
  );
}
