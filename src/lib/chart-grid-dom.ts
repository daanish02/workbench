// Grid for any figure chart, declared on its <svg> instead of drawn by each figure:
//
//   <svg viewBox="0 0 400 200" data-grid='{"box":[30,10,390,170],"x":[0,1],"y":[0,100]}'>
//
// `box` is the plot area [x0, y0, x1, y1] in the SVG's units; `x` and `y` give the data range [min, max] across it
// (a third item: "log" for a log10 axis, "major" for no minor lines; leave an axis out for no lines in that direction). The grid goes
// behind everything else in the SVG. A figure whose scale changes sets `svg.dataset.grid = JSON.stringify(spec)` and
// the grid redraws. Lines come from chart-grid.ts.
import { chartGrid, type Axis } from './chart-grid';

type Range = [number, number] | [number, number, 'log' | 'major'];
interface Spec {
  box: [number, number, number, number];
  x?: Range;
  y?: Range;
}

const axis = (r?: Range): Axis | undefined => (r ? { min: r[0], max: r[1], log: r[2] === 'log', minor: r[2] !== 'major' } : undefined);

function render(svg: SVGSVGElement) {
  let host = svg.querySelector<SVGGElement>(':scope > g.chart-grid-host');
  if (!host) {
    host = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    host.setAttribute('class', 'chart-grid-host');
    svg.prepend(host);
  }
  try {
    const s: Spec = JSON.parse(svg.dataset.grid ?? '');
    const [x0, y0, x1, y1] = s.box;
    host.innerHTML = chartGrid({ box: { x0, y0, x1, y1 }, x: axis(s.x), y: axis(s.y) });
  } catch {
    host.innerHTML = '';
  }
}

document.querySelectorAll<SVGSVGElement>('svg[data-grid]').forEach(render);
new MutationObserver((list) => {
  for (const m of list) if (m.target instanceof SVGSVGElement) render(m.target);
}).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-grid'] });
// a figure that rewrites its SVG's innerHTML wipes the grid; put it back (the check stops this looping)
new MutationObserver((list) => {
  for (const m of list) {
    const svg = m.target;
    if (svg instanceof SVGSVGElement && svg.dataset.grid && !svg.querySelector(':scope > g.chart-grid-host')) render(svg);
  }
}).observe(document.body, { subtree: true, childList: true });
