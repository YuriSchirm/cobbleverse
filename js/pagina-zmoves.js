/*
  Z-Moves: os 35 cristais Z.

  Dois grupos bem diferentes: os de TIPO, que qualquer Pokémon daquele tipo
  usa, e os EXCLUSIVOS, que só um Pokémon específico consegue usar.
*/

const lista = document.getElementById("lista");

function cardDeCristal(cristal) {
  const etiqueta = cristal.tipo
    ? `<span class="tipo" style="background:${CORES_TIPO[cristal.tipo]}">${NOMES_TIPO[cristal.tipo]}</span>`
    : `<span class="para-quem">só o ${cristal.dono}</span>`;

  return `
    <article class="item-mega">
      <header>
        <img src="img/zmoves/${cristal.id}.png" alt="" onerror="this.style.display='none'">
        <h3>${cristal.nome}</h3>
      </header>
      <div class="tipos">${etiqueta}</div>
      ${desenharReceita(cristal.receita)}
    </article>`;
}

const deTipo = DADOS_ZMOVES.filter((c) => c.tipo);
const exclusivos = DADOS_ZMOVES.filter((c) => !c.tipo);

lista.innerHTML = `
  <section class="painel">
    <h2>Como funciona</h2>
    <ol class="passos">
      <li><strong>Consiga o Z-Ring</strong><br>É o acessório que vai no seu personagem, igual ao Mega Bracelete.</li>
      <li><strong>Dê o cristal pro Pokémon segurar</strong><br>O cristal precisa combinar com o tipo do golpe que ele vai usar.</li>
      <li><strong>Use o Z-Power na batalha</strong><br>Uma vez por batalha, o golpe vira a versão Z: dano muito maior.</li>
    </ol>
    <p class="ressalva">
      Cristal de tipo funciona com qualquer Pokémon que tenha um golpe daquele
      tipo. Os exclusivos só funcionam no Pokémon certo, com o golpe certo.
    </p>
  </section>

  <section class="painel">
    <h2>Cristais de tipo <span class="numero">${deTipo.length}</span></h2>
    <p class="detalhes">Servem pra qualquer Pokémon com um golpe daquele tipo.</p>
    <div class="lista-itens">${deTipo.map(cardDeCristal).join("")}</div>
  </section>

  <section class="painel">
    <h2>Cristais exclusivos <span class="numero">${exclusivos.length}</span></h2>
    <p class="detalhes">Cada um só funciona no Pokémon dono.</p>
    <div class="lista-itens">${exclusivos.map(cardDeCristal).join("")}</div>
  </section>`;
