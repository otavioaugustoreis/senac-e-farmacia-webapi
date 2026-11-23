import Link from "next/link";
import { Pill } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-lg font-bold ${light ? "text-white" : "text-brand-900"}`}>
      <span className={`grid size-8 place-items-center rounded-full ${light ? "bg-white text-brand-800" : "bg-brand-800 text-white"}`}>
        <Pill className="size-4" aria-hidden />
      </span>
      E-Farmácia
    </Link>
  );
}
