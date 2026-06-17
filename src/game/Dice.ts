import Phaser from 'phaser'

const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-12, -12], [12, 12]],
  3: [[-12, -12], [0, 0], [12, 12]],
  4: [[-12, -12], [12, -12], [-12, 12], [12, 12]],
  5: [[-12, -12], [12, -12], [0, 0], [-12, 12], [12, 12]],
  6: [[-12, -12], [12, -12], [-12, 0], [12, 0], [-12, 12], [12, 12]],
}

export class Dice {
  readonly x: number
  readonly y: number
  value = 1
  private rolling = false
  private enabled = false
  private g: Phaser.GameObjects.Graphics
  private scene: Phaser.Scene
  private glowText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.x = x
    this.y = y
    this.g = scene.add.graphics().setDepth(20)
    this.glowText = scene.add.text(x, y + 48, 'Toque para rolar', {
      fontSize: '13px', color: '#FFD700', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(21).setAlpha(0)

    this.g.setInteractive(new Phaser.Geom.Rectangle(x - 32, y - 32, 64, 64), Phaser.Geom.Rectangle.Contains)
    this.g.on('pointerdown', () => { if (this.enabled && !this.rolling) scene.events.emit('diceClicked') })
    this.g.on('pointerover', () => { if (this.enabled) this.g.setAlpha(0.85) })
    this.g.on('pointerout',  () => this.g.setAlpha(1))

    this.draw(1)
    this.setEnabled(false)
  }

  draw(val: number) {
    this.g.clear()
    // sombra
    this.g.fillStyle(0x000000, 0.3)
    this.g.fillRoundedRect(this.x - 29, this.y - 27, 58, 58, 10)
    // face
    this.g.fillStyle(0xFFFFFF)
    this.g.fillRoundedRect(this.x - 30, this.y - 30, 60, 60, 10)
    this.g.lineStyle(2, 0x333333)
    this.g.strokeRoundedRect(this.x - 30, this.y - 30, 60, 60, 10)
    // pips
    this.g.fillStyle(0x222222)
    for (const [dx, dy] of (PIPS[val] ?? [])) {
      this.g.fillCircle(this.x + dx, this.y + dy, 5)
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on
    this.g.setAlpha(on ? 1 : 0.35)
    this.scene.tweens.killTweensOf(this.glowText)
    if (on) {
      this.glowText.setAlpha(1)
      this.scene.tweens.add({ targets: this.glowText, alpha: 0, duration: 800, yoyo: true, repeat: -1 })
    } else {
      this.glowText.setAlpha(0)
    }
  }

  async roll(): Promise<number> {
    if (this.rolling) return this.value
    this.rolling = true
    this.setEnabled(false)

    return new Promise(resolve => {
      let ticks = 0
      const total = 14
      this.scene.time.addEvent({
        delay: 55,
        repeat: total - 1,
        callback: () => {
          const fake = Math.ceil(Math.random() * 6)
          this.draw(fake)
          ticks++
          if (ticks >= total) {
            this.value = Math.ceil(Math.random() * 6)
            this.draw(this.value)
            this.rolling = false
            resolve(this.value)
          }
        }
      })
    })
  }

  destroy() {
    this.g.destroy()
    this.glowText.destroy()
  }
}
