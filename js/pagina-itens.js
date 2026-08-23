/*
  As páginas de categoria de item (berries, apricorns, pesca...).

  As oito usam ESTE mesmo arquivo. Qual categoria mostrar sai do nome da
  página: berries.html mostra a categoria "berries". Assim uma correção
  conserta as oito de uma vez.
*/

const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const contagem = document.getElementById("contagem");
const titulo = document.getElementById("titulo");
const explicacao = document.getElementById("explicacao");

const chave = (location.pathname.split("/").pop() || "berries.html").replace(".html", "");
const categoria = DADOS_ITENS.find((c) => c.chave === chave) || DADOS_ITENS[0];

titulo.textContent = categoria.titulo;
explicacao.textContent = categoria.explicacao;

function cardDeItem(item) {
  return `
    <article class="item-simples">
      <img src="${item.icone || ""}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
      <span>${item.nome}</span>
    </article>`;
}

function atualizar() {
  const texto = busca.value.trim().toLowerCase();
  const visiveis = categoria.itens.filter(
    (i) => !texto || i.nome.toLowerCase().includes(texto)
  );

  contagem.textContent =
    visiveis.length === categoria.itens.length
      ? `${categoria.itens.length} itens`
      : `${visiveis.length} de ${categoria.itens.length} itens`;

  lista.innerHTML = visiveis.length
    ? `<div class="grade-itens">${visiveis.map(cardDeItem).join("")}</div>`
    : `<p class="nada">Nenhum item com esse nome.</p>`;
}

busca.addEventListener("input", atualizar);
atualizar();
