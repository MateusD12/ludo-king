import Phaser from 'phaser'
import { Board } from '../game/Board'
import { Dice } from '../game/Dice'
import { Player } from '../game/Player'
import { RulesEngine, MoveResult } from '../game/RulesEngine'
import { AIStrategy } from '../ai/AIStrategy'
import { GameSetup } from './MenuScene'
import { PLAYER_COLORS, PlayerColor, COLOR_PT } from '../constants/Colors'
import { BOARD_PX, OX, OY, HOME_START } from '../constants/Board'

const COLOR_ORDER: PlayerColor[] = ['GREEN', 'YELLOW', 'BLUE', 'RED']

export class GameScene extends Phaser.Scene {
  private players: Player[] = []
  private rules!: RulesEngine
  private ai!: AIStrategy
  private dice!: Dice
  private curIdx  = 0
  private diceVal = 0
  private waiting = false
  private animating = false
  private validMoves: MoveResult[] = []

  // UI
  private playerHeaderGraphics!: Phaser.GameObjects.Graphics
  private turnLabel!:  Phaser.GameObjects.Text
  private infoLabel!:  Phaser.GameObjects.Text
  private menuBtn!:    Phaser.GameObjects.Text
  private rankPanel!:  Phaser.GameObjects.Text

  constructor() { super('GameScene') }

  init(data: GameSetup) {
    this.players    = []
    this.curIdx     = 0
    this.validMoves = []
    this.waiting    = false
    this.animating  = false

    // Novo formato baseado em posições (Verde, Amarelo, Azul, Vermelho)
    if (data.slots) {
      for (let i = 0; i < 4; i++) {
        if (data.slots[i] !== 'VAZIO') {
          this.players.push(new Player(this, COLOR_ORDER[i], data.slots[i] === 'ROBÔ'))
        }
      }
    } else {
      // Fallback para inicialização via código (debug)
      this.players = [
        new Player(this, 'GREEN', false),
        new Player(this, 'YELLOW', true),
        new Player(this, 'BLUE', true),
        new Player(this, 'RED', true)
      ]
    }
  }

  create() {
    const { width, height } = this.scale

    // Fundo fotorealista de madeira é renderizado pelo Board.ts

    // Tabuleiro
    new Board(this)

    // Sidebar e Dimensões do Painel
    const panelWidth = 240
    const sideX = OX + BOARD_PX + 30 + (width - OX - BOARD_PX - 30) / 2
    const panelY = height / 2 - 140
    const panelHeight = 280

    // Painel de Fundo da UI (Módulo estilo vidro/madeira)
    this.add.graphics()
      .fillStyle(0x2a1a10, 0.85) // Tom escuro amadeirado/couro
      .fillRoundedRect(sideX - panelWidth/2, panelY, panelWidth, panelHeight, 12)
      .lineStyle(2, 0x8a5a3a, 0.6) // Borda sutil
      .strokeRoundedRect(sideX - panelWidth/2, panelY, panelWidth, panelHeight, 12)
      .setDepth(19)

    // Cabeçalho da cor do jogador (Desenhado dinamicamente no startTurn)
    this.playerHeaderGraphics = this.add.graphics().setDepth(20)

    // Textos UI
    this.turnLabel = this.add.text(sideX, panelY + 28, '', {
      fontSize: '22px', fontFamily: '"Arial Black", Arial', color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5).setDepth(21)

    this.infoLabel = this.add.text(sideX, panelY + 80, '', {
      fontSize: '17px', color: '#FFFFFF', fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setDepth(21)

    // Dado
    this.dice = new Dice(this, sideX, panelY + 160)

    // Instrução fixa do dado
    this.add.text(sideX, panelY + 240, 'Toque para rolar', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5).setDepth(21)

    // Botão Menu estilizado
    const btnY = panelY + panelHeight + 35
    this.add.graphics()
      .fillStyle(0x2a1a10, 0.9)
      .fillRoundedRect(sideX - 70, btnY - 22, 140, 44, 10)
      .lineStyle(2, 0x8a5a3a, 0.6)
      .strokeRoundedRect(sideX - 70, btnY - 22, 140, 44, 10)
      .setDepth(19)

    this.menuBtn = this.add.text(sideX, btnY, 'Menu', {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(20)
    
    // Aumentar a área de clique usando setInteractive com um retângulo
    this.menuBtn.setInteractive(new Phaser.Geom.Rectangle(-30, -15, 100, 50), Phaser.Geom.Rectangle.Contains, { useHandCursor: true })
    this.menuBtn.on('pointerdown', () => { this.cleanUp(); this.scene.start('MenuScene') })

    // Rank Panel
    this.rankPanel = this.add.text(sideX, btnY + 50, '', {
      fontSize: '13px', color: '#cccccc', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5).setDepth(20)

    // Eventos
    this.events.on('diceClicked', this.onDiceClicked, this)
    this.events.on('pieceClicked', this.onPieceClicked, this)

    this.rules = new RulesEngine(this.players)
    this.ai    = new AIStrategy()

    this.startTurn()
  }

  private startTurn() {
    let tries = 0
    while (this.players[this.curIdx].finished && tries < this.players.length) {
      this.curIdx = (this.curIdx + 1) % this.players.length
      tries++
    }

    const player = this.players[this.curIdx]
    const col    = PLAYER_COLORS[player.color]
    const hexCol = '#' + col.toString(16).padStart(6, '0')

    // Atualizar barra de cor do jogador ativo no topo do painel
    const panelWidth = 240
    const sideX = OX + BOARD_PX + 30 + (this.scale.width - OX - BOARD_PX - 30) / 2
    const panelY = this.scale.height / 2 - 140

    this.playerHeaderGraphics.clear()
    this.playerHeaderGraphics.fillStyle(col, 1)
    // Desenhamos um retângulo com os cantos superiores arredondados para encaixar no painel
    this.playerHeaderGraphics.fillRoundedRect(sideX - panelWidth/2 + 2, panelY + 2, panelWidth - 4, 52, { tl: 10, tr: 10, bl: 0, br: 0 })

    this.turnLabel.setText(COLOR_PT[player.color])
    this.infoLabel.setText(player.isAI ? '🤖 IA pensando...' : '🎲 Role o dado')

    if (player.isAI) {
      this.time.delayedCall(700, () => this.doAITurn())
    } else {
      this.dice.setEnabled(true)
    }
  }

  private async onDiceClicked() {
    if (this.animating || this.waiting) return
    const player = this.players[this.curIdx]
    if (player.isAI) return

    this.dice.setEnabled(false)
    this.animating = true
    this.diceVal = await this.dice.roll()
    this.animating = false

    this.infoLabel.setText(`Tirou ${this.diceVal}`)
    await this.processRoll(player, this.diceVal)
  }

  private async processRoll(player: Player, dice: number) {
    this.validMoves = this.rules.getValidMoves(player, dice)

    if (this.validMoves.length === 0) {
      this.infoLabel.setText('Sem movimentos — próximo!')
      await this.delay(900)
      this.nextTurn(false)
      return
    }

    if (this.validMoves.length === 1) {
      await this.applyMove(this.validMoves[0])
      return
    }

    this.waiting = true
    this.infoLabel.setText('Escolha uma peça')
    this.validMoves.forEach(m => m.piece.setHighlight(true))
  }

  private async onPieceClicked(piece: import('../game/Piece').Piece) {
    if (!this.waiting || this.animating) return
    const move = this.validMoves.find(m => m.piece === piece)
    if (!move) return

    this.validMoves.forEach(m => m.piece.setHighlight(false))
    this.waiting = false
    await this.applyMove(move)
  }

  private async applyMove(move: MoveResult) {
    this.animating = true

    await move.piece.animateThrough(move.pathSteps)
    move.piece.piecePos = move.newPos
    move.piece.syncPosition()

    // Capturas — camera shake
    for (const cap of move.captures) {
      await cap.animateCapture()
    }
    if (move.captures.length > 0) {
      this.cameras.main.shake(150, 0.007)
      this.infoLabel.setText(`Captura! Turno extra!`)
    }

    // Feedback ao entrar na coluna do lar
    if (move.newPos >= HOME_START && move.piece.piecePos !== move.newPos) {
      // já sincronizado acima; flash na câmera para sinalizar entrada no lar
    }
    if (move.newPos >= HOME_START) {
      this.cameras.main.flash(180, 255, 215, 0, false) // flash dourado
    }

    this.animating = false

    // Verificar vitória
    const player = this.players[this.curIdx]
    if (player.finished) {
      const rank = this.players.filter(p => p.rank > 0).length + 1
      player.rank = rank
      this.updateRankPanel()

      const allDone = this.players.every(p => p.finished)
      if (allDone || rank === 1) {
        this.cleanUp()
        this.scene.start('WinScene', { winner: player.color })
        return
      }
    }

    if (move.extraTurn) {
      if (!move.captures.length) {
        this.infoLabel.setText('Turno extra! 🎲')
        // Bounce no infoLabel para destacar turno extra
        this.tweens.add({ targets: this.infoLabel, scaleX: 1.2, scaleY: 1.2, duration: 150, yoyo: true, ease: 'Back.easeOut' })
      }
      await this.delay(500)
      this.startTurn()
    } else {
      this.nextTurn(false)
    }
  }

  private async doAITurn() {
    const player = this.players[this.curIdx]
    this.dice.setEnabled(false)

    await this.delay(400)
    this.diceVal = await this.dice.roll()
    this.infoLabel.setText(`IA tirou ${this.diceVal}`)
    await this.delay(300)

    const moves = this.rules.getValidMoves(player, this.diceVal)
    if (moves.length === 0) {
      this.infoLabel.setText('IA sem movimentos')
      await this.delay(700)
      this.nextTurn(false)
      return
    }

    const selected = this.ai.selectMove(moves, player, this.players)
    if (!selected) { this.nextTurn(false); return }

    await this.applyMove(selected)
  }

  private nextTurn(extra: boolean) {
    if (!extra) this.curIdx = (this.curIdx + 1) % this.players.length
    this.startTurn()
  }

  private updateRankPanel() {
    const lines = this.players
      .filter(p => p.rank > 0)
      .sort((a, b) => a.rank - b.rank)
      .map(p => `${p.rank}º ${COLOR_PT[p.color]}`)
    this.rankPanel.setText(lines.join('\n'))
  }

  private delay(ms: number): Promise<void> {
    return new Promise(r => this.time.delayedCall(ms, r))
  }

  private cleanUp() {
    this.events.off('diceClicked', this.onDiceClicked, this)
    this.events.off('pieceClicked', this.onPieceClicked, this)
  }

  shutdown() {
    this.cleanUp()
    this.players.forEach(p => p.destroy())
  }
}
