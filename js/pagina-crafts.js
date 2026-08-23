/*
  Crafts: a receita de tudo que o modpack deixa fabricar.

  São 3280 receitas. Uma página por mod seria pior que um campo de busca —
  o jogador quer "como faço X", não navegar por mod.
*/

const TETO = 60;

const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const filtroMod = document.getElementById("filtro-mod");
const contagem = document.getElementById("contagem");

function cardDeCraft(craft) {
  const quantos = craft.quantidade > 1 ? ` <span class="efeito">x${craft.quantidade}</span>` : "";
  return `
    <article class="item-mega">
      <header><h3>${craft.nome}${quantos}</h3></header>
      <p class="para-quem">${craft.mod}</p>
      ${desenharReceita(craft.receita)}
    </article>`;
}

/* Os mods com mais receitas primeiro: são os que você vai procurar. */
function prepararFiltro() {
  const quantos = {};
  for (const c of DADOS_CRAFTS) quantos[c.mod] = (quantos[c.mod] || 0) + 1;

  Object.keys(quantos)
    .sort((a, b) => quantos[b] - quantos[a])
    .forEach(function (mod) {
      const opcao = document.createElement("option");
      opcao.value = mod;
      opcao.textContent = `${mod} (${quantos[mod]})`;
      filtroMod.appendChild(opcao);
    });
}

function atualizar() {
  const texto = busca.value.trim().toLowerCase();
  const mod = filtroMod.value;

  const achados = DADOS_CRAFTS.filter(function (c) {
    if (mod && c.mod !== mod) return false;
    if (!texto) return true;
    return c.nome.toLowerCase().includes(texto) || c.id.toLowerCase().includes(texto);
  });

  const { mostrados, escondidos } = limitarLista(achados, TETO);

  contagem.textContent = escondidos
    ? `${achados.length} receitas — mostrando as ${TETO} primeiras, refine a busca`
    : `${achados.length} receitas`;

  lista.innerHTML = mostrados.length
    ? `<div class="lista-itens">${mostrados.map(cardDeCraft).join("")}</div>`
    : `<p class="nada">Nenhuma receita com esse nome.</p>`;
}

prepararFiltro();
busca.addEventListener("input", atualizar);
filtroMod.addEventListener("change", atualizar);
atualizar();
