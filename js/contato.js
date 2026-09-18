/* Fale conosco: validacao e envio pelo Web3Forms.

   A chave do Web3Forms entra na entrega, no campo access_key do formulario
   (contato.html). Enquanto ela for a marca CHAVE_WEB3FORMS, o formulario nao
   envia nada: avisa que entra no ar em breve e oferece o telefone. Assim
   nenhum dado sai do navegador antes de a Politica de Privacidade estar
   valendo. */

const MARCA = 'CHAVE_WEB3FORMS';
const TELEFONE = '<a href="tel:+556133620191">(61) 3362-0191</a>';

export function iniciarContato() {
  const form = document.querySelector('.form');
  if (!form) return;

  const retorno = form.querySelector('.form__retorno');
  const botao = form.querySelector('.form__enviar');
  const assunto = form.querySelector('input[name="subject"]');

  const obrigatorios = [
    ['perfil', 'Escolha se você é consumidor ou revenda.'],
    ['name', 'Diga o seu nome.'],
    ['email', 'Informe um e-mail para a gente responder.'],
    ['message', 'Escreva a sua mensagem.'],
  ];

  function erro(nome, texto) {
    const alvo = nome === 'perfil' ? form.querySelector('.form__perfil') : form.elements[nome];
    const caixa = form.querySelector(`[data-erro="${nome}"]`);
    if (alvo) alvo.setAttribute('aria-invalid', texto ? 'true' : 'false');
    if (caixa) caixa.textContent = texto || '';
  }

  function validar() {
    let primeiro = null;
    for (const [nome, texto] of obrigatorios) {
      let vazio;
      if (nome === 'perfil') vazio = !form.querySelector('input[name="perfil"]:checked');
      else vazio = !form.elements[nome].value.trim();
      let msg = vazio ? texto : '';
      if (!vazio && nome === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.elements.email.value.trim())) {
        msg = 'Esse e-mail parece incompleto.';
      }
      erro(nome, msg);
      if (msg && !primeiro) primeiro = nome;
    }
    return primeiro;
  }

  // o erro some assim que a pessoa corrige
  form.addEventListener('input', (e) => {
    const nome = e.target.name;
    if (obrigatorios.some(([n]) => n === nome)) erro(nome, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    retorno.textContent = '';

    const primeiro = validar();
    if (primeiro) {
      const alvo = primeiro === 'perfil' ? form.querySelector('input[name="perfil"]') : form.elements[primeiro];
      alvo.focus();
      return;
    }

    // o assunto do e-mail ja diz quem esta escrevendo
    const perfil = form.querySelector('input[name="perfil"]:checked').value;
    assunto.value = `Site Palma: mensagem de ${perfil.toLowerCase()}`;

    if (form.elements.access_key.value === MARCA) {
      retorno.innerHTML = `O formulário entra no ar em breve. Enquanto isso, fale com a gente pelo telefone ${TELEFONE}.`;
      return;
    }

    botao.disabled = true;
    retorno.textContent = 'Enviando…';
    try {
      const dados = Object.fromEntries(new FormData(form));
      const r = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(dados),
      });
      const resposta = await r.json().catch(() => ({}));
      if (!r.ok || resposta.success === false) throw new Error(resposta.message || r.status);
      form.reset();
      retorno.textContent = 'Mensagem enviada. Obrigado! A gente responde no e-mail que você deixou.';
    } catch {
      retorno.innerHTML = `Não conseguimos enviar agora. Tente de novo em instantes, ou ligue ${TELEFONE}.`;
    } finally {
      botao.disabled = false;
    }
  });
}
