/* Nossa Fazenda: hero e primeira transicao.

   Entrada: a foto assenta de 1.08 para 1 e o titulo sobe linha a linha.
   Rolagem: enquanto a folha da historia sobe sobre a foto presa, a foto
   aproxima de leve (ate 1.06). So transform, e so enquanto o hero aparece.
   O fio do fim da historia se desenha quando entra na tela. */

const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

export function iniciarFazenda() {
  const hero = document.querySelector('.fz-hero');
  if (hero) iniciarHero(hero);

  const segue = document.querySelector('.fz-segue');
  if (segue) {
    const io = new IntersectionObserver(([item]) => {
      if (!item.isIntersecting) return;
      segue.classList.add('is-visivel');
      io.disconnect();
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(segue);
  }
}

function iniciarHero(hero) {
  const img = hero.querySelector('.fz-hero__foto img');
  let pedido = 0;
  let visivel = true;

  const comecar = () => requestAnimationFrame(() => hero.classList.add('is-pronto'));
  // espera a foto: o assentamento nao pode comecar com a tela vazia
  if (img.complete) comecar();
  else {
    img.addEventListener('load', comecar, { once: true });
    img.addEventListener('error', comecar, { once: true });
    setTimeout(comecar, 1500);
  }

  function aplicar() {
    pedido = 0;
    if (reduzido.matches) { hero.style.removeProperty('--fz-escala'); return; }
    const p = limitar(window.scrollY / hero.offsetHeight, 0, 1);
    hero.classList.toggle('is-rolando', p > 0);
    hero.style.setProperty('--fz-escala', (1 + p * 0.06).toFixed(4));
  }

  const pedir = () => { if (visivel && !pedido) pedido = requestAnimationFrame(aplicar); };
  new IntersectionObserver(([item]) => { visivel = item.isIntersecting; pedir(); }).observe(hero);
  window.addEventListener('scroll', pedir, { passive: true });
  reduzido.addEventListener('change', aplicar);
}
