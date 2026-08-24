/*
  A janela de escolher um Pokémon.

  Ela nasceu dentro da página de Builds. Quando a página de Time ideal também
  precisou dela, copiar os 40 linhas seria o começo do problema de sempre:
  conserta-se o bug numa cópia e esquece-se a outra. Então ela mudou de casa.

  Quem usa chama assim:

      abrirSeletor(["pikachu"], function (pokemon) { ... })

  O primeiro argumento são os ids que NÃO devem aparecer na lista (quem já está
  no time). O segundo é o que fazer quando o usuário clicar em alguém.
*/

const seletorJanela = document.getElementById("seletor");
const seletorBusca = document.getElementById("busca-time");
const seletorLista = document.getElementById("resultados");
const seletorContagem = document.getElementById("contagem-seletor");

let seletorEsconder = [];
let seletorRetorno = null;

/* Avisa na lista se o Pokémon tem mega, outra forma, ou as duas coisas. */
function etiquetaDeForma(p) {
  const temMega = p.variantes.some((v) => v.categoria === "mega");
  const temForma = p.variantes.some((v) => v.categoria === "forma");
  if (temMega && temForma) return `<span class="tem-mega">mega + formas</span>`;
  if (temMega) return `<span class="tem-mega">tem mega</span>`;
  if (temForma) return `<span class="tem-mega">tem forma</span>`;
  return "";
}

function seletorDesenhar() {
  const texto = seletorBusca.value.trim().toLowerCase();

  const achados = DADOS_POKEMON.filter(function (p) {
    if (seletorEsconder.includes(p.id)) return false;
    if (!texto) return true;
    return p.nome.toLowerCase().includes(texto) || String(p.dex).includes(texto);
  });

  // Mostrar mil resultados de uma vez é lento e inútil: ninguém olha o 800º.
  const mostrados = achados.slice(0, 60);
  seletorContagem.textContent =
    achados.length > 60
      ? `${achados.length} encontrados — mostrando os 60 primeiros`
      : `${achados.length} encontrados`;

  seletorLista.innerHTML = mostrados
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

function abrirSeletor(esconder, retorno) {
  seletorEsconder = esconder || [];
  seletorRetorno = retorno;
  seletorBusca.value = "";
  seletorDesenhar();
  seletorJanela.showModal();
  seletorBusca.focus();
}

/*
  Um ouvinte só na página inteira, em vez de um por botão. Os botões da lista
  são recriados a cada busca; se o ouvinte estivesse neles, sumiria junto.
  Isso se chama delegação de evento.
*/
document.addEventListener("click", function (evento) {
  const alvo = evento.target.closest("[data-escolher]");
  if (!alvo) return;

  const pokemon = DADOS_POKEMON.find((p) => p.id === alvo.dataset.escolher);
  seletorJanela.close();
  if (pokemon && seletorRetorno) seletorRetorno(pokemon);
});

document.getElementById("fechar").addEventListener("click", () => seletorJanela.close());
seletorBusca.addEventListener("input", seletorDesenhar);
