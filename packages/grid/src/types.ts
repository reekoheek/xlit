export interface Dimension {
  readonly w: number,
  readonly h: number,
}

export interface Point {
  readonly x: number,
  readonly y: number,
}

export type Rect = Dimension & Point;
