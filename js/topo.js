import { escalaQueCobre } from './mancha.js';

/* Camada de menu e busca.
   Abrir: a mancha oficial cresce a partir do botao tocado ate cobrir a tela.
   No botao Menu ela nasce exatamente sobre a semente (a mancha em miniatura),
   entao a pequena mancha parece se espalhar. Fechar faz o caminho de volta. */

const DURACAO = 780;
const EASING = 'cubic-bezier(.72, 0, .18, 1)';
const reduzido = matchMedia('(prefers-reduced-motion: reduce)');

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled])';

export function iniciarTopo({ forma }) {
  const camada = document.getElementById('camada');
  if (!camada) return;
  const manchaEl = camada.querySelector('.camada__mancha');
  const titulo = camada.querySelector('#camada-titulo');
  const campo = camada.querySelector('#busca-campo');
  const gatilhos = [...document.querySelectorAll('[data-camada]')];
  const fundo = [document.getElementById('topo'), document.getElementById('conteudo'), document.querySelector('.pular')];

  let aberta = false;
  let gatilho = null;
  let animacao = null;

  /* transform inicial (sobre o botao) e final (tela coberta) */
  function trajeto(botao) {
    const W = manchaEl.offsetWidth;
    const H = manchaEl.offsetHeight;
    const ax = forma.ancora.fx * W;
    const ay = forma.ancora.fy * H;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const semente = botao.querySelector('.topo__semente');
    let ox; let oy; let s0;
    if (semente) {
      const r = semente.getBoundingClientRect();
      ox = r.left + forma.ancora.fx * r.width;
      oy = r.top + forma.ancora.fy * r.height;
      s0 = r.width / W;
    } else {
      const r = botao.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
      s0 = 0.012;
    }
    const s1 = escalaQueCobre(forma, W, H, Math.max(ox, vw - ox), Math.max(oy, vh - oy));
    const t = (s) => `translate3d(${(ox - s * ax).toFixed(2)}px, ${(oy - s * ay).toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
    return [t(s0), t(s1)];
  }

  function abrir(modo, botao) {
    if (aberta) return;
    aberta = true;
    gatilho = botao;

    camada.dataset.modo = modo;
    titulo.textContent = modo === 'busca' ? 'Busca' : 'Menu';
    camada.hidden = false;
    document.documentElement.classList.add('camada-aberta');
    fundo.forEach((n) => { if (n) n.inert = true; });
    botao.setAttribute('aria-expanded', 'true');
    camada.focus({ preventScroll: true });

    const [de, ate] = trajeto(botao);
    const aoCobrir = () => {
      camada.classList.add('is-cheia');
      const alvo = modo === 'busca' ? campo : camada.querySelector('.camada__link');
      alvo?.focus({ preventScroll: true });
    };

    if (reduzido.matches) { manchaEl.style.transform = ate; aoCobrir(); return; }
    animacao?.cancel();
    animacao = manchaEl.animate([{ transform: de }, { transform: ate }], { duration: DURACAO, easing: EASING, fill: 'forwards' });
    animacao.finished.then(aoCobrir, () => {});
  }

  function fechar({ devolverFoco = true } = {}) {
    if (!aberta) return Promise.resolve();
    aberta = false;
    camada.classList.remove('is-cheia');

    const concluir = () => {
      camada.hidden = true;
      document.documentElement.classList.remove('camada-aberta');
      fundo.forEach((n) => { if (n) n.inert = false; });
      gatilho?.setAttribute('aria-expanded', 'false');
      if (devolverFoco) gatilho?.focus({ preventScroll: true });
    };

    if (reduzido.matches) { concluir(); return Promise.resolve(); }
    // recalcula: a tela pode ter mudado de tamanho com a camada aberta
    const [de, ate] = trajeto(gatilho);
    animacao?.cancel();
    animacao = manchaEl.animate([{ transform: ate }, { transform: de }], {
      duration: DURACAO * 0.82, easing: EASING, fill: 'forwards', delay: 120,
    });
    return animacao.finished.then(concluir, concluir);
  }

  gatilhos.forEach((b) => b.addEventListener('click', () => abrir(b.dataset.camada, b)));
  camada.querySelector('[data-fechar]').addEventListener('click', () => fechar());

  // links do menu: fecha a camada e so entao segue para a ancora ou a pagina
  camada.querySelectorAll('.camada__link').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const destino = a.getAttribute('href');
    const naPagina = destino.startsWith('#');
    fechar({ devolverFoco: false }).then(() => {
      if (!naPagina) { window.location.href = a.href; return; }
      const alvo = document.querySelector(destino);
      if (alvo) alvo.scrollIntoView({ behavior: reduzido.matches ? 'auto' : 'smooth' });
      history.pushState(null, '', destino);
    });
  }));

  // Os resultados da busca dependem do conteudo das proximas secoes.
  camada.querySelector('.busca').addEventListener('submit', (e) => e.preventDefault());

  camada.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
    if (e.key !== 'Tab') return;
    const itens = [...camada.querySelectorAll(FOCAVEIS)].filter((n) => n.offsetParent !== null);
    if (!itens.length) return;
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === camada)) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primeiro.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (aberta && camada.classList.contains('is-cheia')) {
      animacao?.cancel();
      manchaEl.style.transform = trajeto(gatilho)[1];
    }
  });
}
