-- Verificação do banco (rodar após as migrações). Falha com exceção se algo estiver errado.
-- Uso: npx supabase db query --remote -f supabase/tests/verificacao.sql
begin;

do $$
declare
  n int;
  total int;
  d1 numeric;
  d2 numeric;
begin
  select count(*) into n from public.buscar_medicamentos('DIPIRONA');
  if n < 2 then raise exception 'busca DIPIRONA deveria trazer >= 2, trouxe %', n; end if;

  select count(*) into n from public.buscar_medicamentos('losartana');
  if n < 1 then raise exception 'busca losartana (princípio ativo) não trouxe resultado'; end if;

  select count(*) into total from public.medicamentos;
  select count(*) into n from public.buscar_medicamentos('   ');
  if n <> total then raise exception 'busca vazia deveria trazer todos (%), trouxe %', total, n; end if;

  select count(*) into n from public.buscar_medicamentos('', (select id from public.categorias order by id limit 1));
  if n < 1 then raise exception 'filtro por categoria não trouxe resultado'; end if;

  select count(*) into n from public.farmacias_proximas(-23.5614, -46.6559);
  if n < 1 then raise exception 'farmacias_proximas não trouxe resultado'; end if;

  select distancia_km into d1 from public.farmacias_proximas(-23.5614, -46.6559) limit 1;
  select max(distancia_km) into d2 from public.farmacias_proximas(-23.5614, -46.6559);
  if d1 > d2 then raise exception 'farmacias_proximas não está ordenada por distância'; end if;

  select count(*) into n from public.medicamentos m where not exists (select 1 from public.precos p where p.medicamento_id = m.id);
  if n < 1 then raise exception 'seed deveria ter ao menos 1 medicamento sem preço'; end if;

  select count(*) into n from public.precos where atualizado_em < now() - interval '7 days';
  if n < 1 then raise exception 'seed deveria ter ao menos 1 preço desatualizado (> 7 dias)'; end if;

  select count(*) into n from public.bulas;
  if n <> total then raise exception 'cada medicamento deveria ter bula (% bulas para % medicamentos)', n, total; end if;
end $$;

-- Salvar um preço (mesmo sem mudar o valor) confirma o preço e renova a data;
-- definir a data explicitamente (seed/scripts) é respeitado.
do $$
declare
  alvo bigint;
  data_salva timestamptz;
begin
  select id into alvo from public.precos order by atualizado_em limit 1;
  update public.precos set valor = valor where id = alvo;
  select atualizado_em into data_salva from public.precos where id = alvo;
  if data_salva <> now() then raise exception 'salvar preço sem mudar valor deveria renovar atualizado_em'; end if;

  update public.precos set atualizado_em = now() - interval '3 days' where id = alvo;
  select atualizado_em into data_salva from public.precos where id = alvo;
  if data_salva <> now() - interval '3 days' then raise exception 'data explícita deveria ser respeitada'; end if;
end $$;

-- RLS: usuário autenticado comum não escreve no catálogo
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';
do $$
begin
  begin
    insert into public.categorias (nome) values ('teste-rls');
    raise exception 'RLS falhou: usuário comum inseriu categoria';
  exception when insufficient_privilege then
    -- esperado: barrado pela RLS (não por falta de GRANT)
    if sqlerrm not like '%row-level security%' then
      raise exception 'insert barrado por motivo inesperado: %', sqlerrm;
    end if;
  end;
end $$;

-- RLS: anônimo lê o catálogo
reset role;
set local role anon;
do $$
declare n int;
begin
  select count(*) into n from public.medicamentos;
  if n < 1 then raise exception 'anon deveria ler medicamentos'; end if;
end $$;

rollback;
select 'verificacao ok' as resultado;
