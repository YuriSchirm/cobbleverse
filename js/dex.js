/*
  A Pokédex: carrega o pokemon.json, desenha a grade e filtra.
*/

// Guarda a lista inteira depois que carregar, pra não ler o arquivo toda hora.
let TODOS = [];

const grade = document.getElementById("grade");
const contagem = document.getElementById("contagem");
const busca = document.getElementById("busca");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroRaridade = document.getElementById("filtro-raridade");
const filtroGeracao = document.getElementById("filtro-geracao");

/* Monta o HTML de um card. */
function cardDe(pokemon) {
  const tipos = pokemon.tipos
    .map(
      (t) =>
        `<span class="tipo" style="background:${CORES_TIPO[t]}">${NOMES_TIPO[t] || t}</span>`
    )
    .join("");

  const raridade = pokemon.raridadeId || "nenhuma";

  return `
    <a class="card r-${raridade}" href="pokemon.html?id=${pokemon.id}">
      <span class="numero">${numeroDex(pokemon.dex)}</span>
      <img src="${imagemDo(pokemon.dex)}" alt="${pokemon.nome}" loading="lazy"
           onerror="this.style.visibility='hidden'">
      <h2>${pokemon.nome}</h2>
      <div class="tipos">${tipos}</div>
      <span class="raridade raridade-${raridade}">${pokemon.raridade}</span>
    </a>
  `;
}

/* Decide quem aparece, com base nos filtros, e desenha. */
function atualizar() {
  const texto = busca.value.trim().toLowerCase();
  const tipo = filtroTipo.value;
  const raridade = filtroRaridade.value;
  const geracao = filtroGeracao.value;

  const visiveis = TODOS.filter(function (p) {
    // Cada if é uma razão pra ESCONDER. Sobrou no fim, aparece.
    if (texto) {
      const combinaNome = p.nome.toLowerCase().includes(texto);
      const combinaNumero = String(p.dex).includes(texto);
      if (!combinaNome && !combinaNumero) return false;
    }
    if (tipo && !p.tipos.includes(tipo)) return false;
    if (raridade === "nenhuma" && p.raridadeId) return false;
    if (raridade && raridade !== "nenhuma" && p.raridadeId !== raridade) return false;
    if (geracao && p.geracao !== geracao) return false;
    return true;
  });

  contagem.textContent =
    visiveis.length === TODOS.length
      ? `${TODOS.length} Pokémon no modpack`
      : `${visiveis.length} de ${TODOS.length} Pokémon`;

  if (visiveis.length === 0) {
    grade.innerHTML = `<p class="vazio">Nenhum Pokémon com esses filtros.</p>`;
    return;
  }

  // Montar uma string só e jogar de uma vez é bem mais rápido que
  // adicionar 1000 elementos um por um.
  grade.innerHTML = visiveis.map(cardDe).join("");
}

/* Preenche os menus de tipo e geração com o que existe nos dados. */
function prepararFiltros() {
  const tiposUsados = new Set();
  const geracoes = new Set();

  for (const p of TODOS) {
    p.tipos.forEach((t) => tiposUsados.add(t));
    if (p.geracao) geracoes.add(p.geracao);
  }

  for (const t of TODOS_OS_TIPOS) {
    if (!tiposUsados.has(t)) continue;
    const opcao = document.createElement("option");
    opcao.value = t;
    opcao.textContent = NOMES_TIPO[t];
    filtroTipo.appendChild(opcao);
  }

  const ordenadas = [...geracoes].sort(
    (a, b) => Number(a.replace("gen", "")) - Number(b.replace("gen", ""))
  );
  for (const g of ordenadas) {
    const opcao = document.createElement("option");
    opcao.value = g;
    opcao.textContent = "Geração " + g.replace("gen", "");
    filtroGeracao.appendChild(opcao);
  }
}

/*
  Ponto de partida. DADOS_POKEMON vem do dados/dados.js, que o HTML carrega
  antes deste arquivo — por isso a variável já existe aqui.
*/
TODOS = DADOS_POKEMON;
prepararFiltros();
atualizar();

busca.addEventListener("input", atualizar);
filtroTipo.addEventListener("change", atualizar);
filtroRaridade.addEventListener("change", atualizar);
filtroGeracao.addEventListener("change", atualizar);
