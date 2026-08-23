/*
  Página de tipos: a calculadora em cima e a tabela completa embaixo.
  A lógica de verdade (a tabela de efetividade) está em js/tipos.js.
*/

const seletor1 = document.getElementById("tipo1");
const seletor2 = document.getElementById("tipo2");
const resultado = document.getElementById("resultado");
const tabela = document.getElementById("tabela");

function etiqueta(tipo) {
  return `<span class="tipo" style="background:${CORES_TIPO[tipo]}">${NOMES_TIPO[tipo]}</span>`;
}

/* Preenche os dois menus com os 18 tipos. */
for (const tipo of TODOS_OS_TIPOS) {
  seletor1.appendChild(new Option(NOMES_TIPO[tipo], tipo));
  seletor2.appendChild(new Option(NOMES_TIPO[tipo], tipo));
}

function mostrarResultado() {
  // O segundo tipo é opcional; filter(Boolean) tira o vazio da lista.
  const tipos = [seletor1.value, seletor2.value].filter(Boolean);

  const defesa = agruparPorMultiplicador(calcularDefesa(tipos));
  const ataque = calcularAtaque(tipos);
  const forteContra = TODOS_OS_TIPOS.filter((t) => ataque[t] === 2);

  function linha(titulo, classe, lista, explicacao) {
    if (lista.length === 0) return "";
    return `
      <h3 class="${classe}">${titulo}</h3>
      <div class="linha-tipos">${lista.map(etiqueta).join("")}</div>
      ${explicacao ? `<p class="detalhes">${explicacao}</p>` : ""}`;
  }

  resultado.innerHTML =
    linha("Toma 4× de dano de", "perigo", defesa["4"], "Um golpe desses derruba na hora. Evite.") +
    linha("Toma 2× de dano de", "perigo", defesa["2"]) +
    linha("Toma metade do dano de", "bom", defesa["0.5"]) +
    linha("Toma 1/4 do dano de", "bom", defesa["0.25"]) +
    linha("Não toma dano nenhum de", "bom", defesa["0"], "Imune: pode entrar sem medo.") +
    linha("Os golpes dele são fortes contra", "", forteContra);
}

/* Monta a tabela 18x18. */
function montarTabela() {
  // Primeira linha: os nomes dos tipos que defendem.
  let html = "<tr><th></th>";
  for (const defensor of TODOS_OS_TIPOS) {
    html += `<th class="vertical" style="color:${CORES_TIPO[defensor]}">${NOMES_TIPO[defensor]}</th>`;
  }
  html += "</tr>";

  // Uma linha por tipo atacante.
  for (const atacante of TODOS_OS_TIPOS) {
    html += `<tr><th class="lateral" style="background:${CORES_TIPO[atacante]}">${NOMES_TIPO[atacante]}</th>`;

    for (const defensor of TODOS_OS_TIPOS) {
      const efeito = TABELA_DE_TIPOS[atacante][defensor];

      if (efeito === 2) html += `<td class="celula forte">2×</td>`;
      else if (efeito === 0.5) html += `<td class="celula fraco">½</td>`;
      else if (efeito === 0) html += `<td class="celula zero">0</td>`;
      else html += `<td class="celula"></td>`;
    }

    html += "</tr>";
  }

  tabela.innerHTML = html;
}

seletor1.addEventListener("change", mostrarResultado);
seletor2.addEventListener("change", mostrarResultado);

mostrarResultado();
montarTabela();
