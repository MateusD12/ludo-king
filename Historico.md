# Histórico — Ludo King

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
