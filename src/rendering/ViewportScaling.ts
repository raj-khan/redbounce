/**
 * Pure canvas sizing math (spec section 9): logical 320x180 viewport scaled
 * to fit a container while preserving the aspect ratio (letterboxing).
 */
export type CanvasSize = { cssWidth: number; cssHeight: number };

export const LOGICAL_ASPECT = 16 / 9;

/** Compute the CSS size of the canvas for a given container size. */
export function computeCanvasSize(containerWidth: number, containerHeight: number): CanvasSize {
  const width = Math.min(containerWidth, containerHeight * LOGICAL_ASPECT);
  // Fractional CSS pixels are fine and keep the aspect exact.
  return { cssWidth: width, cssHeight: width / LOGICAL_ASPECT };
}

/** Backing-store size for crisp rendering on high-DPI displays. */
export function computeBackingSize(cssWidth: number, devicePixelRatio: number): CanvasSize {
  const dpr = Math.min(Math.max(devicePixelRatio, 1), 3);
  return {
    cssWidth: Math.round(cssWidth * dpr),
    cssHeight: Math.round((cssWidth * dpr) / LOGICAL_ASPECT),
  };
}
