import Phaser from 'phaser'
import { Piece } from './Piece'
import { PlayerColor } from '../constants/Colors'
import { PATH_ENTRY, FINISHED } from '../constants/Board'

export class Player {
  readonly color: PlayerColor
  readonly isAI: boolean
  readonly pathOffset: number
  readonly pieces: Piece[]
  rank = 0   // posição de chegada (0 = ainda jogando)

  constructor(scene: Phaser.Scene, color: PlayerColor, isAI: boolean) {
    this.color      = color
    this.isAI       = isAI
    this.pathOffset = PATH_ENTRY[color]
    this.pieces     = [0, 1, 2, 3].map(i => new Piece(scene, color, i))
  }

  get finished(): boolean {
    return this.pieces.every(p => p.piecePos === FINISHED)
  }

  destroy() {
    this.pieces.forEach(p => p.destroy())
  }
}
