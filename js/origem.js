import { mancha } from './hero.js';
import { compilarCaminho } from './mancha.js';

/* Secao 02: marca grafica, mancha, origem real.

   A foto vive num palco preso ao topo da tela desde o inicio da pagina, apagado.
   Enquanto o Hero sai, a mancha principal cresce (hero.js) e o palco recebe o
   mesmo contorno dela como clip-path: a foto aparece dentro da propria mancha,
   no lugar exato, e cresce junto. Quando a mancha cobre a tela, o recorte sai e
   a foto fica inteira. Nada disso prende a rolagem: tudo e funcao da posicao.

   ===== Contrato com a Secao 03 =====
   origem.estado.saida   0 quando o fim da secao (.origem__saida) entra por baixo
                         da tela, 1 quando chega ao topo
   origem.assinar(fn)    fn(estado) a cada quadro; devolve a funcao que cancela */

// Espelham --cobre e --pausa do origem.css, em alturas de tela
const COBRE = 0.84;
const PAUSA = 0.3;

const FOTO_APARECE = [0.02, 0.32];   // progresso da mancha em que a foto preenche a forma
const ESCALA_FOTO = 1.1;            // a foto assenta de 1.1 para 1 ate o fim da pausa

const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const suave = (a, b, t) => { const x = limitar((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };

const assinantes = new Set();
export const origem = {
  estado: { saida: 0 },
  assinar(fn) {
    assinantes.add(fn);
    fn(this.estado);
    return () => assinantes.delete(fn);
  },
};

export function iniciarOrigem() {
  const secao = document.querySelector('.origem');
  if (!secao) return;
  const janela = secao.querySelector('.origem__janela');
  const foto = secao.querySelector('.origem__foto img');
  const palco = secao.querySelector('.origem__palco');
  const saida = secao.querySelector('.origem__saida');

  let altura = palco.offsetHeight;
  let saidaY = 0;
  const medir = () => {
    altura = palco.offsetHeight;
    if (saida) saidaY = saida.getBoundingClientRect().top + window.scrollY;
  };
  medir();

  function avisarSaida() {
    const s = limitar((window.scrollY + window.innerHeight - saidaY) / window.innerHeight, 0, 1);
    if (s === origem.estado.saida) return;
    origem.estado = { saida: s };
    assinantes.forEach((fn) => fn(origem.estado));
  }

  new ResizeObserver(() => { medir(); avisarSaida(); }).observe(secao);
  revelarTexto(secao.querySelector('.origem__abertura'));

  if (!mancha.forma || !mancha.elemento) {
    window.addEventListener('scroll', avisarSaida, { passive: true });
    return;
  }

  const desenhar = compilarCaminho(mancha.forma.d);
  let recortada = null;

  function semMovimento() {
    janela.style.opacity = '';
    janela.style.clipPath = '';
    foto.style.transform = '';
    mancha.elemento.style.visibility = '';
  }

  function atualizar(estado) {
    avisarSaida();
    if (reduzido.matches) { semMovimento(); return; }
    const q = estado.progresso;

    const opacidade = suave(FOTO_APARECE[0], FOTO_APARECE[1], q);
    janela.style.opacity = opacidade.toFixed(3);

    // O palco esta preso em (0, 0) enquanto a mancha ainda cresce, entao as
    // coordenadas de tela da mancha servem direto como coordenadas do palco.
    if (q >= 1) {
      if (recortada !== false) { janela.style.clipPath = 'none'; recortada = false; }
    } else if (opacidade > 0) {
      const { a, d, e, f } = mancha.matrizNaTela();
      janela.style.clipPath = `path('${desenhar(a, e, d, f)}')`;
      recortada = true;
    }

    // coberta pela foto, a mancha preta nao precisa mais ser pintada
    mancha.elemento.style.visibility = q >= 1 ? 'hidden' : '';

    const t = limitar(window.scrollY / (altura * (COBRE + PAUSA)), 0, 1);
    foto.style.transform = `scale(${(ESCALA_FOTO - (ESCALA_FOTO - 1) * (1 - (1 - t) ** 3)).toFixed(4)})`;
  }

  mancha.assinar(atualizar);
  reduzido.addEventListener('change', () => atualizar(mancha.estado));
}

/* "Tudo começa aqui." aparece quando o texto entra de fato na tela, logo abaixo
   da foto que sai. Quem chega pelo teclado revela na hora: o CTA nunca recebe
   foco ainda invisivel. */
function revelarTexto(abertura) {
  if (!abertura) return;
  const revelar = () => { abertura.classList.add('is-revelada'); io.disconnect(); };
  const io = new IntersectionObserver((itens) => {
    if (itens.some((i) => i.isIntersecting)) revelar();
  }, { rootMargin: '0px 0px -12% 0px' });
  io.observe(abertura);
  abertura.addEventListener('focusin', revelar, { once: true });
}
