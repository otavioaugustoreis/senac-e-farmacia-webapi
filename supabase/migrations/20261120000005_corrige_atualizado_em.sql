-- A data de atualização só é renovada quando o preço muda e ninguém definiu a data explicitamente.
create or replace function public.renovar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.atualizado_em is not distinct from old.atualizado_em
     and (new.valor is distinct from old.valor
          or new.medicamento_id is distinct from old.medicamento_id
          or new.farmacia_id is distinct from old.farmacia_id) then
    new.atualizado_em := now();
  end if;
  return new;
end $$;

-- Reaplica o preço antigo de demonstração (o gatilho anterior o havia sobrescrito)
update public.precos set atualizado_em = now() - interval '10 days'
where medicamento_id = 1 and farmacia_id = 1;
