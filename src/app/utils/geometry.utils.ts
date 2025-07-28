export function rectangleDimensions(diagonalCm: number, widthPx: number, heightPx: number) {
  const ratio = widthPx / heightPx;
  const heightCm = diagonalCm / Math.sqrt(ratio ** 2 + 1);
  const widthCm = heightCm * ratio;
  return { widthCm, heightCm };
}
