# Histórico — Ludo King

## 21 de junho de 2026 — Caminho não invade mais as home areas

- **O que foi feito:**
  - `drawPath()` em `Board.ts`: adicionado `&& !this.isHome(col, row)` para não pintar creme nas células do anel que estão dentro das home areas. O anel só aparece visualmente nos braços da cruz (drawCross já os cobre). Peças continuam passando por esses pontos logicamente, mas o fundo colorido da home area domina visualmente.
- **Arquivos alterados:** `src/game/Board.ts`
- **Decisões técnicas:** Em um grid 15×15, todos os pontos do anel fora da cruz pertencem às home areas — portanto drawPath() passa a ser efetivamente vazia após essa mudança; a cruz cobre o restante.

## 21 de junho de 2026 — Correção das estrelas seguras (rosettes fora das home areas)

- **O que foi feito:**
  - `SAFE_ABS`: rosettes mudados de [8,20,32,44] → [10,22,34,46]. Os índices antigos mapeavam para células DENTRO das home areas (ex: [4,1] dentro do amarelo, [13,4] dentro do azul). Os novos índices ficam nas junções dos braços da cruz, fora de qualquer home area: [6,1],[13,6],[8,13],[1,8].
  - `drawSafeStars()`: guard adicionado para nunca desenhar estrela em célula isHome(), independente dos índices configurados.
- **Arquivos alterados:** `src/constants/Board.ts`, `src/game/Board.ts`
- **Decisões técnicas:** rosettes devem estar nas junções dos braços da cruz com o anel externo — posições simétricas equidistantes das entradas de cada cor.

## 21 de junho de 2026 — Correção crítica da geometria do tabuleiro

- **O que foi feito:**
  - **[BUG CRÍTICO]** `src/constants/Board.ts`: `PATH_ENTRY` estava com as 4 cores trocadas — o correto é YELLOW=0, BLUE=12, RED=24, GREEN=36 (era GREEN=0, YELLOW=12, BLUE=24, RED=36). Com os valores errados cada peça percorria a rota oposta e a transição para a coluna do lar fazia um "teleporte" visual.
  - **[BUG CRÍTICO]** `HOME_COL[GREEN]` apontava para o braço superior (rows 4→8), correto é braço inferior (rows 13→9). `HOME_COL[BLUE]` apontava para o braço inferior, correto é braço superior (rows 1→5). As faixas coloridas apareciam no lugar errado do tabuleiro.
  - **[BUG VISUAL]** `HOME_BASE`: slots de base movidos para o interior das áreas de lar (ex: col 2/4 em vez de col 1/13) para evitar sobreposição com o caminho creme.
  - **[BUG VISUAL]** `SAFE_ABS`: removidas estrelas geminadas nas posições +1 de cada entrada (índices 1,13,25,37). Agora são 8 estrelas: 4 entradas + 4 rosettes (+8).
  - **[BUG VISUAL]** `src/game/Board.ts`: triângulos do centro estavam com cores trocadas. Correto: esquerdo=YELLOW, superior=BLUE, direito=RED, inferior=GREEN.
- **Arquivos alterados:** `src/constants/Board.ts`, `src/game/Board.ts`
- **Decisões técnicas:** `PATH_ENTRY` é a âncora de todo o sistema de coordenadas do anel. Cada cor deve ter `relPos 47 = HOME_COL[cor][0]` para garantir transição visual suave ao entrar na coluna do lar.

## 21 de junho de 2026 — Correções de bugs críticos + melhorias de layout, IA e game feel

- **O que foi feito:**
  - **[BUG CRÍTICO]** `Player.ts`: condição de vitória corrigida (`piecePos === 57` → `FINISHED = 53`) — o jogo agora detecta vencedores
  - **[BUG ALTO]** `RulesEngine.ts`: `isBlocked()` com lógica invertida corrigida (`movingPlayer` → enemies) e agora chamado em `canMove` — regra de bloqueio funciona
  - **[BUG MÉDIO]** `Piece.ts`: comentário de `piecePos` corrigido (57 → 53)
  - `Colors.ts`: `COLOR_PT` extraído para constante compartilhada (usado por GameScene, MenuScene e WinScene)
  - `WinScene.ts`: nome do vencedor exibido em português (`Verde`, `Amarelo`...) + stagger de entrada das animações + partículas coloridas de celebração
  - `Dice.ts`: animação de "pop" (scale 1→1.35→1) ao revelar resultado final do dado
  - `GameScene.ts`: barra colorida na sidebar indicando jogador ativo; camera shake ao capturar; flash dourado ao entrar na coluna do lar; bounce no label de turno extra; `COLOR_PT` importado
  - `Piece.ts`: offset de sobreposição aumentado (±6px → ±11px); velocidade de animação com cap (`Math.min(90, 400/nPassos)` ms/casa)
  - `AIStrategy.ts`: scoring exponencial no anel (peças avançadas valem muito mais); bônus por criar bloqueio (+35); prioridade correta entre avançar vs. sair da base
- **Arquivos alterados:** `src/constants/Colors.ts`, `src/game/Player.ts`, `src/game/Piece.ts`, `src/game/RulesEngine.ts`, `src/ai/AIStrategy.ts`, `src/game/Dice.ts`, `src/scenes/WinScene.ts`, `src/scenes/GameScene.ts`
- **Decisões técnicas:** `isBlocked` agora verifica apenas inimigos (não o próprio jogador); velocidade de animação limitada a 400ms total independente do número de passos; COLOR_PT centralizado em Colors.ts

## 17 de junho de 2026 — Criação do projeto
- **O que foi feito:** Setup inicial do projeto Ludo King web game
- **Stack:** Phaser 3 + TypeScript + Vite, sem assets externos
- **Decisões técnicas:** piecePos relativo (0-51 anel, 52-56 coluna, 57 finalizado), pathOffset por cor, todas as regras em RulesEngine.ts isolado
- **Arquivos criados:** estrutura completa src/, package.json, tsconfig.json, vite.config.ts
