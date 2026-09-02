import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <Link href="/" className="mb-8 inline-flex">
          <Logo size={28} />
        </Link>
        <div className="flex flex-1 flex-col justify-center pb-16">{children}</div>
      </div>
    </div>
  );
}
