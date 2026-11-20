import type { Metadata } from "next";
import { entrarAction } from "../auth-actions";
import { FormAuth } from "@/components/FormAuth";

export const metadata: Metadata = { title: "Entrar — E-Farmácia" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <FormAuth modo="entrar" acao={entrarAction} next={next ?? "/"} />;
}
