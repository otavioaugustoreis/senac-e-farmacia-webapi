-- E-Farmácia: dados de demonstração.
-- Farmácias, preços e cupons são FICTÍCIOS. Bulas são resumos gerais, sem dosagem,
-- e apontam para o Bulário Eletrônico da Anvisa.

insert into public.categorias (id, nome) values
  (1, 'Analgésicos e antitérmicos'),
  (2, 'Anti-inflamatórios'),
  (3, 'Antibióticos'),
  (4, 'Anti-hipertensivos'),
  (5, 'Gastrointestinais'),
  (6, 'Antialérgicos'),
  (7, 'Diabetes'),
  (8, 'Vitaminas');

insert into public.medicamentos (id, nome_comercial, principio_ativo, categoria_id, tipo, fabricante, apresentacao) values
  (1,  'Novalgina',                        'Dipirona Monoidratada',    1, 'referencia', 'Sanofi',          '500 mg, 10 comprimidos'),
  (2,  'Dipirona Monoidratada EMS',        'Dipirona Monoidratada',    1, 'generico',   'EMS',             '500 mg, 10 comprimidos'),
  (3,  'Dipirona Monoidratada Medley',     'Dipirona Monoidratada',    1, 'generico',   'Medley',          '500 mg, 10 comprimidos'),
  (4,  'Tylenol',                          'Paracetamol',              1, 'referencia', 'Kenvue',          '750 mg, 20 comprimidos'),
  (5,  'Paracetamol EMS',                  'Paracetamol',              1, 'generico',   'EMS',             '750 mg, 20 comprimidos'),
  (6,  'Advil',                            'Ibuprofeno',               2, 'referencia', 'Haleon',          '400 mg, 8 cápsulas'),
  (7,  'Ibuprofeno Prati-Donaduzzi',       'Ibuprofeno',               2, 'generico',   'Prati-Donaduzzi', '400 mg, 10 cápsulas'),
  (8,  'Alivium',                          'Ibuprofeno',               2, 'similar',    'Mantecorp',       '400 mg, 10 cápsulas'),
  (9,  'Cataflam',                         'Diclofenaco Potássico',    2, 'referencia', 'Novartis',        '50 mg, 10 comprimidos'),
  (10, 'Diclofenaco Potássico Medley',     'Diclofenaco Potássico',    2, 'generico',   'Medley',          '50 mg, 10 comprimidos'),
  (11, 'Amoxil',                           'Amoxicilina',              3, 'referencia', 'GSK',             '500 mg, 21 cápsulas'),
  (12, 'Amoxicilina EMS',                  'Amoxicilina',              3, 'generico',   'EMS',             '500 mg, 21 cápsulas'),
  (13, 'Zitromax',                         'Azitromicina',             3, 'referencia', 'Pfizer',          '500 mg, 3 comprimidos'),
  (14, 'Azitromicina Eurofarma',           'Azitromicina',             3, 'generico',   'Eurofarma',       '500 mg, 3 comprimidos'),
  (15, 'Cozaar',                           'Losartana Potássica',      4, 'referencia', 'Organon',         '50 mg, 30 comprimidos'),
  (16, 'Losartana Potássica EMS',          'Losartana Potássica',      4, 'generico',   'EMS',             '50 mg, 30 comprimidos'),
  (17, 'Aradois',                          'Losartana Potássica',      4, 'similar',    'Biolab',          '50 mg, 30 comprimidos'),
  (18, 'Norvasc',                          'Besilato de Anlodipino',   4, 'referencia', 'Viatris',         '5 mg, 30 comprimidos'),
  (19, 'Besilato de Anlodipino Medley',    'Besilato de Anlodipino',   4, 'generico',   'Medley',          '5 mg, 30 comprimidos'),
  (20, 'Losec',                            'Omeprazol',                5, 'referencia', 'AstraZeneca',     '20 mg, 28 cápsulas'),
  (21, 'Omeprazol EMS',                    'Omeprazol',                5, 'generico',   'EMS',             '20 mg, 28 cápsulas'),
  (22, 'Claritin',                         'Loratadina',               6, 'referencia', 'Bayer',           '10 mg, 12 comprimidos'),
  (23, 'Loratadina Neo Química',           'Loratadina',               6, 'generico',   'Neo Química',     '10 mg, 12 comprimidos'),
  (24, 'Glifage',                          'Cloridrato de Metformina', 7, 'referencia', 'Merck',           '850 mg, 30 comprimidos'),
  (25, 'Cloridrato de Metformina EMS',     'Cloridrato de Metformina', 7, 'generico',   'EMS',             '850 mg, 30 comprimidos'),
  (26, 'Addera D3',                        'Colecalciferol',           8, 'referencia', 'Mantecorp',       '1.000 UI, 30 comprimidos');

-- Bulas: um resumo por princípio ativo (sem dosagem)
with textos (principio, serve, contra, efeitos, advert) as (values
  ('Dipirona Monoidratada',
   'Analgésico e antitérmico, indicado para dor e febre.',
   'Alergia à dipirona ou a outras pirazolonas; algumas doenças do sangue e da medula óssea; deficiência de G6PD; porfiria; último trimestre da gravidez.',
   'Reações alérgicas na pele e queda de pressão. Raramente, alterações no sangue (agranulocitose).',
   'Procure atendimento se surgir febre persistente, dor de garganta ou feridas na boca durante o uso.'),
  ('Paracetamol',
   'Alívio de dores leves a moderadas e redução da febre.',
   'Alergia ao paracetamol; doença grave do fígado.',
   'Raros; podem ocorrer reações alérgicas na pele.',
   'Não use junto com outros medicamentos que contenham paracetamol. Uso acima do recomendado e consumo de álcool aumentam o risco de lesão no fígado.'),
  ('Ibuprofeno',
   'Anti-inflamatório para dor, febre e inflamação.',
   'Alergia ao ibuprofeno, ao ácido acetilsalicílico ou a outros anti-inflamatórios; úlcera ou sangramento gastrointestinal; insuficiência grave do coração, dos rins ou do fígado; último trimestre da gravidez.',
   'Dor de estômago, náusea, azia e tontura.',
   'Pode aumentar o risco de problemas cardiovasculares e gastrointestinais. Converse com o médico se tiver pressão alta ou doença renal.'),
  ('Diclofenaco Potássico',
   'Anti-inflamatório para dores e inflamações, como dor muscular, dor nas costas e cólica menstrual.',
   'Alergia ao diclofenaco, ao ácido acetilsalicílico ou a outros anti-inflamatórios; úlcera ou sangramento gastrointestinal; insuficiência grave do coração, dos rins ou do fígado; último trimestre da gravidez.',
   'Dor de estômago, náusea, diarreia, dor de cabeça e tontura.',
   'Pode aumentar o risco de problemas cardiovasculares e gastrointestinais. Evite o uso prolongado sem acompanhamento.'),
  ('Amoxicilina',
   'Antibiótico para infecções bacterianas, como algumas infecções de garganta, ouvido, sinusite e vias urinárias.',
   'Alergia a penicilinas ou a cefalosporinas.',
   'Diarreia, náusea e manchas na pele.',
   'Venda sob prescrição médica, com retenção da receita. Use pelo tempo indicado pelo médico, mesmo que os sintomas melhorem.'),
  ('Azitromicina',
   'Antibiótico para infecções respiratórias, de pele e algumas infecções sexualmente transmissíveis.',
   'Alergia à azitromicina, à eritromicina ou a outros macrolídeos.',
   'Diarreia, náusea e dor abdominal.',
   'Venda sob prescrição médica, com retenção da receita. Informe o médico se tiver problemas no coração ou no fígado.'),
  ('Losartana Potássica',
   'Tratamento da pressão alta e proteção dos rins em alguns pacientes com diabetes tipo 2.',
   'Alergia à losartana; gravidez; uso junto com alisquireno em pessoas com diabetes.',
   'Tontura, cansaço e aumento do potássio no sangue.',
   'Não interrompa o tratamento sem orientação médica. Pode causar tontura ao levantar.'),
  ('Besilato de Anlodipino',
   'Tratamento da pressão alta e da angina.',
   'Alergia ao anlodipino ou a outras di-hidropiridinas; pressão muito baixa; choque.',
   'Inchaço nos tornozelos, dor de cabeça, vermelhidão no rosto e palpitações.',
   'Não interrompa o tratamento sem orientação médica.'),
  ('Omeprazol',
   'Reduz a acidez do estômago; usado em azia, refluxo, gastrite e úlceras.',
   'Alergia ao omeprazol ou a outros benzimidazóis; uso junto com nelfinavir.',
   'Dor de cabeça, diarreia, náusea e gases.',
   'O uso prolongado deve ser acompanhado pelo médico.'),
  ('Loratadina',
   'Antialérgico para rinite alérgica e urticária.',
   'Alergia à loratadina.',
   'Dor de cabeça, sonolência leve e boca seca.',
   'Informe o médico em caso de doença grave do fígado.'),
  ('Cloridrato de Metformina',
   'Controle da glicose no diabetes tipo 2.',
   'Alergia à metformina; insuficiência renal grave; acidose metabólica; situações com falta de oxigenação dos tecidos.',
   'Náusea, diarreia, dor abdominal e gosto metálico na boca.',
   'Pode precisar ser suspensa antes de exames com contraste. Evite o consumo excessivo de álcool.'),
  ('Colecalciferol',
   'Suplementação e tratamento da deficiência de vitamina D.',
   'Excesso de vitamina D ou de cálcio no sangue; alergia ao colecalciferol.',
   'Raros nas doses habituais; em excesso, náusea, sede intensa e fraqueza.',
   'Doses altas por conta própria podem causar intoxicação. Use conforme orientação profissional.')
)
insert into public.bulas (medicamento_id, para_que_serve, contraindicacoes, efeitos_colaterais, advertencias)
select m.id, t.serve, t.contra, t.efeitos, t.advert
from public.medicamentos m
join textos t on t.principio = m.principio_ativo;

-- Farmácias fictícias na região da Av. Paulista / Pinheiros
insert into public.farmacias (id, nome, endereco, telefone, parceira, localizacao) values
  (1,  'Farmácia Bem-Estar Paulista', 'Av. Paulista, 1000 — Bela Vista',          '(11) 3000-0001', true,  extensions.st_setsrid(extensions.st_makepoint(-46.6527, -23.5646), 4326)::extensions.geography),
  (2,  'Drogaria Saúde Augusta',      'R. Augusta, 1500 — Consolação',            '(11) 3000-0002', true,  extensions.st_setsrid(extensions.st_makepoint(-46.6604, -23.5578), 4326)::extensions.geography),
  (3,  'Farmácia Vida Consolação',    'R. da Consolação, 2200 — Consolação',      '(11) 3000-0003', false, extensions.st_setsrid(extensions.st_makepoint(-46.6590, -23.5530), 4326)::extensions.geography),
  (4,  'Drogaria Popular Jardins',    'Al. Santos, 1800 — Jardim Paulista',       '(11) 3000-0004', true,  extensions.st_setsrid(extensions.st_makepoint(-46.6560, -23.5672), 4326)::extensions.geography),
  (5,  'Farmácia Pinheiros Saúde',    'R. dos Pinheiros, 800 — Pinheiros',        '(11) 3000-0005', true,  extensions.st_setsrid(extensions.st_makepoint(-46.6870, -23.5660), 4326)::extensions.geography),
  (6,  'Drogaria Teodoro',            'R. Teodoro Sampaio, 1200 — Pinheiros',     '(11) 3000-0006', false, extensions.st_setsrid(extensions.st_makepoint(-46.6800, -23.5600), 4326)::extensions.geography),
  (7,  'Farmácia Oscar Freire',       'R. Oscar Freire, 900 — Jardim Paulista',   '(11) 3000-0007', true,  extensions.st_setsrid(extensions.st_makepoint(-46.6690, -23.5640), 4326)::extensions.geography),
  (8,  'Drogaria Rebouças',           'Av. Rebouças, 1500 — Pinheiros',           '(11) 3000-0008', false, extensions.st_setsrid(extensions.st_makepoint(-46.6750, -23.5655), 4326)::extensions.geography),
  (9,  'Farmácia Bela Vista',         'R. Treze de Maio, 600 — Bela Vista',       '(11) 3000-0009', true,  extensions.st_setsrid(extensions.st_makepoint(-46.6440, -23.5620), 4326)::extensions.geography),
  (10, 'Drogaria Frei Caneca',        'R. Frei Caneca, 700 — Consolação',         '(11) 3000-0010', false, extensions.st_setsrid(extensions.st_makepoint(-46.6530, -23.5540), 4326)::extensions.geography);

-- Preços fictícios: preço-base por medicamento variando por farmácia; ~2/3 dos pares.
-- O medicamento 26 fica sem preço de propósito.
with base (medicamento_id, valor) as (values
  (1, 18.90), (2, 9.50), (3, 8.90), (4, 24.90), (5, 11.90), (6, 22.50), (7, 12.90), (8, 19.90),
  (9, 39.90), (10, 16.90), (11, 49.90), (12, 24.90), (13, 59.90), (14, 27.90), (15, 79.90),
  (16, 19.90), (17, 39.90), (18, 89.90), (19, 22.90), (20, 99.90), (21, 21.90), (22, 34.90),
  (23, 12.90), (24, 19.90), (25, 9.90)
)
insert into public.precos (medicamento_id, farmacia_id, valor, atualizado_em)
select b.medicamento_id, f.id,
       round(b.valor * (0.90 + ((b.medicamento_id * 7 + f.id * 13) % 25) / 100.0), 2),
       now() - make_interval(days => ((b.medicamento_id + f.id) % 6)::int, hours => (f.id % 5)::int)
from base b
cross join public.farmacias f
where (b.medicamento_id + f.id) % 3 <> 0;

-- Um preço antigo para demonstrar o selo "desatualizado"
update public.precos set atualizado_em = now() - interval '10 days'
where medicamento_id = 1 and farmacia_id = 1;

insert into public.cupons (farmacia_id, codigo, descricao, desconto, validade) values
  (1, 'BEMESTAR10', '10% de desconto em medicamentos genéricos',          '10%',  current_date + 30),
  (2, 'AUGUSTA5',   'R$ 5 de desconto em compras acima de R$ 50',          'R$ 5', current_date + 20),
  (4, 'JARDINS15',  '15% de desconto na primeira compra',                  '15%',  current_date + 45),
  (5, 'PINHEIROS8', '8% de desconto em medicamentos de uso contínuo',      '8%',   current_date + 60),
  (7, 'FREIRE12',   '12% de desconto em antialérgicos',                    '12%',  current_date + 15),
  (9, 'VISTA20',    '20% de desconto em vitaminas',                        '20%',  current_date - 3);

-- Sequências continuam depois dos ids fixos
select setval(pg_get_serial_sequence('public.categorias', 'id'), (select max(id) from public.categorias));
select setval(pg_get_serial_sequence('public.medicamentos', 'id'), (select max(id) from public.medicamentos));
select setval(pg_get_serial_sequence('public.farmacias', 'id'), (select max(id) from public.farmacias));
