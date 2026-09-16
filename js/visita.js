/* Nossa Fazenda: a visita.

   Três coisas, todas discretas:
   1. os blocos sobem uma vez quando entram na tela;
   2. o quadro de cinema troca a foto conforme a rolagem passa pelo trilho;
   3. a sequência horizontal da alimentação também se arrasta com o ponteiro.

   Nada prende a rolagem e nada se move com prefers-reduced-motion. */

const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

export function iniciarVisita() {
  revelar();
  cinema();
  arrastar();
}

/* ----- entrada dos blocos ----- */

function revelar() {
  const restam = new Set(document.querySelectorAll('.vs-sobe, .vs-ato'));
  if (!restam.size) return;

  const mostrar = (el) => { el.classList.add('is-visivel'); restam.delete(el); };

  const io = new IntersectionObserver((itens) => {
    for (const item of itens) if (item.isIntersecting) mostrar(item.target);
    if (!restam.size) desligar();
  }, { rootMargin: '0px 0px -12% 0px' });

  restam.forEach((el) => io.observe(el));

  /* Rede de seguranca: numa rolagem muito rapida, ou num salto de ancora, o
     observador pode nao receber a passagem de um bloco e ele ficaria invisivel.
     Esta varredura mostra tudo o que ja passou da borda de baixo da tela. */
  let pedido = 0;
  function varrer() {
    pedido = 0;
    const limite = window.innerHeight * 0.88;
    for (const el of [...restam]) {
      if (el.getBoundingClientRect().top < limite) mostrar(el);
    }
    if (!restam.size) desligar();
  }
  const pedir = () => { if (!pedido) pedido = requestAnimationFrame(varrer); };

  function desligar() {
    io.disconnect();
    window.removeEventListener('scroll', pedir);
    window.removeEventListener('resize', pedir);
  }

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  varrer();

  // dentro de um mesmo grupo as fotos entram em cascata
  document.querySelectorAll('[data-cascata]').forEach((grupo) => {
    [...grupo.children].forEach((filho, i) => filho.style.setProperty('--n', i));
  });
}

/* ----- cinema: a mesma caminhada, quadro a quadro ----- */

function cinema() {
  const trilho = document.querySelector('.vs-cinema');
  if (!trilho) return;
  const quadros = [...trilho.querySelectorAll('.vs-cinema__palco img')];
  if (quadros.length < 2) return;

  let pedido = 0;
  let visivel = false;
  let atual = -1;

  function aplicar() {
    pedido = 0;
    if (reduzido.matches) {
      quadros.forEach((q) => q.classList.add('is-atual'));
      return;
    }
    const caixa = trilho.getBoundingClientRect();
    const curso = Math.max(1, caixa.height - window.innerHeight);
    const p = limitar(-caixa.top / curso, 0, 0.9999);
    const i = Math.floor(p * quadros.length);
    if (i === atual) return;
    atual = i;
    quadros.forEach((q, n) => q.classList.toggle('is-atual', n === i));
  }

  const pedir = () => { if (visivel && !pedido) pedido = requestAnimationFrame(aplicar); };

  new IntersectionObserver(([item]) => {
    visivel = item.isIntersecting;
    pedir();
  }, { rootMargin: '100% 0px' }).observe(trilho);

  quadros[0].classList.add('is-atual');
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  reduzido.addEventListener('change', () => { atual = -1; aplicar(); });
  aplicar();
}

/* ----- arrastar a sequência horizontal ----- */

function arrastar() {
  const trilho = document.querySelector('.vs-trilho');
  if (!trilho) return;

  let pego = false;
  let x0 = 0;
  let inicio = 0;
  let andou = 0;

  trilho.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return; // o toque já rola sozinho
    pego = true;
    andou = 0;
    x0 = e.clientX;
    inicio = trilho.scrollLeft;
    trilho.setPointerCapture(e.pointerId);
    trilho.style.cursor = 'grabbing';
  });

  trilho.addEventListener('pointermove', (e) => {
    if (!pego) return;
    const d = e.clientX - x0;
    andou = Math.max(andou, Math.abs(d));
    trilho.scrollLeft = inicio - d;
  });

  const soltar = (e) => {
    if (!pego) return;
    pego = false;
    trilho.style.cursor = '';
    if (trilho.hasPointerCapture?.(e.pointerId)) trilho.releasePointerCapture(e.pointerId);
  };
  trilho.addEventListener('pointerup', soltar);
  trilho.addEventListener('pointercancel', soltar);

  // um arrasto não deve virar clique em nada que esteja dentro
  trilho.addEventListener('click', (e) => { if (andou > 6) e.preventDefault(); }, true);
  trilho.style.cursor = 'grab';
}
