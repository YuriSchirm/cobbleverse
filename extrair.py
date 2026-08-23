"""
Lê os arquivos do modpack COBBLEVERSE e gera os .json que o site usa.

Como funciona, em resumo:
  1. Um arquivo .jar (mod) ou .zip (datapack) é só uma pasta compactada.
     O módulo zipfile do Python abre e lê de dentro SEM precisar descompactar nada.
  2. O Minecraft carrega os dados em camadas: mods primeiro, datapacks depois.
     Se dois arquivos têm o mesmo caminho, o último carregado ganha.
     Por isso os spawns do COBBLEVERSE substituem os do Cobblemon normal.
  3. No fim, escreve tudo mastigado na pasta dados/.

Rodar:  python extrair.py
"""

import json
import zipfile
from pathlib import Path

# ---------------------------------------------------------------- configuração

INSTANCIA = Path(
    r"C:\Users\Yuri\curseforge\minecraft\Instances\COBBLEVERSE - Pokemon Adventure [Cobblemon]"
)
JAR_MINECRAFT = Path(
    r"C:\Users\Yuri\curseforge\minecraft\Install\versions\1.21.1\1.21.1.jar"
)
# O Minecraft não guarda as traduções dentro do .jar: ficam soltas numa pasta
# "assets", com nome de arquivo trocado por um código (hash). Um índice diz
# qual código corresponde a qual idioma.
PASTAS_ASSETS = [
    Path(r"C:\Users\Yuri\AppData\Roaming\.minecraft\assets"),
    Path(r"C:\Users\Yuri\curseforge\minecraft\Install\assets"),
]

AQUI = Path(__file__).parent
PASTA_DADOS = AQUI / "dados"
PASTA_ICONES = AQUI / "img" / "bolas"
PASTA_ITENS = AQUI / "img" / "itens"

# Nome bonito pros grupos de bioma (as "tags").
# O que não estiver aqui vira um nome genérico automático — o script avisa no fim.
NOMES_DE_TAG = {
    "is_overworld": "Overworld (qualquer lugar)",
    "is_nether": "Nether",
    "is_end": "End",
    "is_forest": "Floresta",
    "is_jungle": "Selva",
    "is_ocean": "Oceano",
    "is_deep_ocean": "Oceano profundo",
    "is_swamp": "Pântano",
    "is_freshwater": "Água doce (rio/lago)",
    "is_coast": "Praia / costa",
    "is_hills": "Colinas",
    "is_highlands": "Terras altas",
    "is_mountain": "Montanha",
    "is_arid": "Deserto / árido",
    "is_desert": "Deserto",
    "is_taiga": "Taiga",
    "is_temperate": "Clima temperado",
    "is_tropical_island": "Ilha tropical",
    "is_magical": "Bioma mágico",
    "is_volcanic": "Vulcânico",
    "is_snowy": "Neve",
    "is_cold": "Frio",
    "is_cave": "Caverna",
    "is_underground": "Subterrâneo",
    "is_mushroom": "Ilha de cogumelo",
    "is_plains": "Planície",
    "is_grassland": "Campo",
    "is_savanna": "Savana",
    "is_badlands": "Mesa / badlands",
    "is_floral": "Bioma florido",
    "is_sky": "Céu",
    "is_spooky": "Bioma sombrio",
    "is_dead": "Bioma morto",
    "is_wasteland": "Terra devastada",
    "is_lush": "Bioma exuberante",
    "is_river": "Rio",
    "is_beach": "Praia",
    "is_island": "Ilha",
    "is_peak": "Pico de montanha",
    "is_slope": "Encosta",
    "is_water": "Água",
    "is_bamboo": "Bambuzal",
    "is_flower_forest": "Floresta de flores",
    "is_birch_forest": "Floresta de bétulas",
    "is_dark_forest": "Floresta escura",
    "is_cherry_grove": "Bosque de cerejeiras",
    "is_cherry_blossom": "Cerejeiras",
    "is_basalt": "Deltas de basalto",
    "is_crimson": "Floresta carmesim (Nether)",
    "is_warped": "Floresta distorcida (Nether)",
    "is_soul_fire": "Vale das almas (Nether)",
    "is_soul_sand": "Areia das almas (Nether)",
    "is_quartz": "Quartzo (Nether)",
    "is_fungus": "Bioma de fungos",
    "is_deep_dark": "Deep Dark",
    "is_dripstone": "Caverna de dripstone",
    "lush": "Caverna exuberante",
    "is_cold_ocean": "Oceano frio",
    "is_warm_ocean": "Oceano quente",
    "is_lukewarm_ocean": "Oceano morno",
    "is_frozen_ocean": "Oceano congelado",
    "is_frozen": "Congelado",
    "is_freezing": "Congelante",
    "is_glacial": "Glacial",
    "is_tundra": "Tundra",
    "is_snowy_forest": "Floresta nevada",
    "is_snowy_taiga": "Taiga nevada",
    "is_thermal": "Fontes termais",
    "is_plateau": "Platô",
    "is_sandy": "Areia",
    "is_shrubland": "Arbustos",
    "is_overgrowth": "Vegetação densa",
    "mud": "Lamaçal",
    "end": "End",
    "is_aether": "Aether",
    "the_bumblezone": "The Bumblezone",
}

# Onde o Pokémon aparece fisicamente.
TIPOS_DE_POSICAO = {
    "grounded": "No chão",
    "submerged": "Debaixo d'água",
    "surface": "Na superfície da água",
    "seafloor": "No fundo do mar",
    "fishing": "Pescando",
    "lavafloor": "No fundo da lava",
    "underlava": "Dentro da lava",
}

RARIDADES = {
    "common": "Comum",
    "uncommon": "Incomum",
    "rare": "Raro",
    "ultra-rare": "Ultra raro",
}

# ------------------------------------------------------------------- utilidades


def ler_json(zip_aberto, caminho):
    """Lê um arquivo JSON de dentro de um zip. Devolve None se não der."""
    try:
        return json.loads(zip_aberto.read(caminho).decode("utf-8"))
    except Exception:
        # Alguns arquivos são comentados ou quebrados; ignorar é melhor que travar tudo.
        return None


def abrir_camadas():
    """
    Abre todos os zips na ORDEM que o Minecraft carrega.
    Quem vem depois na lista sobrescreve quem veio antes.
    """
    camadas = []

    if JAR_MINECRAFT.exists():
        camadas.append(zipfile.ZipFile(JAR_MINECRAFT))

    for jar in sorted((INSTANCIA / "mods").glob("*.jar")):
        try:
            camadas.append(zipfile.ZipFile(jar))
        except zipfile.BadZipFile:
            pass

    # Datapacks por último: é neles que o COBBLEVERSE muda os spawns.
    for pack in sorted((INSTANCIA / "datapacks").glob("*.zip")):
        try:
            camadas.append(zipfile.ZipFile(pack))
        except zipfile.BadZipFile:
            pass

    return camadas


def juntar_por_caminho(camadas, prefixo, sufixo=".json"):
    """
    Percorre todas as camadas e devolve {caminho: conteúdo}.
    Como a lista está na ordem de carregamento, quem vem depois sobrescreve.
    """
    resultado = {}
    for z in camadas:
        for nome in z.namelist():
            if nome.startswith(prefixo) and nome.endswith(sufixo):
                dados = ler_json(z, nome)
                if dados is not None:
                    resultado[nome] = dados
    return resultado


# ----------------------------------------------------------------------- tags


def carregar_tags(camadas):
    """
    Junta todas as tags de bioma de todos os mods.
    Uma tag é um apelido pra um grupo de biomas: "#cobblemon:is_hills".
    """
    tags = {}
    for z in camadas:
        for nome in z.namelist():
            if "/tags/worldgen/biome/" not in nome or not nome.endswith(".json"):
                continue
            partes = nome.split("/")
            # caminho: data/<namespace>/tags/worldgen/biome/<...>/<arquivo>.json
            namespace = partes[1]
            caminho = "/".join(partes[5:])[: -len(".json")]
            chave = f"{namespace}:{caminho}"

            dados = ler_json(z, nome)
            if dados is None:
                continue

            valores = []
            for v in dados.get("values", []):
                # Um valor pode ser texto simples ou {"id": ..., "required": false}
                valores.append(v["id"] if isinstance(v, dict) else v)

            # "replace": true significa "esquece o que já tinha, use só isto".
            if dados.get("replace") or chave not in tags:
                tags[chave] = valores
            else:
                tags[chave] = tags[chave] + valores

    return tags


def resolver_tag(referencia, tags, ja_vistas=None):
    """
    Transforma "#cobblemon:is_hills" na lista de biomas de verdade.

    É recursiva: uma tag pode apontar pra outra tag, que aponta pra outra...
    A função chama ela mesma até sobrar só nome de bioma.
    'ja_vistas' evita loop infinito se duas tags apontarem uma pra outra.
    """
    if ja_vistas is None:
        ja_vistas = set()

    if not referencia.startswith("#"):
        return [referencia]  # já é um bioma de verdade, acabou

    chave = referencia[1:]
    if chave in ja_vistas:
        return []  # já passei por aqui, senão roda pra sempre
    ja_vistas.add(chave)

    biomas = []
    for valor in tags.get(chave, []):
        biomas.extend(resolver_tag(valor, tags, ja_vistas))
    return biomas


def nome_da_tag(referencia, faltando):
    """Nome legível de uma tag, ex: '#cobblemon:is_hills' -> 'Colinas'."""
    curto = referencia.split(":")[-1].split("/")[-1]
    if curto in NOMES_DE_TAG:
        return NOMES_DE_TAG[curto]
    faltando.add(curto)
    return curto.replace("is_", "").replace("_", " ").capitalize()


# ------------------------------------------------------------------ traduções


def carregar_traducao_do_minecraft():
    """
    Pega o português oficial do Minecraft (nomes dos biomas da Vanilla).
    Ele não está no .jar: o índice em assets/indexes/*.json diz o "hash" do
    arquivo, e o conteúdo está em assets/objects/<2 letras do hash>/<hash>.
    """
    for base in PASTAS_ASSETS:
        for indice in sorted(base.glob("indexes/*.json"), reverse=True):
            try:
                objetos = json.loads(indice.read_text(encoding="utf-8"))["objects"]
            except Exception:
                continue
            item = objetos.get("minecraft/lang/pt_br.json")
            if not item:
                continue
            h = item["hash"]
            arquivo = base / "objects" / h[:2] / h
            if arquivo.exists():
                return json.loads(arquivo.read_text(encoding="utf-8"))
    return {}


def carregar_traducoes(camadas):
    """
    Junta os arquivos de idioma (pt_br) de todos os mods num dicionário só.
    É de onde saem as descrições da Pokédex e os nomes dos biomas em português.
    """
    textos = {}
    for z in camadas:
        for nome in z.namelist():
            if not nome.endswith("/lang/en_us.json"):
                continue
            # Carrega o inglês como reserva e, se existir, o português por cima.
            for idioma in ("en_us", "pt_br"):
                arquivo = nome.replace("en_us.json", f"{idioma}.json")
                if arquivo in z.namelist():
                    dados = ler_json(z, arquivo)
                    if dados:
                        textos.update(dados)

    # Por último o português oficial da Vanilla, pra ganhar do inglês do .jar.
    textos.update(carregar_traducao_do_minecraft())
    return textos


def nome_do_bioma(id_bioma, textos):
    """'minecraft:plains' -> 'Planície' (se o mod tiver tradução)."""
    namespace, _, caminho = id_bioma.partition(":")
    chave = f"biome.{namespace}.{caminho.replace('/', '.')}"
    return textos.get(chave, caminho.replace("_", " ").capitalize())


# -------------------------------------------------------------------- montagem


def montar_locais(spawns, tags, textos, faltando):
    """Transforma a lista crua de spawns em 'onde encontrar' legível."""
    locais = []
    for s in spawns:
        cond = s.get("condition") or {}
        anti = s.get("anticondition") or {}

        referencias = cond.get("biomes") or []
        if isinstance(referencias, str):
            referencias = [referencias]

        biomas = []
        for ref in referencias:
            for b in resolver_tag(ref, tags):
                nome = nome_do_bioma(b, textos)
                if nome not in biomas:
                    biomas.append(nome)

        local = {
            "raridade": RARIDADES.get(s.get("bucket"), s.get("bucket")),
            "raridadeId": s.get("bucket"),
            "nivel": s.get("level"),
            "peso": s.get("weight"),
            "onde": TIPOS_DE_POSICAO.get(
                s.get("spawnablePositionType"), s.get("spawnablePositionType")
            ),
            "grupos": [nome_da_tag(r, faltando) for r in referencias if r.startswith("#")],
            "biomas": sorted(biomas),
        }

        # Detalhes extras só entram se existirem — nada de campo vazio no JSON.
        if cond.get("timeRange"):
            local["horario"] = cond["timeRange"]
        if cond.get("isRaining") is not None:
            local["chuva"] = cond["isRaining"]
        if cond.get("isThundering") is not None:
            local["tempestade"] = cond["isThundering"]
        if cond.get("canSeeSky") is not None:
            local["ceuAberto"] = cond["canSeeSky"]
        if cond.get("minY") is not None or cond.get("maxY") is not None:
            local["altura"] = [cond.get("minY"), cond.get("maxY")]
        if cond.get("structures"):
            local["estruturas"] = cond["structures"]
        if cond.get("neededNearbyBlocks"):
            local["blocosPerto"] = cond["neededNearbyBlocks"]
        if cond.get("moonPhase") is not None:
            local["faseDaLua"] = cond["moonPhase"]
        if cond.get("bait"):
            local["isca"] = cond["bait"]
        if cond.get("rodType"):
            local["vara"] = cond["rodType"]
        if anti.get("biomes"):
            local["biomasExcluidos"] = anti["biomes"]

        locais.append(local)

    return locais


HORARIOS = {
    "day": "de dia",
    "night": "de noite",
    "dusk": "ao entardecer",
    "dawn": "ao amanhecer",
    "noon": "ao meio-dia",
    "midnight": "à meia-noite",
}

NOMES_STAT = {
    "hp": "HP",
    "attack": "Ataque",
    "defence": "Defesa",
    "special_attack": "Ataque Especial",
    "special_defence": "Defesa Especial",
    "speed": "Velocidade",
}


def nome_traduzido(chave, reserva, textos):
    """Busca no dicionário de idiomas; se não achar, arruma o texto cru."""
    return textos.get(chave, reserva.split(":")[-1].replace("_", " ").title())


def nome_de_item(item_id, textos):
    if not item_id:
        return ""
    namespace, _, caminho = item_id.partition(":")
    return nome_traduzido(f"item.{namespace}.{caminho}", item_id, textos)


def nome_de_golpe(golpe, textos):
    return nome_traduzido(f"cobblemon.move.{golpe}", golpe, textos)


# As formas regionais usam tags tipo "evolution/regional/pikachu_alolabiome".
REGIOES = ["alola", "kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "hisui", "galar", "paldea"]


def descrever_bioma(referencia):
    """Nome legível de um bioma ou grupo de biomas usado numa evolução."""
    for regiao in REGIOES:
        if f"{regiao}biome" in referencia:
            return f"biomas da região de {regiao.capitalize()}"
    return f"bioma de {nome_da_tag(referencia, set())}"


def descrever_requisito(req, textos):
    """Transforma um requisito de evolução em português."""
    v = req.get("variant")

    if v == "level":
        return f"a partir do nível {req.get('minLevel')}"
    if v == "friendship":
        return f"com amizade {req.get('amount')} ou mais"
    if v == "held_item":
        return f"segurando {nome_de_item(req.get('itemCondition'), textos)}"
    if v == "time_range":
        return HORARIOS.get(req.get("range"), req.get("range"))
    if v == "biome":
        if req.get("biomeCondition"):
            return f"em {descrever_bioma(req['biomeCondition'])}"
        return f"fora de {descrever_bioma(req.get('biomeAnticondition', ''))}"
    if v == "structure":
        if req.get("structureCondition"):
            return f"dentro de {req['structureCondition'].split(':')[-1].replace('_', ' ')}"
        return f"longe de {req.get('structureAnticondition', '').split(':')[-1].replace('_', ' ')}"
    if v == "has_move":
        return f"sabendo o golpe {nome_de_golpe(req.get('move'), textos)}"
    if v == "has_move_type":
        return f"sabendo um golpe do tipo {req.get('type')}"
    if v == "use_move":
        return f"usando {nome_de_golpe(req.get('move'), textos)} {req.get('amount')} vezes"
    if v == "moon_phase":
        return "na lua cheia" if req.get("moonPhase") == "FULL_MOON" else "em fase certa da lua"
    if v == "weather":
        return "na chuva" if req.get("isRaining") else "com tempo firme"
    if v == "party_member":
        return f"com um {req.get('target')} no time"
    if v == "defeat":
        return f"derrotando {req.get('amount')} {req.get('target')}"
    if v == "blocks_traveled":
        return f"depois de andar {req.get('amount')} blocos"
    if v == "stat_compare":
        alto = NOMES_STAT.get(req.get("highStat"), req.get("highStat"))
        baixo = NOMES_STAT.get(req.get("lowStat"), req.get("lowStat"))
        return f"com {alto} maior que {baixo}"
    if v == "stat_equal":
        um = NOMES_STAT.get(req.get("statOne"), req.get("statOne"))
        dois = NOMES_STAT.get(req.get("statTwo"), req.get("statTwo"))
        return f"com {um} igual a {dois}"
    if v == "advancement":
        return "com uma conquista específica"
    if v == "property_range":
        return f"{req.get('feature', '').replace('_', ' ')} entre {req.get('range')}"
    if v == "properties":
        alvo = req.get("target", "")
        if "gender=male" in alvo:
            return "sendo macho"
        if "gender=female" in alvo:
            return "sendo fêmea"
        return "em uma forma específica"

    return str(v).replace("_", " ")


def montar_megas(especie):
    """
    As formas Mega de um Pokémon.

    Elas ficam em "forms" junto com outras formas (Gmax, regionais). A Mega é a
    única que interessa aqui, e ela traz tipo e status próprios — Mega Charizard
    X, por exemplo, deixa de ser Voador e vira Dragão.
    """
    megas = []
    for forma in especie.get("forms") or []:
        nome = forma.get("name") or ""
        if not (nome.startswith("Mega") or nome.startswith("Primal")):
            continue
        if not forma.get("baseStats"):
            continue  # forma sem status é só aparência, não serve pra avaliar

        megas.append(
            {
                "nome": nome,
                "tipos": [
                    t
                    for t in (forma.get("primaryType"), forma.get("secondaryType"))
                    if t
                ],
                "stats": forma.get("baseStats"),
            }
        )
    return megas


def montar_evolucoes(especie, textos):
    """Pra quem esse Pokémon evolui e como, já em português."""
    evolucoes = []
    for evo in especie.get("evolutions") or []:
        alvo = (evo.get("result") or "").split(" ")[0]
        if not alvo:
            continue

        partes = []
        tipo = evo.get("variant")
        if tipo == "item_interact":
            partes.append(f"usando {nome_de_item(evo.get('requiredContext'), textos)}")
        elif tipo == "trade":
            partes.append("trocando com outro jogador")

        for req in evo.get("requirements") or []:
            texto = descrever_requisito(req, textos)
            if texto:
                partes.append(texto)

        if not partes:
            partes.append("subindo de nível")

        evolucoes.append(
            {
                "para": alvo,
                "como": ", ".join(partes),
            }
        )
    return evolucoes


# --------------------------------------------------------------- pokébolas
#
# Os multiplicadores de captura NÃO estão em arquivo de dados: estão no código
# do mod. Então esta tabela foi conferida na wiki oficial do Cobblemon.
# O nome e o ícone de cada bola vêm do próprio mod, então não repetimos aqui.

POKEBOLAS = [
    # --- básicas: todas iguais, muda só a cor do apricorn
    ("poke_ball", "basica", "1×", "Sempre", "2 apricorns vermelhos + 1 lingote de cobre",
     "A do dia a dia. Boa pra Pokémon fraco ou já bem machucado."),
    ("azure_ball", "basica", "1×", "Sempre", "2 apricorns azuis + 1 lingote de cobre",
     "Igual à Pokébola normal, só muda a cor."),
    ("citrine_ball", "basica", "1×", "Sempre", "2 apricorns amarelos + 1 lingote de cobre",
     "Igual à Pokébola normal, só muda a cor."),
    ("verdant_ball", "basica", "1×", "Sempre", "2 apricorns verdes + 1 lingote de cobre",
     "Igual à Pokébola normal, só muda a cor."),
    ("roseate_ball", "basica", "1×", "Sempre", "2 apricorns rosas + 1 lingote de cobre",
     "Igual à Pokébola normal, só muda a cor."),
    ("slate_ball", "basica", "1×", "Sempre", "2 apricorns pretos + 1 lingote de cobre",
     "Igual à Pokébola normal, só muda a cor."),
    ("premier_ball", "basica", "1×", "Sempre", "2 apricorns brancos + 1 lingote de cobre",
     "Igual à Pokébola normal, só muda a cor."),

    # --- progressão
    ("great_ball", "basica", "1,5×", "Sempre",
     "Apricorn azul + vermelho + 1 lingote de ferro",
     "O upgrade natural da Pokébola. Vale sempre a pena trocar."),
    ("ultra_ball", "basica", "2×", "Sempre",
     "Apricorn preto + amarelo + 1 lingote de ouro",
     "A melhor bola sem condição especial. Guarde pros importantes."),
    ("master_ball", "especial", "100%", "Sempre", "Não dá pra craftar — é achada ou de evento",
     "Nunca falha. Guarde pra um lendário que você não pode perder."),

    # --- condicionais: só valem a pena na situação certa
    ("quick_ball", "condicional", "5×", "No primeiro turno da batalha", "Apricorn + ferro",
     "A mais forte do jogo se você jogar logo de cara. Perdeu o 1º turno, vira bola comum."),
    ("fast_ball", "condicional", "4×", "Alvo com 100+ de Velocidade base", "Apricorn + ferro",
     "Pra aqueles que fogem correndo. Veja a Velocidade na ficha do Pokémon."),
    ("lure_ball", "condicional", "4×", "Em Pokémon fisgado com a vara de pesca", "Apricorn + ferro",
     "Se você pescou, use essa. Nada chega perto."),
    ("dream_ball", "condicional", "4×", "Alvo dormindo", "Apricorn + ferro",
     "Combine com um golpe que faz dormir e a captura fica fácil."),
    ("dusk_ball", "condicional", "3,5× / 3×", "3,5× no escuro total, 3× em luz fraca",
     "Apricorn + ferro", "Perfeita em caverna ou de madrugada sem tocha por perto."),
    ("dive_ball", "condicional", "3,5×", "Alvo totalmente submerso", "Apricorn + ferro",
     "Pra caçar debaixo d'água. Fora d'água não serve de nada."),
    ("repeat_ball", "condicional", "3,5×", "Espécie que você já registrou na Pokédex",
     "Apricorn + ferro", "Ótima pra farmar shiny ou IV de algo que você já tem."),
    ("net_ball", "condicional", "3×", "Alvo do tipo Inseto ou Água", "Apricorn + ferro",
     "Dois tipos muito comuns — vale carregar sempre algumas."),
    ("park_ball", "condicional", "2,5×", "Alvo de bioma de floresta ou planta", "Apricorn + ferro",
     "Boa em selva e floresta, onde tem muito Pokémon."),
    ("love_ball", "condicional", "8× / 2,5×",
     "8× na mesma espécie de gênero oposto, 2,5× em espécie diferente de gênero oposto",
     "Apricorn + ferro", "O maior multiplicador do jogo — mas só se você já tiver o par certo."),
    ("timer_ball", "condicional", "até 4×", "+0,3× a cada turno de batalha", "Apricorn + ferro",
     "Ruim no começo, ótima em batalha longa. Use quando a luta se arrastar."),
    ("level_ball", "condicional", "1× a 4×", "Quanto maior o nível do seu, comparado ao alvo",
     "Apricorn + ferro", "Leve um Pokémon bem mais forte que o alvo pra aproveitar."),
    ("nest_ball", "condicional", "1× a 4×", "Quanto menor o nível do alvo", "Apricorn + ferro",
     "Ideal pra encher a Pokédex com bichinhos de nível baixo."),
    ("heavy_ball", "condicional", "1× a 4×", "Quanto mais pesado o alvo", "Apricorn + ferro",
     "Veja o peso na ficha. Nos gigantes ela brilha."),
    ("moon_ball", "condicional", "1× a 4×", "À noite, conforme a fase da lua", "Apricorn + ferro",
     "Melhor na lua cheia. Confira a fase antes de sair caçando."),
    ("safari_ball", "condicional", "1,5×", "Fora de batalha", "Apricorn + ferro",
     "Pra jogar direto no Pokémon selvagem, sem brigar."),
    ("sport_ball", "condicional", "1,5×", "Sempre", "Apricorn + ferro",
     "Uma Great Ball com outra cara."),
    ("beast_ball", "condicional", "5× / 0,1×", "5× em Ultra Beasts, 0,1× em todo o resto",
     "Apricorn + ferro", "Só pra Ultra Beasts. Em qualquer outro é quase impossível pegar."),

    # --- efeito especial em vez de captura
    ("friend_ball", "efeito", "1×", "Sempre", "Apricorn + ferro",
     "Não ajuda a pegar: o Pokémon já nasce com 150 de amizade. Bom pra quem evolui por amizade."),
    ("heal_ball", "efeito", "1×", "Sempre", "Apricorn + ferro",
     "Cura o Pokémon inteiro assim que ele é capturado."),
    ("luxury_ball", "efeito", "1×", "Sempre", "Apricorn + ferro",
     "Amizade sobe em dobro. Combine com quem evolui por amizade."),
    ("cherish_ball", "efeito", "1×", "Sempre", "Não obtível no survival",
     "Bola de evento. Basicamente decoração."),

    # --- ancestrais (região de Hisui): feitas com tumblestone
    ("ancient_poke_ball", "ancestral", "1×", "Sempre",
     "2 apricorns vermelhos + 2 tumblestones + cobre", "Versão antiga da Pokébola."),
    ("ancient_azure_ball", "ancestral", "1×", "Sempre",
     "2 apricorns azuis + 2 tumblestones + cobre", "Só muda a cor."),
    ("ancient_citrine_ball", "ancestral", "1×", "Sempre",
     "2 apricorns amarelos + 2 tumblestones + cobre", "Só muda a cor."),
    ("ancient_verdant_ball", "ancestral", "1×", "Sempre",
     "2 apricorns verdes + 2 tumblestones + cobre", "Só muda a cor."),
    ("ancient_roseate_ball", "ancestral", "1×", "Sempre",
     "2 apricorns rosas + 2 tumblestones + cobre", "Só muda a cor."),
    ("ancient_slate_ball", "ancestral", "1×", "Sempre",
     "2 apricorns pretos + 2 tumblestones + cobre", "Só muda a cor."),
    ("ancient_ivory_ball", "ancestral", "1×", "Sempre",
     "2 apricorns brancos + 2 tumblestones + cobre", "Só muda a cor."),
    ("ancient_great_ball", "ancestral", "1,5×", "Sempre",
     "Apricorn vermelho + azul + 2 tumblestones + ferro", "A Great Ball dos antigos."),
    ("ancient_ultra_ball", "ancestral", "2×", "Sempre",
     "Apricorn amarelo + preto + 2 tumblestones + ouro", "A Ultra Ball dos antigos."),
    ("ancient_feather_ball", "ancestral", "1×", "Sempre",
     "Sky tumblestones + apricorns + cobre", "Voa mais longe que as outras."),
    ("ancient_wing_ball", "ancestral", "1,5×", "Sempre",
     "Sky tumblestones + apricorn azul e branco + ferro", "Voa mais longe."),
    ("ancient_jet_ball", "ancestral", "2×", "Sempre",
     "Sky tumblestones + apricorn azul e branco + ouro", "A que voa mais longe de todas."),
    ("ancient_heavy_ball", "ancestral", "1×", "Sempre",
     "Black tumblestones + apricorns pretos + cobre", "Pesada: não vai longe quando jogada."),
    ("ancient_leaden_ball", "ancestral", "1,5×", "Sempre",
     "Black tumblestones + apricorns pretos + ferro", "Pesada, alcance curto."),
    ("ancient_gigaton_ball", "ancestral", "2×", "Sempre",
     "Black tumblestones + apricorns pretos + ouro", "A mais pesada. Só de pertinho."),
    ("ancient_origin_ball", "especial", "100%", "Sempre", "Só no criativo ou por comando",
     "A Master Ball dos antigos."),
]


def salvar_textura(camadas, caminho_no_jar, destino):
    """Copia um PNG de dentro do jar pra uma pasta do site."""
    for z in camadas:
        if caminho_no_jar in z.namelist():
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_bytes(z.read(caminho_no_jar))
            return True
    return False


def montar_pokebolas(camadas, textos):
    bolas = []
    for bola_id, categoria, efeito, quando, receita, dica in POKEBOLAS:
        salvar_textura(
            camadas,
            f"assets/cobblemon/textures/item/poke_balls/{bola_id}.png",
            PASTA_ICONES / f"{bola_id}.png",
        )
        bolas.append(
            {
                "id": bola_id,
                "nome": nome_traduzido(f"item.cobblemon.{bola_id}", bola_id, textos),
                "categoria": categoria,
                "efeito": efeito,
                "quando": quando,
                "receita": receita,
                "dica": dica,
            }
        )

    return bolas


# ------------------------------------------------------------ megaevoluções


# O passo a passo da mega evolução. Os minérios e estruturas saem dos arquivos
# do mod (loot_table e worldgen); a mecânica da batalha foi conferida na wiki
# do Mega Showdown.
GUIA_MEGA = [
    {
        "titulo": "Ache um Megasite",
        "texto": "São estruturas subterrâneas que geram em qualquer bioma do Overworld, "
        "entre a altura Y 5 e Y 20. Cave até o centro. Também existem o Megaroid "
        "(subterrâneo), o Observatório (na selva), o Wishing Weald (bioma sombrio) "
        "e o Sítio Arqueológico (deserto).",
    },
    {
        "titulo": "Minere os dois minérios",
        "texto": "Keystone Ore dropa a Pedra Chave. Mega Stone Crystal dropa a Mega Pedra "
        "(a pedra crua, que serve de base pra todas as outras).",
    },
    {
        "titulo": "Faça o Mega Bracelete",
        "texto": "Com a Pedra Chave você crafta o bracelete. Ele vai no seu slot de acessório "
        "— quem usa é VOCÊ, não o Pokémon. Existem 8 variantes só de aparência.",
    },
    {
        "titulo": "Faça a pedra do seu Pokémon",
        "texto": "Cada Pokémon tem a pedra dele, feita com a Mega Pedra + ferro + diamante + "
        "um item que combina com o tipo dele. A lista completa está aqui embaixo.",
    },
    {
        "titulo": "Dê a pedra pro Pokémon segurar",
        "texto": "A pedra vai como item segurado (held item). Com o bracelete no seu "
        "personagem e a pedra no Pokémon, um botão Mega aparece embaixo dos golpes "
        "na batalha. Aperte e escolha o golpe.",
    },
    {
        "titulo": "Fora de batalha",
        "texto": "Shift + clique direito no Pokémon que segura a pedra faz a mega evolução "
        "só de enfeite. Um por vez.",
    },
    {
        "titulo": "Exceção: Rayquaza",
        "texto": "Rayquaza não precisa de pedra nenhuma. Basta ele saber o golpe Dragon Ascent "
        "e você estar usando o bracelete.",
    },
]


def descrever_ingrediente(valor, textos):
    """Um slot da receita pode ser um item, uma tag ou uma lista de opções."""
    if isinstance(valor, list):
        return " ou ".join(descrever_ingrediente(v, textos) for v in valor)
    if isinstance(valor, dict):
        if "item" in valor:
            return nome_de_item(valor["item"], textos)
        if "tag" in valor:
            return valor["tag"].split(":")[-1].replace("_", " ")
        return "?"
    return nome_de_item(str(valor), textos)


def separar_id(referencia, padrao="minecraft"):
    """'minecraft:diamond' -> ('minecraft', 'diamond'). Sem namespace, assume o padrão."""
    namespace, tem_dois_pontos, caminho = referencia.partition(":")
    if not tem_dois_pontos:
        return padrao, namespace
    return namespace, caminho


def achar_textura(camadas, referencia, profundidade=0):
    """
    Descobre o PNG de um item.

    O caminho não dá pra adivinhar: 'iron_ingot' pode estar em qualquer
    subpasta. Então a gente faz o que o Minecraft faz — lê o modelo do item,
    que aponta pra textura. Se o modelo não tiver textura própria, ele tem um
    'parent', e a função se chama de novo pra seguir esse pai.
    """
    if profundidade > 4:
        return None

    namespace, caminho = separar_id(referencia)
    modelo = f"assets/{namespace}/models/{caminho}.json"

    for z in camadas:
        if modelo not in z.namelist():
            continue

        dados = ler_json(z, modelo) or {}
        texturas = dados.get("textures") or {}

        # layer0 é a camada principal de um item plano; 'all' é de bloco.
        ref = texturas.get("layer0") or texturas.get("all") or texturas.get("side")
        if not ref:
            ref = next((v for v in texturas.values() if isinstance(v, str)), None)

        if ref and not ref.startswith("#"):
            tns, tcaminho = separar_id(ref)
            return f"assets/{tns}/textures/{tcaminho}.png"

        if dados.get("parent"):
            return achar_textura(camadas, dados["parent"], profundidade + 1)

    return None


def icone_do_item(camadas, item_id):
    """Copia o PNG do item pra img/itens/ e devolve o caminho pro site usar."""
    namespace, nome = separar_id(item_id)
    destino = PASTA_ITENS / f"{namespace}__{nome}.png"
    relativo = f"img/itens/{namespace}__{nome}.png"

    if destino.exists():
        return relativo

    textura = achar_textura(camadas, f"{namespace}:item/{nome}")
    if not textura:
        return None

    return relativo if salvar_textura(camadas, textura, destino) else None


def ingrediente_com_icone(valor, textos, camadas):
    """Nome + ícone de um slot da receita."""
    item_id = None

    if isinstance(valor, list) and valor:
        primeiro = valor[0]
        item_id = primeiro.get("item") if isinstance(primeiro, dict) else primeiro
    elif isinstance(valor, dict):
        item_id = valor.get("item")
    elif isinstance(valor, str):
        item_id = valor

    return {
        "nome": descrever_ingrediente(valor, textos),
        "icone": icone_do_item(camadas, item_id) if item_id else None,
    }


def montar_receita(receita, textos, camadas):
    """
    Deixa a receita pronta pro site mostrar.
    Craft 3x3 vira uma grade com os ícones; os outros tipos viram uma frase.
    """
    if not receita:
        return None

    tipo = receita.get("type")

    if tipo == "minecraft:crafting_shaped":
        return {
            "padrao": receita.get("pattern", []),
            "itens": {
                letra: ingrediente_com_icone(valor, textos, camadas)
                for letra, valor in (receita.get("key") or {}).items()
            },
        }

    if tipo == "minecraft:crafting_shapeless":
        itens = [descrever_ingrediente(i, textos) for i in receita.get("ingredients", [])]
        return {"texto": "Na bancada, sem ordem: " + " + ".join(itens)}

    if tipo in ("minecraft:smelting", "minecraft:blasting"):
        onde = "fornalha" if tipo.endswith("smelting") else "fornalha de fundição"
        return {"texto": f"Na {onde}: {descrever_ingrediente(receita.get('ingredient'), textos)}"}

    if tipo == "minecraft:stonecutting":
        return {"texto": "No cortador de pedra: " + descrever_ingrediente(receita.get("ingredient"), textos)}

    if tipo == "minecraft:smithing_transform":
        base = descrever_ingrediente(receita.get("base"), textos)
        adicao = descrever_ingrediente(receita.get("addition"), textos)
        return {"texto": f"Na bancada de ferraria: {base} + {adicao}"}

    if tipo == "cobblemon:cooking_pot":
        itens = [descrever_ingrediente(i, textos) for i in receita.get("ingredients", [])]
        return {"texto": "Na panela de cozinha: " + " + ".join(itens)}

    return None


def montar_megas_do_pack(camadas, textos):
    # Todas as receitas, indexadas pelo item que produzem.
    receitas = {}
    for caminho, dados in juntar_por_caminho(camadas, "data/mega_showdown/recipe/").items():
        resultado = dados.get("result")
        item_id = resultado.get("id") if isinstance(resultado, dict) else resultado
        if item_id:
            receitas[item_id] = dados

    pedras = []
    for caminho, dados in juntar_por_caminho(
        camadas, "data/mega_showdown/mega_showdown/mega/"
    ).items():
        # O nome do arquivo é o id do item de verdade (charizardite_x.json).
        # O "showdown_id" de dentro às vezes vem sem o underline, então não serve.
        pedra_id = caminho.split("/")[-1][: -len(".json")]
        if not pedra_id:
            continue

        salvar_textura(
            camadas,
            f"assets/mega_showdown/textures/item/{pedra_id}.png",
            AQUI / "img" / "megas" / f"{pedra_id}.png",
        )

        pedras.append(
            {
                "id": pedra_id,
                "nome": nome_traduzido(f"item.mega_showdown.{pedra_id}", pedra_id, textos),
                "pokemon": dados.get("pokemons") or [],
                "receita": montar_receita(receitas.get(f"mega_showdown:{pedra_id}"), textos, camadas),
            }
        )

    pedras.sort(key=lambda p: p["pokemon"][0] if p["pokemon"] else p["id"])

    # Os itens que você precisa ANTES de qualquer mega pedra.
    base = []
    for item_id in ("keystone_block", "keystone", "mega_bracelet", "mega_stone"):
        base.append(
            {
                "id": item_id,
                "nome": nome_traduzido(f"item.mega_showdown.{item_id}", item_id, textos),
                "receita": montar_receita(receitas.get(f"mega_showdown:{item_id}"), textos, camadas),
            }
        )
        salvar_textura(
            camadas,
            f"assets/mega_showdown/textures/item/{item_id}.png",
            AQUI / "img" / "megas" / f"{item_id}.png",
        )

    return {"guia": GUIA_MEGA, "base": base, "pedras": pedras}


def montar_arquivo_js(pokemon, bolas, megas):
    """
    Grava os dados como JavaScript em vez de JSON.

    Por quê: quando a página é aberta com dois cliques (endereço file://), o
    navegador proíbe ela de ler outros arquivos do disco por fetch() — é uma
    regra de segurança. Uma tag <script> não tem essa limitação. Guardando os
    dados como JavaScript, o site funciona sem servidor nenhum, e dá pra
    mandar a pasta zipada pra alguém.
    """

    def bloco(nome, valor):
        texto = json.dumps(valor, ensure_ascii=False, separators=(",", ":"))
        return f"const {nome} = {texto};\n"

    return (
        "/* Gerado pelo extrair.py. Não edite à mão: rode o script de novo. */\n"
        + bloco("DADOS_POKEMON", pokemon)
        + bloco("DADOS_BOLAS", bolas)
        + bloco("DADOS_MEGAS", megas)
    )


def main():
    print("Abrindo o modpack...")
    camadas = abrir_camadas()
    print(f"  {len(camadas)} arquivos abertos (Minecraft + mods + datapacks)")

    print("Lendo tags de bioma...")
    tags = carregar_tags(camadas)
    print(f"  {len(tags)} tags")

    print("Lendo traduções...")
    textos = carregar_traducoes(camadas)
    print(f"  {len(textos)} textos")

    print("Lendo espécies...")
    especies_por_caminho = juntar_por_caminho(camadas, "data/cobblemon/species/")
    print(f"  {len(especies_por_caminho)} arquivos de espécie")

    print("Lendo spawns (datapack do COBBLEVERSE sobrescreve o Cobblemon base)...")
    spawns_por_caminho = juntar_por_caminho(camadas, "data/cobblemon/spawn_pool_world/")
    print(f"  {len(spawns_por_caminho)} arquivos de spawn")

    # Agrupa os spawns por Pokémon.
    spawns_por_pokemon = {}
    for arquivo in spawns_por_caminho.values():
        if arquivo.get("enabled") is False:
            continue
        for s in arquivo.get("spawns") or []:
            if s.get("type") not in (None, "pokemon"):
                continue
            nome = (s.get("pokemon") or "").split(" ")[0].lower()
            if nome:
                spawns_por_pokemon.setdefault(nome, []).append(s)

    faltando = set()
    pokemon = []
    nao_implementados = 0

    for especie in especies_por_caminho.values():
        nome = especie.get("name")
        if not nome:
            continue
        chave = nome.lower().replace(" ", "")

        if especie.get("implemented") is False:
            nao_implementados += 1
            continue

        locais = montar_locais(
            spawns_por_pokemon.get(chave, []), tags, textos, faltando
        )

        # A raridade do Pokémon é a do spawn mais comum que ele tem.
        ordem = ["common", "uncommon", "rare", "ultra-rare"]
        ids = [l["raridadeId"] for l in locais if l["raridadeId"] in ordem]
        raridade = min(ids, key=ordem.index) if ids else None

        pokemon.append(
            {
                "id": chave,
                "nome": nome,
                "dex": especie.get("nationalPokedexNumber"),
                "tipos": [
                    t for t in (especie.get("primaryType"), especie.get("secondaryType")) if t
                ],
                "stats": especie.get("baseStats") or {},
                "habilidades": [
                    {
                        # "h:" na frente quer dizer que é a habilidade oculta.
                        "nome": nome_traduzido(
                            f"cobblemon.ability.{h.replace('h:', '')}", h, textos
                        ),
                        "oculta": h.startswith("h:"),
                    }
                    for h in especie.get("abilities") or []
                ],
                "catchRate": especie.get("catchRate"),
                "geracao": next(
                    (l for l in especie.get("labels") or [] if l.startswith("gen")), None
                ),
                "grupoOvo": especie.get("eggGroups") or [],
                "altura": especie.get("height"),
                "peso": especie.get("weight"),
                "preEvolucao": (especie.get("preEvolution") or "").split(" ")[0] or None,
                "evolucoes": montar_evolucoes(especie, textos),
                "megas": montar_megas(especie),
                "descricao": textos.get(
                    (especie.get("pokedex") or [""])[0], ""
                ),
                "raridade": RARIDADES.get(raridade, "Não aparece na natureza"),
                "raridadeId": raridade,
                "locais": locais,
            }
        )

    pokemon.sort(key=lambda p: p["dex"] or 9999)

    print("Lendo pokébolas e megaevoluções...")
    bolas = montar_pokebolas(camadas, textos)
    megas = montar_megas_do_pack(camadas, textos)
    print(f"  {len(bolas)} pokébolas | {len(megas['pedras'])} mega pedras")

    PASTA_DADOS.mkdir(parents=True, exist_ok=True)
    destino = PASTA_DADOS / "dados.js"
    destino.write_text(montar_arquivo_js(pokemon, bolas, megas), encoding="utf-8")

    com_spawn = sum(1 for p in pokemon if p["locais"])
    tamanho = destino.stat().st_size / 1_000_000

    print()
    print(f"OK: {len(pokemon)} pokémon escritos em dados/dados.js ({tamanho:.1f} MB)")
    print(f"    {com_spawn} aparecem na natureza | {nao_implementados} ainda não existem no mod")
    if faltando:
        print(f"    tags sem nome em português ({len(faltando)}): {sorted(faltando)}")


if __name__ == "__main__":
    main()
