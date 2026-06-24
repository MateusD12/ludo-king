export type PlayerColor = 'GREEN' | 'YELLOW' | 'BLUE' | 'RED'

export const COLOR_PT: Record<PlayerColor, string> = {
  GREEN: 'Verde', YELLOW: 'Amarelo', BLUE: 'Azul', RED: 'Vermelho',
}

export const PLAYER_COLORS: Record<PlayerColor, number> = {
  GREEN:  0x318C41,
  YELLOW: 0xE8BA28,
  BLUE:   0x2E64A5,
  RED:    0xCD3831,
}

export const HOME_FILL: Record<PlayerColor, number> = {
  GREEN:  0x318C41,
  YELLOW: 0xE8BA28,
  BLUE:   0x2E64A5,
  RED:    0xCD3831,
}

export const C = {
  BOARD_BG:  0xFDF1D6,
  PATH_BG:   0xFDF1D6,
  GRID_LINE: 0x5C4033,
  SAFE_STAR: 0x5C4033,
  CENTER_BG: 0x5C4033,
  WHITE:     0xFFFFFF,
  BLACK:     0x000000,
  UI_BG:     0x1A1412,
  UI_PANEL:  0x2E221E,
  UI_TEXT:   0xFDF1D6,
}
