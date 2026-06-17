import { CELL, OX, OY, COLS, MAIN_PATH, SAFE_ABS, HOME_COL, HOME_BASE, cellPx } from '../constants/Board';
import { C, HOME_FILL, PLAYER_COLORS } from '../constants/Colors';
const COLORS_ORDER = ['GREEN', 'YELLOW', 'BLUE', 'RED'];
// Quadrantes dos 4 lar: [col, row, largura, altura]
const HOME_AREAS = [
    ['YELLOW', 0, 0, 6, 6],
    ['BLUE', 9, 0, 6, 6],
    ['GREEN', 0, 9, 6, 6],
    ['RED', 9, 9, 6, 6],
];
export class Board {
    constructor(scene) {
        this.g = scene.add.graphics().setDepth(0);
        this.draw();
    }
    r(col, row) {
        return { x: OX + col * CELL, y: OY + row * CELL, w: CELL, h: CELL };
    }
    draw() {
        this.drawBackground();
        this.drawHomeAreas();
        this.drawCross();
        this.drawPath();
        this.drawSafeStars();
        this.drawHomeColumns();
        this.drawCenter();
        this.drawHomeSlots();
        this.drawGrid();
    }
    drawBackground() {
        this.g.fillStyle(C.BOARD_BG);
        this.g.fillRect(OX - 4, OY - 4, COLS * CELL + 8, COLS * CELL + 8);
    }
    drawHomeAreas() {
        for (const [color, col, row, w, h] of HOME_AREAS) {
            const px = OX + col * CELL, py = OY + row * CELL;
            this.g.fillStyle(HOME_FILL[color]);
            this.g.fillRect(px, py, w * CELL, h * CELL);
            this.g.lineStyle(3, PLAYER_COLORS[color], 1);
            this.g.strokeRect(px, py, w * CELL, h * CELL);
            // círculo interno decorativo
            this.g.fillStyle(PLAYER_COLORS[color], 0.25);
            this.g.fillCircle(px + w * CELL / 2, py + h * CELL / 2, CELL * 2);
        }
    }
    drawCross() {
        // Fundo creme da cruz (linhas 6-8 e colunas 6-8), excluindo home areas
        this.g.fillStyle(C.PATH_BG);
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (this.isCross(col, row) && !this.isHome(col, row)) {
                    const r = this.r(col, row);
                    this.g.fillRect(r.x, r.y, r.w, r.h);
                }
            }
        }
    }
    drawPath() {
        this.g.fillStyle(C.PATH_BG);
        for (const [col, row] of MAIN_PATH) {
            if (!this.isCross(col, row)) {
                const r = this.r(col, row);
                this.g.fillRect(r.x, r.y, r.w, r.h);
            }
        }
    }
    drawSafeStars() {
        SAFE_ABS.forEach(idx => {
            if (idx >= MAIN_PATH.length)
                return;
            const [col, row] = MAIN_PATH[idx];
            const { x, y } = cellPx(col, row);
            this.drawStar(x, y);
        });
    }
    drawStar(cx, cy) {
        const r1 = CELL * 0.38, r2 = CELL * 0.16;
        const pts = [];
        for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? r1 : r2;
            const a = (i * 45 - 90) * (Math.PI / 180);
            pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
        }
        this.g.fillStyle(C.SAFE_STAR, 0.9);
        this.g.fillPoints(pts, true);
    }
    drawHomeColumns() {
        for (const color of COLORS_ORDER) {
            for (const [col, row] of HOME_COL[color]) {
                const r = this.r(col, row);
                this.g.fillStyle(PLAYER_COLORS[color], 0.75);
                this.g.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
            }
        }
    }
    drawCenter() {
        // 4 triângulos coloridos no 3x3 central
        const cx = OX + 6 * CELL;
        const cy = OY + 6 * CELL;
        const s = CELL * 3; // tamanho do quadrado 3x3
        const mx = cx + s / 2, my = cy + s / 2;
        const corners = [
            [cx, cy + s], // bottom-left  → Green
            [cx, cy], // top-left     → Yellow
            [cx + s, cy], // top-right    → Blue
            [cx + s, cy + s], // bottom-right → Red
        ];
        const triColors = ['GREEN', 'YELLOW', 'BLUE', 'RED'];
        for (let i = 0; i < 4; i++) {
            const [ax, ay] = corners[i];
            const [bx, by] = corners[(i + 1) % 4];
            this.g.fillStyle(PLAYER_COLORS[triColors[i]]);
            this.g.fillTriangle(mx, my, ax, ay, bx, by);
        }
        // círculo central branco
        this.g.fillStyle(C.WHITE);
        this.g.fillCircle(mx, my, CELL * 0.6);
        // estrela central
        this.drawStar(mx, my);
    }
    drawHomeSlots() {
        for (const color of COLORS_ORDER) {
            for (const [col, row] of HOME_BASE[color]) {
                const { x, y } = cellPx(col, row);
                this.g.fillStyle(C.WHITE, 0.5);
                this.g.fillCircle(x, y, CELL * 0.33);
                this.g.lineStyle(2, PLAYER_COLORS[color], 0.8);
                this.g.strokeCircle(x, y, CELL * 0.33);
            }
        }
    }
    drawGrid() {
        this.g.lineStyle(0.5, C.GRID_LINE, 0.3);
        // só nas casas do caminho e cruz
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if ((this.isCross(col, row) || this.isPath(col, row)) && !this.isHome(col, row)) {
                    const r = this.r(col, row);
                    this.g.strokeRect(r.x, r.y, r.w, r.h);
                }
            }
        }
    }
    isCross(col, row) {
        return (row >= 6 && row <= 8) || (col >= 6 && col <= 8);
    }
    isHome(col, row) {
        return (col <= 5 && row <= 5) || (col >= 9 && row <= 5) ||
            (col <= 5 && row >= 9) || (col >= 9 && row >= 9);
    }
    isPath(col, row) {
        return MAIN_PATH.some(([c, r]) => c === col && r === row);
    }
}
