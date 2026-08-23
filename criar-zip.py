"""
Monta o cobbleverse.zip pra mandar pra alguém.

Pega só o que a pessoa precisa pra usar o site — deixa de fora os arquivos de
desenvolvimento (o extrair.py, os testes, os planos), que não servem pra nada
na máquina dela.

Rodar:  python criar-zip.py
"""

import zipfile
from pathlib import Path

AQUI = Path(__file__).parent
DESTINO = AQUI / "cobbleverse.zip"

# O que vai junto. Pastas entram inteiras.
ARQUIVOS = ["index.html", "pokemon.html", "builds.html", "tipos.html", "pokebolas.html", "megas.html"]
PASTAS = ["css", "js", "dados", "img"]

COMO_USAR = """COBBLEVERSE - Pokedex do modpack
=================================

Como abrir:

  1. Descompacte esta pasta inteira em algum lugar.
  2. Clique duas vezes no arquivo  index.html
  3. Pronto. Abre no navegador.

Nao precisa instalar nada.

Precisa de internet?
  So pra aparecerem as imagens dos Pokemon (elas vem da PokeAPI) e as
  fontes bonitas. Sem internet o site funciona igual, so fica mais
  simples visualmente.

O que tem aqui:
  Pokedex ...... os 1025 Pokemon do modpack, com raridade, bioma e nivel
  Builds ....... monte seu time de 6 e veja onde ele tem furo
  Tipos ........ quem e forte contra quem
  Pokebolas .... qual bola usar em cada situacao
  Megas ........ como conseguir cada mega evolucao

Os dados foram lidos direto dos arquivos do modpack COBBLEVERSE, entao
batem com o que aparece no jogo de verdade.
"""


def main():
    total = 0

    with zipfile.ZipFile(DESTINO, "w", zipfile.ZIP_DEFLATED) as z:
        for nome in ARQUIVOS:
            caminho = AQUI / nome
            if caminho.exists():
                z.write(caminho, nome)
                total += 1

        for pasta in PASTAS:
            for caminho in sorted((AQUI / pasta).rglob("*")):
                if caminho.is_file():
                    # arcname = o caminho que o arquivo terá dentro do zip
                    z.write(caminho, str(caminho.relative_to(AQUI)).replace("\\", "/"))
                    total += 1

        z.writestr("COMO-USAR.txt", COMO_USAR.encode("utf-8"))
        total += 1

    tamanho = DESTINO.stat().st_size / 1_000_000
    print(f"OK: {DESTINO.name} com {total} arquivos ({tamanho:.1f} MB)")
    print(f"    {DESTINO}")


if __name__ == "__main__":
    main()
