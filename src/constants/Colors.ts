export type PlayerColor = 'GREEN' | 'YELLOW' | 'BLUE' | 'RED'

export const PLAYER_COLORS: Record<PlayerColor, number> = {
  GREEN:  0x4CAF50,
  YELLOW: 0xFFC107,
  BLUE:   0x2196F3,
  RED:    0xF44336,
}

export const HOME_FILL: Record<PlayerColor, number> = {
  GREEN:  0xA5D6A7,
  YELLOW: 0xFFF9C4,
  BLUE:   0xBBDEFB,
  RED:    0xFFCDD2,
}

export const C = {
  BOARD_BG:  0x795548,
  PATH_BG:   0xFFFDE7,
  GRID_LINE: 0xCCBB99,
  SAFE_STAR: 0xFFD700,
  CENTER_BG: 0x212121,
  WHITE:     0xFFFFFF,
  BLACK:     0x000000,
  UI_BG:     0x1a0a00,
  UI_PANEL:  0x2d1a0a,
  UI_TEXT:   0xFFFFFF,
}
