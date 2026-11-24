export const path = (d, tone = 'outline') => `<path class="g-${tone}" d="${d}"/>`;
export const ellipse = (cx, cy, rx, ry, tone) => `<ellipse class="g-${tone}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
export const box = (x, y, w, h, tone, rx = 8) => `<rect class="g-${tone}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
export const line = (x1, y1, x2, y2, tone = 'outline') => path(`M${x1} ${y1}L${x2} ${y2}`, tone);
export const words = (x, y, label) => `<text class="g-word" x="${x}" y="${y}">${label}</text>`;
export const art = (...parts) => parts.join('');

export function figure(title, plane, source, takeaway, geometry, labels) {
  return { title, plane, source, takeaway, geometry, labels };
}

export const torso = () => art(
  path('M167 34q-10 23-38 27l-60 12Q46 91 53 126l20 80q10 22 37 25h199q27-3 37-25l20-80q7-35-16-53l-60-12q-28-4-38-27Z', 'skin'),
  path('M107 84q48-15 92 8m115-8q-48-15-92 8M118 134q39-14 78-6m106 6q-39-14-78-6M110 169q45-12 87-6m111 6q-45-12-87-6', 'faint'),
  path('M196 92h28l-3 85-11 13-11-13Z', 'bone'),
);

export const rib = (x, y) => path(`M${x} ${y}h108q18 0 18 14t-18 14H${x}q-16 0-16-14t16-14Z`, 'bone');

export const sinusTrace = 'M26 139h35q9 0 16-9t17 9h32l10 8 11-58 12 66 11-16h28q23-28 47 0h134';
