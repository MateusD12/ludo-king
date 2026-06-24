import Phaser from 'phaser'
import {
  CELL, OX, OY, COLS, MAIN_PATH, SAFE_ABS, HOME_COL, HOME_BASE, cellPx
} from '../constants/Board'
import { C, HOME_FILL, PLAYER_COLORS, PlayerColor } from '../constants/Colors'

const COLORS_ORDER: PlayerColor[] = ['GREEN', 'YELLOW', 'BLUE', 'RED']

// Quadrantes dos 4 lar: [col, row, largura, altura]
const HOME_AREAS: [PlayerColor, number, number, number, number][] = [
  ['YELLOW', 0, 0, 6, 6],
  ['BLUE',   9, 0, 6, 6],
  ['GREEN',  0, 9, 6, 6],
  ['RED',    9, 9, 6, 6],
]

export class Board {
  private g: Phaser.GameObjects.Graphics
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.g = scene.add.graphics().setDepth(0)
    this.draw()
  }

  private r(col: number, row: number) {
    return { x: OX + col * CELL, y: OY + row * CELL, w: CELL, h: CELL }
  }

  private draw() {
    this.drawBackground()
    this.drawHomeAreas()
    this.drawCross()
    this.drawPath()
    this.drawSafeStars()
    this.drawHomeColumns()
    this.drawCenter()
    this.drawHomeSlots()
    this.drawGrid()
  }

  private drawBackground() {
    const { width, height } = this.scene.scale
    
    // 1. Fundo da tela inteira (Mesa de madeira)
    this.scene.add.image(width / 2, height / 2, 'board_bg').setDisplaySize(width, height).setDepth(-2)

    // Tamanho do tabuleiro e posição
    const size = COLS * CELL
    const cx = OX + size / 2
    const cy = OY + size / 2

    // 2. Sombra do tabuleiro
    this.g.fillStyle(0x000000, 0.6)
    this.g.fillRoundedRect(OX + 12, OY + 18, size, size, 16)

    // 3. Moldura de madeira escura
    this.g.fillStyle(0x3B2516, 1)
    this.g.fillRoundedRect(OX - 10, OY - 10, size + 20, size + 20, 12)
    this.g.lineStyle(4, 0x1A0F09, 1)
    this.g.strokeRoundedRect(OX - 10, OY - 10, size + 20, size + 20, 12)

    // 4. Superfície do tabuleiro (Creme)
    this.g.fillStyle(C.BOARD_BG, 1)
    this.g.fillRoundedRect(OX, OY, size, size, 6)
  }

  private drawHomeAreas() {
    for (const [color, col, row, w, h] of HOME_AREAS) {
      const px = OX + col * CELL, py = OY + row * CELL
      
      // Quadrado externo da cor do jogador
      this.g.fillStyle(PLAYER_COLORS[color], 1)
      this.g.fillRect(px, py, w * CELL, h * CELL)
      
      // Linha fina de contorno
      this.g.lineStyle(2, C.GRID_LINE, 0.8)
      this.g.strokeRect(px, py, w * CELL, h * CELL)

      // Quadrado branco interno (área branca típica de Ludo)
      const innerMargin = CELL * 0.8
      this.g.fillStyle(C.WHITE, 0.95)
      this.g.fillRoundedRect(px + innerMargin, py + innerMargin, w * CELL - innerMargin * 2, h * CELL - innerMargin * 2, 8)
      
      // Contorno interno
      this.g.lineStyle(2, PLAYER_COLORS[color], 0.8)
      this.g.strokeRoundedRect(px + innerMargin, py + innerMargin, w * CELL - innerMargin * 2, h * CELL - innerMargin * 2, 8)
    }
  }

  private drawCross() {
    // Fundo creme da cruz (linhas 6-8 e colunas 6-8), semi-transparente
    this.g.fillStyle(C.PATH_BG, 0.4)
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (this.isCross(col, row) && !this.isHome(col, row)) {
          const r = this.r(col, row)
          this.g.fillRect(r.x, r.y, r.w, r.h)
        }
      }
    }
  }

  private drawPath() {
    // Só desenha creme nas células de caminho fora das home areas e fora da cruz, semi-transparente
    this.g.fillStyle(C.PATH_BG, 0.4)
    for (const [col, row] of MAIN_PATH) {
      if (!this.isCross(col, row) && !this.isHome(col, row)) {
        const r = this.r(col, row)
        this.g.fillRect(r.x, r.y, r.w, r.h)
      }
    }
  }

  private drawSafeStars() {
    SAFE_ABS.forEach(idx => {
      if (idx >= MAIN_PATH.length) return
      const [col, row] = MAIN_PATH[idx]
      if (this.isHome(col, row)) return   // estrelas nunca aparecem dentro de home areas
      const { x, y } = cellPx(col, row)
      this.drawStar(x, y)
    })
  }

  private drawStar(cx: number, cy: number) {
    const r1 = CELL * 0.38, r2 = CELL * 0.16
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? r1 : r2
      const a = (i * 45 - 90) * (Math.PI / 180)
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
    }
    this.g.fillStyle(C.SAFE_STAR, 0.9)
    this.g.fillPoints(pts, true)
  }

  private drawHomeColumns() {
    for (const color of COLORS_ORDER) {
      for (const [col, row] of HOME_COL[color]) {
        const r = this.r(col, row)
        this.g.fillStyle(PLAYER_COLORS[color], 0.8)
        this.g.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2)
      }
    }
  }

  private drawCenter() {
    // 4 triângulos coloridos no 3x3 central
    const cx = OX + 6 * CELL
    const cy = OY + 6 * CELL
    const s = CELL * 3  // tamanho do quadrado 3x3
    const mx = cx + s / 2, my = cy + s / 2

    const corners: [number, number][] = [
      [cx, cy + s],     // bottom-left  → braço esquerdo (Amarelo)
      [cx, cy],         // top-left     → braço superior (Azul)
      [cx + s, cy],     // top-right    → braço direito (Vermelho)
      [cx + s, cy + s], // bottom-right → braço inferior (Verde)
    ]
    // Cada triângulo aponta em direção ao braço da coluna do lar do seu jogador
    const triColors: PlayerColor[] = ['YELLOW', 'BLUE', 'RED', 'GREEN']

    for (let i = 0; i < 4; i++) {
      const [ax, ay] = corners[i]
      const [bx, by] = corners[(i + 1) % 4]
      this.g.fillStyle(PLAYER_COLORS[triColors[i]], 0.7)
      this.g.fillTriangle(mx, my, ax, ay, bx, by)
    }

    // círculo central branco
    this.g.fillStyle(C.WHITE, 0.8)
    this.g.fillCircle(mx, my, CELL * 0.6)
    // estrela central
    this.drawStar(mx, my)
  }

  private drawHomeSlots() {
    for (const color of COLORS_ORDER) {
      for (const [col, row] of HOME_BASE[color]) {
        const { x, y } = cellPx(col, row)
        // Círculo base colorido
        this.g.fillStyle(PLAYER_COLORS[color], 0.3)
        this.g.fillCircle(x, y, CELL * 0.35)
        this.g.lineStyle(2, PLAYER_COLORS[color], 0.9)
        this.g.strokeCircle(x, y, CELL * 0.35)
      }
    }
  }

  private drawGrid() {
    this.g.lineStyle(0.5, C.GRID_LINE, 0.3)
    // só nas casas do caminho e cruz
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if ((this.isCross(col, row) || this.isPath(col, row)) && !this.isHome(col, row)) {
          const r = this.r(col, row)
          this.g.strokeRect(r.x, r.y, r.w, r.h)
        }
      }
    }
  }

  private isCross(col: number, row: number): boolean {
    return (row >= 6 && row <= 8) || (col >= 6 && col <= 8)
  }
  private isHome(col: number, row: number): boolean {
    return (col <= 5 && row <= 5) || (col >= 9 && row <= 5) ||
           (col <= 5 && row >= 9) || (col >= 9 && row >= 9)
  }
  private isPath(col: number, row: number): boolean {
    return MAIN_PATH.some(([c, r]) => c === col && r === row)
  }
}
