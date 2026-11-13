import Link from "next/link";
import { WorkspaceHeader } from "@/components/ui/patterns";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Terms & Conditions · Deevi",
  description: "Deevi Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 sm:px-6 py-8">
      <WorkspaceHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Last updated: November 2026"
      />

      <Card className="p-5 space-y-4">
        <p className="text-sm text-ink-soft leading-relaxed">
          Welcome to Deevi. These Terms & Conditions (&ldquo;Terms&rdquo;) govern your use of the Deevi platform
          (&ldquo;Deevi&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using Deevi, you agree to
          these Terms.
        </p>

        <h3 className="text-sm font-semibold text-ink">1. Eligibility</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          You must be at least 18 years old to use Deevi. By signing up, you represent that you meet this requirement
          and that all information you provide is accurate.
        </p>

        <h3 className="text-sm font-semibold text-ink">2. Roles: Customer and Artisan</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          You may sign up as a customer (someone seeking services) or as an artisan (someone offering services).
          Artisans must complete identity and trade verification before they can apply to jobs.
        </p>

        <h3 className="text-sm font-semibold text-ink">3. Jobs and Payments</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          Customers post jobs and artisans apply. Deevi does not handle payments; payment is arranged directly between
          the customer and the artisan. Deevi is not a party to the service contract and is not liable for work
          performed.
        </p>

        <h3 className="text-sm font-semibold text-ink">4. Conduct</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          You agree not to post fraudulent listings, misrepresent your identity or qualifications, or engage in
          harassment. Violations may result in suspension or removal from the platform.
        </p>

        <h3 className="text-sm font-semibold text-ink">5. Notifications</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          Deevi may send in-app notifications about your jobs, applications, messages, and verification status. You can
          manage your notification preferences in Settings. Important alerts (verification decisions, job selection,
          payment disputes) cannot be disabled.
        </p>

        <h3 className="text-sm font-semibold text-ink">6. Termination</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          We may suspend or terminate your account at any time, with or without notice, for violations of these Terms.
        </p>

        <h3 className="text-sm font-semibold text-ink">7. Limitation of Liability</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          Deevi is provided &ldquo;as is.&rdquo; To the fullest extent permitted by law, Deevi is not liable for any
          indirect, incidental, or consequential damages arising from your use of the platform.
        </p>

        <h3 className="text-sm font-semibold text-ink">8. Changes to These Terms</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          We may update these Terms from time to time. We&rsquo;ll notify you of material changes through the platform
          or by email. Your continued use means you accept the updated Terms.
        </p>
      </Card>

      <div className="flex gap-3">
        <Link href="/signup" className="flex-1">
          <Button variant="secondary" fullWidth>
            Back to signup
          </Button>
        </Link>
        <Link href="/login" className="flex-1">
          <Button fullWidth>
            Log in
          </Button>
        </Link>
      </div>
    </div>
  );
}
