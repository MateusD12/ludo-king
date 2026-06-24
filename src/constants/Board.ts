import type { PlayerColor } from './Colors'

export const CELL = 50          // pixels por célula
export const COLS = 15
export const ROWS = 15
export const BOARD_PX = CELL * COLS   // 750px
export const OX = 25                  // offset X do tabuleiro no canvas
export const OY = 25                  // offset Y

export function cellPx(col: number, row: number): { x: number; y: number } {
  return { x: OX + col * CELL + CELL / 2, y: OY + row * CELL + CELL / 2 }
}

export const MAIN_PATH: [number, number][] = [
  // Yellow Start to Top-Left corner
  [1,6],[2,6],[3,6],[4,6],[5,6],
  // Up the Blue arm
  [6,5],[6,4],[6,3],[6,2],[6,1],[6,0],
  // Top turn
  [7,0],[8,0],
  // Down the Blue arm
  [8,1],[8,2],[8,3],[8,4],[8,5],
  // Right along Red arm
  [9,6],[10,6],[11,6],[12,6],[13,6],[14,6],
  // Right turn
  [14,7],[14,8],
  // Left along Red arm
  [13,8],[12,8],[11,8],[10,8],[9,8],
  // Down the Green arm
  [8,9],[8,10],[8,11],[8,12],[8,13],[8,14],
  // Bottom turn
  [7,14],[6,14],
  // Up the Green arm
  [6,13],[6,12],[6,11],[6,10],[6,9],
  // Left along Yellow arm
  [5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
  // Left turn
  [0,7],[0,6]
]
// Total: 5 + 6 + 2 + 5 + 6 + 2 + 5 + 6 + 2 + 5 + 6 + 2 = 52 casas no anel externo✓

export const PATH_ENTRY: Record<PlayerColor, number> = {
  YELLOW: 0,
  BLUE:   13,
  RED:    26,
  GREEN:  39,
}

// Casas seguras (índices absolutos no MAIN_PATH) -> sem captura
export const SAFE_ABS = new Set<number>([
  0, 13, 26, 39,   // casas de entrada de cada cor
  8, 21, 34, 47,   // estrelas nas junções dos braços
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
  YELLOW: [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]],
  BLUE:   [[10.5, 1.5], [12.5, 1.5], [10.5, 3.5], [12.5, 3.5]],
  GREEN:  [[1.5, 10.5], [3.5, 10.5], [1.5, 12.5], [3.5, 12.5]],
  RED:    [[10.5, 10.5], [12.5, 10.5], [10.5, 12.5], [12.5, 12.5]],
}

export const HOME_START = 51   // primeiro piecePos dentro da coluna do lar (logo após o anel)
export const FINISHED   = 56   // piecePos quando a peça terminou (51 + 5 casas)
export const PATH_LEN   = 52   // tamanho do anel externo
