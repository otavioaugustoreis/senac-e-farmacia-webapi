import type { Metadata } from "next";
import { signInAction } from "../auth-actions";
import { FormAuth } from "@/components/FormAuth";

export const metadata: Metadata = { title: "Entrar — E-Farmácia" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <FormAuth mode="signIn" action={signInAction} next={next ?? "/"} />;
}
