import { escalaQueCobre, transformarCaminho, lerForma } from './mancha.js';

/* Manchas do Hero.

   Varias manchas oficiais do pattern, como nas embalagens. As secundarias so
   entram, uma depois da outra, e ficam paradas. A principal, a que atravessa a
   headline, tem dois movimentos somados num unico transform:
   1. entrada: a mancha nasce pequena em torno do seu ponto mais interno e se
      espalha ate a posicao do layout, uma vez;
   2. rolagem: conforme o Hero sai da tela, ela cresce e caminha para o centro
      ate cobrir a viewport inteira. Nada prende a rolagem: a mancha so
      responde a posicao atual.

   ===== Contrato com a Secao 02 =====
   A proxima secao nao precisa conhecer as contas daqui. Ela usa `mancha`:

   mancha.estado          fase, progresso (0 a 1), cobertura (0 a 1), escala
   mancha.assinar(fn)     fn(estado) a cada quadro em que a mancha muda;
                          devolve a funcao que cancela a assinatura
   mancha.caminhoPara(el) a mancha, na posicao exata em que esta na tela, como
                          caminho SVG em px relativos a caixa de `el`. Serve
                          direto em el.style.clipPath = `path('...')`
   mancha.matrizNaTela()  coordenadas do desenho oficial para px da viewport

   A fase tambem fica em data-mancha no .hero e sai no evento `palma:mancha`
   quando muda: entrada, repouso, transformando, coberta. "coberta" e o
   momento da passagem: a viewport inteira esta preta e a Secao 02 pode nascer
   de dentro da forma. Depois disso a mancha segue cobrindo a tela; a Secao 02
   precisa ficar acima dela (z-index 2 ou mais) ou assumir `mancha.elemento`. */

const ENTRADA_MS = 1800;
const ESCALA_INICIAL = 0.16;
/* as secundarias entram depois da principal, em sequencia */
const ATRASO_SECUNDARIA_MS = 170;
const ESCALA_INICIAL_SECUNDARIA = 0.3;
/* fracao da altura do Hero ja rolada quando a mancha fecha a tela */
const COBRE_EM = 0.84;

const reduzido = matchMedia('(prefers-reduced-motion: reduce)');

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const saidaSuave = (t) => 1 - (1 - t) ** 4;
/* comeca devagar, enquanto a headline ainda e lida, e acelera conforme o Hero
   sai. A escala ja cresce em progressao geometrica, entao a curva e suave. */
const acelera = (t) => t ** 2.1;

const assinantes = new Set();
const m = { L: 0, T: 0, W: 1, H: 1, ax: 0, ay: 0, heroX: 0, heroY: 0, heroH: 1, vw: 1, vh: 1, cobre: 1, rolagem: 0 };

export const mancha = {
  forma: null,
  elemento: null,
  estado: { fase: 'entrada', progresso: 0, cobertura: 0, escala: 1, tx: 0, ty: 0 },

  assinar(fn) {
    assinantes.add(fn);
    fn(this.estado);
    return () => assinantes.delete(fn);
  },

  /* x_tela = a * x + e ; y_tela = d * y + f, com x e y no viewBox do simbolo */
  matrizNaTela() {
    const { escala: s, tx, ty } = this.estado;
    const vb = this.forma.vb;
    const a = (s * m.W) / vb.w;
    const d = (s * m.H) / vb.h;
    const origemX = m.heroX + m.L + tx;
    const origemY = m.heroY - m.rolagem + m.T + ty;
    return { a, d, e: origemX - a * vb.x, f: origemY - d * vb.y };
  },

  caminhoPara(elemento) {
    const r = elemento.getBoundingClientRect();
    const { a, d, e, f } = this.matrizNaTela();
    return transformarCaminho(this.forma.d, a, e - r.left, d, f - r.top);
  },
};

export function iniciarHero() {
  const hero = document.querySelector('.hero');
  const el = hero?.querySelector('.hero__mancha--principal');
  if (!hero || !el) return;
  const forma = lerForma(el.dataset.forma);
  const secundarias = [...hero.querySelectorAll('.hero__mancha:not(.hero__mancha--principal)')]
    .map((no, i) => ({ el: no, forma: lerForma(no.dataset.forma), atraso: (i + 1) * ATRASO_SECUNDARIA_MS, ax: 0, ay: 0, feita: false }));
  const topo = document.getElementById('topo');
  const marca = topo?.querySelector('.topo__marca');

  mancha.forma = forma;
  mancha.elemento = el;

  let entrada = reduzido.matches ? 1 : 0;
  let decorrido = reduzido.matches ? Infinity : 0;
  let inicio = null;
  let pedido = 0;
  let sobreMancha = false;
  const logo = { x: 0, y: 0 };   // centro da logo em coordenadas do Hero

  /* Todas as leituras de layout ficam aqui, fora do quadro de rolagem. */
  function medir() {
    // valores fracionarios: offsetWidth e offsetLeft arredondam, e com a mancha
    // ampliada o arredondamento vira desalinhamento visivel na mascara
    const cs = getComputedStyle(el);
    m.L = parseFloat(cs.left);
    m.T = parseFloat(cs.top);
    m.W = parseFloat(cs.width);
    m.H = parseFloat(cs.height);
    m.ax = forma.ancora.fx * m.W;
    m.ay = forma.ancora.fy * m.H;
    const caixa = hero.getBoundingClientRect();
    m.heroX = caixa.left + window.scrollX;
    m.heroY = caixa.top + window.scrollY;
    m.heroH = hero.offsetHeight;
    m.vw = document.documentElement.clientWidth;
    m.vh = window.innerHeight;
    m.cobre = escalaQueCobre(forma, m.W, m.H, m.vw / 2, m.vh / 2);
    secundarias.forEach((sec) => {
      const c = getComputedStyle(sec.el);
      sec.ax = sec.forma.ancora.fx * (parseFloat(c.width) || 0);
      sec.ay = sec.forma.ancora.fy * (parseFloat(c.height) || 0);
    });
    if (marca) {
      const r = marca.getBoundingClientRect();
      logo.x = r.left + r.width / 2 + window.scrollX - m.heroX;
      logo.y = r.top + r.height / 2 + window.scrollY - m.heroY;
    }
  }

  function aplicar() {
    pedido = 0;
    m.rolagem = window.scrollY;
    const y = m.rolagem - m.heroY;
    const q = reduzido.matches ? 0 : limitar(y / (m.heroH * COBRE_EM), 0, 1);
    const k = acelera(q);
    const s = lerp(ESCALA_INICIAL, 1, saidaSuave(entrada)) * m.cobre ** k;

    // a ancora sai da posicao de repouso e vai ao centro da tela
    const px = lerp(m.L + m.ax, m.vw / 2, k);
    const py = lerp(m.T + m.ay, y + m.vh / 2, k);
    const tx = px - m.L - s * m.ax;
    const ty = py - m.T - s * m.ay;
    el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;

    let fase = 'repouso';
    if (entrada < 1) fase = 'entrada';
    else if (q >= 1) fase = 'coberta';
    else if (q > 0) fase = 'transformando';

    const anterior = mancha.estado.fase;
    mancha.estado = { fase, progresso: q, cobertura: k, escala: s, tx, ty };
    if (fase !== anterior) {
      hero.dataset.mancha = fase;
      window.dispatchEvent(new CustomEvent('palma:mancha', { detail: mancha.estado }));
    }
    assinantes.forEach((fn) => fn(mancha.estado));

    atualizarMarca(y, tx, ty, s);
  }

  /* A logo e azul e preta: a inversao automatica nao serve para ela. Quando a
     mancha chega por baixo do centro da logo, troca pela versao branca oficial. */
  function atualizarMarca(y, tx, ty, s) {
    if (!marca) return;
    const visivel = logo.y - y > -m.vh * 0.1;
    const agora = visivel && forma.contem((logo.x - m.L - tx) / s / m.W, (logo.y - m.T - ty) / s / m.H);
    if (agora !== sobreMancha) {
      sobreMancha = agora;
      topo.classList.toggle('is-sobre-mancha', agora);
    }
  }

  /* Entrada das secundarias: crescem em torno do proprio ponto mais interno,
     como a principal, e depois nao recebem mais nenhum transform. */
  function entrarSecundarias() {
    let todas = true;
    secundarias.forEach((sec) => {
      if (sec.feita) return;
      const e = limitar((decorrido - sec.atraso) / ENTRADA_MS, 0, 1);
      if (e >= 1) {
        sec.el.style.transform = '';
        sec.feita = true;
        return;
      }
      todas = false;
      const s = lerp(ESCALA_INICIAL_SECUNDARIA, 1, saidaSuave(e));
      sec.el.style.transform = `translate3d(${((1 - s) * sec.ax).toFixed(2)}px, ${((1 - s) * sec.ay).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    });
    return todas;
  }

  function quadroDeEntrada(t) {
    inicio ??= t;
    decorrido = t - inicio;
    entrada = limitar(decorrido / ENTRADA_MS, 0, 1);
    aplicar();
    const secundariasProntas = entrarSecundarias();
    if (entrada < 1 || !secundariasProntas) requestAnimationFrame(quadroDeEntrada);
  }

  function pedirQuadro() {
    if (!pedido && entrada >= 1) pedido = requestAnimationFrame(aplicar);
  }

  const remedir = () => { medir(); aplicar(); };

  medir();
  aplicar();

  window.addEventListener('scroll', pedirQuadro, { passive: true });
  new ResizeObserver(remedir).observe(hero);
  window.addEventListener('resize', remedir);
  reduzido.addEventListener('change', () => { entrada = 1; decorrido = Infinity; remedir(); entrarSecundarias(); });

  /* Comeca quando a fonte chegou: a headline nao pode trocar de metrica no meio
     da animacao. O teto evita esperar para sempre numa conexao ruim. */
  const fonte = Promise.race([
    document.fonts ? document.fonts.load('900 1em "Palma Sans"') : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
  fonte.then(() => {
    medir();
    hero.classList.add('is-viva', 'is-pronta');
    document.documentElement.classList.add('palma-pronta');
    if (entrada < 1) requestAnimationFrame(quadroDeEntrada); else { aplicar(); entrarSecundarias(); }
  });
}
