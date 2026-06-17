import Phaser from 'phaser'
import { PLAYER_COLORS, PlayerColor } from '../constants/Colors'

export interface GameSetup {
  playerCount: number
  aiSlots: boolean[]
}

const COLOR_ORDER: PlayerColor[] = ['GREEN', 'YELLOW', 'BLUE', 'RED']
const COLOR_NAME = { GREEN: 'Verde', YELLOW: 'Amarelo', BLUE: 'Azul', RED: 'Vermelho' }

export class MenuScene extends Phaser.Scene {
  private count = 4
  private ai = [false, true, true, true]
  private countBtns: Phaser.GameObjects.Text[] = []
  private slotBtns: Phaser.GameObjects.Text[] = []

  constructor() { super('MenuScene') }

  create() {
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, 0x1a0a00).setOrigin(0)

    // Decoração fundo
    this.add.rectangle(width / 2, height / 2, 560, 480, 0x2d1a0a, 0.8).setOrigin(0.5)

    // Título
    this.add.text(width / 2, 70, '🎲 LUDO KING', {
      fontSize: '52px', fontFamily: '"Arial Black", Arial',
      color: '#FFD700', stroke: '#8B4513', strokeThickness: 5
    }).setOrigin(0.5)

    this.add.text(width / 2, 130, 'Sem propagandas • Jogo local', {
      fontSize: '14px', color: '#888', fontFamily: 'Arial'
    }).setOrigin(0.5)

    // ── Seletor de jogadores ──────────────────────────────────────
    this.add.text(width / 2, 190, 'Número de Jogadores', {
      fontSize: '18px', color: '#fff', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.countBtns = []
    for (const n of [2, 3, 4]) {
      const btn = this.add.text(width / 2 + (n - 3) * 90, 230, `${n}`, {
        fontSize: '28px', fontFamily: '"Arial Black", Arial',
        backgroundColor: '#3d2a0a',
        padding: { x: 20, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerdown', () => { this.count = n; this.refreshUI() })
      this.countBtns.push(btn)
    }

    // ── Slots de jogadores ────────────────────────────────────────
    this.add.text(width / 2, 295, 'Jogadores', {
      fontSize: '16px', color: '#ccc', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.slotBtns = []
    for (let i = 0; i < 4; i++) {
      const color   = COLOR_ORDER[i]
      const hexStr  = '#' + PLAYER_COLORS[color].toString(16).padStart(6, '0')
      const label   = i === 0 ? '👤 Humano (Você)' : (this.ai[i] ? '🤖 IA' : '👤 Humano')
      const enabled = i < this.count

      const btn = this.add.text(width / 2, 330 + i * 44, `${hexStr.toUpperCase()}  ${COLOR_NAME[color]}: ${label}`, {
        fontSize: '16px', fontFamily: 'Arial',
        color: enabled ? hexStr : '#555',
        backgroundColor: enabled ? '#2a1800' : '#111',
        padding: { x: 16, y: 6 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: i > 0 && enabled })

      if (i > 0 && enabled) {
        btn.on('pointerdown', () => {
          this.ai[i] = !this.ai[i]
          this.refreshUI()
        })
      }
      this.slotBtns.push(btn)
    }

    // ── Botão Iniciar ─────────────────────────────────────────────
    const start = this.add.text(width / 2, height - 80, '▶  JOGAR', {
      fontSize: '30px', fontFamily: '"Arial Black", Arial',
      color: '#1a0a00', backgroundColor: '#FFD700',
      padding: { x: 40, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    start.on('pointerover', () => start.setBackgroundColor('#FFB300'))
    start.on('pointerout',  () => start.setBackgroundColor('#FFD700'))
    start.on('pointerdown', () => {
      const setup: GameSetup = { playerCount: this.count, aiSlots: [...this.ai] }
      this.scene.start('GameScene', setup)
    })

    this.refreshUI()
  }

  private refreshUI() {
    // Atualiza seleção de contagem
    for (let i = 0; i < this.countBtns.length; i++) {
      const n = i + 2
      this.countBtns[i].setColor(n === this.count ? '#FFD700' : '#888')
                        .setBackgroundColor(n === this.count ? '#5d3a0a' : '#3d2a0a')
    }

    // Garante que ai[0] é sempre false
    this.ai[0] = false

    // Recria a cena para atualizar labels dos slots (mais simples que atualizar texto)
    this.scene.restart({ _count: this.count, _ai: this.ai })
  }

  init(data: { _count?: number; _ai?: boolean[] }) {
    if (data._count) this.count = data._count
    if (data._ai)   this.ai    = data._ai
  }
}
