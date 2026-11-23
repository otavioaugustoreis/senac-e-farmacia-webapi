update public.precos
set atualizado_em = now() - make_interval(days => ((medicamento_id + farmacia_id) % 6)::int, hours => (farmacia_id % 5)::int);

update public.precos set atualizado_em = now() - interval '10 days'
where medicamento_id = 1 and farmacia_id = 1;

update public.cupons c set validade = (now() at time zone 'America/Sao_Paulo')::date + v.dias
from (values ('BEMESTAR10', 30), ('AUGUSTA5', 20), ('JARDINS15', 45), ('PINHEIROS8', 60), ('FREIRE12', 15), ('VISTA20', -3))
  as v(codigo, dias)
where c.codigo = v.codigo;

select 'dados de demonstração renovados' as resultado;
