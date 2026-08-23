/*
  Testes da avaliação de time.

  Roda sem navegador, usando o Node que vem dentro do VS Code:

    ELECTRON_RUN_AS_NODE=1 "$LOCALAPPDATA/Programs/Microsoft VS Code/Code.exe" teste-avaliacao.js

  Serve pra conferir que mexer nas notas não quebrou nada. Se você mudar os
  pesos em js/avaliar.js, rode isto: as comparações têm que continuar valendo.
*/

const fs = require("fs");
const path = __dirname + "/";

/*
  No navegador cada <script> compartilha o mesmo escopo. No Node, cada eval()
  cria o seu. Por isso tudo entra num eval só.

  Pegadinha: function declarada dentro de um eval VAZA pro escopo de fora,
  mas const NÃO vaza. Então as funções (calcularDefesa, avaliarTime...)
  ficam acessíveis aqui, mas o const DADOS_POKEMON não — daí a última linha,
  que copia o valor pra uma variável declarada aqui fora.
*/
let TODOS;
eval(
  fs.readFileSync(path + "dados/dados.js", "utf8") +
    "\n" +
    fs.readFileSync(path + "js/tipos.js", "utf8") +
    "\n" +
    fs.readFileSync(path + "js/avaliar.js", "utf8") +
    "\nTODOS = DADOS_POKEMON;"
);

const acha = (id) => TODOS.find((p) => p.id === id);
const monta = (ids, megas = {}) =>
  ids.map((id) => ({
    pokemon: acha(id),
    mega: megas[id] === undefined ? null : megas[id],
  }));

let falhas = 0;
function conferir(nome, condicao, extra) {
  console.log((condicao ? "  ok    " : "  FALHA ") + nome + (extra ? "  -> " + extra : ""));
  if (!condicao) falhas++;
}

console.log("\n=== 1. Mega muda tipo e status ===");
const zardBase = monta(["charizard"])[0];
const zardX = monta(["charizard"], { charizard: 0 })[0];
conferir(
  "Charizard base é fogo/voador",
  JSON.stringify(tiposDoMembro(zardBase)) === '["fire","flying"]',
  tiposDoMembro(zardBase).join("/")
);
conferir(
  "Mega X vira fogo/dragão",
  JSON.stringify(tiposDoMembro(zardX)) === '["fire","dragon"]',
  tiposDoMembro(zardX).join("/")
);
conferir(
  "Mega X tem mais status",
  totalDeStats(statsDoMembro(zardX)) > totalDeStats(statsDoMembro(zardBase)),
  totalDeStats(statsDoMembro(zardBase)) + " -> " + totalDeStats(statsDoMembro(zardX))
);
conferir(
  "Mega X deixa de ser fraco a Elétrico 2x",
  calcularDefesa(tiposDoMembro(zardX)).electric < calcularDefesa(tiposDoMembro(zardBase)).electric,
  calcularDefesa(tiposDoMembro(zardBase)).electric + "x -> " + calcularDefesa(tiposDoMembro(zardX)).electric + "x"
);

console.log("\n=== 2. Fraqueza compartilhada derruba a nota de Defesa ===");
const soFogo = monta(["charizard", "arcanine", "rapidash", "magmar", "flareon", "typhlosion"]);
const misto = monta(["charizard", "gyarados", "venusaur", "alakazam", "steelix", "gengar"]);
const rFogo = avaliarTime(soFogo, TODOS);
const rMisto = avaliarTime(misto, TODOS);

conferir(
  "Time só de Fogo tem Defesa pior que time misto",
  rFogo.notas.defesa < rMisto.notas.defesa,
  "fogo=" + rFogo.notas.defesa + " misto=" + rMisto.notas.defesa
);
conferir(
  "Time só de Fogo tem nota geral menor",
  rFogo.notas.geral < rMisto.notas.geral,
  "fogo=" + rFogo.notas.geral + " misto=" + rMisto.notas.geral
);
conferir(
  "Aponta a fraqueza a Água",
  rFogo.problemas.some((p) => p.titulo.includes("Água")),
  rFogo.problemas[0].titulo
);
conferir(
  "Avisa que tem tipo repetido",
  rFogo.problemas.some((p) => p.titulo.includes("do tipo Fogo"))
);

console.log("\n=== 3. Sugestões ===");
const prob = rFogo.problemas[0];
conferir("Sugere 3 Pokémon", prob.sugestoes.length === 3, prob.sugestoes.map((s) => s.pokemon.nome).join(", "));
conferir(
  "Nenhuma sugestão já está no time",
  prob.sugestoes.every((s) => !soFogo.some((m) => m.pokemon.id === s.pokemon.id))
);
conferir(
  "Nenhuma sugestão tem a mesma fraqueza (Água)",
  prob.sugestoes.every((s) => calcularDefesa(s.pokemon.tipos).water < 2),
  prob.sugestoes.map((s) => s.pokemon.nome + "=" + calcularDefesa(s.pokemon.tipos).water + "x").join(" ")
);
conferir(
  "Toda sugestão explica o motivo",
  prob.sugestoes.every((s) => s.motivos.length > 0),
  prob.sugestoes[0].motivos.join(" · ")
);

console.log("\n=== 4. As notas ficam sempre entre 0 e 100 ===");
const times = [
  soFogo,
  misto,
  monta(["magikarp"]),
  monta(["arceus", "mewtwo", "rayquaza", "groudon", "kyogre", "dialga"]),
  monta(["charizard"], { charizard: 1 }),
];
for (const t of times) {
  const r = avaliarTime(t, TODOS);
  const valores = [r.notas.defesa, r.notas.ataque, r.notas.equilibrio, r.notas.praticidade, r.notas.geral];
  conferir(
    "notas válidas: " + t.map((m) => m.pokemon.nome).slice(0, 3).join(", "),
    valores.every((n) => n >= 0 && n <= 100 && Number.isFinite(n)),
    valores.join(" / ")
  );
}

console.log("\n=== 5. Comparações que têm que fazer sentido ===");
const lendas = avaliarTime(monta(["arceus", "mewtwo", "rayquaza", "groudon", "kyogre", "dialga"]), TODOS);
const carpa = avaliarTime(monta(["magikarp"]), TODOS);
conferir(
  "Lendários tiram nota maior que Magikarp sozinho",
  lendas.notas.geral > carpa.notas.geral,
  "lendas=" + lendas.notas.geral + " carpa=" + carpa.notas.geral
);
conferir(
  "Lendários levam Praticidade baixa (difíceis de pegar)",
  lendas.notas.praticidade < 60,
  "" + lendas.notas.praticidade
);
conferir(
  "Magikarp sozinho NÃO tira nota alta em Defesa (é fraco e não tem pra quem trocar)",
  carpa.notas.defesa < 60,
  "" + carpa.notas.defesa
);
conferir(
  "Time misto de 6 tem Defesa melhor que Magikarp sozinho",
  rMisto.notas.defesa > carpa.notas.defesa,
  "misto=" + rMisto.notas.defesa + " carpa=" + carpa.notas.defesa
);
conferir("Time incompleto é marcado como incompleto", carpa.completo === false);
conferir("Time de 6 é marcado como completo", rMisto.completo === true);

console.log("\n" + (falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"));
process.exit(falhas === 0 ? 0 : 1);
