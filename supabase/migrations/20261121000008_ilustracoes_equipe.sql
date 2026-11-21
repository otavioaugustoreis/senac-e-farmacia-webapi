-- Ilustrações de embalagem da equipe (public/medicamentos), no lugar das fotos externas.
alter table public.medicamentos drop constraint if exists medicamentos_imagem_url_check;
alter table public.medicamentos add constraint medicamentos_imagem_url_check
  check (imagem_url is null or imagem_url like 'https://%' or (imagem_url like '/%' and imagem_url not like '//%'));

update public.medicamentos m
set imagem_url = v.arquivo, imagem_credito = 'Ilustração: equipe E-Farmácia', imagem_fonte = v.arquivo
from (values
  ('Addera D3', '/medicamentos/01-addera-d3.svg'),
  ('Advil', '/medicamentos/02-advil.svg'),
  ('Alivium', '/medicamentos/03-alivium.svg'),
  ('Amoxicilina EMS', '/medicamentos/04-amoxicilina-ems.svg'),
  ('Amoxil', '/medicamentos/05-amoxil.svg'),
  ('Aradois', '/medicamentos/06-aradois.svg'),
  ('Azitromicina Eurofarma', '/medicamentos/07-azitromicina-eurofarma.svg'),
  ('Besilato de Anlodipino Medley', '/medicamentos/08-besilato-de-anlodipino-medley.svg'),
  ('Cataflam', '/medicamentos/09-cataflam.svg'),
  ('Claritin', '/medicamentos/10-claritin.svg'),
  ('Cloridrato de Metformina EMS', '/medicamentos/11-cloridrato-de-metformina-ems.svg'),
  ('Cozaar', '/medicamentos/12-cozaar.svg'),
  ('Diclofenaco Potássico Medley', '/medicamentos/13-diclofenaco-potassico-medley.svg'),
  ('Dipirona Monoidratada EMS', '/medicamentos/14-dipirona-monoidratada-ems.svg'),
  ('Dipirona Monoidratada Medley', '/medicamentos/15-dipirona-monoidratada-medley.svg'),
  ('Glifage', '/medicamentos/16-glifage.svg'),
  ('Ibuprofeno Prati-Donaduzzi', '/medicamentos/17-ibuprofeno-prati-donaduzzi.svg'),
  ('Loratadina Neo Química', '/medicamentos/18-loratadina-neo-quimica.svg'),
  ('Losartana Potássica EMS', '/medicamentos/19-losartana-potassica-ems.svg'),
  ('Losec', '/medicamentos/20-losec.svg'),
  ('Norvasc', '/medicamentos/21-norvasc.svg'),
  ('Novalgina', '/medicamentos/22-novalgina.svg'),
  ('Omeprazol EMS', '/medicamentos/23-omeprazol-ems.svg'),
  ('Paracetamol EMS', '/medicamentos/24-paracetamol-ems.svg'),
  ('Tylenol', '/medicamentos/25-tylenol.svg'),
  ('Zitromax', '/medicamentos/26-zitromax.svg')
) as v(nome, arquivo)
where m.nome_comercial = v.nome;
