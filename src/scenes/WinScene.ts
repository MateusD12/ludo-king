import Phaser from 'phaser'
import { PlayerColor, PLAYER_COLORS } from '../constants/Colors'

export class WinScene extends Phaser.Scene {
  constructor() { super('WinScene') }

  create(data: { winner: PlayerColor }) {
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, 0x000000, 0.88).setOrigin(0)

    const hexCol = '#' + PLAYER_COLORS[data.winner].toString(16).padStart(6, '0')

    this.add.text(width / 2, height * 0.28, '🏆', { fontSize: '72px' }).setOrigin(0.5)
    this.add.text(width / 2, height * 0.45, 'VENCEDOR!', {
      fontSize: '52px', fontFamily: '"Arial Black", Arial', color: '#FFD700',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5)
    this.add.text(width / 2, height * 0.57, data.winner, {
      fontSize: '38px', fontFamily: '"Arial Black", Arial', color: hexCol,
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5)

    const again = this.add.text(width / 2, height * 0.72, 'JOGAR NOVAMENTE', {
      fontSize: '24px', fontFamily: '"Arial Black", Arial',
      color: '#1a0a00', backgroundColor: '#FFD700',
      padding: { x: 32, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    again.on('pointerover', () => again.setBackgroundColor('#FFB300'))
    again.on('pointerout',  () => again.setBackgroundColor('#FFD700'))
    again.on('pointerdown', () => this.scene.start('MenuScene'))

    const menu = this.add.text(width / 2, height * 0.83, 'Menu Principal', {
      fontSize: '16px', color: '#aaa', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    menu.on('pointerover', () => menu.setColor('#fff'))
    menu.on('pointerout',  () => menu.setColor('#aaa'))
    menu.on('pointerdown', () => this.scene.start('MenuScene'))
  }
}
