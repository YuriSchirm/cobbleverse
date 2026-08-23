# Patch grande: tudo sobre o modpack

**Objetivo:** sair de 5 páginas pra 11, cobrindo o que o modpack tem de dado
aproveitável. Cada página lê os arquivos do modpack, como as outras.

## Páginas novas

| Página | Fonte | Quantidade | O que mostra |
|---|---|---|---|
| **Z-Moves** | `mega_showdown/z_crystal_item` | 35 cristais | qual cristal, qual tipo, qual golpe Z, como craftar |
| **Raids** | `cobblemonraiddens/raid` | 889 | qual Pokémon aparece, tier, tipo do den, golpes dele |
| **Treinadores** | `rctmod/trainers` | 155+ | time completo: espécie, nível, golpes, habilidade |
| **TMs** | `tmcraft/recipe` | 2172 | qual golpe cada TM ensina e como fazer |
| **Formas** | `mega_showdown/battle_form` | 52 | Gigantamax, Primal, Arceus, Aegislash |
| **Crafts** | todos os `*/recipe/` | ~6000 | busca universal: digita o item, vê a receita |

## Decisões

- **Uma busca só pra crafts**, não uma página por mod. Vinte páginas de receita
  seriam piores que um campo de busca — o jogador quer "como faço X", não
  "navegar pelo mod Y".
- **Prioridade Pokémon.** Os mods de decoração (rechiseled, handcrafted,
  cozyhome...) entram na busca de crafts, mas não ganham página própria.
- Se o `dados.js` passar de ~8 MB, quebrar em um arquivo por página, pra a
  Pokédex não carregar 6000 receitas à toa.

## Passos

- [x] 1. Extração: Z-Crystals (nome, tipo, golpe, receita)
- [x] 2. Extração: raids (agrupadas por Pokémon e por tier)
- [x] 3. Extração: treinadores (time completo, com nomes de golpe traduzidos)
- [x] 4. Extração: TMs (golpe que ensina + receita)
- [x] 5. Extração: formas de batalha
- [x] 6. Extração: índice universal de receitas
- [x] 7. Medir o tamanho e decidir se divide o dados.js
- [x] 8. As 6 páginas + menu
- [x] 9. Testes e publicar

## Resultado

20 páginas. Extração: 35 cristais Z, 74 formas, 1125 raids, 1714 treinadores,
930 TMs, 3280 receitas, 350 itens em 8 categorias. 5,2 MB divididos em 6
arquivos, um por assunto — cada página carrega só o que usa.

Duas coisas que precisaram existir por causa do tamanho:
- `js/menu.js` — o cabeçalho vive num lugar só. Com 20 páginas, manter 20
  cópias do menu seria garantia de esquecer alguma.
- `js/comum.js` — o que aparecia copiado (imagem do Pokémon, desenhar receita)
  passou pra cá.

## Verificações

- Z-Move de Dragão existe e tem receita
- Raid de tier 5 lista Pokémon lendário
- Treinador mostra time com 6 Pokémon e níveis coerentes
- Buscar "pokébola" nos crafts acha a receita
- `teste-paginas.js` passa com as 11 páginas
