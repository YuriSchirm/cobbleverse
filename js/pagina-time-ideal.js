/*
  Time ideal: você escolhe um Pokémon e o site monta os outros 5 em volta dele.

  A diferença pra página de Builds é de quem faz o trabalho. Lá você monta e o
  site critica; aqui você dá o ponto de partida e o site monta. As contas são
  as mesmas — vêm todas de js/avaliar.js.
*/

const CAIXA_FAVORITO = "cobbleverse-favorito";

const areaFavorito = document.getElementById("favorito");
const areaResultado = document.getElementById("resultado");
const campoDificuldade = document.getElementById("dificuldade");

let favorito = null;

/* ------------------------------------------------ quem pode entrar no time */

/*
  Sem o filtro de dificuldade a resposta seria sempre a mesma lista de lendários:
  eles têm status altíssimo e o algoritmo iria atrás disso. Um time que você não
  consegue montar não serve pra nada.
*/
function passaNaDificuldade(p, nivel) {
  // Sem raridade = não nasce na natureza: vem de evolução, ovo ou evento.
  if (nivel === "natureza") return Boolean(p.raridadeId);
  if (nivel === "faceis") return p.raridadeId === "common" || p.raridadeId === "uncommon";
  return true;
}

/* ------------------------------------------------------------- o algoritmo */

/*
  O que esse Pokémon acrescentou ao time que já existia.

  Compara o time ANTES e DEPOIS de ele entrar. O que mudou entre os dois é,
  literalmente, a contribuição dele.
*/
function porqueEntrou(timeAntes, p) {
  const antes = analisarTime(timeAntes);
  const depois = analisarTime([...timeAntes, { pokemon: p, mega: null }]);
  const partes = [];

  // Tipos que ninguém do time batia forte e que agora alguém bate.
  const novos = TODOS_OS_TIPOS.filter(
    (t) => antes.acertam[t].length === 0 && depois.acertam[t].length > 0
  );
  if (novos.length > 0) {
    partes.push("abre ataque contra " + novos.map((t) => NOMES_TIPO[t]).join(", "));
  }

  // Fraquezas que o time tinha e que ele aguenta — as três mais espalhadas.
  const defesa = calcularDefesa(p.tipos);
  const tampou = TODOS_OS_TIPOS.filter((t) => antes.fracos[t].length > 0 && defesa[t] < 1)
    .sort((a, b) => antes.fracos[b].length - antes.fracos[a].length)
    .slice(0, 3);
  if (tampou.length > 0) {
    partes.push("aguenta " + tampou.map((t) => NOMES_TIPO[t]).join(", "));
  }

  if (partes.length === 0) {
    partes.push("entra pelo status alto sem repetir fraqueza de ninguém");
  }

  return partes.join(" · ");
}

/*
  O algoritmo GULOSO (greedy), que é o nome de uma ideia bem simples:
  a cada rodada, pega o melhor pedaço na hora e não volta atrás.

  Aqui: testa os 1025 Pokémon como se cada um fosse o próximo do time, fica com
  o que faz a nota geral subir mais, e repete até fechar os 6.

  Por que não testar todas as combinações possíveis? Porque escolher 5 entre
  1025 dá mais de 1 quatrilhão de times — o navegador não terminaria nunca.
  O guloso não garante o melhor time do universo. Garante um time bom e, o que
  importa mais aqui, EXPLICÁVEL: dá pra dizer por que cada um entrou.
*/
function montarTime(escolhido, nivel) {
  const time = [
    {
      pokemon: escolhido,
      porque: "é o seu favorito — o time inteiro foi montado em volta dele",
    },
  ];

  while (time.length < 6) {
    let melhor = null;
    let melhorNota = -1;

    for (const p of DADOS_POKEMON) {
      if (p.tipos.length === 0) continue;
      if (time.some((m) => m.pokemon.id === p.id)) continue;
      if (!passaNaDificuldade(p, nivel)) continue;

      const nota = calcularNotas([...time, { pokemon: p, mega: null }]).notas.geral;
      if (nota > melhorNota) {
        melhorNota = nota;
        melhor = p;
      }
    }

    // Filtro apertado demais: não sobrou ninguém pra testar.
    if (!melhor) break;

    // A razão é calculada ANTES do push, com o time do jeito que ele estava.
    const razao = porqueEntrou(time, melhor);
    time.push({ pokemon: melhor, porque: razao });
  }

  return time;
}

/* ----------------------------------------------------------- o favorito */

function salvarFavorito() {
  try {
    localStorage.setItem(CAIXA_FAVORITO, favorito ? favorito.id : "");
  } catch (erro) {
    // Navegador anônimo ou storage bloqueado: não é motivo pra quebrar a página.
  }
}

function carregarFavorito() {
  try {
    const id = localStorage.getItem(CAIXA_FAVORITO);
    if (id) favorito = DADOS_POKEMON.find((p) => p.id === id) || null;
  } catch (erro) {
    favorito = null;
  }
}

function desenharFavorito() {
  if (!favorito) {
    areaFavorito.innerHTML = `
      <button type="button" class="slot-time vazio" data-trocar>
        <span class="mais">+</span>
        <span>Escolher Pokémon</span>
      </button>`;
    return;
  }

  areaFavorito.innerHTML = `
    <article class="slot-time cheio favorito r-${favorito.raridadeId || "nenhuma"}">
      <span class="etiqueta-favorito">seu favorito</span>
      <a href="pokemon.html?id=${favorito.id}">
        <img src="${imagemDo(favorito.dex)}" alt="${favorito.nome}" onerror="this.style.visibility='hidden'">
      </a>
      <h3>${favorito.nome}</h3>
      <div class="tipos">${etiquetasDeTipo(favorito.tipos)}</div>
      <p class="raridade raridade-${favorito.raridadeId || "nenhuma"}">${favorito.raridade}</p>
      <button type="button" class="botao-fraco trocar" data-trocar>Trocar</button>
    </article>`;
}

/* ------------------------------------------------------------ o resultado */

function cardDoMembro(membro, indice) {
  const p = membro.pokemon;

  return `
    <article class="slot-time cheio r-${p.raridadeId || "nenhuma"}${indice === 0 ? " favorito" : ""}">
      ${indice === 0 ? `<span class="etiqueta-favorito">seu favorito</span>` : ""}
      <a href="pokemon.html?id=${p.id}">
        <img src="${imagemDo(p.dex)}" alt="${p.nome}" loading="lazy" onerror="this.style.visibility='hidden'">
      </a>
      <h3>${p.nome}</h3>
      <div class="tipos">${etiquetasDeTipo(p.tipos)}</div>
      <p class="numero">Total de status: ${totalDeStats(p.stats)}</p>
      <p class="raridade raridade-${p.raridadeId || "nenhuma"}">${p.raridade}</p>
      <p class="motivos">${membro.porque}</p>
    </article>`;
}

function desenharResultado(time) {
  const { notas } = calcularNotas(time);
  const veredito = vereditoDe(notas.geral);

  const incompleto =
    time.length < 6
      ? `<p class="detalhes">Só consegui montar ${time.length}. Afrouxe a dificuldade pra ter mais candidatos.</p>`
      : "";

  areaResultado.innerHTML = `
    <section class="painel">
      <h2>O time</h2>
      <div class="slots">${time.map(cardDoMembro).join("")}</div>
      ${incompleto}
    </section>

    <section class="painel resultado">
      <div class="veredito">
        <span class="nota-geral">${notas.geral}</span>
        <div>
          <h2>${veredito.titulo}</h2>
          <p>${veredito.texto}</p>
        </div>
      </div>

      ${barraDeNota("Defesa", notas.defesa, "fraquezas que se repetem no time")}
      ${barraDeNota("Ataque", notas.ataque, "quantos tipos o time bate forte")}
      ${barraDeNota("Equilíbrio", notas.equilibrio, "status e tipos repetidos")}
      ${barraDeNota("Praticidade", notas.praticidade, "dá pra pegar esse time no seu mundo")}

      <p class="ressalva">
        O time é montado por um algoritmo guloso: ele escolhe o melhor
        companheiro de cada vez, sem voltar atrás. Não é o melhor time possível
        do jogo — é um time bom e coerente com o seu favorito. Quer mexer nele à
        mão? A página de <a href="builds.html">Builds</a> serve pra isso.
      </p>
    </section>`;
}

function montar() {
  if (!favorito) {
    areaResultado.innerHTML = `
      <section class="painel">
        <h2>Escolha alguém primeiro</h2>
        <p class="nada">Clique no quadrado acima e escolha o Pokémon que você quer no time.</p>
      </section>`;
    return;
  }

  areaResultado.innerHTML = `
    <section class="painel"><p class="nada">Montando o time...</p></section>`;

  /*
    Esse setTimeout de zero milissegundos parece inútil, mas resolve um problema
    real: JavaScript roda numa linha só. Se a conta começasse agora, o navegador
    ficaria ocupado até ela terminar e nunca desenharia a frase "Montando o
    time..." — ela só apareceria depois de já ter acabado. O setTimeout devolve
    a vez pro navegador desenhar, e a conta começa logo em seguida.
  */
  setTimeout(function () {
    desenharResultado(montarTime(favorito, campoDificuldade.value));
  }, 0);
}

/* --------------------------------------------------------------- eventos */

document.addEventListener("click", function (evento) {
  if (!evento.target.closest("[data-trocar]")) return;

  abrirSeletor([], function (pokemon) {
    favorito = pokemon;
    salvarFavorito();
    desenharFavorito();
    montar();
  });
});

campoDificuldade.addEventListener("change", montar);

/* ------------------------------------------------------------- o começo */

carregarFavorito();
desenharFavorito();
montar();
