/*
  A ficha de um Pokémon só.

  Qual Pokémon? Vem do endereço: pokemon.html?id=charizard
  O navegador entrega isso pra gente com URLSearchParams.
*/

const ficha = document.getElementById("ficha");
const idProcurado = new URLSearchParams(location.search).get("id");

const NOMES_STAT = {
  hp: "HP",
  attack: "Ataque",
  defence: "Defesa",
  special_attack: "Atq. Especial",
  special_defence: "Def. Especial",
  speed: "Velocidade",
};

const HORARIOS = {
  day: "durante o dia",
  night: "durante a noite",
  dusk: "no entardecer",
  dawn: "no amanhecer",
  noon: "ao meio-dia",
  midnight: "à meia-noite",
};

function limpar(id) {
  // "#minecraft:village" vira "village"
  return String(id).replace("#", "").split(":").pop().replace(/_/g, " ");
}

/* ---------------------------------------------------------------- pedaços */

function blocoStats(stats) {
  let total = 0;
  const linhas = Object.keys(NOMES_STAT)
    .map(function (chave) {
      const valor = stats[chave] || 0;
      total += valor;
      // A barra mais longa possível é 255 (o maior stat que existe).
      const largura = Math.round((valor / 255) * 100);
      return `
        <div class="stat">
          <span class="stat-nome">${NOMES_STAT[chave]}</span>
          <span class="stat-valor">${valor}</span>
          <span class="stat-barra"><i style="width:${largura}%"></i></span>
        </div>`;
    })
    .join("");

  return `
    <section class="painel">
      <h2>Status base</h2>
      ${linhas}
      <p class="total">Total: <strong>${total}</strong></p>
    </section>`;
}

function blocoEfetividade(tipos) {
  const defesa = agruparPorMultiplicador(calcularDefesa(tipos));
  const ataque = calcularAtaque(tipos);

  function listar(listaDeTipos) {
    if (listaDeTipos.length === 0) return `<span class="nada">—</span>`;
    return listaDeTipos
      .map(
        (t) =>
          `<span class="tipo" style="background:${CORES_TIPO[t]}">${NOMES_TIPO[t]}</span>`
      )
      .join("");
  }

  const forteContra = Object.keys(ataque).filter((t) => ataque[t] === 2);

  return `
    <section class="painel">
      <h2>Fraquezas e vantagens</h2>

      <h3 class="perigo">Fraco contra</h3>
      <div class="linha-tipos">${listar(defesa["4"].concat(defesa["2"]))}</div>
      ${
        defesa["4"].length
          ? `<p class="aviso">Cuidado: ${listar(defesa["4"])} causa <strong>4× de dano</strong> nele.</p>`
          : ""
      }

      <h3 class="bom">Resiste a</h3>
      <div class="linha-tipos">${listar(defesa["0.5"].concat(defesa["0.25"]))}</div>

      <h3 class="bom">Imune a</h3>
      <div class="linha-tipos">${listar(defesa["0"])}</div>

      <h3>Os golpes dele são fortes contra</h3>
      <div class="linha-tipos">${listar(forteContra)}</div>
    </section>`;
}

/* As formas com status próprio: mega, regionais, Rotom, os cavaleiros do Calyrex. */
function blocoFormas(pokemon) {
  if (pokemon.variantes.length === 0) return "";

  const base = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);

  const linhas = pokemon.variantes
    .map(function (v) {
      const total = Object.values(v.stats).reduce((a, b) => a + b, 0);
      const diferenca = total - base;
      const sinal = diferenca > 0 ? `+${diferenca}` : diferenca;

      const tipos = v.tipos
        .map(
          (t) => `<span class="tipo" style="background:${CORES_TIPO[t]}">${NOMES_TIPO[t]}</span>`
        )
        .join("");

      return `
        <article class="local">
          <div class="local-topo">
            <strong>${v.nome}</strong>
            <span>${v.categoria === "mega" ? "mega evolução" : "forma"}</span>
            <span>status ${total} (${sinal})</span>
          </div>
          <div class="linha-tipos">${tipos}</div>
        </article>`;
    })
    .join("");

  return `
    <section class="painel">
      <h2>Outras formas</h2>
      <p class="detalhes">Cada uma muda tipo ou status. Dá pra testar no
        <a href="builds.html">montador de time</a>.</p>
      ${linhas}
    </section>`;
}

function blocoEvolucao(pokemon, porId) {
  if (!pokemon.preEvolucao && pokemon.evolucoes.length === 0) return "";

  let html = `<section class="painel"><h2>Evolução</h2>`;

  if (pokemon.preEvolucao) {
    const antes = porId[pokemon.preEvolucao];
    html += `<p>Evolui de <a href="pokemon.html?id=${pokemon.preEvolucao}">${
      antes ? antes.nome : pokemon.preEvolucao
    }</a>.</p>`;
  }

  for (const evo of pokemon.evolucoes) {
    const alvo = porId[evo.para];
    html += `
      <p class="evo">
        <a href="pokemon.html?id=${evo.para}">
          <img src="${alvo ? imagemDo(alvo.dex) : ""}" alt="" loading="lazy">
          <strong>${alvo ? alvo.nome : evo.para}</strong>
        </a>
        <span>${evo.como}</span>
      </p>`;
  }

  return html + `</section>`;
}

function blocoLocal(local) {
  const detalhes = [];

  if (local.horario) detalhes.push(HORARIOS[local.horario] || local.horario);
  if (local.chuva === true) detalhes.push("só chovendo");
  if (local.chuva === false) detalhes.push("sem chuva");
  if (local.tempestade === true) detalhes.push("durante tempestade");
  if (local.ceuAberto === true) detalhes.push("a céu aberto");
  if (local.ceuAberto === false) detalhes.push("sem ver o céu (caverna)");
  if (local.altura) {
    const [min, max] = local.altura;
    if (min !== null && max !== null) detalhes.push(`altura Y entre ${min} e ${max}`);
    else if (min !== null) detalhes.push(`acima de Y ${min}`);
    else detalhes.push(`abaixo de Y ${max}`);
  }
  if (local.faseDaLua !== undefined) detalhes.push(`fase da lua ${local.faseDaLua}`);
  if (local.estruturas) detalhes.push("em " + local.estruturas.map(limpar).join(" ou "));
  if (local.blocosPerto) detalhes.push("perto de " + local.blocosPerto.map(limpar).join(" ou "));
  if (local.isca) detalhes.push("com isca " + limpar(local.isca));

  const grupos = local.grupos.length
    ? local.grupos.map((g) => `<span class="grupo">${g}</span>`).join("")
    : "";

  return `
    <article class="local">
      <div class="local-topo">
        <span class="raridade raridade-${local.raridadeId}">${local.raridade}</span>
        <span>Nível ${local.nivel}</span>
        <span>${local.onde}</span>
      </div>
      <div class="grupos">${grupos}</div>
      ${detalhes.length ? `<p class="detalhes">${detalhes.join(" · ")}</p>` : ""}
      ${
        local.biomas.length
          ? `<details><summary>${local.biomas.length} biomas</summary>
             <p class="biomas">${local.biomas.join(" · ")}</p></details>`
          : ""
      }
    </article>`;
}

function blocoOndeEncontrar(pokemon) {
  if (pokemon.locais.length === 0) {
    return `
      <section class="painel">
        <h2>Onde encontrar</h2>
        <p class="nada">Este Pokémon não aparece naturalmente no COBBLEVERSE.
        Ele vem de evolução, ovo, troca ou algum evento especial.</p>
      </section>`;
  }

  return `
    <section class="painel">
      <h2>Onde encontrar</h2>
      ${pokemon.locais.map(blocoLocal).join("")}
    </section>`;
}

/* ------------------------------------------------------------------ montar */

function desenhar(pokemon, porId) {
  document.title = pokemon.nome + " — COBBLEVERSE";

  const tipos = pokemon.tipos
    .map(
      (t) =>
        `<span class="tipo" style="background:${CORES_TIPO[t]}">${NOMES_TIPO[t]}</span>`
    )
    .join("");

  const habilidades = pokemon.habilidades
    .map((h) => `<li>${h.nome}${h.oculta ? " <em>(oculta)</em>" : ""}</li>`)
    .join("");

  ficha.innerHTML = `
    <a class="voltar" href="index.html">← Voltar pra Pokédex</a>

    <header class="cabecalho">
      <img src="${imagemDo(pokemon.dex)}" alt="${pokemon.nome}"
           onerror="this.style.visibility='hidden'">
      <div>
        <span class="numero">#${String(pokemon.dex).padStart(3, "0")}</span>
        <h1>${pokemon.nome}</h1>
        <div class="tipos">${tipos}</div>
        <p class="raridade raridade-${pokemon.raridadeId || "nenhuma"}">${pokemon.raridade}</p>
        <p class="descricao">${pokemon.descricao || ""}</p>
      </div>
    </header>

    <div class="paineis">
      ${blocoOndeEncontrar(pokemon)}
      ${blocoEfetividade(pokemon.tipos)}
      ${blocoStats(pokemon.stats)}
      ${blocoFormas(pokemon)}
      ${blocoEvolucao(pokemon, porId)}

      <section class="painel">
        <h2>Outras informações</h2>
        <ul class="lista">
          ${habilidades}
        </ul>
        <p>Facilidade de captura (catch rate): <strong>${pokemon.catchRate}</strong>
           — quanto maior, mais fácil de pegar.
           <a href="pokebolas.html">Ver qual pokébola usar</a></p>
        <p>Altura: ${(pokemon.altura / 10).toFixed(1)} m ·
           Peso: ${(pokemon.peso / 10).toFixed(1)} kg</p>
        <p>Grupo de ovo: ${pokemon.grupoOvo.join(", ") || "—"}</p>
      </section>
    </div>
  `;
}

// Um "índice" por id: procurar fica instantâneo em vez de varrer a lista.
const porId = {};
for (const p of DADOS_POKEMON) porId[p.id] = p;

const pokemon = porId[idProcurado];
if (pokemon) {
  desenhar(pokemon, porId);
} else {
  ficha.innerHTML = `<p class="nada">Não achei esse Pokémon.
    <a href="index.html">Voltar</a></p>`;
}
