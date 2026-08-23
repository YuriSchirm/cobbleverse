/*
  A página de builds: os 6 slots, o seletor de Pokémon e a tela de resultado.
  As contas da avaliação estão em js/avaliar.js.
*/

const CAIXA = "cobbleverse-time"; // nome da gaveta onde o time fica salvo

const areaSlots = document.getElementById("slots");
const areaAvaliacao = document.getElementById("avaliacao");
const seletor = document.getElementById("seletor");
const buscaTime = document.getElementById("busca-time");
const resultados = document.getElementById("resultados");
const contagemSeletor = document.getElementById("contagem-seletor");

let TODOS = [];
let time = []; // cada item: { pokemon, mega: null ou o número da forma }
let slotEmEdicao = null;

/* Avisa no seletor se o Pokémon tem mega, outra forma, ou as duas coisas. */
function etiquetaDeForma(p) {
  const temMega = p.variantes.some((v) => v.categoria === "mega");
  const temForma = p.variantes.some((v) => v.categoria === "forma");
  if (temMega && temForma) return `<span class="tem-mega">mega + formas</span>`;
  if (temMega) return `<span class="tem-mega">tem mega</span>`;
  if (temForma) return `<span class="tem-mega">tem forma</span>`;
  return "";
}

function etiquetasDeTipo(tipos) {
  return tipos
    .map(
      (t) => `<span class="tipo" style="background:${CORES_TIPO[t]}">${NOMES_TIPO[t]}</span>`
    )
    .join("");
}

/* ------------------------------------------------------ salvar e carregar */

/*
  O navegador tem uma gavetinha por site (localStorage) que sobrevive a fechar
  a aba. Guardamos só o id e a mega — o resto a gente reconstrói do JSON.
*/
function salvar() {
  try {
    const simples = time.map((m) => ({ id: m.pokemon.id, mega: m.mega }));
    localStorage.setItem(CAIXA, JSON.stringify(simples));
  } catch (erro) {
    // Navegador anônimo ou storage bloqueado: não é motivo pra quebrar a página.
  }
}

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CAIXA) || "[]");
    for (const item of salvo) {
      const pokemon = TODOS.find((p) => p.id === item.id);
      if (pokemon) time.push({ pokemon, mega: item.mega });
    }
  } catch (erro) {
    time = [];
  }
}

/* ------------------------------------------------------------- os slots */

function slotVazio(indice) {
  return `
    <button type="button" class="slot-time vazio" data-slot="${indice}">
      <span class="mais">+</span>
      <span>Escolher Pokémon</span>
    </button>`;
}

function slotCheio(membro, indice) {
  const p = membro.pokemon;
  const tipos = tiposDoMembro(membro);
  const total = totalDeStats(statsDoMembro(membro));

  let seletorMega = "";
  if (p.variantes.length > 0) {
    /*
      Mega e forma comum ficam em grupos separados de propósito. Mega é
      temporária e precisa de pedra; forma regional (Alolan, Hisui) ou os
      cavaleiros do Calyrex são permanentes. Juntar as duas na mesma lista
      daria a entender que é tudo a mesma coisa.
    */
    function grupo(titulo, categoria) {
      const opcoes = p.variantes
        .map((v, i) =>
          v.categoria === categoria
            ? `<option value="${i}" ${membro.mega === i ? "selected" : ""}>${v.nome}</option>`
            : ""
        )
        .join("");
      return opcoes ? `<optgroup label="${titulo}">${opcoes}</optgroup>` : "";
    }

    seletorMega = `
      <label class="mega">
        <span>Forma</span>
        <select data-mega="${indice}">
          <option value="">Normal</option>
          ${grupo("Mega evolução", "mega")}
          ${grupo("Outras formas", "forma")}
        </select>
      </label>`;
  } else {
    seletorMega = `<p class="sem-mega">Só tem a forma normal</p>`;
  }

  return `
    <article class="slot-time cheio r-${p.raridadeId || "nenhuma"}">
      <button type="button" class="tirar" data-tirar="${indice}" title="Tirar do time">×</button>
      <a href="pokemon.html?id=${p.id}">
        <img src="${imagemDo(p.dex)}" alt="${p.nome}" onerror="this.style.visibility='hidden'">
      </a>
      <h3>${p.nome}</h3>
      <div class="tipos">${etiquetasDeTipo(tipos)}</div>
      <p class="numero">Total de status: ${total}</p>
      <p class="raridade raridade-${p.raridadeId || "nenhuma"}">${p.raridade}</p>
      ${seletorMega}
      <button type="button" class="botao-fraco trocar" data-slot="${indice}">Trocar</button>
    </article>`;
}

function desenharSlots() {
  let html = "";
  for (let i = 0; i < 6; i++) {
    html += time[i] ? slotCheio(time[i], i) : slotVazio(i);
  }
  areaSlots.innerHTML = html;
}

/* ---------------------------------------------------------- o resultado */

function barraDeNota(rotulo, valor, explicacao) {
  const cor = valor >= 70 ? "boa" : valor >= 45 ? "media" : "ruim";
  return `
    <div class="nota">
      <span class="nota-rotulo">${rotulo}</span>
      <span class="nota-valor">${valor}</span>
      <span class="nota-barra"><i class="${cor}" style="width:${valor}%"></i></span>
      <span class="nota-explica">${explicacao}</span>
    </div>`;
}

function cardDeSugestao(sugestao) {
  const p = sugestao.pokemon;
  const podeAdicionar = time.length < 6;

  return `
    <article class="sugestao">
      <a href="pokemon.html?id=${p.id}">
        <img src="${imagemDo(p.dex)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
      </a>
      <div>
        <h4>${p.nome}</h4>
        <div class="tipos">${etiquetasDeTipo(p.tipos)}</div>
        <p class="motivos">${sugestao.motivos.join(" · ")}</p>
        <p class="raridade raridade-${p.raridadeId || "nenhuma"}">${p.raridade}</p>
      </div>
      ${
        podeAdicionar
          ? `<button type="button" class="botao-fraco" data-adicionar="${p.id}">Adicionar</button>`
          : ""
      }
    </article>`;
}

function desenharAvaliacao() {
  if (time.length === 0) {
    areaAvaliacao.innerHTML = `
      <section class="painel">
        <h2>Sem time ainda</h2>
        <p class="nada">Coloque pelo menos um Pokémon pra eu avaliar.</p>
      </section>`;
    return;
  }

  const r = avaliarTime(time, TODOS);

  const problemas = r.problemas.length
    ? r.problemas
        .map(
          (p) => `
          <article class="problema ${p.nivel}">
            <h3>${p.titulo}</h3>
            <p>${p.texto}</p>
            ${
              p.sugestoes.length
                ? `<p class="detalhes">Quem resolveria:</p>
                   <div class="sugestoes">${p.sugestoes.map(cardDeSugestao).join("")}</div>`
                : ""
            }
          </article>`
        )
        .join("")
    : `<p class="nada">Não achei furo nenhum. Bom trabalho.</p>`;

  areaAvaliacao.innerHTML = `
    <section class="painel resultado">
      <div class="veredito">
        <span class="nota-geral">${r.notas.geral}</span>
        <div>
          <h2>${r.veredito.titulo}</h2>
          <p>${r.veredito.texto}</p>
          ${
            r.completo
              ? ""
              : `<p class="detalhes">Avaliei com ${time.length} de 6. Complete o time pra nota valer de verdade.</p>`
          }
        </div>
      </div>

      ${barraDeNota("Defesa", r.notas.defesa, "fraquezas que se repetem no time")}
      ${barraDeNota("Ataque", r.notas.ataque, "quantos tipos o time bate forte")}
      ${barraDeNota("Equilíbrio", r.notas.equilibrio, "status e tipos repetidos")}
      ${barraDeNota("Praticidade", r.notas.praticidade, "dá pra pegar esse time no seu mundo")}

      <p class="ressalva">
        A nota de Ataque usa os tipos do Pokémon pra adivinhar os golpes dele.
        Os golpes que você ensina de verdade não estão nos arquivos do modpack,
        então trate essa nota como estimativa.
      </p>
    </section>

    <section class="painel">
      <h2>O que melhorar</h2>
      ${problemas}
    </section>`;
}

function atualizar() {
  desenharSlots();
  desenharAvaliacao();
  salvar();
}

/* ------------------------------------------------------------- o seletor */

function mostrarResultados() {
  const texto = buscaTime.value.trim().toLowerCase();
  const jaTem = time.map((m) => m.pokemon.id);

  const achados = TODOS.filter(function (p) {
    if (jaTem.includes(p.id)) return false;
    if (!texto) return true;
    return p.nome.toLowerCase().includes(texto) || String(p.dex).includes(texto);
  });

  // Mostrar mil resultados de uma vez é lento e inútil: ninguém olha o 800º.
  const mostrados = achados.slice(0, 60);
  contagemSeletor.textContent =
    achados.length > 60
      ? `${achados.length} encontrados — mostrando os 60 primeiros`
      : `${achados.length} encontrados`;

  resultados.innerHTML = mostrados
    .map(
      (p) => `
      <button type="button" class="achado r-${p.raridadeId || "nenhuma"}" data-escolher="${p.id}">
        <img src="${imagemDo(p.dex)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <span class="nome">${p.nome}</span>
        <span class="tipos">${etiquetasDeTipo(p.tipos)}</span>
        ${etiquetaDeForma(p)}
      </button>`
    )
    .join("");
}

function abrirSeletor(indice) {
  slotEmEdicao = indice;
  buscaTime.value = "";
  mostrarResultados();
  seletor.showModal();
  buscaTime.focus();
}

function escolher(id) {
  const pokemon = TODOS.find((p) => p.id === id);
  if (!pokemon) return;

  const novo = { pokemon, mega: null };

  if (slotEmEdicao !== null && time[slotEmEdicao]) {
    time[slotEmEdicao] = novo;
  } else if (time.length < 6) {
    time.push(novo);
  }

  seletor.close();
  atualizar();
}

/* --------------------------------------------------------------- eventos */

/*
  Um ouvinte só na página inteira, em vez de um por botão.
  Os botões são recriados o tempo todo; se o ouvinte estivesse neles,
  ele sumiria junto. Isso se chama delegação de evento.
*/
document.addEventListener("click", function (evento) {
  const alvo = evento.target.closest("[data-slot], [data-tirar], [data-adicionar], [data-escolher]");
  if (!alvo) return;

  if (alvo.dataset.slot !== undefined) {
    abrirSeletor(Number(alvo.dataset.slot));
  } else if (alvo.dataset.tirar !== undefined) {
    time.splice(Number(alvo.dataset.tirar), 1);
    atualizar();
  } else if (alvo.dataset.escolher) {
    escolher(alvo.dataset.escolher);
  } else if (alvo.dataset.adicionar) {
    slotEmEdicao = null;
    escolher(alvo.dataset.adicionar);
  }
});

document.addEventListener("change", function (evento) {
  const indice = evento.target.dataset.mega;
  if (indice === undefined) return;

  const valor = evento.target.value;
  time[Number(indice)].mega = valor === "" ? null : Number(valor);
  atualizar();
});

document.getElementById("fechar").addEventListener("click", () => seletor.close());
document.getElementById("limpar").addEventListener("click", function () {
  time = [];
  atualizar();
});
buscaTime.addEventListener("input", mostrarResultados);

/* ------------------------------------------------------------- o começo */

TODOS = DADOS_POKEMON;
carregar();
atualizar();
