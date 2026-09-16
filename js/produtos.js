/* Secao 03: a linha de produtos.

   Rolagem da pagina: quando a secao entra, o recorte do Leite Integral sobe
   devagar e se afasta (a mancha vira embalagem). So transform; nada prende a
   rolagem.

   Slider: rolagem horizontal nativa (toque, trackpad e setas do teclado com o
   trilho em foco), arrastar com o mouse, botoes e uma linha de progresso. A
   peca que recebe atencao cresce: no desktop, a que esta sob o mouse; no toque,
   a que para no centro. */

const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
const comMouse = matchMedia('(hover: hover) and (pointer: fine)');
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const sai = (t) => 1 - (1 - t) ** 3;

export function iniciarProdutos() {
  const secao = document.querySelector('.produtos');
  if (!secao) return;

  revelar(secao.querySelector('.produtos__titulo'), () => secao.classList.add('is-revelada'));
  const vitrine = secao.querySelector('.produtos__vitrine');
  vitrine.querySelectorAll('.produtos__item').forEach((item, i) => item.style.setProperty('--n', i));
  revelar(vitrine, () => vitrine.classList.add('is-revelada'));

  moverLeite(secao);
  iniciarSlider(vitrine);
}

function revelar(el, fazer) {
  if (!el) return;
  const io = new IntersectionObserver(([item]) => {
    if (!item.isIntersecting) return;
    fazer();
    io.disconnect();
  }, { rootMargin: '0px 0px -18% 0px' });
  io.observe(el);
}

function moverLeite(secao) {
  const leite = secao.querySelector('.produtos__leite');
  if (!leite) return;
  let secaoY = 0;
  let vh = window.innerHeight;
  let visivel = false;
  let pedido = 0;

  const medir = () => {
    vh = window.innerHeight;
    secaoY = secao.getBoundingClientRect().top + window.scrollY;
  };

  function aplicar() {
    pedido = 0;
    if (reduzido.matches) { leite.style.transform = ''; return; }
    // do pe da tela ate o topo da secao chegar a 10% da altura
    const e = sai(limitar((window.scrollY + vh - secaoY) / (vh * 0.9), 0, 1));
    leite.style.transform = e >= 1 ? '' : `translate3d(0, ${((1 - e) * vh * 0.14).toFixed(1)}px, 0) scale(${(1.1 - 0.1 * e).toFixed(4)})`;
  }

  const pedir = () => { if (visivel && !pedido) pedido = requestAnimationFrame(aplicar); };
  new IntersectionObserver(([item]) => { visivel = item.isIntersecting; pedir(); }, { rootMargin: '25% 0px' }).observe(secao);
  window.addEventListener('scroll', pedir, { passive: true });
  new ResizeObserver(() => { medir(); aplicar(); }).observe(document.body);
  reduzido.addEventListener('change', aplicar);
  medir();
  aplicar();
}

function iniciarSlider(vitrine) {
  const trilho = vitrine.querySelector('.produtos__trilho');
  const itens = [...trilho.querySelectorAll('.produtos__item')];
  const voltar = vitrine.querySelector('.produtos__seta--voltar');
  const avancar = vitrine.querySelector('.produtos__seta--avancar');
  const barra = vitrine.querySelector('.produtos__barra');
  let pedido = 0;

  const ativar = (alvo) => itens.forEach((item) => item.classList.toggle('is-ativo', item === alvo));
  const comportamento = () => (reduzido.matches ? 'auto' : 'smooth');

  // ----- estado: progresso, setas e, no toque, a peca do centro -----
  function atualizar() {
    pedido = 0;
    const max = trilho.scrollWidth - trilho.clientWidth;
    const p = max > 0 ? trilho.scrollLeft / max : 0;
    const tamanho = max > 0 ? (trilho.clientWidth / trilho.scrollWidth) * 100 : 100;
    barra.style.setProperty('--tamanho', `${tamanho.toFixed(2)}%`);
    barra.style.setProperty('--posicao', `${(p * (100 - tamanho) / tamanho * 100).toFixed(2)}%`);
    voltar.disabled = trilho.scrollLeft <= 2;
    avancar.disabled = trilho.scrollLeft >= max - 2;

    if (!comMouse.matches) {
      const centro = trilho.getBoundingClientRect().left + trilho.clientWidth / 2;
      let perto = null;
      let menor = Infinity;
      itens.forEach((item) => {
        const r = item.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - centro);
        if (d < menor) { menor = d; perto = item; }
      });
      ativar(perto);
    }
  }
  const pedir = () => { if (!pedido) pedido = requestAnimationFrame(atualizar); };
  trilho.addEventListener('scroll', pedir, { passive: true });
  new ResizeObserver(pedir).observe(trilho);
  comMouse.addEventListener('change', () => { ativar(null); pedir(); });

  // ----- desktop: a peca sob o mouse cresce -----
  itens.forEach((item) => {
    item.addEventListener('pointerenter', (ev) => { if (ev.pointerType === 'mouse' && comMouse.matches && !arrastando) ativar(item); });
    item.addEventListener('pointerleave', (ev) => { if (ev.pointerType === 'mouse' && comMouse.matches) ativar(null); });
  });

  // ----- botoes: no desktop anda boa parte da tela; no toque, uma peca -----
  function andar(sentido) {
    if (comMouse.matches) {
      trilho.scrollBy({ left: sentido * trilho.clientWidth * 0.7, behavior: comportamento() });
      return;
    }
    const atual = itens.findIndex((item) => item.classList.contains('is-ativo'));
    const alvo = itens[limitar((atual < 0 ? 0 : atual) + sentido, 0, itens.length - 1)];
    trilho.scrollTo({ left: alvo.offsetLeft + alvo.offsetWidth / 2 - trilho.clientWidth / 2, behavior: comportamento() });
  }
  voltar.addEventListener('click', () => andar(-1));
  avancar.addEventListener('click', () => andar(1));

  // ----- arrastar com o mouse -----
  let arrastando = false;
  let inicioX = 0;
  let inicioScroll = 0;
  let segurando = false;
  trilho.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType !== 'mouse' || ev.button !== 0) return;
    segurando = true;
    arrastando = false;
    inicioX = ev.clientX;
    inicioScroll = trilho.scrollLeft;
  });
  window.addEventListener('pointermove', (ev) => {
    if (!segurando) return;
    const dx = ev.clientX - inicioX;
    if (!arrastando && Math.abs(dx) > 4) {
      arrastando = true;
      trilho.classList.add('is-arrastando');
      ativar(null);
    }
    if (arrastando) trilho.scrollLeft = inicioScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!segurando) return;
    segurando = false;
    if (arrastando) {
      trilho.classList.remove('is-arrastando');
      // o clique que encerra o arraste nao vale como clique
      trilho.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
      setTimeout(() => { arrastando = false; }, 0);
    }
  });
  trilho.addEventListener('dragstart', (ev) => ev.preventDefault());

  atualizar();
}
