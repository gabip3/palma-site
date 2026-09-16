/* Secao 04: cada materia sobe uma vez, quando entra na tela. Sem movimento
   reduzido, o CSS ja mostra tudo parado. */

export function iniciarNoticias() {
  const artigos = document.querySelectorAll('.noticias__principal, .noticias__chamada');
  if (!artigos.length) return;
  const io = new IntersectionObserver((itens) => {
    itens.forEach((item) => {
      if (!item.isIntersecting) return;
      item.target.classList.add('is-visivel');
      io.unobserve(item.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  artigos.forEach((a) => io.observe(a));
}
