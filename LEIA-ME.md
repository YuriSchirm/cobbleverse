# Pokédex do COBBLEVERSE

**No ar em: https://yurischirm.github.io/cobbleverse/**

Site pra consultar os Pokémon do modpack. Os dados são lidos direto dos
arquivos do modpack instalado, então batem com o que aparece no seu jogo.

## Como abrir

Clique duas vezes no `index.html`. Só isso.

Antes o site precisava do `python -m http.server`, porque ele lia os dados com
`fetch()` — e o navegador proíbe uma página aberta como arquivo (`file://`) de
ler outros arquivos do disco. Agora os dados são um `<script>` (`dados/dados.js`),
que não tem essa restrição. Por isso abre direto, e por isso dá pra mandar
zipado pra alguém.

## Atualizar o site no ar

Mexeu em alguma coisa? Três comandos:

```
git add -A
git commit -m "o que mudou"
git push
```

Em ~1 minuto o site publicado já está com a mudança. Não precisa mandar
arquivo pra ninguém.

## Mandar pra alguém (sem internet)

```
python criar-zip.py
```

Gera o `cobbleverse.zip` (uns 0,4 MB) com só o que a pessoa precisa. Ela
descompacta e clica no `index.html`. Não instala nada.

Internet é necessária só pras imagens dos Pokémon (vêm da PokeAPI) e pras
fontes. Sem internet o site funciona igual, só fica mais simples.

## Quando o modpack atualizar

```
python extrair.py
```

Lê os `.jar` e `.zip` do modpack de novo e regrava o `dados/dados.js`.
Se você mudar a instância de lugar, ajuste os caminhos no topo do `extrair.py`.

## Testar

O VS Code traz um Node por dentro, então dá pra testar sem instalar nada:

```
ELECTRON_RUN_AS_NODE=1 "$LOCALAPPDATA/Programs/Microsoft VS Code/Code.exe" teste-avaliacao.js
ELECTRON_RUN_AS_NODE=1 "$LOCALAPPDATA/Programs/Microsoft VS Code/Code.exe" teste-paginas.js
```

- `teste-avaliacao.js` — 19 conferências nas contas da nota do time.
  Rode sempre que mexer no `js/avaliar.js`.
- `teste-paginas.js` — carrega as 6 páginas com um DOM falso e vê se alguma
  quebrou. Rode depois de mexer em qualquer JS.

## O que é cada arquivo

| Arquivo | O que faz |
|---|---|
| `extrair.py` | Lê o modpack e gera o `dados/dados.js`. Roda só quando o pack muda. |
| `criar-zip.py` | Monta o zip pra mandar pra alguém. |
| `index.html` + `js/dex.js` | A Pokédex: busca, filtros e a grade. |
| `pokemon.html` + `js/ficha.js` | A ficha de um Pokémon. |
| `builds.html` + `js/builds.js` | Monta o time de 6 e mostra a avaliação. |
| `js/avaliar.js` | As contas da nota do time. É o cérebro dos builds. |
| `tipos.html` + `js/pagina-tipos.js` | Calculadora de fraquezas e tabela dos 18 tipos. |
| `js/tipos.js` | A tabela de efetividade e as contas. Usada por várias páginas. |
| `pokebolas.html` + `js/pagina-bolas.js` | Guia de qual bola usar. |
| `megas.html` + `js/pagina-megas.js` | Megaevoluções e as receitas. |
| `css/estilo.css` | Todo o visual. |
| `dados/dados.js` | Gerado. Não edite à mão. |

## De onde vem cada informação

- **Espécies, stats, evoluções, formas Mega**: do `Cobblemon-fabric-1.7.3+1.21.1.jar`.
- **Raridade, bioma e nível**: do `COBBLEVERSE-DP-v21-CF.zip`. O datapack do
  modpack **substitui** os spawns do Cobblemon normal — por isso este site
  mostra números diferentes de qualquer wiki genérica de Cobblemon.
- **Megaevoluções e receitas**: do `mega_showdown-*.jar`.
- **Ícones de itens**: dos próprios mods, seguindo o modelo de cada item.
- **Tabela de tipos e multiplicadores das pokébolas**: escritos à mão, porque
  estão no código dos mods e não em arquivo de dados. Os das bolas foram
  conferidos na wiki oficial do Cobblemon.
- **Imagens dos Pokémon**: sprites da PokeAPI (precisa de internet).

## Créditos

Projeto de fã, sem ligação oficial com ninguém.

- Dados, ícones de itens e descrições da Pokédex vieram do modpack COBBLEVERSE
  e dos mods **Cobblemon** e **Mega Showdown**. Todo o crédito é deles.
- Sprites dos Pokémon: **PokeAPI**.
- Pokémon é marca da Nintendo, Game Freak e The Pokémon Company.

## Ideias pra depois

- Treinadores e ginásios (o `COBBLEVERSE-RCT-DP-v20.zip` tem 456 treinadores)
