import type { Bula } from "@/domain/bula";
import type { Cupom } from "@/domain/cupom";
import type { Farmacia, FarmaciaProxima } from "@/domain/farmacia";
import type { Categoria, Medicamento, ResultadoBusca, TipoMedicamento } from "@/domain/medicamento";
import type { Preco } from "@/domain/preco";
import type { ReportePreco } from "@/domain/reporte";

export interface MedicamentoInput {
  id?: number;
  nomeComercial: string;
  principioAtivo: string;
  categoriaId: number | null;
  tipo: TipoMedicamento;
  fabricante: string;
  apresentacao: string;
  imagemUrl?: string | null;
  imagemCredito?: string | null;
  imagemFonte?: string | null;
}

export type BulaInput = Omit<Bula, "medicamentoId">;

export interface FarmaciaInput {
  id?: number;
  nome: string;
  endereco: string;
  telefone: string | null;
  parceira: boolean;
  lat: number;
  lng: number;
}

export interface PrecoInput {
  id?: number;
  medicamentoId: number;
  farmaciaId: number;
  valor: number;
}

export interface CupomInput {
  id?: number;
  farmaciaId: number;
  codigo: string;
  descricao: string;
  desconto: string;
  validade: Date;
}

export interface CategoriaInput {
  id?: number;
  nome: string;
}

export type PrecoComMedicamento = Preco & { medicamento: string };

export interface MedicamentoRepository {
  /** Busca por nome comercial ou princípio ativo (sem acento/maiúsculas). `q` vazio = todos. */
  buscar(q: string, categoriaId?: number): Promise<ResultadoBusca[]>;
  obterPorId(id: number): Promise<Medicamento | null>;
  listarPorPrincipioAtivo(principioAtivo: string): Promise<ResultadoBusca[]>;
  salvar(m: MedicamentoInput): Promise<number>;
  excluir(id: number): Promise<void>;
}

export interface BulaRepository {
  obter(medicamentoId: number): Promise<Bula | null>;
  salvar(b: Bula): Promise<void>;
}

export interface PrecoRepository {
  listarPorMedicamento(medicamentoId: number): Promise<Preco[]>;
  listarTodos(): Promise<PrecoComMedicamento[]>;
  salvar(p: PrecoInput): Promise<void>;
  excluir(id: number): Promise<void>;
}

export interface FarmaciaRepository {
  proximas(lat: number, lng: number, raioKm: number): Promise<FarmaciaProxima[]>;
  listar(): Promise<Farmacia[]>;
  salvar(f: FarmaciaInput): Promise<void>;
  excluir(id: number): Promise<void>;
}

export interface CupomRepository {
  listar(): Promise<Cupom[]>;
  salvar(c: CupomInput): Promise<void>;
  excluir(id: number): Promise<void>;
}

export interface CategoriaRepository {
  listar(): Promise<Categoria[]>;
  salvar(c: CategoriaInput): Promise<void>;
  excluir(id: number): Promise<void>;
}

export interface ReporteRepository {
  criar(r: { precoId: number; userId: string; comentario: string }): Promise<void>;
  listar(): Promise<ReportePreco[]>;
  resolver(id: number): Promise<void>;
}

export interface Repositorios {
  medicamentos: MedicamentoRepository;
  bulas: BulaRepository;
  precos: PrecoRepository;
  farmacias: FarmaciaRepository;
  cupons: CupomRepository;
  categorias: CategoriaRepository;
  reportes: ReporteRepository;
}
