export function pct(n) {
  return `${Math.round(n)}%`;
}

export function avg(arr, key) {
  return arr.length ? arr.reduce((s, m) => s + (m[key] || 0), 0) / arr.length : 0;
}

export function corr(data, xKey, yKey) {
  if (data.length < 2) return null;

  const xs = data.map((d) => d[xKey]);
  const ys = data.map((d) => d[yKey]);

  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;

  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(
    xs.reduce((s, x) => s + (x - mx) ** 2, 0) *
      ys.reduce((s, y) => s + (y - my) ** 2, 0)
  );

  return den ? num / den : null;
}
