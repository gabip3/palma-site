/* Catalogo: filtro por linha e por versao (a cor da embalagem), e a entrada das pecas.

   O filtro so esconde: nada sai do HTML. Sem JS a pagina continua inteira, com
   todos os produtos visiveis, que e como o buscador e um leitor de tela veem. */

export function iniciarCatalogo() {
  const cat = document.querySelector('.cat');
  if (!cat) return;

  const botoes = [...cat.querySelectorAll('.cat__filtro')];
  const versoes = [...cat.querySelectorAll('.cat__versao')];
  const faixaVersoes = cat.querySelector('.cat__versoes');
  const itens = [...cat.querySelectorAll('.cat__item')];
  const grupos = [...cat.querySelectorAll('.cat__grupo')];

  let linha = 'todos';
  let versao = null; // tradicional, light, zero ou nenhuma

  function aplicar() {
    for (const item of itens) {
      // a versao casa com a barra colorida da peca: o filtro mostra as pecas
      // que tem aquela cor
      const cabe = (linha === 'todos' || item.dataset.linha === linha)
                && (!versao || item.dataset.versoes.split(' ').includes(versao));
      item.hidden = !cabe;
    }
    // um grupo sem nenhuma peca visivel some junto com o seu titulo
    for (const grupo of grupos) {
      grupo.hidden = ![...grupo.querySelectorAll('.cat__item')].some((i) => !i.hidden);
    }
    for (const b of botoes) b.setAttribute('aria-pressed', String(b.dataset.linha === linha));
    for (const v of versoes) v.setAttribute('aria-pressed', String(v.dataset.versao === versao));
    if (faixaVersoes) faixaVersoes.classList.toggle('tem-escolha', !!versao);
  }

  for (const b of botoes) {
    b.addEventListener('click', () => { linha = b.dataset.linha; aplicar(); });
  }
  // clicar de novo na versao escolhida desliga o filtro
  for (const v of versoes) {
    v.addEventListener('click', () => {
      versao = versao === v.dataset.versao ? null : v.dataset.versao;
      aplicar();
    });
  }
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
