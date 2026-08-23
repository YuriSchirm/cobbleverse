/*
  Raids: quem aparece em cada den, com tier e golpes.

  O tier é o que importa na hora de decidir se você encara: tier 7 tem
  Pokémon muito mais forte que tier 1.
*/

const TETO = 80;

const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const filtroTier = document.getElementById("filtro-tier");
const filtroTipo = document.getElementById("filtro-tipo");
const contagem = document.getElementById("contagem");

function cardDeRaid(raid) {
  const golpes = raid.golpes.length
    ? `<p class="detalhes">${raid.golpes.join(" · ")}</p>`
    : "";

  const tipo = NOMES_TIPO[raid.tipo]
    ? `<span class="tipo" style="background:${CORES_TIPO[raid.tipo]}">${NOMES_TIPO[raid.tipo]}</span>`
    : "";

  return `
    <article class="raid tier-${raid.tier}">
      <a href="pokemon.html?id=${raid.pokemon}">
        <img src="${raid.dex ? imagemDo(raid.dex) : ""}" alt="" loading="lazy"
             onerror="this.style.visibility='hidden'">
      </a>
      <div class="raid-corpo">
        <h3>${nomeBonito(raid.pokemon)}</h3>
        <div class="tipos"><span class="tier">Tier ${raid.tier}</span>${tipo}</div>
        ${golpes}
      </div>
    </article>`;
}

function prepararFiltros() {
  const tiers = [...new Set(DADOS_RAIDS.map((r) => r.tier))].sort((a, b) => a - b);
  for (const t of tiers) {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = `Tier ${t}`;
    filtroTier.appendChild(o);
  }

  const tipos = [...new Set(DADOS_RAIDS.map((r) => r.tipo))].filter((t) => NOMES_TIPO[t]);
  tipos.sort((a, b) => NOMES_TIPO[a].localeCompare(NOMES_TIPO[b]));
  for (const t of tipos) {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = NOMES_TIPO[t];
    filtroTipo.appendChild(o);
  }
}

function atualizar() {
  const texto = busca.value.trim().toLowerCase();
  const tier = filtroTier.value;
  const tipo = filtroTipo.value;

  const achados = DADOS_RAIDS.filter(function (r) {
    if (tier && String(r.tier) !== tier) return false;
    if (tipo && r.tipo !== tipo) return false;
    if (!texto) return true;
    return r.pokemon.toLowerCase().includes(texto);
  });

  const { mostrados, escondidos } = limitarLista(achados, TETO);

  contagem.textContent = escondidos
    ? `${achados.length} raids — mostrando as ${TETO} primeiras, use os filtros`
    : `${achados.length} raids`;

  lista.innerHTML = mostrados.length
    ? `<div class="lista-raids">${mostrados.map(cardDeRaid).join("")}</div>`
    : `<p class="nada">Nenhuma raid com esses filtros.</p>`;
}

prepararFiltros();
busca.addEventListener("input", atualizar);
filtroTier.addEventListener("change", atualizar);
filtroTipo.addEventListener("change", atualizar);
atualizar();
