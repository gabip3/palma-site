/* A busca.

   O site é pequeno e inteiro estático: dez páginas, treze produtos e três
   matérias. Não precisa de servidor nenhum. O índice sai do próprio conteúdo
   (ver .preview/tmp/gera-busca.mjs) e a procura acontece aqui no navegador,
   sem pedir nada a ninguém, o que também mantém a Política de Privacidade
   verdadeira quando ela diz que o que você digita não sai do seu aparelho.

   Escreve enquanto digita. O Enter vai para o primeiro resultado. */

import { INDICE } from './busca-indice.js';

const MAX = 7;

/* "Queijo Minas Frescal Zero" e "queijo minas frescal zero" são a mesma coisa,
   e quem digita com pressa não põe acento */
const nu = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function pontos(item, termos) {
  const titulo = nu(item.t);
  const tudo = nu(item.t + ' ' + item.d + ' ' + item.p + ' ' + item.c);
  let total = 0;
  for (const termo of termos) {
    if (!tudo.includes(termo)) return 0; // todos os termos precisam aparecer
    if (titulo.startsWith(termo)) total += 6;
    else if (new RegExp('\\b' + termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(titulo)) total += 4;
    else if (titulo.includes(termo)) total += 3;
    else total += 1;
  }
  /* entre dois empatados, o título mais curto costuma ser o mais certo */
  return total * 100 - titulo.length;
}

export function procurar(texto) {
  const termos = nu(texto).split(/\s+/).filter(Boolean);
  if (!termos.length) return [];
  return INDICE
    .map((item) => ({ item, n: pontos(item, termos) }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, MAX)
    .map((r) => r.item);
}

export function ligarBusca(camada) {
  const form = camada.querySelector('.busca');
  const campo = camada.querySelector('.busca__campo');
  if (!form || !campo || camada.querySelector('.busca__resultados')) return null;

  const saida = document.createElement('div');
  saida.className = 'busca__resultados';
  saida.innerHTML = '<p class="busca__recado" role="status" aria-live="polite"></p><ul class="busca__itens"></ul>';
  form.insertAdjacentElement('afterend', saida);
  const recado = saida.querySelector('.busca__recado');
  const lista = saida.querySelector('.busca__itens');

  const externo = (u) => /^https?:/.test(u);
  let achados = [];

  function desenhar() {
    const texto = campo.value.trim();
    achados = procurar(texto);
    lista.innerHTML = achados.map((i) => `
      <li class="busca__item">
        <a class="busca__ir" href="${i.u}"${externo(i.u) ? ' target="_blank" rel="noopener"' : ''}>
          <span class="busca__nome">${i.t}${externo(i.u) ? '<span class="u-sr"> (abre em nova aba)</span>' : ''}</span>
          <span class="busca__onde">${i.c}</span>
        </a>
      </li>`).join('');

    if (!texto) recado.textContent = '';
    else if (!achados.length) recado.textContent = `Nada encontrado para “${texto}”.`;
    else recado.textContent = `${achados.length} ${achados.length === 1 ? 'resultado' : 'resultados'}.`;
    saida.classList.toggle('busca__resultados--cheia', achados.length > 0 || !!texto);
  }

  let espera = 0;
  campo.addEventListener('input', () => {
    clearTimeout(espera);
    espera = setTimeout(desenhar, 90);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(espera);
    desenhar();
    const primeiro = lista.querySelector('.busca__ir');
    if (primeiro) primeiro.click();
  });

  /* seta para baixo desce do campo para a lista */
  campo.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown') return;
    const primeiro = lista.querySelector('.busca__ir');
    if (primeiro) { e.preventDefault(); primeiro.focus(); }
  });

  return { limpar() { campo.value = ''; desenhar(); } };
}
