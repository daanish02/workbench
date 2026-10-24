// Grid lines behind a chart: faint major lines at round values and fainter minor lines between them, the way graph
// paper looks. A log axis gets a major line at each power of ten and minor lines at 2 to 9 times it.
// Returns SVG markup to place BEFORE the data, so the data draws on top. Style: .grid-major and .grid-minor in global.css.
//
//   svg.innerHTML = chartGrid({ box: { x0: 30, y0: 40, x1: 350, y1: 190 }, y: { min: 0, max: 2.2 } }) + data;
//
// `box` is the plot area in the SVG's own units; each axis gives the data range that spans it. Leave an axis out for
// no lines in that direction (a bar chart has no grid on its category axis). Tick numbers are not drawn.
export interface Axis {
  min: number;
  max: number;
  /** a log10 axis: min and max must be above zero */
  log?: boolean;
  /** draw minor lines too (default true) */
  minor?: boolean;
}
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A step of 1, 2 or 5 times a power of ten that gives about `target` intervals over the range. */
function niceStep(range: number, target = 5) {
  const raw = range / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

interface Ticks {
  major: number[];
  minor: number[];
}

function linearTicks(min: number, max: number): Ticks {
  const step = niceStep(max - min);
  const lead = Math.round(step / 10 ** Math.floor(Math.log10(step)));
  // minor lines: fifths of a 1 or 5 step, quarters of a 2 step
  const fine = lead === 2 ? step / 4 : step / 5;
  const major: number[] = [];
  const minor: number[] = [];
  for (let i = Math.ceil(min / fine - 1e-9); i <= Math.floor(max / fine + 1e-9); i++) {
    const v = i * fine;
    (Math.abs(v / step - Math.round(v / step)) < 1e-6 ? major : minor).push(v);
  }
  return { major, minor };
}

function logTicks(min: number, max: number): Ticks {
  const lo = Math.floor(Math.log10(min) + 1e-9);
  const hi = Math.ceil(Math.log10(max) - 1e-9);
  const span = hi - lo;
  // over a very wide range, every decade is a minor line and only every few decades is a major one
  const every = span <= 8 ? 1 : span <= 20 ? 4 : 5;
  const major: number[] = [];
  const minor: number[] = [];
  for (let k = lo; k <= hi; k++) {
    (k % every === 0 ? major : minor).push(10 ** k);
    if (span <= 6) for (let m = 2; m <= 9; m++) minor.push(m * 10 ** k);
  }
  // inside less than a decade there is no power of ten: use 1, 2 and 5 times it as the major lines
  if (!major.some((v) => v >= min && v <= max)) {
    const promoted = minor.filter((v) => [1, 2, 5].includes(Math.round(v / 10 ** Math.floor(Math.log10(v)))));
    return { major: promoted, minor: minor.filter((v) => !promoted.includes(v)) };
  }
  return { major, minor };
}

/** where a value falls along an axis, 0 at min and 1 at max */
const along = (a: Axis, v: number) => (a.log ? (Math.log10(v) - Math.log10(a.min)) / (Math.log10(a.max) - Math.log10(a.min)) : (v - a.min) / (a.max - a.min));

function lines(a: Axis, from: number, to: number, line: (pos: number, cls: string) => string, flip: boolean) {
  if (!(a.max > a.min) || (a.log && a.min <= 0)) return '';
  const { major, minor } = a.log ? logTicks(a.min, a.max) : linearTicks(a.min, a.max);
  const draw = (values: number[], cls: string) =>
    values
      .map((v) => along(a, v))
      // the plot's own edges carry the axis lines, so a grid line there would only double them
      .filter((f) => f > 0.004 && f < 0.996)
      .map((f) => line(flip ? to - f * (to - from) : from + f * (to - from), cls))
      .join('');
  return (a.minor === false ? '' : draw(minor, 'grid-minor')) + draw(major, 'grid-major');
}

export function chartGrid({ box, x, y }: { box: Box; x?: Axis; y?: Axis }): string {
  const n = (v: number) => v.toFixed(1);
  const vertical = x ? lines(x, box.x0, box.x1, (p, c) => `<line class="${c}" x1="${n(p)}" x2="${n(p)}" y1="${n(box.y0)}" y2="${n(box.y1)}" vector-effect="non-scaling-stroke"/>`, false) : '';
  // y grows upward in a chart but downward in SVG, so the vertical axis is flipped
  const horizontal = y ? lines(y, box.y0, box.y1, (p, c) => `<line class="${c}" x1="${n(box.x0)}" x2="${n(box.x1)}" y1="${n(p)}" y2="${n(p)}" vector-effect="non-scaling-stroke"/>`, true) : '';
  return `<g class="chart-grid" aria-hidden="true">${vertical}${horizontal}</g>`;
}
