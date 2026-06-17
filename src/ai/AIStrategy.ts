import { MoveResult } from '../game/RulesEngine'
import { Player } from '../game/Player'
import { SAFE_ABS, HOME_START, PATH_LEN, FINISHED } from '../constants/Board'

export class AIStrategy {
  selectMove(moves: MoveResult[], aiPlayer: Player, allPlayers: Player[]): MoveResult | null {
    if (moves.length === 0) return null
    if (moves.length === 1) return moves[0]

    const scored = moves.map(m => ({ m, score: this.score(m, aiPlayer, allPlayers) }))
    scored.sort((a, b) => b.score - a.score)
    return scored[0].m
  }

  private score(m: MoveResult, ai: Player, all: Player[]): number {
    let s = 0

    // Capturas são prioridade máxima
    s += m.captures.length * 100

    // Sair da base
    if (m.piece.piecePos === -1) s += 45

    // Terminar
    if (m.newPos === FINISHED) s += 200

    // Entrar/avançar na coluna do lar
    if (m.newPos >= HOME_START) s += 80 + (m.newPos - HOME_START) * 5

    // Progresso no anel
    if (m.newPos >= 0 && m.newPos < HOME_START) {
      s += m.newPos  // mais avançado = melhor

      const absIdx = (ai.pathOffset + m.newPos) % PATH_LEN

      // Bônus por casa segura
      if (SAFE_ABS.has(absIdx)) s += 25

      // Penalidade por ficar ameaçado
      if (!SAFE_ABS.has(absIdx) && this.isThreatened(absIdx, ai, all)) s -= 35
    }

    return s
  }

  private isThreatened(absIdx: number, ai: Player, all: Player[]): boolean {
    for (const enemy of all) {
      if (enemy === ai || enemy.finished) continue
      for (const p of enemy.pieces) {
        if (p.piecePos < 0 || p.piecePos >= HOME_START) continue
        const eAbs = (enemy.pathOffset + p.piecePos) % PATH_LEN
        // Inimigo está a 1-6 casas antes de absIdx (pode capturar no próximo turno)
        const dist = (absIdx - eAbs + PATH_LEN) % PATH_LEN
        if (dist >= 1 && dist <= 6) return true
      }
    }
    return false
  }
}
