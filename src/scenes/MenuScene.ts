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
  private configContainer!: Phaser.GameObjects.Container
  private mainContainer!: Phaser.GameObjects.Container
  private countBtns: Phaser.GameObjects.Text[] = []
  private slotRows: { bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }[] = []

  constructor() { super('MenuScene') }

  preload() {
    this.load.image('board_bg', 'assets/board_bg.png')
    this.load.image('dice', 'assets/dice.png')
    this.load.image('piece_base', 'assets/piece_base.png')
  }

  create() {
    const { width, height } = this.scale

    // Fundo
    this.add.rectangle(0, 0, width, height, 0x1a0a00).setOrigin(0)
    
    // Título Global
    this.add.text(width / 2, 80, 'LUDO KING', {
      fontSize: '54px', fontFamily: '"Arial Black", Arial',
      color: '#FFD700', stroke: '#8B4513', strokeThickness: 6
    }).setOrigin(0.5)

    this.createMainContainer(width, height)
    this.createConfigContainer(width, height)
  }

  private createMainContainer(width: number, height: number) {
    this.mainContainer = this.add.container(0, 0)

    const btnLocal = this.createButton(width / 2, 280, 'JOGAR LOCAL', '#2E7D32', () => {
      this.mainContainer.setVisible(false)
      this.configContainer.setVisible(true)
    })

    const btnOnline = this.createButton(width / 2, 380, 'JOGAR ONLINE', '#1565C0', () => {
      alert('Jogar Online estará disponível em breve!')
    })

    this.mainContainer.add([btnLocal, btnOnline])
  }

  private createConfigContainer(width: number, height: number) {
    this.configContainer = this.add.container(0, 0)
    this.configContainer.setVisible(false)

    const panelBg = this.add.rectangle(width / 2, height / 2 + 30, 560, 480, 0x2d1a0a, 0.95).setOrigin(0.5)
    this.configContainer.add(panelBg)

    // Número de Jogadores
    const lblNum = this.add.text(width / 2, 160, 'Número de Jogadores', {
      fontSize: '18px', color: '#ccc', fontFamily: 'Arial'
    }).setOrigin(0.5)
    this.configContainer.add(lblNum)

    this.countBtns = []
    for (let i = 0; i < 3; i++) {
      const n = i + 2
      const btn = this.add.text(width / 2 + (i - 1) * 110, 210, `${n}`, {
        fontSize: '28px', fontFamily: '"Arial Black", Arial',
        backgroundColor: '#2a1800', padding: { x: 30, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      btn.on('pointerdown', () => { this.count = n; this.updateUI() })
      this.countBtns.push(btn)
      this.configContainer.add(btn)
    }

    // Slots
    const lblSlots = this.add.text(width / 2, 280, 'Jogadores', {
      fontSize: '16px', color: '#aaa', fontFamily: 'Arial'
    }).setOrigin(0.5)
    this.configContainer.add(lblSlots)

    this.slotRows = []
    for (let i = 0; i < 4; i++) {
      const y = 320 + i * 50
      const bg = this.add.rectangle(width / 2, y, 420, 40, 0x1a0a00).setOrigin(0.5).setInteractive({ useHandCursor: true })
      const label = this.add.text(width / 2, y, '', {
        fontSize: '18px', fontFamily: 'Arial', color: '#fff'
      }).setOrigin(0.5)

      const idx = i
      bg.on('pointerdown', () => {
        if (idx === 0 || idx >= this.count) return
        this.ai[idx] = !this.ai[idx]
        this.updateUI()
      })

      this.slotRows.push({ bg, label })
      this.configContainer.add([bg, label])
    }

    // Botões Inferiores
    const btnBack = this.createButton(width / 2 - 120, height - 80, 'VOLTAR', '#555555', () => {
      this.configContainer.setVisible(false)
      this.mainContainer.setVisible(true)
    }, 20)

    const btnStart = this.createButton(width / 2 + 120, height - 80, 'INICIAR', '#FFD700', () => {
      const setup: GameSetup = {
        playerCount: this.count,
        aiSlots: this.ai.slice(0, this.count)
      }
      this.scene.start('GameScene', setup)
    }, 20, '#1a0a00')

    this.configContainer.add([btnBack, btnStart])

    this.updateUI()
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void, fontSize = 26, textColor = '#ffffff') {
    const btn = this.add.container(x, y)
    
    // Fundo maior para garantir clique
    const bg = this.add.rectangle(0, 0, 320, 64, Phaser.Display.Color.HexStringToColor(color).color)
      .setInteractive({ useHandCursor: true })
    
    const label = this.add.text(0, 0, text, {
      fontSize: `${fontSize}px`, fontFamily: '"Arial Black", Arial', color: textColor
    }).setOrigin(0.5)

    bg.on('pointerdown', onClick)
    bg.on('pointerover', () => bg.setAlpha(0.8))
    bg.on('pointerout', () => bg.setAlpha(1))

    btn.add([bg, label])
    return btn
  }

  private updateUI() {
    for (let i = 0; i < this.countBtns.length; i++) {
      const n = i + 2
      const active = n === this.count
      this.countBtns[i]
        .setColor(active ? '#1a0a00' : '#777')
        .setBackgroundColor(active ? '#FFD700' : '#2a1800')
    }

    for (let i = 0; i < 4; i++) {
      const { bg, label } = this.slotRows[i]
      const color   = COLOR_ORDER[i]
      const hex     = PLAYER_COLORS[color]
      const hexStr  = '#' + hex.toString(16).padStart(6, '0')
      const enabled = i < this.count

      const who = i === 0 ? 'Você (Humano)' : (this.ai[i] ? 'IA' : 'Humano')
      const text = `${COLOR_PT[color]}:  ${who}`

      bg.setFillStyle(enabled ? 0x2a1800 : 0x111111)
      label.setText(text).setColor(enabled ? hexStr : '#444')
    }
  }
}
