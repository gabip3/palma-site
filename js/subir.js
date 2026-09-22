/* Voltar ao topo.

   O cabeçalho do site não é fixo: ele rola junto e não volta. Em páginas
   longas, e a Nossa Fazenda tem mais de dezesseis telas de celular, a pessoa
   fica sem nenhuma saída até chegar ao rodapé. Este é o caminho de volta.

   O botão é uma mancha do pattern com a seta dentro, a mesma ideia dos ícones
   de rede do rodapé, para não virar a bolinha de sempre.

   Só entra em página que passa de três telas, só aparece depois de duas, e
   some quando o rodapé chega, para não ficar boiando em cima dele. */

const FORMA = 'mancha-icone-a';
const CAIXA = { l: 108.672, a: 99.391 };

export function ligarSubir() {
  const rodape = document.querySelector('.rodape');
  if (!rodape || document.querySelector('.subir')) return;
  if (!document.getElementById(FORMA)) return; // a página não tem o pattern

  const botao = document.createElement('button');
  botao.className = 'subir';
  botao.type = 'button';
  botao.setAttribute('aria-label', 'Voltar ao topo');
  botao.innerHTML = `
    <svg viewBox="0 0 ${CAIXA.l} ${CAIXA.a}" aria-hidden="true" focusable="false">
      <use href="#${FORMA}" width="${CAIXA.l}" height="${CAIXA.a}"/>
      <svg class="subir__seta" x="31.8" y="27" width="45" height="45" viewBox="0 0 24 24">
        <path d="M12 19V6M5.6 12.4 12 6l6.4 6.4" fill="none" stroke="currentColor"
              stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </svg>`;
  document.body.appendChild(botao);

  const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
  let longa = false;
  let noRodape = false;

  const medir = () => {
    longa = document.documentElement.scrollHeight > innerHeight * 3;
    botao.classList.toggle('subir--serve', longa);
  };

  const conferir = () => {
    botao.classList.toggle('subir--vendo', longa && !noRodape && scrollY > innerHeight * 2);
  };

  /* o rodapé chegando desliga o botão */
  new IntersectionObserver(([entrada]) => {
    noRodape = entrada.isIntersecting;
    conferir();
  }, { rootMargin: '0px 0px -40% 0px' }).observe(rodape);

  botao.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduzido.matches ? 'auto' : 'smooth' });
    /* quem navega por teclado ou leitor de tela precisa voltar junto */
    const topo = document.getElementById('topo') || document.body;
    topo.setAttribute('tabindex', '-1');
    topo.focus({ preventScroll: true });
  });

  let pedido = 0;
  addEventListener('scroll', () => {
    if (pedido) return;
    pedido = requestAnimationFrame(() => { pedido = 0; conferir(); });
  }, { passive: true });

  addEventListener('resize', () => { medir(); conferir(); }, { passive: true });
  medir();
  conferir();
}
