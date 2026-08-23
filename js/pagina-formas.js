/*
  Formas de batalha: mudanças que acontecem durante a luta.
  Primal, Origin, Crowned, Zen... cada uma precisa de um item.
*/

const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const contagem = document.getElementById("contagem");

function cardDeForma(forma) {
  const donos = forma.pokemon.join(", ");
  return `
    <article class="item-mega">
      <header>
        <h3>${donos}</h3>
      </header>
      <p class="para-quem">forma ${forma.forma || "especial"}</p>
      ${forma.item ? `<p class="receita-texto">Precisa de: ${forma.item}</p>` : ""}
    </article>`;
}

function atualizar() {
  const texto = busca.value.trim().toLowerCase();

  const visiveis = DADOS_FORMAS.filter(function (f) {
    if (!texto) return true;
    return (
      f.pokemon.join(" ").toLowerCase().includes(texto) ||
      String(f.forma).toLowerCase().includes(texto)
    );
  });

  contagem.textContent = `${visiveis.length} de ${DADOS_FORMAS.length} formas`;
  lista.innerHTML = visiveis.length
    ? `<div class="lista-itens">${visiveis.map(cardDeForma).join("")}</div>`
    : `<p class="nada">Nada com esse nome.</p>`;
}

busca.addEventListener("input", atualizar);
atualizar();
