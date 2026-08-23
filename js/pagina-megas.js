/* Página das megaevoluções: o guia, os itens base e as 47 pedras. */

const guia = document.getElementById("guia");
const listaBase = document.getElementById("base");
const listaPedras = document.getElementById("pedras");
const buscaMega = document.getElementById("busca-mega");
const contagemMega = document.getElementById("contagem-mega");

let PEDRAS = [];

/* Desenha a receita: grade 3x3 do craft, ou uma frase se for outro tipo. */
function desenharReceita(receita) {
  if (!receita) return "";
  if (receita.texto) return `<p class="receita-texto">${receita.texto}</p>`;

  let celulas = "";
  const usados = [];

  // O padrão tem até 3 linhas de até 3 letras. Espaço = slot vazio.
  for (let linha = 0; linha < 3; linha++) {
    const texto = receita.padrao[linha] || "   ";
    for (let coluna = 0; coluna < 3; coluna++) {
      const letra = texto[coluna] || " ";
      const item = receita.itens[letra];

      if (!item) {
        celulas += `<span class="slot"></span>`;
        continue;
      }

      if (!usados.includes(item.nome)) usados.push(item.nome);

      // Com ícone mostra a imagem; sem ícone, cai no nome escrito.
      const dentro = item.icone
        ? `<img src="${item.icone}" alt="${item.nome}">`
        : `<span class="so-texto">${item.nome}</span>`;

      celulas += `<span class="slot cheio" title="${item.nome}">${dentro}</span>`;
    }
  }

  // No celular não existe passar o mouse por cima, então a lista fica embaixo.
  return `
    <div class="craft">${celulas}</div>
    <p class="ingredientes">${usados.join(" · ")}</p>`;
}

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
