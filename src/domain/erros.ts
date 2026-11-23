/** Falha de validação de regra de negócio. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Não encontrado") {
    super(message);
    this.name = "NaoEncontradoError";
  }
}

export class UnauthenticatedError extends Error {
  constructor(message = "Faça login para continuar") {
    super(message);
    this.name = "NaoAutenticadoError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Acesso restrito a administradores") {
    super(message);
    this.name = "ProibidoError";
  }
}
