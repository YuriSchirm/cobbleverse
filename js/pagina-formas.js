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

function cardDeVariante(v) {
  const tipos = v.tipos
    .map((t) => `<span class="tipo" style="background:${CORES_TIPO[t]}">${NOMES_TIPO[t]}</span>`)
    .join("");
  const diferenca = v.total - v.totalBase;
  const sinal = diferenca > 0 ? `+${diferenca}` : diferenca;

  return `
    <article class="item-mega">
      <header>
        <img src="${v.dex ? imagemDo(v.dex) : ""}" alt="" loading="lazy"
             onerror="this.style.display='none'">
        <h3><a href="pokemon.html?id=${v.id}">${v.pokemon}</a></h3>
      </header>
      <p class="para-quem">${v.forma}</p>
      <div class="tipos">${tipos}</div>
      <p class="detalhes">Status ${v.total} <span class="numero">(${sinal} do normal)</span></p>
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

  const variantes = DADOS_VARIANTES.filter(function (v) {
    if (!texto) return true;
    return (
      v.pokemon.toLowerCase().includes(texto) || v.forma.toLowerCase().includes(texto)
    );
  });

  const total = DADOS_FORMAS.length + DADOS_VARIANTES.length;
  contagem.textContent = `${visiveis.length + variantes.length} de ${total} formas`;

  lista.innerHTML =
    (variantes.length
      ? `<section class="painel">
           <h2>Formas com status próprio <span class="numero">${variantes.length}</span></h2>
           <p class="detalhes">Mudam tipo ou status: regionais, Rotom, Deoxys, os cavaleiros do Calyrex.</p>
           <div class="lista-itens">${variantes.map(cardDeVariante).join("")}</div>
         </section>`
      : "") +
    (visiveis.length
      ? `<section class="painel">
           <h2>Trocas dentro da batalha <span class="numero">${visiveis.length}</span></h2>
           <p class="detalhes">Precisam de um item e acontecem no meio da luta.</p>
           <div class="lista-itens">${visiveis.map(cardDeForma).join("")}</div>
         </section>`
      : "") ||
    `<p class="nada">Nada com esse nome.</p>`;
}

busca.addEventListener("input", atualizar);
atualizar();
