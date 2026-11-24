/**
 * Single-series charts use one categorical hue (slot 1 of the reference palette).
 * Text uses MUI text tokens, never the series colour; gridlines are hairline and recessive.
 */
export const BAR_COLOR = '#2a78d6'
export const GRID_COLOR = '#e6e5e1'
export const AXIS_TEXT = '#52514e'
export const HOVER_BAND = 'rgba(42, 120, 214, 0.08)'

export const AXIS_PROPS = {
  tick: { fill: AXIS_TEXT, fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const
