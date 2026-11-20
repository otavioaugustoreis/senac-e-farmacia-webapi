import type { Metadata } from "next";
import { cadastrarAction } from "../auth-actions";
import { FormAuth } from "@/components/FormAuth";

export const metadata: Metadata = { title: "Criar conta — E-Farmácia" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <FormAuth modo="cadastro" acao={cadastrarAction} next={next ?? "/"} />;
}
