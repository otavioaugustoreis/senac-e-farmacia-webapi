-- Permissões explícitas para a API (o projeto não concede acesso às tabelas por padrão).
-- A RLS continua decidindo quais linhas cada papel pode ler ou alterar.

grant usage on schema public to anon, authenticated;
grant usage on schema extensions to anon, authenticated;

grant select on public.categorias, public.medicamentos, public.bulas, public.farmacias,
  public.precos, public.cupons, public.farmacias_view to anon, authenticated;

grant insert, update, delete on public.categorias, public.medicamentos, public.bulas,
  public.farmacias, public.precos, public.cupons to authenticated;

grant select, insert, update, delete on public.reportes_preco to authenticated;
grant select on public.reportes_view to authenticated;
grant select on public.profiles to authenticated;

grant usage, select on all sequences in schema public to authenticated;

grant execute on function public.buscar_medicamentos(text, bigint) to anon, authenticated;
grant execute on function public.farmacias_proximas(float8, float8, float8) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
