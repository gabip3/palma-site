/* Catalogo: filtro por linha e por zero lactose, e a entrada das pecas.

   O filtro so esconde: nada sai do HTML. Sem JS a pagina continua inteira, com
   todos os produtos visiveis, que e como o buscador e um leitor de tela veem. */

export function iniciarCatalogo() {
  const cat = document.querySelector('.cat');
  if (!cat) return;

  const botoes = [...cat.querySelectorAll('.cat__filtro:not(.cat__zero)')];
  const zero = cat.querySelector('.cat__zero');
  const itens = [...cat.querySelectorAll('.cat__item')];
  const grupos = [...cat.querySelectorAll('.cat__grupo')];

  let linha = 'todos';
  let soZero = false;

  function aplicar() {
    for (const item of itens) {
      const cabe = (linha === 'todos' || item.dataset.linha === linha)
                && (!soZero || item.dataset.zero === 'sim');
      item.hidden = !cabe;
    }
    // um grupo sem nenhuma peca visivel some junto com o seu titulo
    for (const grupo of grupos) {
      grupo.hidden = ![...grupo.querySelectorAll('.cat__item')].some((i) => !i.hidden);
    }
    for (const b of botoes) b.setAttribute('aria-pressed', String(b.dataset.linha === linha));
    if (zero) zero.setAttribute('aria-pressed', String(soZero));
  }

  for (const b of botoes) {
    b.addEventListener('click', () => { linha = b.dataset.linha; aplicar(); });
  }
  if (zero) zero.addEventListener('click', () => { soZero = !soZero; aplicar(); });
  aplicar();

  // entrada em cascata, uma vez so
  itens.forEach((item, i) => item.style.setProperty('--n', i % 4));
  const io = new IntersectionObserver((vistos) => {
    for (const v of vistos) {
      if (!v.isIntersecting) continue;
      v.target.classList.add('is-visivel');
      io.unobserve(v.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  itens.forEach((i) => io.observe(i));
}
