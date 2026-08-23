# Pokédex do COBBLEVERSE

**No ar em: https://yurischirm.github.io/cobbleverse/**

Site pra consultar tudo do modpack. Os dados são lidos direto dos arquivos do
modpack instalado, então batem com o que aparece no seu jogo.

## As 20 páginas

**Pokémon**

| Página | O que tem |
|---|---|
| Pokédex | 1025 Pokémon: busca, filtro por tipo, raridade e geração |
| Ficha | onde encontrar, fraquezas, status, evolução, habilidades |
| Builds | monta o time de 6, dá nota e diz o que trocar |
| Tipos | calculadora de fraquezas + tabela dos 18 tipos |

**Batalha**

| Página | O que tem |
|---|---|
| Raids | 1125 raids: qual Pokémon, tier, tipo do den e golpes |
| Treinadores | 1714 treinadores com o time completo |
| Megas | 92 mega pedras com receita |
| Z-Moves | 35 cristais Z, de tipo e exclusivos |
| Formas | 74 formas de batalha (Primal, Origin, Crowned...) |
| TMs | 930 TMs e como fazer cada disco |

**Itens**

| Página | O que tem |
|---|---|
| Pokébolas | 48 bolas, multiplicador e quando usar |
| Berries · Apricorns · Evolução · Segurados · Pesca · Vitaminas · Mints · Gemas | 350 itens em 8 categorias |
| Crafts | busca em 3280 receitas do modpack inteiro |

## Como abrir

Clique duas vezes no `index.html`. Não precisa de servidor: os dados são
carregados por `<script>`, não por `fetch()`.

## Atualizar o site no ar

```
git add -A
git commit -m "o que mudou"
git push
```

Em ~1 minuto o site publicado já mudou.

## Quando o modpack atualizar

```
python extrair.py
```

Lê os `.jar` e `.zip` do modpack e regrava a pasta `dados/`.

## Mandar por arquivo (sem internet)

```
python criar-zip.py
```

Gera o `cobbleverse.zip`. A pessoa descompacta e clica no `index.html`.

## Testar

O VS Code traz um Node por dentro, então dá pra testar sem instalar nada:

```
ELECTRON_RUN_AS_NODE=1 "$LOCALAPPDATA/Programs/Microsoft VS Code/Code.exe" teste-avaliacao.js
ELECTRON_RUN_AS_NODE=1 "$LOCALAPPDATA/Programs/Microsoft VS Code/Code.exe" teste-paginas.js
```

- `teste-avaliacao.js` — 19 conferências nas contas da nota do time
- `teste-paginas.js` — carrega as 20 páginas com um DOM falso e vê se quebrou

## Como o código está organizado

| Arquivo | O que faz |
|---|---|
| `extrair.py` | Lê o modpack e gera a pasta `dados/`. Roda só quando o pack muda. |
| `criar-zip.py` | Monta o zip pra mandar pra alguém. |
| `js/menu.js` | O cabeçalho, escrito uma vez só e usado pelas 20 páginas. |
| `js/comum.js` | O que várias páginas usam: imagem do Pokémon, desenhar receita. |
| `js/tipos.js` | Tabela de efetividade dos 18 tipos e as contas. |
| `js/avaliar.js` | As notas do time. O cérebro da página de builds. |
| `js/pagina-*.js` | Um por página. |
| `js/pagina-itens.js` | Serve as 8 páginas de categoria: a categoria sai do nome do arquivo. |
| `css/estilo.css` | Todo o visual. |
| `dados/*.js` | Gerados. Um arquivo por assunto, pra cada página carregar só o que usa. |

## De onde vem cada informação

- **Espécies, stats, evoluções**: `Cobblemon-fabric-1.7.3+1.21.1.jar`
- **Raridade, bioma e nível**: `COBBLEVERSE-DP-v21-CF.zip`. O datapack do
  modpack **substitui** os spawns do Cobblemon normal — por isso este site
  mostra números diferentes de qualquer wiki genérica.
- **Megas**: `mega_showdown` (47 pedras) + `zamega` (45 pedras do Legends Z-A)
- **Z-Moves e formas**: `mega_showdown`
- **Raids**: `cobblemonraiddens`
- **Treinadores**: `COBBLEVERSE-RCT-DP-v20.zip`
- **TMs**: `tmcraft`
- **Ícones**: dos próprios mods, seguindo o modelo de cada item
- **Tabela de tipos e multiplicadores das pokébolas**: escritos à mão, porque
  estão no código dos mods. Os das bolas foram conferidos na wiki do Cobblemon.
- **Imagens dos Pokémon**: sprites da PokeAPI (precisa de internet)

## Créditos

Projeto de fã, sem ligação oficial com ninguém.

- Dados e ícones vieram do modpack COBBLEVERSE e dos mods **Cobblemon**,
  **Mega Showdown**, **ZA Mega**, **Cobblemon Raid Dens**, **RCT** e **TMCraft**.
- Sprites dos Pokémon: **PokeAPI**.
- Pokémon é marca da Nintendo, Game Freak e The Pokémon Company.

## Ideias pra depois

- Ligar as raids na ficha do Pokémon ("este aparece em raid tier 5")
- Mostrar quais TMs cada Pokémon consegue aprender
