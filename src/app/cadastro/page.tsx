import type { Metadata } from "next";
import { signUpAction } from "../auth-actions";
import { FormAuth } from "@/components/FormAuth";

export const metadata: Metadata = { title: "Criar conta — E-Farmácia" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <FormAuth mode="signUp" action={signUpAction} next={next ?? "/"} />;
}
