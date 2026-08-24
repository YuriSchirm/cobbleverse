/*
  Pedaços usados por várias páginas.

  Tudo que apareceu copiado em mais de um lugar mora aqui. Copiar código
  parece mais rápido na hora, mas depois você conserta o mesmo bug em 5
  arquivos — e esquece um.
*/

/* Imagem do Pokémon pelo número da Pokédex. Vem da PokeAPI (precisa de internet). */
function imagemDo(dex) {
  return (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
    dex +
    ".png"
  );
}

/* 6 vira "#006" */
function numeroDex(dex) {
  return "#" + String(dex).padStart(3, "0");
}

/* Vira "Charizard" a partir de "charizard" ou "raichu_alolan". */
function nomeBonito(id) {
  return String(id)
    .split(/[_\-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/* Uma etiqueta colorida por tipo. A cor sai da tabela em js/tipos.js. */
function etiquetasDeTipo(tipos) {
  return tipos
    .map(
      (t) => `<span class="tipo" style="background:${CORES_TIPO[t]}">${NOMES_TIPO[t]}</span>`
    )
    .join("");
}

/* Uma linha de nota com barra: usada pela página de Builds e pela de Time ideal. */
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

/*
  Desenha uma receita: a grade 3x3 do craft, ou uma frase quando a receita
  não é de bancada (fornalha, cortador de pedra...).
*/
function desenharReceita(receita) {
  if (!receita) return "";
  if (receita.texto) return `<p class="receita-texto">${receita.texto}</p>`;

  let celulas = "";
  const usados = [];

  // O padrão tem até 3 linhas de até 3 letras. Espaço = slot vazio.
  for (let linha = 0; linha < 3; linha++) {
    const texto = receita.padrao[linha] || "   ";
    for (let coluna = 0; coluna < 3; coluna++) {
      const letra = texto[coluna] || " ";
      const item = receita.itens[letra];

      if (!item) {
        celulas += `<span class="slot"></span>`;
        continue;
      }

      if (!usados.includes(item.nome)) usados.push(item.nome);

      const dentro = item.icone
        ? `<img src="${item.icone}" alt="${item.nome}">`
        : `<span class="so-texto">${item.nome}</span>`;

      celulas += `<span class="slot cheio" title="${item.nome}">${dentro}</span>`;
    }
  }

  // No celular não existe passar o mouse por cima, então a lista fica embaixo.
  return `
    <div class="craft">${celulas}</div>
    <p class="ingredientes">${usados.join(" · ")}</p>`;
}

/*
  Listas grandes: desenhar 3000 cards de uma vez trava o navegador, e ninguém
  olha o milésimo. Mostra os primeiros e avisa quantos ficaram de fora.
*/
function limitarLista(itens, teto) {
  return {
    mostrados: itens.slice(0, teto),
    escondidos: Math.max(0, itens.length - teto),
  };
}
