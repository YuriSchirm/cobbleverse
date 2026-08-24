# Atualização: cores do Pokémon + página de Time ideal

Duas coisas independentes no mesmo patch.

## 1. Repaginada de cores

Sai o cinza de deepslate com laranja de tocha. Entram as cores do próprio
Pokémon: o azul e o amarelo da logo no fundo, o vermelho e o branco da
pokébola por cima.

### A divisão de papéis (e por que ela não é gosto)

| Cor | Papel | Motivo |
|---|---|---|
| Azul `#0E1546` → `#303C92` | fundo e painéis, em 4 profundidades | é o campo da logo |
| Amarelo `#ffcb05` | **letra** de destaque: link, aba ativa, nota | 9,7:1 de contraste sobre o azul |
| Vermelho `#d92d0a` | **mancha**: listra do card, faixa do topo, barras | 3,3:1 — não serve pra texto, serve pra área |
| Branco `#ffffff` | o texto normal | 14,7:1 |

Vermelho de pokébola como cor de texto sobre azul escuro fica abaixo do
mínimo legível (4,5:1). Por isso o vermelho vira área e o amarelo vira letra —
que é exatamente o que a logo e a bola fazem no mundo real.

### O que muda de tabela junto

- **Escada de raridade**: o azul-lápis do "raro" sumia dentro do fundo azul.
  Vira cinza → âmbar → ciano → rosa.
- **Cores dos tiers de raid**: mesma coisa, subiram de brilho pra sobreviver ao azul.
- **Nome dos tokens**: `--pedra` virou `--painel` e `--tocha` se partiu em
  `--realce` (amarelo) e `--vermelho`. Nome de variável que mente atrapalha.

### O elemento-assinatura

Uma pokébola desenhada **só com CSS** (dois gradientes, nenhuma imagem) ao lado
da marca no cabeçalho. Ousadia num lugar só; o resto do site fica quieto.

### Passos

- [x] 1. `:root` novo + comentário do topo do CSS
- [x] 2. Renomear `--pedra`/`--pedra-alta` → `--painel`/`--painel-alto`
- [x] 3. Visitar os 26 usos de `--tocha` e decidir um a um: amarelo ou vermelho
- [x] 4. Cores soltas: `.aviso`, `.celula.zero`, backdrop, 7 tiers de raid
- [x] 5. Fundo com o brilho amarelo + faixa vermelha no cabeçalho + a pokébola

### Verificações

- Nenhum texto pequeno em vermelho sobre azul
- Aba ativa, link de painel e nota geral em amarelo
- Foco do teclado visível (contorno amarelo)
- As 20 páginas antigas continuam carregando

## 2. Página nova: Time ideal

**O que faz:** você escolhe um Pokémon favorito e o site monta os outros 5
em volta dele.

### Como o time é montado

Testar todas as combinações é impossível: 1025 elevado a 5 dá mais de um
quatrilhão. Então o algoritmo é **guloso** (greedy) — o mais simples que
resolve:

```
time = [o seu favorito]
repete 5 vezes:
    testa os 1025 Pokémon, um por um, como se fosse o próximo do time
    fica com aquele que faz a NOTA GERAL subir mais
```

Não garante o melhor time possível do universo, garante um time bom e — o que
importa mais — **explicável**: dá pra dizer por que cada um entrou.

### Reaproveitamento

As contas já existem em `js/avaliar.js`. Duas extrações antes de escrever a
página nova:

- `calcularNotas(time)` sai de dentro do `avaliarTime` pra poder ser chamada mil
  vezes por rodada sem arrastar junto a busca de sugestões, que é cara.
- `js/seletor.js`: a janela de escolher Pokémon estava presa no `builds.js`.
  Agora as duas páginas usam a mesma.

### Passos

- [x] 1. `calcularNotas` extraída, `teste-avaliacao.js` ainda passando
- [x] 2. `js/seletor.js` + `builds.js` usando ele
- [x] 3. `time-ideal.html` + `js/pagina-time-ideal.js`
- [x] 4. Link no menu, página no `teste-paginas.js`, contagem no `LEIA-ME.md`

### Verificações

- Escolher Pikachu monta 5 companheiros e explica cada um
- O favorito nunca sai do time nem aparece repetido
- Filtro de dificuldade muda o time sugerido
- Time montado tem nota maior que o favorito sozinho

## Resultado

**Cores:** 26 usos do laranja visitados um a um, 4 cores soltas trazidas pros
tokens, e o CSS voltou a ter zero cor escrita fora do `:root` (fora as 7 faixas
de tier, que são uma escala e moram juntas de propósito).

**Time ideal:** monta em ~100ms no computador. Verificado com Pikachu
(nota 42 sozinho → 91 em time), Charizard (35 → 88) e Magikarp (36 → 88).
Ninguém repete, o favorito nunca sai do primeiro lugar, e cada companheiro vem
com a frase do que ele acrescentou.

Três pedaços mudaram de casa pra isso, todos por já estarem sendo usados em
dois lugares: `calcularNotas` e `vereditoDe` (avaliar.js), a janela de escolher
Pokémon (seletor.js), `etiquetasDeTipo` e `barraDeNota` (comum.js).
