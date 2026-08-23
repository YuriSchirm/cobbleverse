/* Página das pokébolas: agrupa por categoria e desenha os cards. */

const destino = document.getElementById("bolas");

const CATEGORIAS = [
  ["basica", "Básicas", "Funcionam sempre, em qualquer situação."],
  ["condicional", "De situação", "Só valem a pena no momento certo — aí são as melhores."],
  ["efeito", "De efeito", "Não ajudam a capturar: fazem outra coisa com o Pokémon."],
  ["ancestral", "Ancestrais (Hisui)", "Feitas com tumblestone. Mudam o alcance do arremesso."],
  ["especial", "Especiais", "Captura garantida."],
];

function cardDe(bola) {
  return `
    <article class="bola">
      <img src="img/bolas/${bola.id}.png" alt="" onerror="this.style.visibility='hidden'">
      <div>
        <h3>${bola.nome} <span class="efeito">${bola.efeito}</span></h3>
        <p class="quando">${bola.quando}</p>
        <p class="dica">${bola.dica}</p>
        <p class="receita-texto">Como fazer: ${bola.receita}</p>
      </div>
    </article>`;
}

let html = "";

for (const [chave, titulo, explicacao] of CATEGORIAS) {
  const doGrupo = DADOS_BOLAS.filter((b) => b.categoria === chave);
  if (doGrupo.length === 0) continue;

  html += `
    <section class="painel">
      <h2>${titulo}</h2>
      <p class="detalhes">${explicacao}</p>
      <div class="lista-bolas">${doGrupo.map(cardDe).join("")}</div>
    </section>`;
}

destino.innerHTML = html;
