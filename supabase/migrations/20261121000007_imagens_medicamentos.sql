-- Fotos reais com licença livre (Wikimedia Commons), com crédito obrigatório.
-- Imagens ilustrativas: podem não corresponder exatamente à embalagem vendida no Brasil.
alter table public.medicamentos
  add column imagem_url text check (imagem_url is null or imagem_url like 'https://%'),
  add column imagem_credito text,
  add column imagem_fonte text;

drop function public.buscar_medicamentos(text, bigint);
create function public.buscar_medicamentos(q text default '', categoria_filtro bigint default null)
returns table (
  id bigint, nome_comercial text, principio_ativo text, tipo public.tipo_medicamento,
  categoria_id bigint, categoria text, fabricante text, apresentacao text, menor_preco numeric,
  imagem_url text, imagem_credito text, imagem_fonte text
)
language sql stable set search_path = '' as $$
  select m.id, m.nome_comercial, m.principio_ativo, m.tipo, m.categoria_id, c.nome,
         m.fabricante, m.apresentacao,
         (select min(p.valor) from public.precos p where p.medicamento_id = m.id),
         m.imagem_url, m.imagem_credito, m.imagem_fonte
  from public.medicamentos m
  left join public.categorias c on c.id = m.categoria_id
  where (coalesce(trim(q), '') = ''
         or extensions.unaccent(m.nome_comercial) ilike '%' || extensions.unaccent(trim(q)) || '%'
         or extensions.unaccent(m.principio_ativo) ilike '%' || extensions.unaccent(trim(q)) || '%')
    and (categoria_filtro is null or m.categoria_id = categoria_filtro)
  order by m.nome_comercial;
$$;
grant execute on function public.buscar_medicamentos(text, bigint) to anon, authenticated, service_role;

update public.medicamentos m
set imagem_url = v.url, imagem_credito = v.credito, imagem_fonte = v.fonte
from (values
  (4, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Tylenol_Pills_%2815213405761%29.jpg/960px-Tylenol_Pills_%2815213405761%29.jpg', 'Foto: Austin Kirk · CC BY 2.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Tylenol_Pills_(15213405761).jpg'),
  (5, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Paracetamol_650.jpg/960px-Paracetamol_650.jpg', 'Foto: Dineshkumar Nallaveerappan · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Paracetamol_650.jpg'),
  (6, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Advil_tablets_on_a_white_background.jpg/960px-Advil_tablets_on_a_white_background.jpg', 'Foto: Curpharar · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Advil_tablets_on_a_white_background.jpg'),
  (7, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Pile_of_200mg_generic_Ibuprofen_tablets.jpg/960px-Pile_of_200mg_generic_Ibuprofen_tablets.jpg', 'Foto: Derrick Coetzee (User:Dcoetzee) · CC0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Pile_of_200mg_generic_Ibuprofen_tablets.jpg'),
  (8, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Ibuprofen_tablets_in_palm_of_hand.jpg/960px-Ibuprofen_tablets_in_palm_of_hand.jpg', 'Foto: Derrick Coetzee (User:Dcoetzee) · CC0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Ibuprofen_tablets_in_palm_of_hand.jpg'),
  (9, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Diclofenac_l%C3%A9%C4%8Div%C3%A9_p%C5%99%C3%ADpravky_2.JPG/960px-Diclofenac_l%C3%A9%C4%8Div%C3%A9_p%C5%99%C3%ADpravky_2.JPG', 'Foto: Irib · CC0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Diclofenac_l%C3%A9%C4%8Div%C3%A9_p%C5%99%C3%ADpravky_2.JPG'),
  (10, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Diclofenac_Natrium_50mg_Aurobindo.jpg/960px-Diclofenac_Natrium_50mg_Aurobindo.jpg', 'Foto: Bluberryman · CC BY 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Diclofenac_Natrium_50mg_Aurobindo.jpg'),
  (11, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Medication_amoxycillin_capsule.JPG/960px-Medication_amoxycillin_capsule.JPG', 'Foto: Mk2010 · CC BY-SA 3.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Medication_amoxycillin_capsule.JPG'),
  (12, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Amoxicillin_500mg_capsules_on_a_plate_%28Sandoz%29.jpg/960px-Amoxicillin_500mg_capsules_on_a_plate_%28Sandoz%29.jpg', 'Foto: Henrysz · CC BY 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Amoxicillin_500mg_capsules_on_a_plate_(Sandoz).jpg'),
  (13, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Zithromax_%28Azithromycin%29_tablets.jpg/960px-Zithromax_%28Azithromycin%29_tablets.jpg', 'Foto: Anonymous1941 · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Zithromax_(Azithromycin)_tablets.jpg'),
  (14, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/Azithromycin_250mg.jpg/960px-Azithromycin_250mg.jpg', 'Foto: Kristoferb · CC BY-SA 3.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Azithromycin_250mg.jpg'),
  (15, 'https://upload.wikimedia.org/wikipedia/commons/c/cd/000771lg_Cozaar_100_MG_Oral_Tablet.jpg', 'Foto: Unknown NLM photographer · Public domain · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:000771lg_Cozaar_100_MG_Oral_Tablet.jpg'),
  (16, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Losartan_potassium1.jpg/960px-Losartan_potassium1.jpg', 'Foto: Autor não identificado · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Losartan_potassium1.jpg'),
  (17, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Losartan_potassium1.jpg/960px-Losartan_potassium1.jpg', 'Foto: Autor não identificado · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Losartan_potassium1.jpg'),
  (18, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Amlodipine.jpg/960px-Amlodipine.jpg', 'Foto: Hanabishi · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Amlodipine.jpg'),
  (19, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Amlodipine.jpg/960px-Amlodipine.jpg', 'Foto: Hanabishi · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Amlodipine.jpg'),
  (20, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Omeprazole_20mg.jpg/960px-Omeprazole_20mg.jpg', 'Foto: Siufaiho · Public domain · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Omeprazole_20mg.jpg'),
  (21, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Omeprazole_10mg_UK.jpg/960px-Omeprazole_10mg_UK.jpg', 'Foto: Siufaiho · Public domain · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Omeprazole_10mg_UK.jpg'),
  (22, 'https://upload.wikimedia.org/wikipedia/commons/5/56/%E3%82%AF%E3%83%A9%E3%83%AA%E3%83%81%E3%83%B3.jpg', 'Foto: 深志 · CC BY-SA 3.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:%E3%82%AF%E3%83%A9%E3%83%AA%E3%83%81%E3%83%B3.jpg'),
  (23, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Comprimidos_de_Loratadina.jpg/960px-Comprimidos_de_Loratadina.jpg', 'Foto: LordQlbert · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Comprimidos_de_Loratadina.jpg'),
  (24, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Metformin.jpg/960px-Metformin.jpg', 'Foto: LifeofaDiabetic#6 · CC BY 2.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Metformin.jpg'),
  (25, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Metformin_500mg_Tablets.jpg/960px-Metformin_500mg_Tablets.jpg', 'Foto: User:Ash · Public domain · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:Metformin_500mg_Tablets.jpg'),
  (26, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/2023_Ibuvit_D3_4000_IU.jpg/960px-2023_Ibuvit_D3_4000_IU.jpg', 'Foto: Jacek Halicki · CC BY-SA 4.0 · Wikimedia Commons', 'https://commons.wikimedia.org/wiki/File:2023_Ibuvit_D3_4000_IU.jpg')
) as v(id, url, credito, fonte)
where m.id = v.id;
