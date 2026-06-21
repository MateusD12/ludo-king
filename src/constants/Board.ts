import type { PlayerColor } from './Colors'

export const CELL = 44          // pixels por célula
export const COLS = 15
export const ROWS = 15
export const BOARD_PX = CELL * COLS   // 660px
export const OX = 10                  // offset X do tabuleiro no canvas
export const OY = 20                  // offset Y

export function cellPx(col: number, row: number): { x: number; y: number } {
  return { x: OX + col * CELL + CELL / 2, y: OY + row * CELL + CELL / 2 }
}

// ── Anel externo: 48 casas no sentido horário ─────────────────────────────────
// Segmentos simétricos de 12 casas cada:
// Amarelo entra em índice 0  → (1,6)  — último passo: (1,7) → coluna esquerda
// Azul    entra em índice 12 → (8,1)  — último passo: (7,1) → coluna superior
// Vermelho entra em índice 24 → (13,8) — último passo: (13,7) → coluna direita
// Verde  entra em índice 36 → (6,13) — último passo: (7,13) → coluna inferior
export const MAIN_PATH: [number, number][] = [
  // Segmento 1: subindo pela esquerda (col=1, rows 6→1) — 6 casas
  [1,6],[1,5],[1,4],[1,3],[1,2],[1,1],
  // Segmento 1b: topo indo para direita (row=1, cols 2→7) — 6 casas  → total 12
  [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
  // Segmento 2: de (8,1) descendo pela direita até (13,8) — 12 casas
  [8,1],[9,1],[10,1],[11,1],[12,1],[13,1],
  [13,2],[13,3],[13,4],[13,5],[13,6],[13,7],
  // Segmento 3: de (13,8) indo para a esquerda na base até (6,13) — 12 casas
  [13,8],[13,9],[13,10],[13,11],[13,12],[13,13],
  [12,13],[11,13],[10,13],[9,13],[8,13],[7,13],
  // Segmento 4: de (6,13) subindo pela esquerda até (1,7) — 12 casas
  [6,13],[5,13],[4,13],[3,13],[2,13],[1,13],
  [1,12],[1,11],[1,10],[1,9],[1,8],[1,7],
]
// Total: 6+6+6+6+6+6+6+6 = 48 — segmentos simétricos de 12 ✓

// Índice absoluto no MAIN_PATH onde cada cor entra no tabuleiro
// (relPos 47 de cada cor = HOME_COL[cor][0], garantindo transição suave)
export const PATH_ENTRY: Record<PlayerColor, number> = {
  YELLOW: 0,
  BLUE:   12,
  RED:    24,
  GREEN:  36,
}

// Casas seguras (índices absolutos no MAIN_PATH) — sem captura
export const SAFE_ABS = new Set<number>([
  0, 12, 24, 36,   // casas de entrada de cada cor
  10, 22, 34, 46,  // rosettes nas junções dos braços: [6,1],[13,6],[8,13],[1,8]
])

// Colunas do lar por cor — 5 casas, índice 0 = entrada (mais longe do centro), índice 4 = mais perto
// Verde  → braço inferior (col 7, rows 13→9)
// Amarelo→ braço esquerdo (row 7, cols 1→5)
// Azul   → braço superior (col 7, rows 1→5)
// Vermelho → braço direito (row 7, cols 13→9)
export const HOME_COL: Record<PlayerColor, [number, number][]> = {
  GREEN:  [[7,13],[7,12],[7,11],[7,10],[7,9]],
  YELLOW: [[1,7],[2,7],[3,7],[4,7],[5,7]],
  BLUE:   [[7,1],[7,2],[7,3],[7,4],[7,5]],
  RED:    [[13,7],[12,7],[11,7],[10,7],[9,7]],
}

// Posições dos 4 slots de base (onde ficam as peças antes de sair)
// Deslocados das bordas col 1 / col 13 / row 1 / row 13 para não sobrepor o caminho
export const HOME_BASE: Record<PlayerColor, [number, number][]> = {
  GREEN:  [[2,10],[4,10],[2,12],[4,12]],
  YELLOW: [[2,2],[4,2],[2,4],[4,4]],
  BLUE:   [[10,2],[12,2],[10,4],[12,4]],
  RED:    [[10,10],[12,10],[10,12],[12,12]],
}

export const HOME_START = 48   // primeiro piecePos dentro da coluna do lar (logo após o anel)
export const FINISHED   = 53   // piecePos quando a peça terminou (48 + 5 casas)
export const PATH_LEN   = 48   // tamanho do anel externo
