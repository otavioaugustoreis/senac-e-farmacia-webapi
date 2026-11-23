const BASE = "http://e-farmacia.local";

export function safeDestination(next: unknown): string {
  const d = typeof next === "string" ? next : "";
  if (!d.startsWith("/") || d.startsWith("//") || /[\u0000-\u001f\u007f\\]/.test(d)) return "/";
  const url = new URL(d, BASE);
  return url.origin === BASE ? `${url.pathname}${url.search}${url.hash}` : "/";
}

export function destinationAfterLogin(next: unknown, role: "user" | "admin"): string {
  const destination = safeDestination(next);
  return role === "admin" && destination === "/" ? "/admin" : destination;
}
