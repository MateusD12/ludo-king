import { Piece } from './Piece';
import { PATH_ENTRY } from '../constants/Board';
export class Player {
    constructor(scene, color, isAI) {
        this.rank = 0; // posição de chegada (0 = ainda jogando)
        this.color = color;
        this.isAI = isAI;
        this.pathOffset = PATH_ENTRY[color];
        this.pieces = [0, 1, 2, 3].map(i => new Piece(scene, color, i));
    }
    get finished() {
        return this.pieces.every(p => p.piecePos === 57);
    }
    destroy() {
        this.pieces.forEach(p => p.destroy());
    }
}
