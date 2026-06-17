import Phaser from 'phaser'
import { Board } from '../game/Board'
import { Dice } from '../game/Dice'
import { Player } from '../game/Player'
import { RulesEngine, MoveResult } from '../game/RulesEngine'
import { AIStrategy } from '../ai/AIStrategy'
import { GameSetup } from './MenuScene'
import { PLAYER_COLORS, PlayerColor, C } from '../constants/Colors'
import { BOARD_PX, OX, OY } from '../constants/Board'

const COLOR_ORDER: PlayerColor[] = ['GREEN', 'YELLOW', 'BLUE', 'RED']
const COLOR_PT: Record<PlayerColor, string> = {
  GREEN: 'Verde', YELLOW: 'Amarelo', BLUE: 'Azul', RED: 'Vermelho'
}

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
  private turnLabel!: Phaser.GameObjects.Text
  private infoLabel!: Phaser.GameObjects.Text
  private menuBtn!:  Phaser.GameObjects.Text
  private rankPanel!: Phaser.GameObjects.Text

  constructor() { super('GameScene') }

  init(data: GameSetup) {
    this.players    = []
    this.curIdx     = 0
    this.validMoves = []
    this.waiting    = false
    this.animating  = false

    const count = data.playerCount ?? 4
    const aiSlots = data.aiSlots ?? [false, true, true, true]
    for (let i = 0; i < count; i++) {
      this.players.push(new Player(this, COLOR_ORDER[i], aiSlots[i] ?? false))
    }
  }

  create() {
    const { width, height } = this.scale

    // Fundo
    this.add.rectangle(0, 0, width, height, C.UI_BG).setOrigin(0)

    // Tabuleiro
    new Board(this)

    // Sidebar X position
    const sideX = OX + BOARD_PX + 30 + (width - OX - BOARD_PX - 30) / 2

    // Dado
    this.dice = new Dice(this, sideX, height / 2 - 20)

    // Labels UI
    this.turnLabel = this.add.text(sideX, 60, '', {
      fontSize: '20px', fontFamily: '"Arial Black", Arial', color: '#FFD700',
      align: 'center', wordWrap: { width: 130 }
    }).setOrigin(0.5).setDepth(20)

    this.infoLabel = this.add.text(sideX, 100, '', {
      fontSize: '13px', color: '#ccc', fontFamily: 'Arial',
      align: 'center', wordWrap: { width: 130 }
    }).setOrigin(0.5).setDepth(20)

    this.rankPanel = this.add.text(sideX, height - 100, '', {
      fontSize: '12px', color: '#999', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5).setDepth(20)

    // Botão menu
    this.menuBtn = this.add.text(sideX, height - 40, '← Menu', {
      fontSize: '14px', color: '#FFD700', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true })
    this.menuBtn.on('pointerdown', () => { this.cleanUp(); this.scene.start('MenuScene') })

    // Eventos
    this.events.on('diceClicked', this.onDiceClicked, this)
    this.events.on('pieceClicked', this.onPieceClicked, this)

    this.rules = new RulesEngine(this.players)
    this.ai    = new AIStrategy()

    this.startTurn()
  }

  private startTurn() {
    // Pular jogadores que terminaram
    let tries = 0
    while (this.players[this.curIdx].finished && tries < this.players.length) {
      this.curIdx = (this.curIdx + 1) % this.players.length
      tries++
    }

    const player = this.players[this.curIdx]
    const hexCol = '#' + PLAYER_COLORS[player.color].toString(16).padStart(6, '0')
    this.turnLabel.setText(`${COLOR_PT[player.color]}`).setColor(hexCol)
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

    // Jogador escolhe qual peça mover
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

    // Anima o movimento
    await move.piece.animateThrough(move.pathSteps)
    move.piece.piecePos = move.newPos
    move.piece.syncPosition()

    // Capturas
    for (const cap of move.captures) {
      await cap.animateCapture()
    }
    if (move.captures.length > 0) {
      this.infoLabel.setText(`Captura! Turno extra!`)
    }

    this.animating = false

    // Verificar vitória
    const player = this.players[this.curIdx]
    if (player.finished) {
      const rank = this.players.filter(p => p.rank > 0).length + 1
      player.rank = rank
      this.updateRankPanel()

      // Checar se todos terminaram
      const allDone = this.players.every(p => p.finished)
      if (allDone || rank === 1) {
        this.cleanUp()
        this.scene.start('WinScene', { winner: player.color })
        return
      }
    }

    if (move.extraTurn) {
      if (!move.captures.length) this.infoLabel.setText('Turno extra! 🎲')
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
