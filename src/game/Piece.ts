import Phaser from 'phaser'
import {
  CELL, cellPx, MAIN_PATH, HOME_COL, HOME_BASE,
  HOME_START, FINISHED, PATH_ENTRY
} from '../constants/Board'
import { PLAYER_COLORS, PlayerColor } from '../constants/Colors'

export class Piece {
  readonly color: PlayerColor
  readonly idx: number        // 0-3 (qual das 4 peças do jogador)
  piecePos = -1               // -1=base, 0-51=anel, 52-56=coluna, 57=finished

  private circ: Phaser.GameObjects.Arc
  private dot:  Phaser.GameObjects.Arc
  private ring: Phaser.GameObjects.Arc
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, color: PlayerColor, idx: number) {
    this.scene = scene
    this.color = color
    this.idx   = idx

    const col = PLAYER_COLORS[color]
    const { x, y } = this.screenPos()

    this.ring = scene.add.circle(x, y, CELL * 0.42, 0xFFFF00, 0).setDepth(5).setStrokeStyle(3, 0xFFFF00, 0)
    this.circ = scene.add.circle(x, y, CELL * 0.34, col).setDepth(6).setStrokeStyle(2, 0x000000, 0.8)
    this.dot  = scene.add.circle(x, y, CELL * 0.13, 0xFFFFFF, 0.7).setDepth(7)

    this.circ.setInteractive()
    this.circ.on('pointerdown', () => scene.events.emit('pieceClicked', this))
    this.circ.on('pointerover', () => this.circ.setAlpha(0.75))
    this.circ.on('pointerout',  () => this.circ.setAlpha(1))
  }

  setHighlight(on: boolean) {
    if (on) {
      this.ring.setFillStyle(0xFFFF00, 0.15).setStrokeStyle(3, 0xFFFF00, 1)
      this.scene.tweens.add({ targets: this.circ, scaleX: 1.15, scaleY: 1.15, duration: 350, yoyo: true, repeat: -1 })
    } else {
      this.ring.setFillStyle(0, 0).setStrokeStyle(0, 0, 0)
      this.scene.tweens.killTweensOf(this.circ)
      this.circ.setScale(1)
    }
  }

  screenPos(): { x: number; y: number } {
    // offset para evitar sobreposição de peças na mesma casa
    const dx = (this.idx % 2 === 0 ? -1 : 1) * 6
    const dy = (this.idx < 2 ? -1 : 1) * 6

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
    this.circ.setPosition(x, y)
    this.dot.setPosition(x, y)
    this.ring.setPosition(x, y)
  }

  // Anima peça passando por cada posição na lista (uma por vez)
  async animateThrough(positions: number[]): Promise<void> {
    for (const pos of positions) {
      const saved = this.piecePos
      this.piecePos = pos
      const { x, y } = this.screenPos()
      this.piecePos = saved
      await this.tweenTo(x, y, 90)
    }
  }

  private tweenTo(x: number, y: number, ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: [this.circ, this.dot, this.ring],
        x, y, duration: ms,
        ease: 'Sine.easeInOut',
        onComplete: () => resolve()
      })
    })
  }

  async animateCapture(): Promise<void> {
    await new Promise<void>(resolve => {
      this.scene.tweens.add({
        targets: [this.circ, this.dot],
        scaleX: 0, scaleY: 0, alpha: 0, duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => resolve()
      })
    })
    this.circ.setScale(1).setAlpha(1)
    this.dot.setScale(1).setAlpha(1)
    this.piecePos = -1
    this.syncPosition()
  }

  destroy() {
    this.circ.destroy()
    this.dot.destroy()
    this.ring.destroy()
  }
}
