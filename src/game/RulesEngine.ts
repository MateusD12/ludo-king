import { Piece } from './Piece'
import { Player } from './Player'
import {
  MAIN_PATH, SAFE_ABS, HOME_COL, HOME_START, FINISHED, PATH_LEN, PATH_ENTRY
} from '../constants/Board'

export interface MoveResult {
  piece:         Piece
  newPos:        number
  pathSteps:     number[]   // sequência de piecePos para animar
  captures:      Piece[]
  extraTurn:     boolean
}

export class RulesEngine {
  constructor(private players: Player[]) {}

  // Retorna se uma peça pode mover dado um valor de dado
  canMove(piece: Piece, player: Player, dice: number): boolean {
    if (piece.piecePos === FINISHED) return false

    // Na base: precisa de 6
    if (piece.piecePos === -1) return dice === 6

    // Na coluna do lar: não pode sobretiro
    if (piece.piecePos >= HOME_START) {
      const homeIdx = piece.piecePos - HOME_START
      const newHomeIdx = homeIdx + dice
      return newHomeIdx <= HOME_COL[player.color].length   // 0-4 = casas, 5 = FINISHED exato
    }

    // No anel externo: verificar se pode entrar na coluna sem sobretiro e se destino não está bloqueado
    const relPos = piece.piecePos
    const distToEntry = PATH_LEN - relPos  // quantos passos até a entrada da coluna
    if (dice >= distToEntry) {
      const homeSteps = dice - distToEntry
      return homeSteps <= HOME_COL[player.color].length  // no máximo 5 passos dentro
    }

    const destAbs = (player.pathOffset + relPos + dice) % PATH_LEN
    if (this.isBlocked(destAbs, player)) return false

    return true
  }

  // Calcula o resultado completo de um movimento
  calculateMove(piece: Piece, player: Player, dice: number): MoveResult | null {
    if (!this.canMove(piece, player, dice)) return null

    const pathSteps: number[] = []
    let newPos: number

    if (piece.piecePos === -1) {
      // Sair da base → casa 0 (entrada do jogador)
      newPos = 0
      pathSteps.push(0)
    } else if (piece.piecePos >= HOME_START) {
      // Mover dentro da coluna do lar
      const homeIdx = piece.piecePos - HOME_START
      const newHomeIdx = homeIdx + dice
      if (newHomeIdx === HOME_COL[player.color].length) {
        newPos = FINISHED
        for (let i = homeIdx + 1; i <= HOME_COL[player.color].length; i++)
          pathSteps.push(i < HOME_COL[player.color].length ? HOME_START + i : FINISHED)
      } else {
        newPos = HOME_START + newHomeIdx
        for (let i = homeIdx + 1; i <= newHomeIdx; i++) pathSteps.push(HOME_START + i)
      }
    } else {
      // Anel externo
      const relPos = piece.piecePos
      const distToEntry = PATH_LEN - relPos

      if (dice >= distToEntry) {
        // Entra na coluna do lar
        for (let s = relPos + 1; s < PATH_LEN; s++) pathSteps.push(s)
        const homeSteps = dice - distToEntry
        if (homeSteps === 0) {
          // Parou exatamente na entrada — fica como HOME_START + 0 seria antes da primeira
          // Na realidade, entra na 1ª casa da coluna
          newPos = HOME_START
          pathSteps.push(HOME_START)
        } else if (homeSteps === HOME_COL[player.color].length) {
          newPos = FINISHED
          for (let h = 0; h < homeSteps; h++) pathSteps.push(HOME_START + h)
          pathSteps.push(FINISHED)
        } else {
          newPos = HOME_START + homeSteps - 1
          for (let h = 0; h < homeSteps; h++) pathSteps.push(HOME_START + h)
        }
      } else {
        newPos = relPos + dice
        for (let s = relPos + 1; s <= newPos; s++) pathSteps.push(s)
      }
    }

    const captures = this.findCaptures(piece, player, newPos)
    const extraTurn = dice === 6 || captures.length > 0

    return { piece, newPos, pathSteps, captures, extraTurn }
  }

  private findCaptures(movingPiece: Piece, movingPlayer: Player, newPos: number): Piece[] {
    // Sem captura dentro da coluna do lar ou quando termina
    if (newPos >= HOME_START || newPos === FINISHED || newPos === -1) return []

    // Posição absoluta no tabuleiro após o movimento
    const absIdx = (movingPlayer.pathOffset + newPos) % PATH_LEN

    // Casa segura → sem captura
    if (SAFE_ABS.has(absIdx)) return []

    const captured: Piece[] = []
    for (const other of this.players) {
      if (other === movingPlayer) continue
      for (const p of other.pieces) {
        if (p.piecePos < 0 || p.piecePos >= HOME_START) continue
        const otherAbs = (other.pathOffset + p.piecePos) % PATH_LEN
        if (otherAbs === absIdx) captured.push(p)
      }
    }
    return captured
  }

  getValidMoves(player: Player, dice: number): MoveResult[] {
    return player.pieces
      .map(p => this.calculateMove(p, player, dice))
      .filter((m): m is MoveResult => m !== null)
  }

  isBlocked(absIdx: number, movingPlayer: Player): boolean {
    // Casa bloqueada para movingPlayer = 2+ peças de um jogador INIMIGO nessa posição
    for (const other of this.players) {
      if (other === movingPlayer) continue
      const count = other.pieces.filter(p => {
        if (p.piecePos < 0 || p.piecePos >= HOME_START) return false
        return (other.pathOffset + p.piecePos) % PATH_LEN === absIdx
      }).length
      if (count >= 2) return true
    }
    return false
  }
}
