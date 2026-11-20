import Link from "next/link";
import { Pill } from "lucide-react";

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-lg font-bold ${claro ? "text-white" : "text-marca-900"}`}>
      <span className={`grid size-8 place-items-center rounded-full ${claro ? "bg-white/15" : "bg-marca-800 text-white"}`}>
        <Pill className="size-4" aria-hidden />
      </span>
      E-Farmácia
    </Link>
  );
}
