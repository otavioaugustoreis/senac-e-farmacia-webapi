export type Papel = "user" | "admin";

export interface UsuarioAtual {
  id: string;
  email: string;
  nome: string | null;
  role: Papel;
}
