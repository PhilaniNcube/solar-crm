import { Sun } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
      <div className="flex items-center gap-2">
        <Sun className="h-6 w-6 text-orange-500" />
        <span className="text-sm font-semibold text-gray-900">
          PrimeSolar CRM
        </span>
      </div>
      <p className="text-xs text-gray-600">
        © 2024 PrimeSolar CRM. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link
          href="#"
          className="text-xs hover:underline underline-offset-4 text-gray-600"
        >
          Terms of Service
        </Link>
        <Link
          href="#"
          className="text-xs hover:underline underline-offset-4 text-gray-600"
        >
          Privacy Policy
        </Link>
        <Link
          href="#"
          className="text-xs hover:underline underline-offset-4 text-gray-600"
        >
          Support
        </Link>
      </nav>
    </footer>
  );
}
