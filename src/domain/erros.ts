/** Falha de validação de regra de negócio. */
export class DomainError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "DomainError";
  }
}

export class NaoEncontradoError extends Error {
  constructor(mensagem = "Não encontrado") {
    super(mensagem);
    this.name = "NaoEncontradoError";
  }
}

export class NaoAutenticadoError extends Error {
  constructor(mensagem = "Faça login para continuar") {
    super(mensagem);
    this.name = "NaoAutenticadoError";
  }
}

export class ProibidoError extends Error {
  constructor(mensagem = "Acesso restrito a administradores") {
    super(mensagem);
    this.name = "ProibidoError";
  }
}
