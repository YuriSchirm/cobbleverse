/*
  O cérebro da página de builds: dá nota pro time e diz o que está errado.

  A ideia central é uma só: FRAQUEZA COMPARTILHADA.
  Se três do seu time morrem pra Terrestre, um Golem sozinho varre a sua party.
  Todo o resto da nota gira em volta disso.

  Ressalva honesta: a nota de Ataque usa os TIPOS do Pokémon como palpite dos
  golpes que ele vai usar. Na prática depende dos golpes que você ensina —
  esse dado não existe nos arquivos do modpack.
*/

/* Um membro pode estar megaevoluído; aí valem o tipo e o status da mega. */
function tiposDoMembro(membro) {
  const mega = membro.pokemon.megas[membro.mega];
  return mega ? mega.tipos : membro.pokemon.tipos;
}

function statsDoMembro(membro) {
  const mega = membro.pokemon.megas[membro.mega];
  return mega ? mega.stats : membro.pokemon.stats;
}

function totalDeStats(stats) {
  let soma = 0;
  for (const chave in stats) soma += stats[chave];
  return soma;
}

function entre(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/* Quão fácil é conseguir esse Pokémon no seu mundo. */
const PONTOS_DE_RARIDADE = {
  common: 100,
  uncommon: 85,
  rare: 60,
  "ultra-rare": 35,
};

/* ------------------------------------------------------------- a análise */

/*
  Varre o time e monta três mapas:
    fracos[tipo]    = quem toma dano dobrado desse tipo
    resistem[tipo]  = quem aguenta bem esse tipo
    acertam[tipo]   = quem bate forte NESSE tipo
*/
function analisarTime(time) {
  const fracos = {};
  const resistem = {};
  const acertam = {};

  for (const tipo of TODOS_OS_TIPOS) {
    fracos[tipo] = [];
    resistem[tipo] = [];
    acertam[tipo] = [];
  }

  for (const membro of time) {
    const tipos = tiposDoMembro(membro);
    const nome = membro.pokemon.nome;

    const defesa = calcularDefesa(tipos);
    for (const atacante in defesa) {
      if (defesa[atacante] >= 2) fracos[atacante].push(nome);
      if (defesa[atacante] < 1) resistem[atacante].push(nome);
    }

    const ataque = calcularAtaque(tipos);
    for (const defensor in ataque) {
      if (ataque[defensor] >= 2) acertam[defensor].push(nome);
    }
  }

  return { fracos, resistem, acertam };
}

/* --------------------------------------------------------------- as notas */

function notaDefesa(analise, tamanhoDoTime) {
  let nota = 100;

  for (const tipo of TODOS_OS_TIPOS) {
    const quantos = analise.fracos[tipo].length;
    const temResposta = analise.resistem[tipo].length > 0;

    /*
      Conta a PROPORÇÃO do time, não o número solto.
      Se contasse solto, um time de 1 Magikarp tiraria nota alta em defesa só
      porque "2 membros fracos" é impossível com um membro só. Em proporção,
      4/6 de um time cheio e 1/1 de um time solitário dão o mesmo peso — que
      é o certo: nos dois casos você não tem pra quem trocar.
    */
    const fatia = quantos / tamanhoDoTime;

    if (fatia >= 0.6) nota -= 24;
    else if (fatia >= 0.45) nota -= 15;
    else if (fatia >= 0.3) nota -= 5;

    // Ninguém aguenta esse tipo? Não tem pra quem trocar no meio da batalha.
    if (!temResposta && quantos > 0) nota -= 3;
  }

  return entre(Math.round(nota), 0, 100);
}

function notaAtaque(analise) {
  const cobertos = TODOS_OS_TIPOS.filter((t) => analise.acertam[t].length > 0);
  return Math.round((cobertos.length / TODOS_OS_TIPOS.length) * 100);
}

function notaEquilibrio(time) {
  // Média de status: 320 é bem fraquinho, 620 é topo de linha.
  let soma = 0;
  for (const membro of time) soma += totalDeStats(statsDoMembro(membro));
  const media = soma / time.length;
  let nota = ((media - 320) / (620 - 320)) * 100;

  // Tipo repetido demais deixa o time previsível.
  const vezes = {};
  for (const membro of time) {
    for (const tipo of tiposDoMembro(membro)) {
      vezes[tipo] = (vezes[tipo] || 0) + 1;
    }
  }
  for (const tipo in vezes) {
    if (vezes[tipo] >= 3) nota -= 14;
    else if (vezes[tipo] === 2) nota -= 4;
  }

  return entre(Math.round(nota), 0, 100);
}

function notaPraticidade(time) {
  let soma = 0;
  for (const membro of time) {
    // Sem raridade = não nasce na natureza (evolução, ovo ou evento).
    soma += PONTOS_DE_RARIDADE[membro.pokemon.raridadeId] || 25;
  }
  return Math.round(soma / time.length);
}

/* --------------------------------------------------------- as sugestões */

/*
  Procura, nos 1025, quem tampa o buraco do time.
  Cada candidato ganha pontos; os 3 melhores voltam.
*/
function sugerirPokemon(todos, time, tipoProblema, tiposDescobertos) {
  const jaTem = time.map((m) => m.pokemon.id);
  const candidatos = [];

  for (const p of todos) {
    if (jaTem.includes(p.id)) continue;
    if (p.tipos.length === 0) continue;

    let pontos = 0;
    const motivos = [];

    if (tipoProblema) {
      const defesa = calcularDefesa(p.tipos);
      const multiplicador = defesa[tipoProblema];

      // Não adianta sugerir alguém com a MESMA fraqueza do time.
      if (multiplicador >= 2) continue;

      if (multiplicador === 0) {
        pontos += 45;
        motivos.push(`imune a ${NOMES_TIPO[tipoProblema]}`);
      } else if (multiplicador < 1) {
        pontos += 28;
        motivos.push(`resiste a ${NOMES_TIPO[tipoProblema]}`);
      }
    }

    // Ele acerta forte algum tipo que ninguém do time alcança?
    const ataque = calcularAtaque(p.tipos);
    const novos = tiposDescobertos.filter((t) => ataque[t] >= 2);
    if (novos.length > 0) {
      pontos += novos.length * 9;
      motivos.push(`bate forte em ${novos.map((t) => NOMES_TIPO[t]).join(", ")}`);
    }

    // De nada adianta o Pokémon perfeito que você nunca vai achar.
    pontos += (PONTOS_DE_RARIDADE[p.raridadeId] || 25) / 6;
    pontos += totalDeStats(p.stats) / 22;

    if (pontos > 0) candidatos.push({ pokemon: p, pontos, motivos });
  }

  candidatos.sort((a, b) => b.pontos - a.pontos);
  return candidatos.slice(0, 3);
}

/* --------------------------------------------------------- os problemas */

function acharProblemas(time, analise, todos) {
  const problemas = [];

  // Tipos que o time inteiro não consegue acertar com força.
  const descobertos = TODOS_OS_TIPOS.filter((t) => analise.acertam[t].length === 0);

  // 1. Fraquezas compartilhadas, da pior pra menos pior.
  const compartilhadas = TODOS_OS_TIPOS.filter((t) => analise.fracos[t].length >= 2).sort(
    (a, b) => analise.fracos[b].length - analise.fracos[a].length
  );

  for (const tipo of compartilhadas.slice(0, 3)) {
    const quem = analise.fracos[tipo];
    const semResposta = analise.resistem[tipo].length === 0;

    problemas.push({
      nivel: quem.length >= 3 ? "grave" : "atencao",
      titulo: `${quem.length} do time é fraco contra ${NOMES_TIPO[tipo]}`,
      texto:
        `${quem.join(", ")} toma dano dobrado. ` +
        (semResposta
          ? "E ninguém do time aguenta esse tipo, então você não tem pra quem trocar no meio da batalha."
          : `Você pode trocar pra ${analise.resistem[tipo].join(" ou ")}.`),
      sugestoes: sugerirPokemon(todos, time, tipo, descobertos),
    });
  }

  // 2. Buracos de ataque.
  if (descobertos.length > 0) {
    problemas.push({
      nivel: descobertos.length >= 6 ? "atencao" : "dica",
      titulo: `Nenhum do time bate forte em ${descobertos.length} tipos`,
      texto:
        "São eles: " +
        descobertos.map((t) => NOMES_TIPO[t]).join(", ") +
        ". Contra esses você vai depender de golpe fora do tipo do seu Pokémon.",
      sugestoes: sugerirPokemon(todos, time, null, descobertos),
    });
  }

  // 3. Tipo repetido.
  const vezes = {};
  for (const membro of time) {
    for (const tipo of tiposDoMembro(membro)) vezes[tipo] = (vezes[tipo] || 0) + 1;
  }
  for (const tipo in vezes) {
    if (vezes[tipo] >= 3) {
      problemas.push({
        nivel: "atencao",
        titulo: `${vezes[tipo]} Pokémon do tipo ${NOMES_TIPO[tipo]}`,
        texto:
          "Tipo repetido quer dizer fraqueza repetida. Trocar um deles por outro " +
          "tipo cobre mais coisa sem perder nada.",
        sugestoes: [],
      });
    }
  }

  // 4. Time impossível de montar.
  const dificeis = time.filter(
    (m) => m.pokemon.raridadeId === "ultra-rare" || !m.pokemon.raridadeId
  );
  if (dificeis.length >= 4) {
    problemas.push({
      nivel: "dica",
      titulo: `${dificeis.length} do time são muito difíceis de conseguir`,
      texto:
        "No papel o time é forte, mas ultra raro quase não aparece. Vale trocar " +
        "um ou dois por algo comum enquanto você não acha os bons.",
      sugestoes: [],
    });
  }

  return problemas;
}

/* ------------------------------------------------------------ o resultado */

const VEREDITOS = [
  [90, "Time excelente", "Difícil melhorar. Só falta ajustar os golpes."],
  [75, "Time forte", "Aguenta o modpack inteiro. Os ajustes abaixo são refino."],
  [60, "Time bom", "Funciona bem. Tem um ou dois buracos pra tapar."],
  [40, "Dá pro gasto", "Segura as pontas, mas vai apanhar de certos tipos."],
  [0, "Precisa de ajustes", "Tem furo grande. Comece pelo primeiro problema da lista."],
];

function avaliarTime(time, todos) {
  if (time.length === 0) return null;

  const analise = analisarTime(time);

  const notas = {
    defesa: notaDefesa(analise, time.length),
    ataque: notaAtaque(analise),
    equilibrio: notaEquilibrio(time),
    praticidade: notaPraticidade(time),
  };

  notas.geral = Math.round(
    notas.defesa * 0.35 +
      notas.ataque * 0.3 +
      notas.equilibrio * 0.2 +
      notas.praticidade * 0.15
  );

  const veredito = VEREDITOS.find((v) => notas.geral >= v[0]);

  return {
    notas,
    analise,
    veredito: { titulo: veredito[1], texto: veredito[2] },
    problemas: acharProblemas(time, analise, todos),
    completo: time.length === 6,
  };
}
