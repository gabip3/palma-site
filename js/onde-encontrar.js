/* ===== CONTEUDO PENDENTE: onde encontrar Palma =====
   Em 15/09/2026 nenhum material do projeto trazia a lista de lugares onde
   encontrar Palma (mercados, lojas, cidades ou CEPs). Nao preencher com dados
   de exemplo nem com listas antigas de imprensa: so dados confirmados pela
   Palma.

   Formato de cada lugar (lat e lng sao opcionais; com elas da para desenhar
   um mapa no painel):
   {
     nome: 'Nome do lugar',
     endereco: 'Logradouro e numero',
     bairro: 'Bairro',
     cidade: 'Cidade',
     uf: 'UF',
     cep: '00000000',
     lat: 0,
     lng: 0,
   }

   Enquanto a lista estiver vazia, a busca responde com o aviso de conteudo
   pendente (AVISOS.pendente em onde.js) e nao mostra lugar nenhum. */

export const ONDE_ENCONTRAR = [];
