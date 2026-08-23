/*
  O cabeçalho do site, escrito uma vez só.

  Antes cada página tinha a sua cópia do menu. Com 19 páginas isso vira um
  problema: adicionar um link significa editar 19 arquivos e torcer pra não
  esquecer nenhum. Aqui o menu mora num lugar só, e toda página chama.

  São dois níveis: as seções em cima, e os links da seção aberta embaixo.
  Vinte links numa linha só não caberiam na tela.
*/

const SECOES = [
  {
    nome: "Pokémon",
    paginas: [
      ["index.html", "Pokédex"],
      ["builds.html", "Builds"],
      ["tipos.html", "Tipos"],
    ],
  },
  {
    nome: "Batalha",
    paginas: [
      ["raids.html", "Raids"],
      ["treinadores.html", "Treinadores"],
      ["megas.html", "Megas"],
      ["zmoves.html", "Z-Moves"],
      ["formas.html", "Formas"],
      ["tms.html", "TMs"],
    ],
  },
  {
    nome: "Itens",
    paginas: [
      ["pokebolas.html", "Pokébolas"],
      ["berries.html", "Berries"],
      ["apricorns.html", "Apricorns"],
      ["evolucao.html", "Evolução"],
      ["segurados.html", "Segurados"],
      ["pesca.html", "Pesca"],
      ["vitaminas.html", "Vitaminas"],
      ["mints.html", "Mints"],
      ["gems.html", "Gemas"],
      ["crafts.html", "Crafts"],
    ],
  },
];

/* Qual arquivo está aberto agora. Endereço vazio (a raiz) conta como index. */
function paginaAtual() {
  const arquivo = location.pathname.split("/").pop();
  return arquivo === "" ? "index.html" : arquivo;
}

function desenharMenu() {
  const alvo = document.getElementById("topo");
  if (!alvo) return;

  const atual = paginaAtual();

  // A ficha de um Pokémon não está no menu, mas pertence à seção Pokémon.
  const ondeEstou =
    SECOES.find((s) => s.paginas.some(([arquivo]) => arquivo === atual)) ||
    SECOES[0];

  const abas = SECOES.map(function (secao) {
    const primeira = secao.paginas[0][0];
    const ativa = secao === ondeEstou ? " ativo" : "";
    return `<a class="aba${ativa}" href="${primeira}">${secao.nome}</a>`;
  }).join("");

  const links = ondeEstou.paginas
    .map(function ([arquivo, titulo]) {
      const ativo = arquivo === atual ? " ativo" : "";
      return `<a class="${ativo.trim()}" href="${arquivo}">${titulo}</a>`;
    })
    .join("");

  alvo.innerHTML = `
    <div class="topo-linha">
      <a class="marca" href="index.html">COBBLE<span>VERSE</span></a>
      <nav class="abas">${abas}</nav>
    </div>
    <nav class="menu">${links}</nav>
  `;
}

desenharMenu();
