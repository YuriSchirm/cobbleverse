# Página de Builds

**Objetivo:** montar um time de 6, o site dá uma nota e diz o que trocar.

## Como a avaliação funciona

Quatro notas separadas, porque "seu time é 72" sozinho não ensina nada:

| Nota | O que mede |
|---|---|
| **Defesa** | Fraqueza compartilhada. Se 3 do time morrem pra Terrestre, um Golem acaba com você. É o erro nº1 de quem monta time. |
| **Ataque** | Quantos dos 18 tipos o time consegue bater com 2×. |
| **Equilíbrio** | Tipos repetidos e média de status. |
| **Praticidade** | Dá pra pegar esse time no seu mundo? Time todo ultra-raro é bonito e inútil. |

**Ressalva honesta que vai escrita na página:** a nota de Ataque usa os TIPOS do
Pokémon como palpite dos golpes dele. O time real depende dos golpes que você
ensina — o site não tem esse dado.

## Passos

- [x] 1. `extrair.py`: guardar as formas Mega de cada Pokémon (nome, tipos, stats)
- [x] 2. `builds.html` + CSS dos 6 slots
- [x] 3. `js/builds.js`: escolher Pokémon, marcar mega, salvar no navegador
- [x] 4. `js/avaliar.js`: as contas das 4 notas
- [x] 5. Sugestões: achar Pokémon que tampam o buraco do time
- [x] 6. Link "Builds" no menu das 5 páginas antigas
- [x] 7. Testar: time só de Fogo tem que levar nota baixa em Defesa

## Feito e testado

`teste-avaliacao.js` roda 19 conferências sem navegador. Todas passam.

## Verificações

- Charizard tem 2 megas (X e Y); marcar X muda o tipo pra Fogo/Dragão
- Time com 4 Pokémon fracos a Terrestre → aviso grave
- Sugestão nunca repete Pokémon que já está no time
