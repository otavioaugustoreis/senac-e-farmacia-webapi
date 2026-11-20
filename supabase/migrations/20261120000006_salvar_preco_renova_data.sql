-- Salvar um preço pelo painel confirma que ele está correto: renova a data mesmo sem mudar o valor.
-- Só uma data definida explicitamente (seed/scripts) é mantida.
create or replace function public.renovar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.atualizado_em is not distinct from old.atualizado_em then
    new.atualizado_em := now();
  end if;
  return new;
end $$;
