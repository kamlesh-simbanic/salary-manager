/** Money is stored as integer minor units (e.g. cents) to avoid float errors. */
export function toMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

/** Converts a minor-unit amount in a local currency into USD minor units. */
export function toUsdMinor(minor: number, usdPerUnit: number): number {
  return Math.round(minor * usdPerUnit);
}
