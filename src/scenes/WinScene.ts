import Phaser from 'phaser'
import { PlayerColor, PLAYER_COLORS, COLOR_PT } from '../constants/Colors'

export class WinScene extends Phaser.Scene {
  constructor() { super('WinScene') }

  create(data: { winner: PlayerColor }) {
    const { width, height } = this.scale
    const color = PLAYER_COLORS[data.winner]
    const hexCol = '#' + color.toString(16).padStart(6, '0')
    const name   = COLOR_PT[data.winner]

    this.add.rectangle(0, 0, width, height, 0x000000, 0.88).setOrigin(0)

    // Troféu — entra com bounce após 0ms
    const trophy = this.add.text(width / 2, height * 0.28 - 40, '🏆', { fontSize: '72px' })
      .setOrigin(0.5).setAlpha(0)
    this.tweens.add({ targets: trophy, y: height * 0.28, alpha: 1, duration: 400, ease: 'Back.easeOut', delay: 0 })

    // "VENCEDOR!" — entra com escala após 300ms
    const winText = this.add.text(width / 2, height * 0.45, 'VENCEDOR!', {
      fontSize: '52px', fontFamily: '"Arial Black", Arial', color: '#FFD700',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0).setScale(0.4)
    this.tweens.add({ targets: winText, alpha: 1, scaleX: 1, scaleY: 1, duration: 350, ease: 'Back.easeOut', delay: 300 })

    // Nome do vencedor em português — entra após 550ms
    const nameText = this.add.text(width / 2, height * 0.57, name, {
      fontSize: '38px', fontFamily: '"Arial Black", Arial', color: hexCol,
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0)
    this.tweens.add({ targets: nameText, alpha: 1, y: height * 0.57, duration: 300, ease: 'Sine.easeOut', delay: 550 })

    // Botão JOGAR NOVAMENTE — aparece após 700ms
    const again = this.add.text(width / 2, height * 0.72, 'JOGAR NOVAMENTE', {
      fontSize: '26px', fontFamily: '"Arial Black", Arial',
      color: '#1a0a00', backgroundColor: '#FFD700',
      padding: { x: 36, y: 14 }
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true })
    this.tweens.add({ targets: again, alpha: 1, duration: 250, delay: 700 })
    again.on('pointerover', () => again.setBackgroundColor('#FFB300'))
    again.on('pointerout',  () => again.setBackgroundColor('#FFD700'))
    again.on('pointerdown', () => this.scene.start('MenuScene'))

    // Botão Menu — aparece após 700ms
    const menu = this.add.text(width / 2, height * 0.84, 'Menu Principal', {
      fontSize: '16px', color: '#aaa', fontFamily: 'Arial'
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true })
    this.tweens.add({ targets: menu, alpha: 1, duration: 250, delay: 700 })
    menu.on('pointerover', () => menu.setColor('#fff'))
    menu.on('pointerout',  () => menu.setColor('#aaa'))
    menu.on('pointerdown', () => this.scene.start('MenuScene'))

    // Partículas coloridas — círculos expandindo a partir do centro
    this.time.delayedCall(200, () => this.spawnParticles(width / 2, height / 2, color))
  }

  private spawnParticles(cx: number, cy: number, color: number) {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const dist  = 80 + Math.random() * 80
      const c = this.add.circle(cx, cy, 5 + Math.random() * 4, color).setDepth(30).setAlpha(0.9)
      this.tweens.add({
        targets: c,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 600 + Math.random() * 300,
        ease: 'Quad.easeOut',
        delay: i * 30,
        onComplete: () => c.destroy()
      })
    }
  }
}
