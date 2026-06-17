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

// ── Anel externo: 52 casas no sentido horário ─────────────────────────────────
// Verde  entra em índice 0  (col=1, row=6)
// Amarelo entra em índice 13 (col=8, row=1)
// Azul   entra em índice 26 (col=13, row=8)
// Vermelho entra em índice 39 (col=6, row=13)
export const MAIN_PATH: [number, number][] = [
  // Segmento 1 — subindo pela esquerda (col=1, rows 6→1)
  [1,6],[1,5],[1,4],[1,3],[1,2],[1,1],
  // Segmento 1b — topo indo para direita (row=1, cols 2→8)
  [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
  // Segmento 2 — canto superior direito + descendo (col=13, row=1→8)
  [9,1],[10,1],[11,1],[12,1],[13,1],
  [13,2],[13,3],[13,4],[13,5],[13,6],[13,7],[13,8],
  // Segmento 3 — descendo + canto inferior direito (row=13, cols 13→6)
  [13,9],[13,10],[13,11],[13,12],[13,13],
  [12,13],[11,13],[10,13],[9,13],[8,13],[7,13],[6,13],
  // Segmento 4 — canto inferior esquerdo + subindo (col=1, rows 13→8)
  [5,13],[4,13],[3,13],[2,13],[1,13],
  [1,12],[1,11],[1,10],[1,9],[1,8],[1,7],
]
// Total: 6+7+5+8+5+7+5+6 = 52 ✓

// Índice absoluto no MAIN_PATH onde cada cor entra no tabuleiro
export const PATH_ENTRY: Record<PlayerColor, number> = {
  GREEN:  0,
  YELLOW: 13,
  BLUE:   26,
  RED:    39,
}

// Casas seguras (índices absolutos no MAIN_PATH) — sem captura
export const SAFE_ABS = new Set<number>([
  0, 13, 26, 39,        // casas de entrada de cada cor
  8, 21, 34, 47,        // estrelas 1 (padrão +8 das entradas)
  1, 14, 27, 40,        // estrelas 2 (logo após entradas)
])

// Colunas do lar por cor — 5 casas, peça vai da 0ª até a 4ª (índice 52-56)
// piecePos 52 = home[0], ... 56 = home[4], 57 = FINISHED
export const HOME_COL: Record<PlayerColor, [number, number][]> = {
  GREEN:  [[7,8],[7,7],[7,6],[7,5],[7,4]],
  YELLOW: [[1,7],[2,7],[3,7],[4,7],[5,7]],
  BLUE:   [[7,6],[7,7],[7,8],[7,9],[7,10]],
  RED:    [[13,7],[12,7],[11,7],[10,7],[9,7]],
}

// Posições dos 4 slots de base (onde ficam as peças antes de sair)
export const HOME_BASE: Record<PlayerColor, [number, number][]> = {
  GREEN:  [[1,10],[3,10],[1,12],[3,12]],
  YELLOW: [[1,1],[3,1],[1,3],[3,3]],
  BLUE:   [[11,1],[13,1],[11,3],[13,3]],
  RED:    [[11,10],[13,10],[11,12],[13,12]],
}

export const HOME_START = 52   // primeiro piecePos dentro da coluna do lar
export const FINISHED   = 57   // piecePos quando a peça terminou
export const PATH_LEN   = 52   // tamanho do anel externo
