/*
  TMs: 930 discos, um por golpe que dá pra ensinar.
  Como são muitos, a lista só desenha os primeiros — o resto sai na busca.
*/

const TETO = 60;

const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const contagem = document.getElementById("contagem");

function cardDeTM(tm) {
  return `
    <article class="item-mega">
      <header><h3>${tm.nome}</h3></header>
      ${desenharReceita(tm.receita)}
    </article>`;
}

function atualizar() {
  const texto = busca.value.trim().toLowerCase();
  const achados = DADOS_TMS.filter((t) => !texto || t.nome.toLowerCase().includes(texto));
  const { mostrados, escondidos } = limitarLista(achados, TETO);

  contagem.textContent = escondidos
    ? `${achados.length} TMs — mostrando os ${TETO} primeiros, refine a busca`
    : `${achados.length} TMs`;

  lista.innerHTML = mostrados.length
    ? `<div class="lista-itens">${mostrados.map(cardDeTM).join("")}</div>`
    : `<p class="nada">Nenhum golpe com esse nome.</p>`;
}

busca.addEventListener("input", atualizar);
atualizar();
