import { describe, expect, it } from "vitest";
import { buscarMedicamentos } from "@/application/casos-de-uso/buscar-medicamentos";
import { detalharMedicamento } from "@/application/casos-de-uso/detalhar-medicamento";
import { farmaciasProximas } from "@/application/casos-de-uso/farmacias-proximas";
import { listarCuponsVigentes } from "@/application/casos-de-uso/listar-cupons-vigentes";
import { montarVitrine } from "@/application/casos-de-uso/montar-vitrine";
import { reportarPreco } from "@/application/casos-de-uso/reportar-preco";
import { COMO_USAR_PADRAO } from "@/domain/bula";
import { NaoAutenticadoError, NaoEncontradoError } from "@/domain/erros";
import { PONTO_PADRAO } from "@/domain/farmacia";
import { criarFakes, cupom, dadosVazios, farmacia, med, preco, usuarioComum, type Dados } from "./fakes";

const hoje = new Date("2026-11-20T15:00:00Z");

function cenario(): Dados {
  const d = dadosVazios();
  d.medicamentos = [
    med(1, "Novalgina", "Dipirona Sódica", "referencia"),
    med(2, "Dipirona Sódica EMS", "dipirona sodica", "generico"),
    med(3, "Tylenol", "Paracetamol", "referencia"),
    med(4, "Sem Preço", "Loratadina", "similar"),
  ];
  d.farmacias = [farmacia(1), farmacia(2, false)];
  d.precos = [
    preco(10, 1, 1, 10),
    preco(11, 1, 2, 12, new Date("2026-11-10T12:00:00Z")),
    preco(12, 2, 1, 6),
    preco(13, 3, 1, 20),
  ];
  d.cupons = [cupom(1, 1, "2026-12-31T12:00:00Z"), cupom(2, 1, "2026-11-01T12:00:00Z"), cupom(3, 2, "2026-12-31T12:00:00Z")];
  return d;
}

describe("buscarMedicamentos", () => {
  it("lista todos quando a busca tem só espaços", async () => {
    // Arrange
    const buscar = buscarMedicamentos(criarFakes(cenario()));
    // Act
    const resultado = await buscar("   ");
    // Assert
    expect(resultado).toHaveLength(4);
  });

  it("encontra pelo princípio ativo sem acento", async () => {
    // Arrange
    const buscar = buscarMedicamentos(criarFakes(cenario()));
    // Act
    const resultado = await buscar("DIPIRONA SODICA");
    // Assert
    expect(resultado.map((m) => m.id).sort()).toEqual([1, 2]);
  });
});

describe("detalharMedicamento", () => {
  it("lança NaoEncontradoError para id inexistente", async () => {
    // Arrange
    const detalhar = detalharMedicamento(criarFakes(cenario()));
    // Act
    const acao = detalhar(999, hoje);
    // Assert
    await expect(acao).rejects.toBeInstanceOf(NaoEncontradoError);
  });

  it("devolve lista vazia e menorPreco null para medicamento sem preço", async () => {
    // Arrange
    const detalhar = detalharMedicamento(criarFakes(cenario()));
    // Act
    const resultado = await detalhar(4, hoje);
    // Assert
    expect(resultado.precos).toEqual([]);
    expect(resultado.menorPreco).toBeNull();
    expect(resultado.comoUsar).toBe(COMO_USAR_PADRAO);
  });

  it("ordena preços, marca desatualizados e traz alternativas e cupons vigentes", async () => {
    // Arrange
    const detalhar = detalharMedicamento(criarFakes(cenario()));
    // Act
    const resultado = await detalhar(1, hoje);
    // Assert
    expect(resultado.precos.map((p) => p.id)).toEqual([10, 11]);
    expect(resultado.precos.map((p) => p.desatualizado)).toEqual([false, true]);
    expect(resultado.menorPreco?.valor).toBe(10);
    expect(resultado.alternativas.map((m) => m.id)).toEqual([2]);
    expect(resultado.cupons.map((c) => c.id).sort()).toEqual([1, 3]);
  });
});

describe("farmaciasProximas", () => {
  it("usa o ponto padrão quando as coordenadas são inválidas", async () => {
    // Arrange
    const proximas = farmaciasProximas(criarFakes(cenario()));
    // Act
    const resultado = await proximas("x", undefined);
    // Assert
    expect(resultado.origem).toEqual({ ...PONTO_PADRAO, padrao: true });
    expect(resultado.farmacias.length).toBeGreaterThan(0);
  });

  it("amplia o raio e avisa quando não há farmácias perto da posição real (ex.: Campinas)", async () => {
    // Arrange
    const proximas = farmaciasProximas(criarFakes(cenario()));
    const campinas = { lat: -22.9056, lng: -47.0608 };
    // Act
    const resultado = await proximas(campinas.lat, campinas.lng);
    // Assert
    expect(resultado.origem).toEqual({ ...campinas, padrao: false });
    expect(resultado.ampliado).toBe(true);
    expect(resultado.raioKm).toBeGreaterThan(15);
    expect(resultado.farmacias.length).toBeGreaterThan(0);
  });

  it("não amplia o raio quando há farmácias perto", async () => {
    // Arrange
    const proximas = farmaciasProximas(criarFakes(cenario()));
    // Act
    const resultado = await proximas(-23.56, -46.65);
    // Assert
    expect(resultado.ampliado).toBe(false);
    expect(resultado.raioKm).toBe(15);
  });

  it("usa a posição informada quando é válida", async () => {
    // Arrange
    const proximas = farmaciasProximas(criarFakes(cenario()));
    // Act
    const resultado = await proximas(-23.5, -46.6);
    // Assert
    expect(resultado.origem).toEqual({ lat: -23.5, lng: -46.6, padrao: false });
  });
});

describe("listarCuponsVigentes", () => {
  it("não inclui cupons vencidos", async () => {
    // Arrange
    const listar = listarCuponsVigentes(criarFakes(cenario()));
    // Act
    const resultado = await listar(hoje);
    // Assert
    expect(resultado.map((c) => c.id).sort()).toEqual([1, 3]);
  });
});

describe("montarVitrine", () => {
  it("calcula a economia do genérico contra a referência e ignora itens sem preço", async () => {
    // Arrange
    const vitrine = montarVitrine(criarFakes(cenario()));
    // Act
    const resultado = await vitrine(hoje);
    // Assert
    expect(resultado.menoresPrecos.map((m) => m.id)).toEqual([2]);
    expect(resultado.menoresPrecos[0].precoReferencia).toBe(10);
    expect(resultado.menoresPrecos[0].economiaPercentual).toBe(40);
  });

  it("resume números, parceiras e até dois cupons vigentes", async () => {
    // Arrange
    const vitrine = montarVitrine(criarFakes(cenario()));
    // Act
    const resultado = await vitrine(hoje);
    // Assert
    expect(resultado.numeros).toEqual({ medicamentos: 4, farmacias: 2, economiaMediaPercentual: 40 });
    expect(resultado.farmaciasParceiras.map((f) => f.id)).toEqual([1]);
    expect(resultado.cupons.length).toBeLessThanOrEqual(2);
    expect(resultado.cupons.every((c) => c.id !== 2)).toBe(true);
  });
});

describe("reportarPreco", () => {
  it("exige usuário logado", async () => {
    // Arrange
    const reportar = reportarPreco(criarFakes(cenario()));
    // Act
    const acao = reportar(null, 10, "mudou");
    // Assert
    await expect(acao).rejects.toBeInstanceOf(NaoAutenticadoError);
  });

  it("grava o reporte com o comentário normalizado", async () => {
    // Arrange
    const dados = cenario();
    const reportar = reportarPreco(criarFakes(dados));
    // Act
    await reportar(usuarioComum, 10, "  preço mudou  ");
    // Assert
    expect(dados.reportes).toHaveLength(1);
    expect(dados.reportes[0]).toMatchObject({ precoId: 10, userId: "u1", comentario: "preço mudou" });
  });
});
