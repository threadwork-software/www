/**
 * Renders public/og.png, the social preview card.
 *
 * Why a script rather than a hand-made image: every string on the card is a
 * company fact, and this site's whole discipline is that a fact lives in
 * config.ts once (see PROVENANCE_FAQ, one array feeding both the visible Verify
 * block and the FAQPage structured data). An image with the founding year baked
 * into its pixels is a second copy of that fact which no edit to config.ts can
 * reach. Run this after changing anything it reads.
 *
 *   node scripts/generate-og.mjs
 *
 * Uses sharp, already a devDependency for Astro's own asset pipeline, so this
 * adds no packages. Output is committed: GitHub Pages runs `astro build` and
 * nothing else, so an uncommitted card would simply be absent (BUG-3).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// config.ts is TypeScript, and this script is plain node with no transpiler in
// front of it, so the values are read out of the source text rather than
// imported. Plain string scanning rather than a regex: the quoting rules here
// are simple, and a narrow reader that throws on a renamed export beats one that
// silently renders a card with a missing line.
const config = readFileSync(resolve(root, 'src/config.ts'), 'utf8');

function field(object, key) {
  const open = `export const ${object} = {`;
  const start = config.indexOf(open);
  if (start === -1) throw new Error(`Could not find "${open}" in src/config.ts.`);

  const end = config.indexOf('} as const;', start);
  if (end === -1) throw new Error(`"export const ${object}" is not closed with "} as const;".`);

  const block = config.slice(start + open.length, end);
  const marker = `${key}:`;
  const at = block.indexOf(marker);
  if (at === -1) throw new Error(`Could not find "${key}" on ${object} in src/config.ts.`);

  const quote = block.indexOf("'", at + marker.length);
  const close = block.indexOf("'", quote + 1);
  if (quote === -1 || close === -1) throw new Error(`"${key}" on ${object} is not a single-quoted string.`);

  return block.slice(quote + 1, close);
}

const name = field('SITE', 'name');
const productName = field('PRODUCT', 'name');
const title = field('METADATA', 'title');
const jurisdiction = field('ENTITY', 'jurisdiction');
const registryLabel = field('ENTITY', 'registryLabel');
const registryNumber = field('ENTITY', 'registryNumber');

// The card prints only text the site already publishes, so it makes no claim of
// its own: the wordmark, the tagline half of the existing <title>, and the
// hero's entity badge. Content authority for this site sits with Kyle, and
// restating published copy keeps a rendering task from becoming an editing one.
//
// BROAD READING of OQ-458 ruling 1: the chip carries the jurisdiction and the
// registry number, matching the hero badge, rather than the founding year. Same
// change, same reason, in the one place a reader sees before they reach the page.
const tagline = title.includes(':') ? title.slice(title.indexOf(':') + 1).trim() : title;
const entity = `${jurisdiction} · ${registryLabel} ${registryNumber}`;
const product = `We build and operate ${productName}`;

// Brand tokens, mirroring src/assets/styles/tailwind.css. Duplicated rather than
// parsed because a handful of hex values in a documented block is easier to keep
// honest than a CSS parser inside a build script.
const BRAND = '#1d4ed8';
const BRAND_SOFT = '#dbeafe';
const SLATE_900 = '#0f172a';
const SLATE_600 = '#475569';

// Rendered by librsvg inside sharp, which resolves fonts through the host's
// fontconfig and has no access to the @fontsource Inter in node_modules. The
// stack degrades to Segoe UI and then Arial, both close enough in feel that the
// card stays on-brand on a machine without Inter installed.
const FONT = "'Inter Variable', Inter, 'Segoe UI', Arial, sans-serif";

// 1200x630 is the size Open Graph consumers crop to (1.91:1) and the size
// Twitter's summary_large_image expects. Layout.astro requests both.
const WIDTH = 1200;
const HEIGHT = 630;

const MARGIN = 80;
const CONTENT_WIDTH = WIDTH - MARGIN * 2;

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Actual rendered width of a string, in pixels.
 *
 * Measured rather than estimated from a characters-times-ratio guess. The first
 * version of this card guessed, and the tagline ran off the right edge of the
 * image: SVG <text> does not wrap or shrink, it just overflows, and the overflow
 * is invisible until you look at the PNG. Rendering the string alone and reading
 * the ink extent asks the same font engine that draws the final card, so the
 * answer cannot disagree with the output.
 */
async function inkWidth(text, size, weight) {
  // The white rect is load-bearing. An SVG with no background rasterizes to
  // transparent pixels, trim against white then matches nothing, and every
  // measurement comes back as the full probe width: silently "too wide", which
  // shrinks the headline to nothing rather than erroring.
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH * 4}" height="${Math.ceil(size * 3)}">
    <rect width="100%" height="100%" fill="#ffffff" />
    <text x="20" y="${size * 1.5}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="#000000">${escapeXml(text)}</text>
  </svg>`;

  const { info } = await sharp(Buffer.from(probe))
    .png()
    .trim({ background: '#ffffff' })
    .toBuffer({ resolveWithObject: true });

  return info.width;
}

/**
 * Greedy word wrap at a measured width, then shrink to fit if the longest line
 * still overflows. Returns the lines and the size they were laid out at, so the
 * caller can position a block whose height it did not choose.
 */
async function fitLines(text, size, weight, maxLines) {
  const words = text.split(' ');
  let lines = [];

  for (const word of words) {
    const candidate = lines.length === 0 ? word : `${lines[lines.length - 1]} ${word}`;
    if (lines.length > 0 && (await inkWidth(candidate, size, weight)) <= CONTENT_WIDTH) {
      lines[lines.length - 1] = candidate;
    } else {
      lines.push(word);
    }
  }

  // More lines than the layout has room for: fall back to filling exactly
  // maxLines and letting the shrink below make them fit.
  if (lines.length > maxLines) {
    const perLine = Math.ceil(words.length / maxLines);
    lines = [];
    for (let i = 0; i < words.length; i += perLine) lines.push(words.slice(i, i + perLine).join(' '));
  }

  const widest = Math.max(...(await Promise.all(lines.map((line) => inkWidth(line, size, weight)))));
  const scaled = widest > CONTENT_WIDTH ? Math.floor((size * CONTENT_WIDTH) / widest) : size;

  return { lines, size: scaled };
}

const headline = await fitLines(tagline, 70, 700, 2);
const LINE_HEIGHT = 1.16;

// The block grows downward from a fixed first baseline, so a one-line headline
// and a two-line headline both sit under the wordmark rather than floating.
const headlineTop = 300;
const headlineBottom = headlineTop + (headline.lines.length - 1) * headline.size * LINE_HEIGHT;
const productBaseline = headlineBottom + 78;
const chipTop = productBaseline + 38;

const headlineSvg = headline.lines
  .map(
    (line, i) =>
      `<text x="${MARGIN}" y="${headlineTop + i * headline.size * LINE_HEIGHT}" font-family="${FONT}" font-size="${headline.size}" font-weight="700" fill="${SLATE_900}">${escapeXml(line)}</text>`
  )
  .join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND_SOFT}" stop-opacity="0.85" />
      <stop offset="55%" stop-color="#ffffff" stop-opacity="1" />
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash)" />

  <!-- The mark from public/favicon.svg, scaled up: rounded square, bar and stem. -->
  <g transform="translate(${MARGIN}, 74)">
    <rect width="96" height="96" rx="21" fill="${BRAND}" />
    <path d="M24 33h48M48 33v39" stroke="#ffffff" stroke-width="10.5" stroke-linecap="round" />
  </g>
  <text x="200" y="140" font-family="${FONT}" font-size="44" font-weight="700" fill="${SLATE_900}">${escapeXml(name)}</text>

  ${headlineSvg}

  <text x="${MARGIN}" y="${productBaseline}" font-family="${FONT}" font-size="34" font-weight="400" fill="${SLATE_600}">${escapeXml(product)}</text>

  <!-- The one fact a diligence reader is here to check, in the accent color. -->
  <g transform="translate(${MARGIN}, ${chipTop})">
    <rect width="5" height="46" rx="2.5" fill="${BRAND}" />
    <text x="26" y="33" font-family="${FONT}" font-size="30" font-weight="600" fill="${BRAND}">${escapeXml(entity)}</text>
  </g>

  <rect y="${HEIGHT - 12}" width="${WIDTH}" height="12" fill="${BRAND}" />
</svg>
`;

const out = resolve(root, 'public/og.png');
const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(out, png);

const { width, height } = await sharp(png).metadata();

// No line of text may cross the right margin. Checked per string at its final
// size, not by trimming the finished card: the card is deliberately full-bleed,
// so its ink reaches 1200px whatever the text does, and a whole-image check
// passes and fails for reasons that have nothing to do with the copy.
//
// The overflow this guards against is silent. The PNG still writes, at the right
// dimensions, with a sentence running off the edge of it.
const placed = [
  ['wordmark', name, 44, 700, 200],
  ...headline.lines.map((line, i) => [`headline line ${i + 1}`, line, headline.size, 700, MARGIN]),
  ['product line', product, 34, 400, MARGIN],
  ['entity line', entity, 30, 600, MARGIN + 26],
];

let widestEdge = 0;
for (const [label, text, size, weight, left] of placed) {
  const right = left + (await inkWidth(text, size, weight));
  widestEdge = Math.max(widestEdge, right);
  if (right > WIDTH - MARGIN) {
    throw new Error(
      `The ${label} reaches ${right}px, past the ${WIDTH - MARGIN}px margin. Shorten the copy or lower its font size.`
    );
  }
}

console.log(`Wrote public/og.png (${width}x${height}, ${(png.length / 1024).toFixed(1)} KB)`);
console.log(
  `Headline: ${headline.lines.length} line(s) at ${headline.size}px. Widest text edge ${widestEdge}px of ${WIDTH - MARGIN}px allowed.`
);
