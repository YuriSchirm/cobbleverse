/*
  Treinadores: o time completo de cada um.

  Serve pra saber o que vem antes de entrar na luta — nível, espécie,
  golpes e habilidade de cada Pokémon do time.
*/

const TETO = 40;

const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const filtroNivel = document.getElementById("filtro-nivel");
const contagem = document.getElementById("contagem");

function membroDoTime(m) {
  return `
    <article class="membro">
      <img src="${m.dex ? imagemDo(m.dex) : ""}" alt="" loading="lazy"
           onerror="this.style.visibility='hidden'">
      <div>
        <strong>${nomeBonito(m.especie)}</strong>
        <span class="numero">nível ${m.nivel || "?"}</span>
        ${m.habilidade ? `<span class="detalhes">${m.habilidade}</span>` : ""}
        ${m.golpes.length ? `<span class="detalhes">${m.golpes.join(" · ")}</span>` : ""}
      </div>
    </article>`;
}

function cardDeTreinador(t) {
  return `
    <details class="treinador">
      <summary>
        <span class="treinador-nome">${t.nome}</span>
        <span class="numero">nível até ${t.nivelMax} · ${t.time.length} Pokémon</span>
      </summary>
      <div class="time">${t.time.map(membroDoTime).join("")}</div>
    </details>`;
}

function atualizar() {
  const texto = busca.value.trim().toLowerCase();
  const teto = Number(filtroNivel.value) || 0;

  const achados = DADOS_TREINADORES.filter(function (t) {
    if (teto && t.nivelMax > teto) return false;
    if (!texto) return true;
    if (t.nome.toLowerCase().includes(texto)) return true;
    // Buscar também pelo Pokémon: "quem usa Gengar?"
    return t.time.some((m) => m.especie.toLowerCase().includes(texto));
  });

  const { mostrados, escondidos } = limitarLista(achados, TETO);

  contagem.textContent = escondidos
    ? `${achados.length} treinadores — mostrando os ${TETO} primeiros, refine a busca`
    : `${achados.length} treinadores`;

  lista.innerHTML = mostrados.length
    ? mostrados.map(cardDeTreinador).join("")
    : `<p class="nada">Nenhum treinador com esses filtros.</p>`;
}

busca.addEventListener("input", atualizar);
filtroNivel.addEventListener("change", atualizar);
atualizar();
