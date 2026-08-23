/*
  Teste de fumaça das páginas.

  "Teste de fumaça" é o teste mais básico que existe: liga e vê se sai fumaça.
  Aqui ele carrega os scripts de cada página com um DOM de mentirinha e conta
  se algum estourou erro. Não checa se ficou bonito — checa se não quebrou.

  Roda com:
    ELECTRON_RUN_AS_NODE=1 "$LOCALAPPDATA/Programs/Microsoft VS Code/Code.exe" teste-paginas.js
*/

const fs = require("fs");
const vm = require("vm");
const pasta = __dirname + "/";

// As páginas de verdade, na mesma ordem de <script> do HTML.
const PAGINAS = {
  "index.html": ["dados/pokemon.js", "js/tipos.js", "js/dex.js"],
  "pokemon.html": ["dados/pokemon.js", "js/tipos.js", "js/ficha.js"],
  "builds.html": ["dados/pokemon.js", "js/tipos.js", "js/avaliar.js", "js/builds.js"],
  "tipos.html": ["js/tipos.js", "js/pagina-tipos.js"],
  "raids.html": ["dados/batalha.js", "js/tipos.js", "js/pagina-raids.js"],
  "treinadores.html": ["dados/batalha.js", "js/pagina-treinadores.js"],
  "megas.html": ["dados/megas.js", "js/pagina-megas.js"],
  "zmoves.html": ["dados/megas.js", "js/tipos.js", "js/pagina-zmoves.js"],
  "formas.html": ["dados/megas.js", "js/pagina-formas.js"],
  "tms.html": ["dados/tms.js", "js/pagina-tms.js"],
  "pokebolas.html": ["dados/itens.js", "js/pagina-bolas.js"],
  "crafts.html": ["dados/crafts.js", "js/pagina-crafts.js"],
  "berries.html": ["dados/itens.js", "js/pagina-itens.js"],
  "apricorns.html": ["dados/itens.js", "js/pagina-itens.js"],
  "evolucao.html": ["dados/itens.js", "js/pagina-itens.js"],
  "segurados.html": ["dados/itens.js", "js/pagina-itens.js"],
  "pesca.html": ["dados/itens.js", "js/pagina-itens.js"],
  "vitaminas.html": ["dados/itens.js", "js/pagina-itens.js"],
  "mints.html": ["dados/itens.js", "js/pagina-itens.js"],
  "gems.html": ["dados/itens.js", "js/pagina-itens.js"],
};

/* Um elemento falso que aceita tudo que os scripts fazem com ele. */
function elementoFalso() {
  const elemento = {
    innerHTML: "",
    textContent: "",
    value: "",
    dataset: {},
    style: {},
    children: [],
    appendChild(filho) {
      this.children.push(filho);
      return filho;
    },
    addEventListener() {},
    removeEventListener() {},
    showModal() {},
    close() {},
    focus() {},
    closest() {
      return null;
    },
    querySelector() {
      return null;
    },
  };
  return elemento;
}

function rodarPagina(pagina, scripts) {
  const criados = {};

  const contexto = {
    console,
    URLSearchParams,
    JSON,
    Math,
    Object,
    Array,
    String,
    Number,
    Set,
    Boolean,
    isNaN,
    parseInt,
    parseFloat,
    location: { search: "?id=charizard", pathname: "/" + pagina },
    localStorage: {
      dados: {},
      getItem(chave) {
        return this.dados[chave] || null;
      },
      setItem(chave, valor) {
        this.dados[chave] = valor;
      },
    },
    Option: function (texto, valor) {
      const o = elementoFalso();
      o.textContent = texto;
      o.value = valor;
      return o;
    },
    document: {
      getElementById(id) {
        if (!criados[id]) criados[id] = elementoFalso();
        return criados[id];
      },
      createElement() {
        return elementoFalso();
      },
      addEventListener() {},
      title: "",
    },
  };
  contexto.globalThis = contexto;
  vm.createContext(contexto);

  for (const arquivo of ["js/menu.js", "js/comum.js", ...scripts]) {
    const codigo = fs.readFileSync(pasta + arquivo, "utf8");
    new vm.Script(codigo, { filename: arquivo }).runInContext(contexto);
  }

  return criados;
}

let falhas = 0;

for (const [pagina, scripts] of Object.entries(PAGINAS)) {
  try {
    const elementos = rodarPagina(pagina, scripts);

    // Além de não quebrar, a página tem que ter DESENHADO alguma coisa.
    const escreveuAlgo = Object.values(elementos).some(
      (e) => e.innerHTML.length > 0 || e.textContent.length > 0 || e.children.length > 0
    );

    if (escreveuAlgo) {
      console.log("  ok     " + pagina);
    } else {
      console.log("  FALHA  " + pagina + ": carregou mas não desenhou nada");
      falhas++;
    }
  } catch (erro) {
    console.log("  FALHA  " + pagina + ": " + erro.message);
    falhas++;
  }
}

console.log("\n" + (falhas === 0 ? "todas as páginas carregam" : falhas + " página(s) com erro"));
process.exit(falhas === 0 ? 0 : 1);
