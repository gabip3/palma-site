/* ===== ONDE ENCONTRAR PALMA =====

   Lista da rede Dona, 20 lojas no Distrito Federal, entregue pela Palma em
   23/09/2026 na planilha "ENDEREÇO LOJAS DONA.xlsx".

   O que eu mexi na planilha, e só isso: tirei a coluna de número do pedido,
   que é interna; troquei as abreviações do sistema pelo que se lê ("Loja 01 a
   30-01/30" virou "Lojas 01 a 30", "-S/N" saiu); e limpei o campo de bairro,
   que vinha com o nome administrativo inteiro ("Setor Industrial (Taguatinga)"
   virou "Taguatinga"). Nenhum endereço foi inventado ou completado.

   PENDENTE: o CEP da loja da 306 Asa Norte veio 70000-001 na planilha, que é
   um CEP genérico de Brasília e não o da quadra. Conferir com a Palma. Até lá
   a loja aparece na busca por bairro e por nome, mas não por CEP.

   PENDENTE: são só as lojas Dona. Se a Palma estiver em outra rede, é só
   acrescentar aqui no mesmo formato, que a busca e a página acompanham.

   Formato de cada lugar (lat e lng são opcionais; com elas dá para desenhar
   um mapa no painel). */

export const ONDE_ENCONTRAR = [
  { nome: 'Dona Guará II', endereco: 'Área QE 30, Bloco A, Lojas 01 a 30',
    bairro: 'Guará II', cidade: 'Brasília', uf: 'DF', cep: '71065610' },

  { nome: 'Dona Candangolândia', endereco: 'Quadra QR 5, Módulo Único 05',
    bairro: 'Candangolândia', cidade: 'Brasília', uf: 'DF', cep: '71725500' },

  { nome: 'Dona Sobradinho', endereco: 'Quadra 6, Comércio Local 5, Lojas 01 e 02',
    bairro: 'Sobradinho', cidade: 'Brasília', uf: 'DF', cep: '73026515' },

  { nome: 'Dona Águas Claras 1', endereco: 'Rua 7, Lote 04, Lojas 01 a 03',
    bairro: 'Águas Claras', cidade: 'Brasília', uf: 'DF', cep: '71938000' },

  { nome: 'Dona Sudoeste', endereco: 'CLSW 104, Bloco C, Lojas 01 a 55',
    bairro: 'Sudoeste', cidade: 'Brasília', uf: 'DF', cep: '70670533' },

  { nome: 'Dona 213 Asa Norte', endereco: 'CLN 213, Bloco D, Lojas 02 a 30',
    bairro: 'Asa Norte', cidade: 'Brasília', uf: 'DF', cep: '70872540' },

  { nome: 'Dona Arniqueiras', endereco: 'SHA, Conjunto 4, Chácara 75, Loja 02',
    bairro: 'Arniqueiras', cidade: 'Brasília', uf: 'DF', cep: '71994425' },

  { nome: 'Dona 306 Asa Norte', endereco: 'CLN 306, Bloco B, Loja 9',
    bairro: 'Asa Norte', cidade: 'Brasília', uf: 'DF', cep: '' },

  { nome: 'Dona 506 Asa Norte', endereco: 'SEPN 506, Bloco A, Lojas 1 a 4',
    bairro: 'Asa Norte', cidade: 'Brasília', uf: 'DF', cep: '70740501' },

  { nome: 'Dona Águas Claras 2', endereco: 'Rua das Pitangueiras',
    bairro: 'Águas Claras', cidade: 'Brasília', uf: 'DF', cep: '71938540' },

  { nome: 'Dona Taguatinga', endereco: 'Quadra QI 8, Lote 1A, Loja 16',
    bairro: 'Taguatinga', cidade: 'Brasília', uf: 'DF', cep: '72135080' },

  { nome: 'Dona 111 Asa Norte', endereco: 'CLN 111, Bloco D',
    bairro: 'Asa Norte', cidade: 'Brasília', uf: 'DF', cep: '70754540' },

  { nome: 'Dona 216 Asa Norte', endereco: 'SQN 216, Bloco C',
    bairro: 'Asa Norte', cidade: 'Brasília', uf: 'DF', cep: '70875030' },

  { nome: 'Dona 303 Asa Norte', endereco: 'SQN 303, Bloco B, Loja 66',
    bairro: 'Asa Norte', cidade: 'Brasília', uf: 'DF', cep: '70735020' },

  { nome: 'Dona QI 15 Lago Sul', endereco: 'SHIS QI 15, Lote G',
    bairro: 'Lago Sul', cidade: 'Brasília', uf: 'DF', cep: '71635606' },

  { nome: 'Dona Vicente Pires', endereco: 'Rua 12, Chácara 129A, Conjunto A, Lojas 2 a 4',
    bairro: 'Vicente Pires', cidade: 'Brasília', uf: 'DF', cep: '72007750' },

  { nome: 'Dona Condomínio Solar', endereco: 'Condomínio Solar de Brasília',
    bairro: 'Jardim Botânico', cidade: 'Brasília', uf: 'DF', cep: '71680349' },

  { nome: 'Dona Jardim Botânico', endereco: 'QI 23, DF-001, Km 23,5',
    bairro: 'Jardim Botânico', cidade: 'Brasília', uf: 'DF', cep: '71679650' },

  { nome: 'Dona 502 Asa Sul', endereco: 'EQS 502/503',
    bairro: 'Asa Sul', cidade: 'Brasília', uf: 'DF', cep: '70330550' },

  { nome: 'Dona Park Sul', endereco: 'SGCV',
    bairro: 'Park Sul', cidade: 'Brasília', uf: 'DF', cep: '71215100' },
];
