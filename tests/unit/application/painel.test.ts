import { describe, expect, it } from "vitest";
import { montarPainel } from "@/application/casos-de-uso/montar-painel";
import { ProibidoError } from "@/domain/erros";
import { admin, criarFakes, cupom, dadosVazios, farmacia, med, preco, usuarioComum } from "./fakes";

const hoje = new Date("2026-11-20T15:00:00Z");
const diasAtras = (n: number) => new Date(hoje.getTime() - n * 24 * 60 * 60 * 1000);

function cenario() {
  const d = dadosVazios();
  d.medicamentos = [
    { ...med(1, "Novalgina", "Dipirona", "referencia"), imagem: { url: "https://x/a.jpg", credito: "c", fonte: "f" } },
    med(2, "Dipirona EMS", "Dipirona", "generico"),
    med(3, "Sem Preço", "Loratadina", "similar"),
  ];
  d.farmacias = [farmacia(1), farmacia(2, false)];
  d.precos = [
    preco(10, 1, 1, 10, diasAtras(1)),
    preco(11, 1, 2, 12, diasAtras(4)),
    preco(12, 2, 1, 6, diasAtras(7)),
    preco(13, 2, 2, 7, diasAtras(10)),
  ];
  d.cupons = [cupom(1, 1, "2026-12-31T12:00:00Z"), cupom(2, 1, "2026-11-01T12:00:00Z")];
  d.reportes = [
    { id: 5, precoId: 10, userId: "u1", comentario: "caro", medicamento: "Novalgina", farmacia: "F1", valor: 10, criadoEm: diasAtras(1), resolvido: false },
    { id: 6, precoId: 11, userId: "u1", comentario: "", medicamento: "Novalgina", farmacia: "F2", valor: 12, criadoEm: diasAtras(2), resolvido: true },
  ];
  return d;
}

describe("montarPainel", () => {
  it("é exclusivo do administrador", async () => {
    // Arrange
    const painel = montarPainel(criarFakes(cenario()));
    // Act
    const acao = painel(usuarioComum, hoje);
    // Assert
    await expect(acao).rejects.toBeInstanceOf(ProibidoError);
  });

  it("calcula os totais do catálogo, preços, farmácias, cupons e reportes", async () => {
    // Arrange
    const painel = montarPainel(criarFakes(cenario()));
    // Act
    const p = await painel(admin, hoje);
    // Assert
    expect(p.totais).toMatchObject({
      medicamentos: 3, comFoto: 1, semPreco: 1, precos: 4, precosDesatualizados: 1, precosAtualizadosPct: 75,
      farmacias: 2, parceiras: 1, cuponsVigentes: 1, cuponsVencidos: 1, reportesAbertos: 1,
    });
  });

  it("agrupa os preços por idade e marca a faixa desatualizada", async () => {
    // Arrange
    const painel = montarPainel(criarFakes(cenario()));
    // Act
    const p = await painel(admin, hoje);
    // Assert
    expect(p.idadePrecos.map((f) => f.qtd)).toEqual([1, 1, 1, 1]);
    expect(p.idadePrecos[3]).toMatchObject({ faixa: "Mais de 7 dias", alerta: true });
  });

  it("mede a cobertura de cada farmácia sobre o catálogo", async () => {
    // Arrange
    const painel = montarPainel(criarFakes(cenario()));
    // Act
    const p = await painel(admin, hoje);
    // Assert
    expect(p.coberturaFarmacias[0]).toMatchObject({ qtd: 2, pct: 67 });
  });

  it("lista o que precisa de atenção: sem preço, preços antigos e reportes abertos", async () => {
    // Arrange
    const painel = montarPainel(criarFakes(cenario()));
    // Act
    const p = await painel(admin, hoje);
    // Assert
    expect(p.semPreco.map((m) => m.id)).toEqual([3]);
    expect(p.maisAntigos[0]).toMatchObject({ precoId: 13, dias: 10 });
    expect(p.reportesAbertos.map((r) => r.id)).toEqual([5]);
  });
});
