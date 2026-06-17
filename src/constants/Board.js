export const CELL = 44; // pixels por célula
export const COLS = 15;
export const ROWS = 15;
export const BOARD_PX = CELL * COLS; // 660px
export const OX = 10; // offset X do tabuleiro no canvas
export const OY = 20; // offset Y
export function cellPx(col, row) {
    return { x: OX + col * CELL + CELL / 2, y: OY + row * CELL + CELL / 2 };
}
// ── Anel externo: 48 casas no sentido horário ─────────────────────────────────
// Segmentos simétricos de 12 casas cada:
// Verde  entra em índice 0  → (1,6)
// Amarelo entra em índice 12 → (8,1)
// Azul   entra em índice 24 → (13,8)
// Vermelho entra em índice 36 → (6,13)
export const MAIN_PATH = [
    // Segmento 1: subindo pela esquerda (col=1, rows 6→1) — 6 casas
    [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1],
    // Segmento 1b: topo indo para direita (row=1, cols 2→7) — 6 casas  → total 12
    [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
    // Segmento 2: de (8,1) descendo pela direita até (13,8) — 12 casas
    [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1],
    [13, 2], [13, 3], [13, 4], [13, 5], [13, 6], [13, 7],
    // Segmento 3: de (13,8) indo para a esquerda na base até (6,13) — 12 casas
    [13, 8], [13, 9], [13, 10], [13, 11], [13, 12], [13, 13],
    [12, 13], [11, 13], [10, 13], [9, 13], [8, 13], [7, 13],
    // Segmento 4: de (6,13) subindo pela esquerda até (1,7) — 12 casas
    [6, 13], [5, 13], [4, 13], [3, 13], [2, 13], [1, 13],
    [1, 12], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7],
];
// Total: 6+6+6+6+6+6+6+6 = 48 — segmentos simétricos de 12 ✓
// Índice absoluto no MAIN_PATH onde cada cor entra no tabuleiro
export const PATH_ENTRY = {
    GREEN: 0,
    YELLOW: 12,
    BLUE: 24,
    RED: 36,
};
// Casas seguras (índices absolutos no MAIN_PATH) — sem captura
export const SAFE_ABS = new Set([
    0, 12, 24, 36, // casas de entrada de cada cor
    8, 20, 32, 44, // estrelas +8 de cada entrada
    1, 13, 25, 37, // estrelas +1 de cada entrada
]);
// Colunas do lar por cor — 5 casas, peça vai da 0ª até a 4ª (índice 52-56)
// piecePos 52 = home[0], ... 56 = home[4], 57 = FINISHED
export const HOME_COL = {
    GREEN: [[7, 8], [7, 7], [7, 6], [7, 5], [7, 4]],
    YELLOW: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    BLUE: [[7, 6], [7, 7], [7, 8], [7, 9], [7, 10]],
    RED: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};
// Posições dos 4 slots de base (onde ficam as peças antes de sair)
export const HOME_BASE = {
    GREEN: [[1, 10], [3, 10], [1, 12], [3, 12]],
    YELLOW: [[1, 1], [3, 1], [1, 3], [3, 3]],
    BLUE: [[11, 1], [13, 1], [11, 3], [13, 3]],
    RED: [[11, 10], [13, 10], [11, 12], [13, 12]],
};
export const HOME_START = 48; // primeiro piecePos dentro da coluna do lar (logo após o anel)
export const FINISHED = 53; // piecePos quando a peça terminou (48 + 5 casas)
export const PATH_LEN = 48; // tamanho do anel externo
