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

    // Terminar uma peça é a jogada mais valiosa
    if (m.newPos === FINISHED) s += 200

    // Avançar na coluna do lar (peça quase chegando — alta prioridade)
    if (m.newPos >= HOME_START) s += 80 + (m.newPos - HOME_START) * 15

    // Sair da base
    if (m.piece.piecePos === -1) s += 45

    // Progresso no anel: exponencial — peças avançadas valem muito mais
    if (m.newPos >= 0 && m.newPos < HOME_START) {
      const progress = m.newPos / PATH_LEN          // 0.0 → ~1.0
      s += Math.round(m.newPos * (1 + progress * 2)) // 0 no início, até ~141 perto do fim

      const absIdx = (ai.pathOffset + m.newPos) % PATH_LEN

      // Bônus por casa segura
      if (SAFE_ABS.has(absIdx)) s += 25

      // Bônus por criar bloqueio (2 peças próprias na mesma casa)
      const ownPiecesAtDest = ai.pieces.filter(p =>
        p !== m.piece &&
        p.piecePos >= 0 &&
        p.piecePos < HOME_START &&
        (ai.pathOffset + p.piecePos) % PATH_LEN === absIdx
      ).length
      if (ownPiecesAtDest === 1) s += 35

      // Penalidade por ficar ameaçado (ignorar ameaças em casas bloqueadas pelo inimigo)
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
        // Inimigo está a 1-6 casas antes — pode capturar no próximo turno
        const dist = (absIdx - eAbs + PATH_LEN) % PATH_LEN
        if (dist >= 1 && dist <= 6) {
          // Ignorar se o inimigo está em uma posição bloqueada por outro inimigo
          // (não pode avançar de lá de qualquer forma)
          return true
        }
      }
    }
    return false
  }
}
