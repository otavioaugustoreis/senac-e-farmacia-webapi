import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { criarRepositorios } from "@/infrastructure/repositorios";
import { PONTO_PADRAO } from "@/domain/farmacia";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Integração real contra o Supabase (somente leitura, como visitante anônimo).
describe.skipIf(!url || !chave)("repositórios Supabase (leitura anônima)", () => {
  const repos = () => criarRepositorios(createClient(url!, chave!, { auth: { persistSession: false } }));

  it("busca 'DIPIRONA' sem acento e traz menor preço numérico", async () => {
    // Arrange
    const { medicamentos } = repos();
    // Act
    const resultado = await medicamentos.buscar("DIPIRONA");
    // Assert
    expect(resultado.length).toBeGreaterThanOrEqual(2);
    expect(resultado.some((m) => typeof m.menorPreco === "number")).toBe(true);
    expect(resultado[0].categoria?.nome).toBeTruthy();
  });

  it("encontra por princípio ativo ('losartana')", async () => {
    // Arrange
    const { medicamentos } = repos();
    // Act
    const resultado = await medicamentos.buscar("losartana");
    // Assert
    expect(resultado.some((m) => m.principioAtivo === "Losartana Potássica")).toBe(true);
  });

  it("filtra por categoria", async () => {
    // Arrange
    const { medicamentos, categorias } = repos();
    const [primeira] = await categorias.listar();
    // Act
    const resultado = await medicamentos.buscar("", primeira.id);
    // Assert
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((m) => m.categoria?.id === primeira.id)).toBe(true);
  });

  it("traz a ilustração da equipe para cada medicamento, na busca e no detalhe", async () => {
    // Arrange
    const { medicamentos } = repos();
    // Act
    const [detalhe, busca] = await Promise.all([medicamentos.obterPorId(4), medicamentos.buscar("tylenol")]);
    // Assert
    expect(detalhe?.imagem?.url).toBe("/medicamentos/25-tylenol.svg");
    expect(detalhe?.imagem?.credito).toBe("Ilustração: equipe E-Farmácia");
    expect(busca[0].imagem?.url).toBe(detalhe?.imagem?.url);
  });

  it("todos os medicamentos do catálogo têm imagem, inclusive a dipirona", async () => {
    // Arrange
    const { medicamentos } = repos();
    // Act
    const [todos, novalgina] = await Promise.all([medicamentos.buscar(""), medicamentos.obterPorId(1)]);
    // Assert
    expect(todos.every((m) => m.imagem?.url.startsWith("/medicamentos/"))).toBe(true);
    expect(novalgina?.imagem?.url).toBe("/medicamentos/22-novalgina.svg");
  });

  it("devolve null para medicamento inexistente", async () => {
    // Arrange
    const { medicamentos } = repos();
    // Act
    const resultado = await medicamentos.obterPorId(999999);
    // Assert
    expect(resultado).toBeNull();
  });

  it("lista alternativas pelo princípio ativo exato", async () => {
    // Arrange
    const { medicamentos } = repos();
    // Act
    const resultado = await medicamentos.listarPorPrincipioAtivo("Ibuprofeno");
    // Assert
    expect(resultado.length).toBeGreaterThanOrEqual(3);
    expect(resultado.every((m) => m.principioAtivo === "Ibuprofeno")).toBe(true);
  });

  it("ordena farmácias próximas por distância", async () => {
    // Arrange
    const { farmacias } = repos();
    // Act
    const resultado = await farmacias.proximas(PONTO_PADRAO.lat, PONTO_PADRAO.lng, 15);
    // Assert
    expect(resultado.length).toBeGreaterThan(0);
    const distancias = resultado.map((f) => f.distanciaKm);
    expect(distancias).toEqual([...distancias].sort((a, b) => a - b));
    expect(typeof resultado[0].lat).toBe("number");
  });

  it("converte datas e valores dos preços", async () => {
    // Arrange
    const { precos } = repos();
    // Act
    const resultado = await precos.listarPorMedicamento(1);
    // Assert
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].atualizadoEm).toBeInstanceOf(Date);
    expect(typeof resultado[0].valor).toBe("number");
    expect(resultado[0].farmacia.nome).toBeTruthy();
  });

  it("lê bula e cupons com farmácia", async () => {
    // Arrange
    const { bulas, cupons } = repos();
    // Act
    const [bula, lista] = await Promise.all([bulas.obter(1), cupons.listar()]);
    // Assert
    expect(bula?.paraQueServe).toContain("dor");
    expect(lista.length).toBeGreaterThan(0);
    expect(lista[0].validade).toBeInstanceOf(Date);
    expect(lista[0].farmacia.nome).toBeTruthy();
  });

  it("não deixa visitante anônimo gravar preço", async () => {
    // Arrange
    const { precos } = repos();
    // Act
    const acao = precos.salvar({ medicamentoId: 1, farmaciaId: 1, valor: 1 });
    // Assert
    await expect(acao).rejects.toThrow();
  });
});
