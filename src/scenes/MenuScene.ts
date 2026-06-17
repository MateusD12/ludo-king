import Phaser from 'phaser'
import { PLAYER_COLORS, PlayerColor } from '../constants/Colors'

export interface GameSetup {
  playerCount: number
  aiSlots: boolean[]
}

const COLOR_ORDER: PlayerColor[] = ['GREEN', 'YELLOW', 'BLUE', 'RED']
const COLOR_PT: Record<PlayerColor, string> = {
  GREEN: 'Verde', YELLOW: 'Amarelo', BLUE: 'Azul', RED: 'Vermelho'
}

export class MenuScene extends Phaser.Scene {
  private count = 4
  private ai = [false, true, true, true]

  // Referências para atualização dinâmica
  private countBtns: Phaser.GameObjects.Text[] = []
  private slotRows: { bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }[] = []

  constructor() { super('MenuScene') }

  create() {
    const { width, height } = this.scale

    // Fundo
    this.add.rectangle(0, 0, width, height, 0x1a0a00).setOrigin(0)
    this.add.rectangle(width / 2, height / 2, 560, 500, 0x2d1a0a, 0.85).setOrigin(0.5)

    // Título
    this.add.text(width / 2, 68, '🎲 LUDO KING', {
      fontSize: '50px', fontFamily: '"Arial Black", Arial',
      color: '#FFD700', stroke: '#8B4513', strokeThickness: 5
    }).setOrigin(0.5)

    this.add.text(width / 2, 125, 'Sem propagandas • Jogo local', {
      fontSize: '13px', color: '#777', fontFamily: 'Arial'
    }).setOrigin(0.5)

    // ── Número de jogadores ───────────────────────────────────────
    this.add.text(width / 2, 172, 'Número de Jogadores', {
      fontSize: '17px', color: '#ccc', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.countBtns = []
    for (let i = 0; i < 3; i++) {
      const n = i + 2
      const btn = this.add.text(width / 2 + (i - 1) * 95, 212, `${n}`, {
        fontSize: '26px', fontFamily: '"Arial Black", Arial',
        padding: { x: 22, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerdown', () => { this.count = n; this.updateUI() })
      this.countBtns.push(btn)
    }

    // ── Slots dos jogadores ───────────────────────────────────────
    this.add.text(width / 2, 268, 'Jogadores', {
      fontSize: '15px', color: '#aaa', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.slotRows = []
    for (let i = 0; i < 4; i++) {
      const y = 300 + i * 48
      const bg = this.add.rectangle(width / 2, y, 420, 38, 0x1a0a00).setOrigin(0.5)
      const label = this.add.text(width / 2, y, '', {
        fontSize: '15px', fontFamily: 'Arial'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      const idx = i
      label.on('pointerdown', () => {
        if (idx === 0 || idx >= this.count) return
        this.ai[idx] = !this.ai[idx]
        this.updateUI()
      })
      this.slotRows.push({ bg, label })
    }

    // ── Botão Jogar ───────────────────────────────────────────────
    const start = this.add.text(width / 2, height - 72, '▶  JOGAR', {
      fontSize: '30px', fontFamily: '"Arial Black", Arial',
      color: '#1a0a00', backgroundColor: '#FFD700',
      padding: { x: 42, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    start.on('pointerover', () => start.setBackgroundColor('#FFB300'))
    start.on('pointerout',  () => start.setBackgroundColor('#FFD700'))
    start.on('pointerdown', () => {
      const setup: GameSetup = {
        playerCount: this.count,
        aiSlots: this.ai.slice(0, this.count)
      }
      this.scene.start('GameScene', setup)
    })

    this.updateUI()
  }

  private updateUI() {
    // Botões de contagem
    for (let i = 0; i < this.countBtns.length; i++) {
      const n = i + 2
      const active = n === this.count
      this.countBtns[i]
        .setColor(active ? '#FFD700' : '#777')
        .setBackgroundColor(active ? '#5d3a0a' : '#2a1800')
    }

    // Slots
    for (let i = 0; i < 4; i++) {
      const { bg, label } = this.slotRows[i]
      const color   = COLOR_ORDER[i]
      const hex     = PLAYER_COLORS[color]
      const hexStr  = '#' + hex.toString(16).padStart(6, '0')
      const enabled = i < this.count

      const who = i === 0
        ? '👤 Você (Humano)'
        : (this.ai[i] ? '🤖 IA' : '👤 Humano')
      const text = `${COLOR_PT[color]}:  ${who}`

      bg.setFillStyle(enabled ? 0x2a1800 : 0x111111)
      label.setText(text)
            .setColor(enabled ? hexStr : '#444')
            .setInteractive(enabled && i > 0 ? { useHandCursor: true } : {})
    }
  }
}
