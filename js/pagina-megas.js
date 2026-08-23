/* Página das megaevoluções: o guia, os itens base e as 47 pedras. */

const guia = document.getElementById("guia");
const listaBase = document.getElementById("base");
const listaPedras = document.getElementById("pedras");
const buscaMega = document.getElementById("busca-mega");
const contagemMega = document.getElementById("contagem-mega");

let PEDRAS = [];

function cardDeItem(item, imagem) {
  return `
    <article class="item-mega">
      <header>
        <img src="${imagem}" alt="" onerror="this.style.display='none'">
        <h3>${item.nome}</h3>
      </header>
      ${item.pokemon ? `<p class="para-quem">${item.pokemon.join(", ")}</p>` : ""}
      ${desenharReceita(item.receita)}
    </article>`;
}

function mostrarPedras() {
  const texto = buscaMega.value.trim().toLowerCase();

  const visiveis = PEDRAS.filter(function (pedra) {
    if (!texto) return true;
    const nome = pedra.nome.toLowerCase();
    const donos = pedra.pokemon.join(" ").toLowerCase();
    return nome.includes(texto) || donos.includes(texto);
  });

  contagemMega.textContent = `${visiveis.length} de ${PEDRAS.length} pedras`;
  listaPedras.innerHTML = visiveis
    .map((p) => cardDeItem(p, `img/megas/${p.id}.png`))
    .join("");
}

guia.innerHTML = DADOS_MEGAS.guia
  .map((p) => `<li><strong>${p.titulo}</strong><br>${p.texto}</li>`)
  .join("");

listaBase.innerHTML = DADOS_MEGAS.base
  .map((item) => cardDeItem(item, `img/megas/${item.id}.png`))
  .join("");

PEDRAS = DADOS_MEGAS.pedras;
mostrarPedras();
buscaMega.addEventListener("input", mostrarPedras);
