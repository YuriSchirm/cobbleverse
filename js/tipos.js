/*
  Tudo sobre os 18 tipos de Pokémon.

  Esta tabela NÃO está no modpack — é regra do jogo Pokémon, que o mod
  implementa no código. Então ela é escrita aqui à mão.
*/

const NOMES_TIPO = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  electric: "Elétrico",
  grass: "Planta",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Venenoso",
  ground: "Terrestre",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Metálico",
  fairy: "Fada",
};

const CORES_TIPO = {
  normal: "#9fa19f",
  fire: "#e8622a",
  water: "#2f8fd8",
  electric: "#e3c318",
  grass: "#4aa54a",
  ice: "#5fd0d0",
  fighting: "#d03e3e",
  poison: "#9b4a9b",
  ground: "#c9a63a",
  flying: "#7f9fe0",
  psychic: "#e8557f",
  bug: "#8fbc27",
  rock: "#b0a367",
  ghost: "#6b5a99",
  dragon: "#6b4fd0",
  dark: "#5a4a42",
  steel: "#7b9aa8",
  fairy: "#e08fc4",
};

/*
  Quanto dano cada tipo ATACANTE causa em cada tipo DEFENSOR.
  Só listamos o que foge do normal:
    2   = super efetivo (dano dobrado)
    0.5 = pouco efetivo (dano pela metade)
    0   = não afeta
  Qualquer combinação que não estiver aqui vale 1 (dano normal).
*/
const TABELA_DE_TIPOS = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const TODOS_OS_TIPOS = Object.keys(NOMES_TIPO);

/*
  Quanto dano um Pokémon RECEBE de cada tipo.

  Se ele tem dois tipos, os dois multiplicadores se multiplicam.
  Charizard é fogo/voador; um ataque de pedra é 2× contra fogo e 2× contra
  voador, então 2 × 2 = 4× de dano. É por isso que Charizard morre pra pedra.
*/
function calcularDefesa(tiposDoPokemon) {
  const resultado = {};

  for (const atacante of TODOS_OS_TIPOS) {
    let multiplicador = 1;

    for (const defensor of tiposDoPokemon) {
      const efeito = TABELA_DE_TIPOS[atacante][defensor];
      // Se não está na tabela, é dano normal (1) e não muda nada.
      if (efeito !== undefined) {
        multiplicador = multiplicador * efeito;
      }
    }

    resultado[atacante] = multiplicador;
  }

  return resultado;
}

/*
  Contra quem os ataques deste Pokémon são fortes.
  Pega o melhor dos dois tipos contra cada defensor.
*/
function calcularAtaque(tiposDoPokemon) {
  const resultado = {};

  for (const defensor of TODOS_OS_TIPOS) {
    let melhor = 0;

    for (const atacante of tiposDoPokemon) {
      const efeito = TABELA_DE_TIPOS[atacante][defensor];
      const valor = efeito === undefined ? 1 : efeito;
      if (valor > melhor) {
        melhor = valor;
      }
    }

    resultado[defensor] = melhor;
  }

  return resultado;
}

/* Separa o resultado em grupos, do jeito que a gente quer mostrar na tela. */
function agruparPorMultiplicador(multiplicadores) {
  const grupos = { "4": [], "2": [], "0.5": [], "0.25": [], "0": [] };

  for (const tipo in multiplicadores) {
    const valor = multiplicadores[tipo];
    if (valor !== 1 && grupos[String(valor)]) {
      grupos[String(valor)].push(tipo);
    }
  }

  return grupos;
}
