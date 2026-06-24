import Phaser from 'phaser'
import {
  CELL, cellPx, MAIN_PATH, HOME_COL, HOME_BASE,
  HOME_START, FINISHED, PATH_ENTRY
} from '../constants/Board'
import { PLAYER_COLORS, PlayerColor } from '../constants/Colors'

export class Piece {
  readonly color: PlayerColor
  readonly idx: number        // 0-3 (qual das 4 peças do jogador)
  piecePos = -1               // -1=base, 0-47=anel, 48-52=coluna do lar, 53=finalizado (FINISHED)

  private container: Phaser.GameObjects.Container
  private ring: Phaser.GameObjects.Arc
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, color: PlayerColor, idx: number) {
    this.scene = scene
    this.color = color
    this.idx   = idx

    const col = PLAYER_COLORS[color]
    const { x, y } = this.screenPos()

    this.container = scene.add.container(x, y).setDepth(6)
    
    // Dimensões relativas à CELL
    const w = CELL * 0.6
    const h = CELL * 0.4
    const headY = -CELL * 0.5

    // 1. Desenhamos o peão inteiro em um objeto Graphics para precisão 2.5D
    const g = scene.add.graphics()

    // Sombra do peão na mesa
    g.fillStyle(0x000000, 0.4)
    g.fillEllipse(6, 8, w, h)

    // Base do peão (Efeito 3D)
    g.fillStyle(0x000000, 0.3)
    g.fillEllipse(0, 3, w, h)
    g.fillStyle(col, 1)
    g.fillEllipse(0, 0, w, h)

    // Corpo (Cone)
    g.beginPath()
    g.moveTo(-w/2, 0)
    g.lineTo(w/2, 0)
    g.lineTo(w/4, headY)
    g.lineTo(-w/4, headY)
    g.closePath()
    g.fillPath()

    // Cabeça do peão
    g.fillCircle(0, headY, CELL * 0.22)
    
    // Brilho / Highlight
    g.fillStyle(0xFFFFFF, 0.5)
    g.fillCircle(-CELL * 0.06, headY - CELL * 0.06, CELL * 0.06)

    this.ring = scene.add.circle(0, 0, CELL * 0.45, 0xFFFF00, 0).setStrokeStyle(3, 0xFFFF00, 0)
    
    this.container.add([g, this.ring])

    // Hitbox invisível para cliques (maior para facilitar no mobile)
    const hitZone = scene.add.circle(0, headY / 2, CELL * 0.6, 0, 0).setInteractive({ useHandCursor: true })
    this.container.add(hitZone)

    hitZone.on('pointerdown', () => scene.events.emit('pieceClicked', this))
    hitZone.on('pointerover', () => this.container.setAlpha(0.85))
    hitZone.on('pointerout',  () => this.container.setAlpha(1))
  }

  setHighlight(on: boolean) {
    if (on) {
      this.ring.setFillStyle(0xFFFF00, 0.15).setStrokeStyle(3, 0xFFFF00, 1)
      this.scene.tweens.add({ targets: this.container, scaleX: 1.15, scaleY: 1.15, duration: 350, yoyo: true, repeat: -1 })
    } else {
      this.ring.setFillStyle(0, 0).setStrokeStyle(0, 0, 0)
      this.scene.tweens.killTweensOf(this.container)
      this.container.setScale(1)
    }
  }

  screenPos(): { x: number; y: number } {
    // offset para evitar sobreposição de peças na mesma casa
    const dx = (this.idx % 2 === 0 ? -1 : 1) * 11
    const dy = (this.idx < 2 ? -1 : 1) * 11

    if (this.piecePos === -1) {
      const [col, row] = HOME_BASE[this.color][this.idx]
      return cellPx(col, row)
    }
    if (this.piecePos === FINISHED) {
      const p = cellPx(7, 7)
      return { x: p.x + dx, y: p.y + dy }
    }
    if (this.piecePos >= HOME_START) {
      const hi = this.piecePos - HOME_START
      const [col, row] = HOME_COL[this.color][hi]
      return { x: cellPx(col, row).x + dx, y: cellPx(col, row).y + dy }
    }
    // anel externo: piecePos relativo → índice absoluto
    const absIdx = (PATH_ENTRY[this.color] + this.piecePos) % MAIN_PATH.length
    const [col, row] = MAIN_PATH[absIdx]
    return { x: cellPx(col, row).x + dx, y: cellPx(col, row).y + dy }
  }

  syncPosition() {
    const { x, y } = this.screenPos()
    this.container.setPosition(x, y)
  }

  // Anima peça passando por cada posição na lista (uma por vez)
  async animateThrough(positions: number[]): Promise<void> {
    const msPerStep = Math.min(90, Math.round(400 / positions.length))
    for (const pos of positions) {
      const saved = this.piecePos
      this.piecePos = pos
      const { x, y } = this.screenPos()
      this.piecePos = saved
      await this.tweenTo(x, y, msPerStep)
    }
  }

  private tweenTo(x: number, y: number, ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        x, y, duration: ms,
        ease: 'Sine.easeInOut',
        onComplete: () => resolve()
      })
    })
  }

  async animateCapture(): Promise<void> {
    await new Promise<void>(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 0, scaleY: 0, alpha: 0, duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => resolve()
      })
    })
    this.container.setScale(1).setAlpha(1)
    this.piecePos = -1
    this.syncPosition()
  }

  destroy() {
    this.container.destroy()
  }
}
