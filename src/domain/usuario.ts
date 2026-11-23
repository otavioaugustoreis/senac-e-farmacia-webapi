export type Role = "user" | "admin";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}
