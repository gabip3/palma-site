/* Geometria da mancha oficial.
   A forma e lida do <symbol id="mancha-palma"> do HTML, entao o desenho e o
   teste de colisao usam exatamente o mesmo caminho. O teste usa Path2D num
   canvas fora da tela: funciona sem a forma estar renderizada. */

export class Forma {
  constructor(d, vb) {
    this.vb = vb;
    this.caminho = new Path2D(d);
    this.ctx = document.createElement('canvas').getContext('2d');
    this.ancora = this.#pontoMaisInterno();
  }

  /* fx, fy: fracao da caixa da forma (0 a 1) */
  contem(fx, fy) {
    if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return false;
    const { x, y, w, h } = this.vb;
    return this.ctx.isPointInPath(this.caminho, x + fx * w, y + fy * h);
  }

  /* O ponto mais distante da borda. E em torno dele que a mancha cresce: assim
     ela avanca por igual para todos os lados, sem expor um recorte da forma. */
  #pontoMaisInterno() {
    const N = 44;
    const { w, h } = this.vb;
    const dentro = [];
    const fora = [];
    for (let j = -1; j <= N; j++) {
      for (let i = -1; i <= N; i++) {
        const fx = (i + 0.5) / N;
        const fy = (j + 0.5) / N;
        (this.contem(fx, fy) ? dentro : fora).push([fx * w, fy * h, fx, fy]);
      }
    }
    let melhor = { fx: 0.5, fy: 0.5 };
    let recorde = -1;
    for (const [px, py, fx, fy] of dentro) {
      let menor = Infinity;
      for (const [qx, qy] of fora) {
        const d = (px - qx) ** 2 + (py - qy) ** 2;
        if (d < menor) menor = d;
      }
      if (menor > recorde) { recorde = menor; melhor = { fx, fy }; }
    }
    return melhor;
  }
}

/* Leva os pontos de um caminho absoluto (M, L, C, Z) por x' = sx*x + ox e
   y' = sy*y + oy. O desenho oficial so usa esses comandos; qualquer outro e
   recusado, em vez de gerar uma mascara torta sem aviso. */
export function transformarCaminho(d, sx, ox, sy, oy) {
  return compilarCaminho(d)(sx, ox, sy, oy);
}

/* Mesmo resultado, com a leitura do caminho feita uma vez so. Devolve uma
   funcao (sx, ox, sy, oy) => caminho. Serve para quem redesenha a mancha a
   cada quadro de rolagem, como a mascara da Secao 02. */
export function compilarCaminho(d) {
  const itens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  const pecas = [];   // string = comando; numero = coordenada
  const eixos = [];   // true = x
  let eixoX = true;
  for (const item of itens) {
    if (/[A-Za-z]/.test(item)) {
      if (!/[MLCZ]/.test(item)) throw new Error('comando de caminho nao suportado: ' + item);
      pecas.push(item); eixos.push(false);
      eixoX = true;
      continue;
    }
    pecas.push(Number(item)); eixos.push(eixoX);
    eixoX = !eixoX;
  }
  return (sx, ox, sy, oy) => {
    let s = '';
    for (let i = 0; i < pecas.length; i++) {
      const p = pecas[i];
      s += (i ? ' ' : '') + (typeof p === 'string' ? p : (eixos[i] ? sx * p + ox : sy * p + oy).toFixed(2));
    }
    return s;
  };
}

export function lerForma(id = 'mancha-palma') {
  const simbolo = document.getElementById(id);
  const [x, y, w, h] = simbolo.getAttribute('viewBox').trim().split(/[\s,]+/).map(Number);
  const forma = new Forma(simbolo.querySelector('path').getAttribute('d'), { x, y, w, h });
  forma.d = simbolo.querySelector('path').getAttribute('d');
  return forma;
}

/* Menor escala em que a forma, crescendo em torno da ancora, cobre um
   retangulo centrado na ancora com meias-medidas (mx, my), em px.
   largura/altura: tamanho do elemento da mancha sem transform. */
export function escalaQueCobre(forma, largura, altura, mx, my, folga = 1.03) {
  const ax = forma.ancora.fx * largura;
  const ay = forma.ancora.fy * altura;
  const amostras = [];
  const PASSOS = 10;
  for (let k = 0; k <= PASSOS; k++) {
    const t = (k / PASSOS) * 2 - 1;
    amostras.push([t, -1], [t, 1], [-1, t], [1, t]);
  }

  const cobre = (s) => amostras.every(([u, v]) =>
    forma.contem((ax + (u * mx * folga) / s) / largura, (ay + (v * my * folga) / s) / altura));

  let s = 1;
  if (cobre(s)) return s;
  while (!cobre(s) && s < 400) s *= 1.12;
  let lo = s / 1.12;
  let hi = s;
  for (let i = 0; i < 16; i++) {
    const meio = (lo + hi) / 2;
    if (cobre(meio)) hi = meio; else lo = meio;
  }
  return hi;
}
