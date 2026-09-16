/* Secao 05: onde encontrar Palma.

   A busca aceita cidade ou CEP. Os dados vem de onde-encontrar.js, hoje vazio
   (conteudo pendente): nesse caso a resposta e so o aviso, sem inventar loja,
   cidade ou disponibilidade. Com dados, a lista mostra onde encontrar Palma na
   cidade ou na faixa de CEP digitada.

   O painel desenha o caminho da Fazenda Palma ate "sua casa"; depois da busca,
   o destino passa a mostrar o que a pessoa digitou. */

import { ONDE_ENCONTRAR } from './onde-encontrar.js';

// CONTEUDO PENDENTE: textos de resposta revisados quando a lista existir
const AVISOS = {
  pendente: 'Estamos preparando a lista de onde encontrar Palma.',
  vazio: 'Digite uma cidade ou um CEP.',
  nenhum: (em) => `Ainda não temos onde encontrar Palma ${em}.`,
  achados: (em) => `Onde encontrar Palma ${em}:`,
};

const semAcento = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const soDigitos = (s) => s.replace(/\D/g, '');

function procurar(consulta) {
  const digitos = soDigitos(consulta);
  if (digitos.length === 8) {
    // mesma faixa de CEP: os cinco primeiros digitos
    return ONDE_ENCONTRAR.filter((p) => soDigitos(p.cep || '').slice(0, 5) === digitos.slice(0, 5));
  }
  const alvo = semAcento(consulta);
  return ONDE_ENCONTRAR.filter((p) => semAcento(p.cidade || '').includes(alvo));
}

export function iniciarOnde() {
  const secao = document.querySelector('.onde');
  if (!secao) return;
  const form = secao.querySelector('.onde__busca');
  const campo = secao.querySelector('.onde__campo');
  const resultado = secao.querySelector('.onde__resultado');
  const aviso = secao.querySelector('.onde__aviso');
  const lista = secao.querySelector('.onde__lista');
  const lugar = secao.querySelector('.onde__lugar');

  new IntersectionObserver(([item], io) => {
    if (!item.isIntersecting) return;
    secao.classList.add('is-visivel');
    io.disconnect();
  }, { rootMargin: '0px 0px -20% 0px' }).observe(secao);

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const consulta = campo.value.trim();
    lista.replaceChildren();
    resultado.hidden = false;

    if (!consulta) {
      aviso.textContent = AVISOS.vazio;
      campo.focus();
      return;
    }

    const digitos = soDigitos(consulta);
    const cep = digitos.length === 8;
    const rotulo = cep ? `CEP ${digitos.slice(0, 5)}-${digitos.slice(5)}` : consulta;
    const em = cep ? `perto do ${rotulo}` : `em ${rotulo}`;
    lugar.textContent = rotulo;
    secao.classList.add('tem-destino');

    if (!ONDE_ENCONTRAR.length) {
      aviso.textContent = AVISOS.pendente;
      return;
    }

    const achados = procurar(consulta);
    aviso.textContent = achados.length ? AVISOS.achados(em) : AVISOS.nenhum(em);
    achados.forEach((p) => {
      const li = document.createElement('li');
      const nome = document.createElement('strong');
      nome.textContent = p.nome;
      const onde = document.createElement('span');
      onde.textContent = [p.endereco, p.bairro, `${p.cidade}, ${p.uf}`].filter(Boolean).join(', ');
      li.append(nome, onde);
      lista.append(li);
    });
  });
}
