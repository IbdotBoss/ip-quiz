// Solvers (S) and question generators (GENS) for the Image Processing practice site.
// Pure data in and out, so node can test it. The page draws what these return.

const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[ri(0, a.length - 1)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rmat = (M, N, lo = 0, hi = 255) => Array.from({ length: M }, () => Array.from({ length: N }, () => ri(lo, hi)));
const sum = a => a.reduce((x, y) => x + y, 0);
const rnd = x => Math.floor(x + 0.5);            // "round .5 upwards"
const clip = x => Math.max(0, Math.min(255, x));
const dp2 = x => Math.round(x * 100) / 100;
const map2 = (m, f) => m.map((r, i) => r.map((v, j) => f(v, i, j)));
const mt = m => "[" + m.map(r => r.join(" ")).join("; ") + "]";
const big = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const S = {
  // week 1
  bytesBinary: (M, N) => Math.ceil(M * N / 8),
  bytesIndexed: (M, N, C) => M * N + 3 * C,
  minBits: v => { let t = 0; while (2 ** t < v) t++; return t; },
  // week 2
  city: (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]),
  chess: (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])),
  euclid: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
  mean: L => sum(L.flat()) / L.flat().length,
  harmonic: L => L.flat().length / sum(L.flat().map(v => 1 / v)),
  geometric: L => Math.exp(sum(L.flat().map(Math.log)) / L.flat().length),
  range: L => Math.max(...L.flat()) - Math.min(...L.flat()),
  michelson: L => { const f = L.flat(), a = Math.max(...f), b = Math.min(...f); return (a - b) / (a + b); },
  rms: L => { const f = L.flat(), m = sum(f) / f.length; return Math.sqrt(sum(f.map(v => (v - m) ** 2)) / f.length); },
  // week 3
  lightness: ([r, g, b]) => rnd((Math.max(r, g, b) + Math.min(r, g, b)) / 2),
  average: ([r, g, b]) => rnd((r + g + b) / 3),
  luminosity: ([r, g, b]) => rnd(0.21 * r + 0.72 * g + 0.07 * b),
  hist: (L, levels) => { const h = Array(levels).fill(0); L.flat().forEach(v => h[v]++); return h; },
  cumul: h => { let c = 0; return h.map(v => (c += v)); },
  // week 4
  levels: L => [...new Set(L.flat())].sort((a, b) => a - b),
  stretch: (v, lo, hi, t = 255) => rnd((v - lo) * t / (hi - lo)),
  percentile: (L, p) => { const s = L.flat().sort((a, b) => a - b); let k = rnd(p * (s.length + 1)); k = Math.max(1, Math.min(s.length, k)); return s[k - 1]; },
  equalise: (L, t = 255) => {
    const f = L.flat(), lv = S.levels(L), out = {}; let c = 0; const cum = {};
    lv.forEach(v => { c += f.filter(x => x === v).length; cum[v] = c; });
    const h0 = cum[lv[0]];
    lv.forEach(v => { out[v] = rnd((cum[v] - h0) / (f.length - h0) * t); });
    return out;
  },
  // week 5
  N4: [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]],
  at: (A, i, j) => (i < 0 || j < 0 || i >= A.length || j >= A[0].length) ? 0 : A[i][j],
  dilate: (A, se = S.N4) => map2(A, (v, i, j) => se.some(([a, b]) => S.at(A, i + a, j + b)) ? 1 : 0),
  erode: (A, se = S.N4) => map2(A, (v, i, j) => se.every(([a, b]) => S.at(A, i + a, j + b)) ? 1 : 0),
  open: A => S.dilate(S.erode(A)),
  close: A => S.erode(S.dilate(A)),
  gradient: A => { const d = S.dilate(A), e = S.erode(A); return map2(d, (v, i, j) => v - e[i][j]); },
  hitmiss: (A, se) => map2(A, (v, i, j) => se.every((row, a) => row.every((want, b) => want === null || S.at(A, i + a - 1, j + b - 1) === want)) ? 1 : 0),
  CORNERS: {
    TL: [[0, 0, null], [0, 1, 1], [null, 1, null]], TR: [[null, 0, 0], [1, 1, 0], [null, 1, null]],
    BL: [[null, 1, null], [0, 1, 1], [0, 0, null]], BR: [[null, 1, null], [1, 1, 0], [null, 0, 0]],
  },
  corners: A => { const o = Object.values(S.CORNERS).map(se => S.hitmiss(A, se)); return map2(A, (v, i, j) => o.some(m => m[i][j]) ? 1 : 0); },
  // week 6
  flipLR: L => L.map(r => r.slice().reverse()),
  flipUD: L => L.slice().reverse().map(r => r.slice()),
  rot180: L => S.flipUD(S.flipLR(L)),
  transpose: L => L[0].map((_, j) => L.map(r => r[j])),
  rotP90: L => S.flipLR(S.transpose(L)),          // clockwise in (i,j) coordinates
  rotM90: L => S.flipUD(S.transpose(L)),
  antiT: L => S.rot180(S.transpose(L)),
  bilinear: (c, M, N, i, j) => (c[0][0] * (M - i) * (N - j) + c[0][1] * (M - i) * j + c[1][0] * i * (N - j) + c[1][1] * i * j) / (M * N),
  // weeks 8 and 9
  flip180: k => k.slice().reverse().map(r => r.slice().reverse()),
  corrAt: (L, k, i, j) => { const n = k.length, h = (n - 1) / 2; let s = 0; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) s += k[a][b] * L[i - 1 - h + a][j - 1 - h + b]; return s; },
  convAt: (L, k, i, j) => S.corrAt(L, S.flip180(k), i, j),
  validCorr: (L, k) => { const n = k.length, h = (n - 1) / 2, o = []; for (let i = h + 1; i <= L.length - h; i++) { const r = []; for (let j = h + 1; j <= L[0].length - h; j++) r.push(S.corrAt(L, k, i, j)); o.push(r); } return o; },
  validConv: (L, k) => S.validCorr(L, S.flip180(k)),
  maxOut: k => 255 * sum(k.flat().filter(v => v > 0)),
  RING: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0]],
  kirschBank: () => Array.from({ length: 8 }, (_, z) => { const k = [[-3, -3, -3], [-3, 0, -3], [-3, -3, -3]]; for (let d = 0; d < 3; d++) { const [a, b] = S.RING[(z + d) % 8]; k[a][b] = 5; } return k; }),
  kirsch: L => Math.max(...S.kirschBank().map(k => S.corrAt(L, k, 2, 2))),
  K: {
    mean3: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]],
    gauss: [[1 / 16, 1 / 8, 1 / 16], [1 / 8, 1 / 4, 1 / 8], [1 / 16, 1 / 8, 1 / 16]],
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    emboss: [[1, 0, 0], [0, 0, 0], [0, 0, -1]],
    lap4: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]],
    lap8: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    prewittX: [[1, 0, -1], [1, 0, -1], [1, 0, -1]], prewittY: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]],
    sobelX: [[1, 0, -1], [2, 0, -2], [1, 0, -1]], sobelY: [[1, 2, 1], [0, 0, 0], [-1, -2, -1]],
    robX: [[1, 0], [0, -1]], robY: [[0, 1], [-1, 0]],
  },
  usm: L => 2 * L[1][1] - S.mean(L),
  mse: (L, t) => sum(L.flat().map((v, n) => (v - t.flat()[n]) ** 2)) / L.flat().length,
};

/* ---------- small pictures, returned as data ---------- */
// A test scene: a ramp, a bright disc and a dark bar. Values 0..255.
const scene = (n = 44) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
  let v = 70 + 90 * j / n + 30 * i / n;
  if ((i - n * 0.38) ** 2 + (j - n * 0.36) ** 2 < (n * 0.2) ** 2) v = 225;
  if (i > n * 0.66 && i < n * 0.84 && j > n * 0.3 && j < n * 0.86) v = 40;
  return Math.round(v);
}));
// An asymmetric glyph so that all eight orientations look different.
const GLYPH = ["0000000", "0111110", "0100000", "0100000", "0111100", "0100000", "0100000", "0100010", "0000000"]
  .map((r, i) => [...r].map((c, j) => c === "1" ? 235 : 60 + 6 * i + 4 * j));
const histSvg = (L) => {
  const h = Array(32).fill(0); L.flat().forEach(v => h[Math.min(31, v >> 3)]++);
  const mx = Math.max(...h);
  return `<svg viewBox="0 0 132 70" width="132" height="70" role="img" aria-label="histogram"><rect x="1" y="1" width="130" height="68" fill="none" stroke="currentColor"/>` +
    h.map((v, x) => `<rect x="${2 + x * 4}" y="${68 - 64 * v / mx}" width="3.4" height="${64 * v / mx}" fill="currentColor"/>`).join("") + `</svg>`;
};
// Kernel drawn as bars standing on a tilted grid. Bars below the grid are negative.
const surfSvg = k => {
  const n = k.length, m = k[0].length, dx = 22, dy = 11, cx = 80, cy = 46, mx = Math.max(...k.flat().map(Math.abs)) || 1, bars = [];
  for (let s = 0; s <= n + m - 2; s++) for (let r = 0; r < n; r++) { const c = s - r; if (c < 0 || c >= m) continue;
    const x = cx + (c - r) * dx, y = cy + (c + r) * dy, h = k[r][c] / mx * 34;
    const top = h > 0 ? y - h : y, p = (px, py) => `${px.toFixed(1)},${py.toFixed(1)}`;
    const face = (pts, f) => `<polygon points="${pts}" fill="${f}" stroke="#17171c" stroke-width=".8"/>`;
    let g = "";
    if (Math.abs(h) > 0.5) {   // positive bars stand on the floor, negative bars hang below it
      const y0 = top, y1 = top + Math.abs(h);
      g += face([p(x - dx, y0), p(x, y0 + dy), p(x, y1 + dy), p(x - dx, y1)].join(" "), h > 0 ? "#8d8d96" : "#4a4a55");
      g += face([p(x + dx, y0), p(x, y0 + dy), p(x, y1 + dy), p(x + dx, y1)].join(" "), h > 0 ? "#b9b9c2" : "#6a6a75");
    }
    g += face([p(x, top - dy), p(x + dx, top), p(x, top + dy), p(x - dx, top)].join(" "), h > 0.5 ? "#fff" : h < -0.5 ? "#17171c" : "#e3e3e8");
    bars.push(g);
  }
  return `<svg viewBox="0 0 160 142" width="160" height="142" role="img" aria-label="kernel surface plot">${bars.join("")}</svg>`;
};
const maskSvg = kind => {
  const disc = (r, f) => `<circle cx="40" cy="40" r="${r}" fill="${f}"/>`, W = "#fff", B = "#1b1424";
  const body = { low: disc(14, W), high: disc(14, B), bandpass: disc(26, W) + disc(13, B), bandreject: disc(26, B) + disc(13, W) }[kind];
  const bg = (kind === "low" || kind === "bandpass") ? B : W;
  return `<svg viewBox="0 0 80 80" width="80" height="80" role="img" aria-label="filter mask"><rect width="80" height="80" fill="${bg}" stroke="#1b1424"/>${body}</svg>`;
};
const grating = (f, deg, n = 48) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
  const a = deg * Math.PI / 180, u = (j * Math.cos(a) + i * Math.sin(a)) / n;
  return Math.round(127.5 + 127.5 * Math.sin(2 * Math.PI * f * u));
}));
const spectrumSvg = (f, deg) => {
  const a = deg * Math.PI / 180, r = f * 5, x = r * Math.cos(a), y = r * Math.sin(a);
  return `<svg viewBox="0 0 80 80" width="80" height="80" role="img" aria-label="magnitude spectrum"><rect width="80" height="80" fill="#1b1424"/><circle cx="40" cy="40" r="2.2" fill="#fff"/><circle cx="${40 + x}" cy="${40 + y}" r="3" fill="#fff"/><circle cx="${40 - x}" cy="${40 - y}" r="3" fill="#fff"/></svg>`;
};

/* ---------- input helpers ---------- */
const num = (ans, tol = 0) => ({ k: "num", ans, tol });
const grid = (ans, extra = {}) => ({ k: "grid", ans, ...extra });
const fields = (labels, ans, tol = 0) => ({ k: "fields", labels, ans, tol });
const mc = (right, wrongs) => { const opts = shuffle([right, ...wrongs]); return { k: "mc", opts, ans: opts.indexOf(right) }; };
const fact = bank => () => { const [q, right, ...wrongs] = pick(bank); return { stem: q, input: mc(right, wrongs), steps: [] }; };
const TOL = 0.011;

const GENS = [];
const G = (w, id, name, rule, trap, make) => GENS.push({ w, id: "w" + w + "-" + id, name, rule, trap, make });
const pos = (i, j) => `(${i},${j})`;

/* ================= Week 1 ================= */
G(1, "dims", "Rows, columns and the origin", "M counts rows and N counts columns. The origin is the top-left pixel at (1,1).", "Rows come first. A matrix with 4 rows and 3 columns has M = 4 and N = 3.", () => {
  let M = ri(2, 5), N = ri(2, 5); if (M === N) N = M === 5 ? 4 : M + 1; const L = rmat(M, N, 100, 255);
  return { stem: "For the image matrix below, give M, N and the pixel value at the origin.", show: [{ m: L, kind: "grey" }], input: fields(["M (rows)", "N (columns)", "Value at the origin"], [M, N, L[0][0]]), steps: [`There are ${M} rows, so M = ${M}. There are ${N} columns, so N = ${N}.`, `The origin is the top-left entry, which is ${L[0][0]}.`] };
});
G(1, "pixel", "Pixel at a coordinate", "(i,j) means row i, column j, counting from 1 at the top-left. Go down i rows first, then across j columns.", "It is not (x,y). Reading (3,4) as column 3, row 4 gives the wrong pixel.", () => {
  const L = rmat(5, 5, 0, 9); let i = ri(1, 5), j = ri(1, 5); if (i === j) j = i % 5 + 1;
  return { stem: `What is the value of the pixel at coordinate ${pos(i, j)}?`, show: [{ m: L, kind: "plain" }], input: num(L[i - 1][j - 1]), steps: [`Row ${i} is ${L[i - 1].join(" ")}.`, `Entry ${j} of that row is ${L[i - 1][j - 1]}.`, `The swapped reading ${pos(j, i)} would give ${L[j - 1][i - 1]}.`] };
});
G(1, "count", "Total number of pixels", "Pixels = M × N. Colour channels add values per pixel, not pixels.", "The channel count is a distraction. Do not multiply by it.", () => {
  const M = ri(2, 30), N = ri(2, 30), c = pick([3, 4]);
  return { stem: `What is the total number of pixels in an image with ${M} rows and ${N} columns that has ${c} colour channels?`, input: num(M * N), steps: [`${M} × ${N} = ${M * N} pixels.`, `Each pixel holds ${c} values, but it is still one pixel.`] };
});
G(1, "bytes", "Bytes needed to store an image", "Binary ⌈MN ÷ 8⌉. 8-bit greyscale MN. RGB 3MN. Indexed MN + 3C, where C is the number of colours in the lookup table.", "The number of unique shades or colours only matters for indexed colour. For binary, round up to a whole byte.", () => {
  const M = ri(100, 640), N = ri(100, 640), C = ri(8, 250), f = pick(["binary", "grey", "rgb", "indexed"]);
  const ans = { binary: S.bytesBinary(M, N), grey: M * N, rgb: 3 * M * N, indexed: S.bytesIndexed(M, N, C) }[f];
  const stem = { binary: `How many bytes are needed to store an image with ${M} rows and ${N} columns in binary format?`, grey: `How many bytes are needed to store an image with ${M} rows and ${N} columns that contains ${C} unique shades of grey in 8-bit greyscale format?`, rgb: `How many bytes are needed to store an RGB image with ${M} rows and ${N} columns that has ${C} unique colours?`, indexed: `How many bytes are needed to store an image with ${C} colours, ${M} rows and ${N} columns in indexed colour format? Count the pixel values and the colour lookup table.` }[f];
  const steps = { binary: [`MN = ${M * N} bits, one per pixel.`, `${M * N} ÷ 8 = ${(M * N / 8).toFixed(3)}, rounded up to ${ans} bytes.`], grey: [`One byte per pixel, so MN = ${ans}.`, `The ${C} unique shades do not change the answer.`], rgb: [`Three bytes per pixel, so 3 × ${M * N} = ${ans}.`, `The ${C} unique colours do not change the answer.`], indexed: [`One byte per pixel gives MN = ${M * N}.`, `The table holds ${C} colours at 3 bytes each, which is ${3 * C}.`, `${M * N} + ${3 * C} = ${ans}.`] }[f];
  return { stem: stem + " Count pixel data only, with no header.", input: num(ans), steps };
});
G(1, "bits", "Bits per pixel and grey levels", "Shades v = 2^t. Largest value = 2^t − 1. Bits needed t = ⌈log2(v)⌉, and log2(v) = log(v) ÷ log(2).", "The largest value is one less than the number of shades, because counting starts at 0.", () => {
  const f = pick(["shades", "max", "bits"]);
  if (f === "bits") { const v = ri(3, 70000), t = S.minBits(v); return { stem: `What is the minimum number of bits per pixel needed for a greyscale image that must represent up to ${big(v)} shades of grey?`, input: num(t), steps: [`log2(${v}) = ${(Math.log2(v)).toFixed(3)}, rounded up to ${t}.`, `Check: 2^${t} = ${big(2 ** t)} is enough, and 2^${t - 1} = ${big(2 ** (t - 1))} is not.`] }; }
  const t = ri(2, 24);
  return f === "shades" ? { stem: `How many different shades of grey are possible in a greyscale image that uses ${t} bits per pixel?`, input: num(2 ** t), steps: [`2^${t} = ${big(2 ** t)}.`] }
    : { stem: `What is the maximum possible pixel value in a greyscale image that uses ${t} bits per pixel?`, input: num(2 ** t - 1), steps: [`2^${t} − 1 = ${big(2 ** t - 1)}.`] };
});
G(1, "images", "How many different images are possible", "k^n, where k is the number of values one pixel can take and n is the number of pixels. Binary k = 2, 8-bit grey k = 256, RGB k = 256³ = 16,777,216.", "The exponent is the pixel count M × N, not M or N alone.", () => {
  const f = pick(["binary", "grey", "rgb"]);
  let M, N, k, kn;
  if (f === "binary") { M = ri(2, 6); N = ri(2, 4); k = 2n; kn = "2"; }
  else if (f === "grey") { M = ri(1, 2); N = ri(1, 3); k = 256n; kn = "256"; }
  else { M = 1; N = ri(1, 2); k = 16777216n; kn = "16,777,216"; }
  const ans = k ** BigInt(M * N);
  return { stem: `How many different ${{ binary: "binary", grey: "8-bit greyscale", rgb: "24-bit RGB" }[f]} images of size ${M} × ${N} pixels are possible?`, input: { k: "num", ans: ans.toString(), tol: 0 }, steps: [`Each pixel can take ${kn} values and there are ${M * N} pixels.`, `${kn}^${M * N} = ${big(ans)}.`] };
});
G(1, "rgb", "RGB triplets and colours", "One channel at 255 gives red, green or blue. Two at 255 give the secondaries: R+G yellow, G+B cyan, R+B magenta. All equal gives a grey, from black to white.", "Yellow is red plus green, not red plus blue.", () => {
  const all = [["(255,0,0)", "red"], ["(0,255,0)", "green"], ["(0,0,255)", "blue"], ["(255,255,0)", "yellow"], ["(0,255,255)", "cyan"], ["(255,0,255)", "magenta"], ["(255,255,255)", "white"], ["(0,0,0)", "black"], ["(128,128,128)", "grey"]];
  const p = shuffle(all).slice(0, 5), opts = all.map(a => a[1]);
  return { stem: "Match each RGB triplet to its colour.", input: { k: "match", left: p.map(a => ({ t: a[0] })), opts, ans: p.map(a => opts.indexOf(a[1])) }, steps: p.map(a => `${a[0]} is ${a[1]}.`) };
});
G(1, "formats", "Recognise the image format", "Binary has only black and white. Greyscale has smooth greys. RGB has smooth colour. Indexed colour has few colours, so gradients break into bands. Vector has clean flat shapes with sharp edges at any size.", "Indexed and RGB are both colour. Look for banding in the gradient to spot indexed.", () => {
  const g = scene(40), col = map2(g, (v, i, j) => [clip(v + 30), clip(200 - v / 2 + i), clip(60 + 3 * j)]);
  const items = shuffle([
    ["binary", { px: map2(g, v => v >= 128 ? 255 : 0) }], ["greyscale", { px: g }], ["RGB", { px: col }],
    ["indexed", { px: map2(col, c => c.map(x => Math.round(x / 85) * 85)) }],
    ["vector", { svg: `<svg viewBox="0 0 40 40" width="120" height="120" role="img" aria-label="picture"><rect width="40" height="40" fill="#8a7fb0"/><circle cx="14.5" cy="15" r="8" fill="#f2e9c9"/><rect x="12" y="26.5" width="22.5" height="7" fill="#2a2140"/></svg>` }],
  ]);
  const opts = ["binary", "greyscale", "indexed", "RGB", "vector"];
  return { stem: "Match each picture to its image format.", input: { k: "match", left: items.map((it, n) => ({ t: "ABCDE"[n], ...it[1] })), opts, ans: items.map(it => opts.indexOf(it[0])) }, steps: [] };
});

/* ================= Week 2 ================= */
G(2, "dist", "Distance between two pixels", "Take the two differences |Δi| and |Δj| first. City block adds them. Chessboard takes the larger. Euclidean is √(Δi² + Δj²).", "Check the order: chessboard ≤ Euclidean ≤ city block, always.", () => {
  const a = [ri(1, 320), ri(1, 320)], b = [ri(1, 320), ri(1, 320)], f = pick(["city", "chess", "euclid"]), di = Math.abs(a[0] - b[0]), dj = Math.abs(a[1] - b[1]);
  const name = { city: "city block", chess: "chessboard", euclid: "Euclidean" }[f];
  const ans = f === "euclid" ? dp2(S.euclid(a, b)) : S[f](a, b);
  return { stem: `What is the ${name} distance between a pixel at ${pos(...a)} and a pixel at ${pos(...b)}?${f === "euclid" ? " Give 2 d.p." : ""}`, input: num(ans, f === "euclid" ? TOL : 0), steps: [`|Δi| = ${di} and |Δj| = ${dj}.`, { city: `${di} + ${dj} = ${ans}.`, chess: `The larger of the two is ${ans}.`, euclid: `√(${di}² + ${dj}²) = √${di * di + dj * dj} = ${ans}.` }[f]] };
});
G(2, "bright", "Brightness as a mean", "Arithmetic: sum ÷ count. Harmonic: count ÷ sum of reciprocals. Geometric: take ln of every pixel, average them, then e to that power.", "Check the order: harmonic ≤ geometric ≤ arithmetic. Read the rounding line, because geometric is usually asked as a whole number.", () => {
  const L = rmat(3, 3, 4, 255), f = pick(["arith", "harm", "geom"]), n = 9;
  const a = S.mean(L), h = S.harmonic(L), g = S.geometric(L);
  const stem = { arith: "Calculate brightness as arithmetic mean luminance, to 2 d.p.", harm: "Calculate brightness as harmonic mean luminance, to 2 d.p.", geom: "Calculate brightness as geometric mean luminance, rounded to a whole number." }[f];
  const steps = { arith: [`Sum = ${sum(L.flat())}. Divide by ${n} to get ${dp2(a)}.`], harm: [`Sum of reciprocals = ${sum(L.flat().map(v => 1 / v)).toFixed(5)}.`, `${n} ÷ that sum = ${dp2(h)}.`], geom: [`Sum of ln(L) = ${sum(L.flat().map(Math.log)).toFixed(4)}. Divide by ${n} to get ${(Math.log(g)).toFixed(4)}.`, `e to that power = ${g.toFixed(3)}, which rounds to ${rnd(g)}.`] }[f];
  steps.push(`For this image harmonic ${dp2(h)} ≤ geometric ${dp2(g)} ≤ arithmetic ${dp2(a)}.`);
  return { stem: "For the 8-bit greyscale image matrix below. " + stem, show: [{ m: L, kind: "grey" }], input: f === "geom" ? num(rnd(g)) : num(dp2(f === "arith" ? a : h), TOL), steps };
});
G(2, "contrast", "Contrast measures", "Find Lmax and Lmin first. Range = max − min. Normalised range = range ÷ 255. Michelson = (max − min) ÷ (max + min). RMS = the standard deviation, dividing by MN.", "Normalised range divides by 255, not 256. Normalised range and Michelson both sit between 0 and 1.", () => {
  const f = pick(["range", "norm", "mich", "rms"]), L = f === "rms" ? rmat(3, 3, 20, 240) : rmat(4, 4, 2, 252), fl = L.flat(), hi = Math.max(...fl), lo = Math.min(...fl);
  if (f === "rms") { const m = S.mean(L), r = S.rms(L); return { stem: "For the 8-bit greyscale image matrix below, calculate RMS contrast to 2 d.p.", show: [{ m: L, kind: "grey" }], input: num(dp2(r), TOL), steps: [`Mean = ${dp2(m)}.`, `Squared differences from the mean sum to ${dp2(sum(fl.map(v => (v - m) ** 2)))}.`, `Divide by ${fl.length} and take the square root to get ${dp2(r)}.`] }; }
  const ans = { range: hi - lo, norm: dp2((hi - lo) / 255), mich: dp2((hi - lo) / (hi + lo)) }[f];
  const name = { range: "statistical range", norm: "normalised range, to 2 d.p.", mich: "Michelson contrast, to 2 d.p." }[f];
  return { stem: `For the 8-bit greyscale image matrix below, calculate contrast as ${name}`, show: [{ m: L, kind: "grey" }], input: num(ans, f === "range" ? 0 : TOL), steps: [`Lmax = ${hi} and Lmin = ${lo}.`, { range: `${hi} − ${lo} = ${ans}.`, norm: `(${hi} − ${lo}) ÷ 255 = ${ans}.`, mich: `(${hi} − ${lo}) ÷ (${hi} + ${lo}) = ${hi - lo} ÷ ${hi + lo} = ${ans}.` }[f]] };
});
G(2, "arith", "Image arithmetic with 8-bit limits", "Work entry by entry, then force every result into 0..255. Above 255 becomes 255. Below 0 becomes 0. The ∘ symbol means multiply matching entries.", "224 + 60 is 255, not 284. 30 − 40 is 0, not −10. L1 ∘ L2 is not matrix multiplication.", () => {
  const f = pick(["addS", "mulS", "add", "sub", "had"]);
  if (f === "addS") { const L = rmat(3, 3, 0, 255); L[ri(0, 2)][ri(0, 2)] = ri(250, 255); const s = ri(5, 60), o = map2(L, v => clip(v + s)); return { stem: `Give the output of L + S for the 8-bit greyscale image below, where S = ${s}.`, show: [{ cap: "L", m: L, kind: "grey" }], input: grid(o), steps: [`Add ${s} to every entry.`, `Any result above 255 is stored as 255.`] }; }
  if (f === "mulS") { const L = rmat(3, 3, 5, 180), s = pick([0.5, 1.5, 2, 2.5]), o = map2(L, v => clip(rnd(v * s))); return { stem: `Give the output of S · L for the 8-bit greyscale image below, where S = ${s}. Round .5 upwards.`, show: [{ cap: "L", m: L, kind: "grey" }], input: grid(o), steps: [`Multiply every entry by ${s} and round.`, `Any result above 255 is stored as 255.`] }; }
  if (f === "had") { const L = rmat(3, 3, 0, 255), B = rmat(3, 3, 0, 1), o = map2(L, (v, i, j) => v * B[i][j]); return { stem: "Give the output of L1 ∘ L2.", show: [{ cap: "L1", m: L, kind: "grey" }, { cap: "L2", m: B, kind: "bin" }], input: grid(o), steps: [`Multiply each entry of L1 by the entry in the same place in L2.`, `Where L2 is 1 the pixel is kept. Where L2 is 0 the pixel becomes 0. This is how a mask selects pixels.`] }; }
  const A = rmat(2, 3, 0, 230), B = rmat(2, 3, 0, 230), o = map2(A, (v, i, j) => clip(f === "add" ? v + B[i][j] : v - B[i][j]));
  return { stem: `Give the output of L1 ${f === "add" ? "+" : "−"} L2 for these 8-bit greyscale images.`, show: [{ cap: "L1", m: A, kind: "grey" }, { cap: "L2", m: B, kind: "grey" }], input: grid(o), steps: [f === "add" ? "Add matching entries. Anything above 255 is stored as 255." : "Subtract matching entries. Anything below 0 is stored as 0."] };
});

/* ================= Week 3 ================= */
G(3, "togrey", "RGB to greyscale", "Lightness = (largest + smallest) ÷ 2. Average = (R + G + B) ÷ 3. Luminosity = 0.21R + 0.72G + 0.07B. Round at the end.", "Lightness ignores the middle value. Luminosity weights green most, so a strong green gives a bright grey.", () => {
  const c = [ri(0, 255), ri(0, 255), ri(0, 255)], f = pick(["lightness", "average", "luminosity"]), ans = S[f](c);
  const w = { lightness: `(${Math.max(...c)} + ${Math.min(...c)}) ÷ 2 = ${(Math.max(...c) + Math.min(...c)) / 2}`, average: `(${c.join(" + ")}) ÷ 3 = ${(sum(c) / 3).toFixed(3)}`, luminosity: `0.21 × ${c[0]} + 0.72 × ${c[1]} + 0.07 × ${c[2]} = ${(0.21 * c[0]).toFixed(2)} + ${(0.72 * c[1]).toFixed(2)} + ${(0.07 * c[2]).toFixed(2)} = ${(0.21 * c[0] + 0.72 * c[1] + 0.07 * c[2]).toFixed(2)}` }[f];
  return { stem: `Using the ${f} method, what 8-bit grey value is produced for the RGB triplet (${c.join(",")})? Round to a whole number, with .5 rounding upwards.`, input: num(ans), steps: [w + ".", `Rounded, that is ${ans}.`] };
});
G(3, "bars", "Bars on a histogram", "The fewest bars is 1, when every pixel has the same value. The most is the number of possible values: 2 for binary and 2^b for a b-bit image.", "An 8-bit image can show 256 bars, not 8.", () => {
  const b = ri(2, 10);
  return { stem: `Give the minimum and maximum number of bars that can appear on the histogram of a binary image and of a ${b}-bit greyscale image.`, input: fields(["Binary, minimum", "Binary, maximum", `${b}-bit, minimum`, `${b}-bit, maximum`], [1, 2, 1, 2 ** b]), steps: [`One bar appears when all pixels share a value.`, `A ${b}-bit image has 2^${b} = ${2 ** b} possible values, so at most ${2 ** b} bars.`] };
});
G(3, "hist", "Build a histogram", "Count: tally each grey level. Normalised: count ÷ MN. Cumulative: running total of the counts. Normalised cumulative: running total ÷ MN.", "Check the totals. Counts add up to MN. The last cumulative bar is MN. The last normalised cumulative bar is 1.", () => {
  const L = rmat(5, 5, 0, 7), h = S.hist(L, 8), c = S.cumul(h), f = pick(["count", "norm", "cumul", "ncumul"]);
  const ans = { count: h, norm: h.map(v => dp2(v / 25)), cumul: c, ncumul: c.map(v => dp2(v / 25)) }[f];
  const name = { count: "count histogram", norm: "normalised count histogram, to 2 d.p.", cumul: "cumulative count histogram", ncumul: "normalised cumulative count histogram, to 2 d.p." }[f];
  return { stem: `Below is a 3-bit greyscale image with grey levels 0 to 7. Enter its ${name}`, show: [{ m: L, kind: "plain" }], input: fields(h.map((_, v) => "Level " + v), ans, f === "count" || f === "cumul" ? 0 : TOL), steps: [`Counts for levels 0 to 7 are ${h.join(", ")}. They add up to 25.`, `Running totals are ${c.join(", ")}.`, f === "norm" || f === "ncumul" ? "Divide each by MN = 25." : "No division is needed here."] };
});
G(3, "thresh", "Thresholding to a binary mask", "Write the test, then go pixel by pixel. Basic: 1 if L ≥ T. Low-pass: 1 if L ≤ T. High-pass: 1 if L ≥ T. Band-pass: 1 if T1 ≤ L ≤ T2. Band-reject: 1 if L ≤ T1 or L ≥ T2.", "A pixel equal to the threshold is included in every one of these. Band-reject is the opposite of band-pass except at the two threshold values.", () => {
  const f = pick(["basic", "low", "high", "bandpass", "bandreject"]), L = rmat(3, 3, 5, 250), T1 = ri(50, 120), T2 = T1 + ri(30, 90);
  L[ri(0, 2)][ri(0, 2)] = f === "bandreject" || f === "bandpass" ? pick([T1, T2]) : T1;
  const test = { basic: v => v >= T1, low: v => v <= T1, high: v => v >= T1, bandpass: v => v >= T1 && v <= T2, bandreject: v => v <= T1 || v >= T2 }[f];
  const name = { basic: `Convert L to a binary image using threshold T = ${T1}, where a pixel below T becomes 0 and any other pixel becomes 1.`, low: `Apply low-pass thresholding with T = ${T1}.`, high: `Apply high-pass thresholding with T = ${T1}.`, bandpass: `Apply band-pass thresholding with T1 = ${T1} and T2 = ${T2}.`, bandreject: `Apply band-reject thresholding with T1 = ${T1} and T2 = ${T2}.` }[f];
  const rule = { basic: `1 if L ≥ ${T1}`, low: `1 if L ≤ ${T1}`, high: `1 if L ≥ ${T1}`, bandpass: `1 if ${T1} ≤ L ≤ ${T2}`, bandreject: `1 if L ≤ ${T1} or L ≥ ${T2}` }[f];
  return { stem: name + " Enter the binary mask.", show: [{ cap: "L", m: L, kind: "grey" }], input: grid(map2(L, v => test(v) ? 1 : 0)), steps: [`The test is: ${rule}, otherwise 0.`, `One pixel here sits exactly on a threshold, and it passes the test.`] };
});
G(3, "multiband", "Multi-band threshold on RGB", "A pixel is 1 only when all three channel tests pass. Check the red test first and cross out failures, then test only the survivors on green, then blue.", "The comparisons here are strict. A value equal to its threshold fails.", () => {
  const R = rmat(2, 3, 0, 255), Gm = rmat(2, 3, 0, 255), B = rmat(2, 3, 0, 255), T = [pick([96, 128, 160]), pick([64, 96, 128]), pick([48, 64, 96])];
  const o = map2(R, (v, i, j) => (v < T[0] && Gm[i][j] > T[1] && B[i][j] > T[2]) ? 1 : 0);
  return { stem: `Enter the binary mask S, where S = 1 if (R < ${T[0]}) and (G > ${T[1]}) and (B > ${T[2]}), otherwise 0.`, show: [{ cap: "R", m: R, kind: "grey" }, { cap: "G", m: Gm, kind: "grey" }, { cap: "B", m: B, kind: "grey" }], input: grid(o), steps: [`R < ${T[0]} passes at ${mt(map2(R, v => v < T[0] ? 1 : 0))}.`, `G > ${T[1]} passes at ${mt(map2(Gm, v => v > T[1] ? 1 : 0))}.`, `B > ${T[2]} passes at ${mt(map2(B, v => v > T[2] ? 1 : 0))}.`, `Keep only the places where all three are 1.`] };
});
G(3, "select", "Use a mask to select pixels", "Make the mask, then keep the original value where the mask is 1 and write 0 everywhere else.", "The answer holds grey values and zeros, not ones and zeros.", () => {
  const L = rmat(3, 3, 5, 250), T = ri(70, 150), o = map2(L, v => v <= T ? v : 0);
  return { stem: `Apply low-pass thresholding with T = ${T} to L, then use the mask to select pixels. Enter the output image.`, show: [{ cap: "L", m: L, kind: "grey" }], input: grid(o), steps: [`The mask is 1 where L ≤ ${T}: ${mt(map2(L, v => v <= T ? 1 : 0))}.`, `Selected pixels keep their grey value. The rest become 0.`] };
});

/* ================= Week 4 ================= */
G(4, "effects", "Brightness arithmetic and the histogram", "Adding a positive number or multiplying by more than 1 brightens, and the bars slide right. Subtracting or multiplying by a fraction darkens, and the bars slide left. Multiplying by 0 or a negative number wipes the image to black.", "Subtracting a negative number brightens. Multiplying by a negative number gives negative values, which all become 0.", () => {
  const all = [["L' = L + S, S > 0", "brighten"], ["L' = L − S, S > 0", "darken"], ["L' = L + S, S < 0", "darken"], ["L' = L − S, S < 0", "brighten"], ["L' = L + S, S = 0", "no effect"], ["L' = L × S, S > 1", "brighten"], ["L' = L × S, S = 1", "no effect"], ["L' = L × S, S = 0", "annihilate"], ["L' = L × S, S < 0", "annihilate"], ["L' = L × S, 0 < S < 1", "darken"]];
  const p = shuffle(all).slice(0, 5), opts = ["brighten", "darken", "no effect", "annihilate"];
  return { stem: "Match each operation on image L with scalar S to its effect.", input: { k: "match", left: p.map(a => ({ t: a[0] })), opts, ans: p.map(a => opts.indexOf(a[1])) }, steps: ["Brighter images have their histogram bars further right. Darker images have them further left."] };
});
G(4, "stretchparts", "Histogram stretch, step by step", "Stretch is (L − Lmin) × t ÷ (Lmax − Lmin). Subtract Lmin so the darkest pixel is 0, then multiply by the coefficient t ÷ (Lmax − Lmin) so the brightest becomes t.", "The coefficient uses t = 255 on top, not 256. Stretch never changes how many different grey levels there are.", () => {
  const f = pick(["min", "coef", "facts"]), L = rmat(4, 4, 100, 200), fl = L.flat(), lo = Math.min(...fl), hi = Math.max(...fl);
  if (f === "min") return { stem: "The first step of a histogram stretch subtracts Lmin from every pixel. What is Lmin for this image?", show: [{ m: L, kind: "grey" }], input: num(lo), steps: [`The smallest value is ${lo}.`] };
  if (f === "coef") return { stem: "After subtracting Lmin, what coefficient do we multiply by so the output spans 0 to 255? Give 2 d.p.", show: [{ m: L, kind: "grey" }], input: num(dp2(255 / (hi - lo)), TOL), steps: [`Lmax = ${hi} and Lmin = ${lo}, so the spread is ${hi - lo}.`, `255 ÷ ${hi - lo} = ${dp2(255 / (hi - lo))}.`] };
  const a = ri(10, 60), b = a + ri(40, 120), u = ri(12, 40);
  return { stem: `Before a histogram stretch an 8-bit image has Lmin = ${a}, Lmax = ${b} and ${u} unique shades of grey. After a stretch with t = 255, give the new values.`, input: fields(["New Lmin", "New Lmax", "Unique shades"], [0, 255, u]), steps: ["The darkest pixel always lands on 0 and the brightest on t.", `Each old level maps to exactly one new level, so there are still ${u} shades.`] };
});
G(4, "stretchmap", "Histogram stretch, new grey levels", "For each level: (level − Lmin) × 255 ÷ (Lmax − Lmin), then round to the nearest whole number. Work out the coefficient once and reuse it.", "Round to nearest, do not chop. 215.77 is 216. The first level must come out as 0 and the last as 255.", () => {
  const L = rmat(3, 3, 5, 160), lv = S.levels(L), lo = lv[0], hi = lv[lv.length - 1]; if (hi === lo) L[0][0] = hi + 20;
  const l2 = S.levels(L), a = l2[0], b = l2[l2.length - 1];
  return { stem: "Enter the new value of each grey level after a histogram stretch with b = 0 and t = 255.", show: [{ m: L, kind: "grey" }], input: fields(l2.map(v => "Level " + v), l2.map(v => S.stretch(v, a, b))), steps: [`Lmin = ${a}, Lmax = ${b}, coefficient = 255 ÷ ${b - a} = ${(255 / (b - a)).toFixed(4)}.`, ...l2.map(v => `${v}: (${v} − ${a}) × ${(255 / (b - a)).toFixed(4)} = ${((v - a) * 255 / (b - a)).toFixed(2)}, which rounds to ${S.stretch(v, a, b)}.`)] };
});
G(4, "alpha", "Alpha-trimmed stretch, the percentile pixel", "Sort the pixels from low to high. The position is p × (MN + 1), rounded to the nearest whole number. Count along the sorted list to that position.", "It is MN + 1, not MN. If the position falls below 1 use the first pixel. If it is above MN use the last.", () => {
  const L = rmat(4, 4, 10, 220), p = pick([0.05, 0.1, 0.9, 0.95]), s = L.flat().sort((a, b) => a - b), raw = p * 17, k = Math.max(1, Math.min(16, rnd(raw)));
  return { stem: `Find the pixel value at the ${Math.round(p * 100)}th percentile of L, which will stand in for ${p < 0.5 ? "Lmin" : "Lmax"} in an alpha-trimmed stretch.`, show: [{ cap: "L", m: L, kind: "grey" }], input: num(S.percentile(L, p)), steps: [`Sorted: ${s.join(", ")}.`, `Position = ${p} × (16 + 1) = ${raw.toFixed(2)}, which rounds to ${rnd(raw)}${rnd(raw) !== k ? `, limited to ${k}` : ""}.`, `Pixel number ${k} in the sorted list is ${s[k - 1]}.`] };
});
G(4, "cumbars", "Cumulative histogram bars", "The first bar is the count of the darkest level, so Hcumul(Lmin) = H(Lmin). The last bar is always the pixel count MN.", "The last bar does not depend on the pixel values at all.", () => {
  if (ri(0, 1)) { const M = ri(60, 300), N = ri(60, 300); return { stem: `An 8-bit greyscale image has M = ${M} and N = ${N}. What is the height of the final bar of its cumulative histogram?`, input: num(M * N), steps: [`The running total ends at every pixel counted, which is ${M} × ${N} = ${big(M * N)}.`] }; }
  const L = rmat(3, 3, 10, 70), lo = Math.min(...L.flat()); L[ri(0, 2)][ri(0, 2)] = lo; const n = L.flat().filter(v => v === lo).length;
  return { stem: "What is the height of the first bar of the cumulative histogram of this image?", show: [{ m: L, kind: "grey" }], input: num(n), steps: [`The darkest level is ${lo}. It appears ${n} time${n > 1 ? "s" : ""}.`, "Nothing comes before the first bar, so it equals the plain count."] };
});
G(4, "equalise", "Histogram equalisation, new grey levels", "List the levels in order with their running totals H. New level = (H − H of the darkest) ÷ (MN − H of the darkest) × 255, rounded. Work out the bottom once.", "Use the running total, not the plain count. The first level must come out as 0 and the last as 255.", () => {
  let L = rmat(3, 3, 5, 160); L[ri(0, 2)][ri(0, 2)] = L[0][0];
  const lv = S.levels(L), f = L.flat(), map = S.equalise(L); let c = 0; const cum = lv.map(v => (c += f.filter(x => x === v).length)), h0 = cum[0];
  return { stem: "Enter the new value of each grey level after histogram equalisation, with t = 255 and b = 0.", show: [{ m: L, kind: "grey" }], input: fields(lv.map(v => "Level " + v), lv.map(v => map[v])), steps: [`Running totals for the levels are ${cum.join(", ")}.`, `Bottom = MN − H(Lmin) = 9 − ${h0} = ${9 - h0}.`, ...lv.map((v, n) => `${v}: (${cum[n]} − ${h0}) ÷ ${9 - h0} × 255 = ${((cum[n] - h0) / (9 - h0) * 255).toFixed(2)}, which rounds to ${map[v]}.`)] };
});
G(4, "histmatch", "Match pictures to histograms", "Dark picture: bars bunched on the left. Bright: bunched on the right. Low contrast: a narrow clump. High contrast: bars spread across the whole width.", "Low contrast is about how narrow the clump is, not where it sits.", () => {
  const g = scene(40), v = [["dark", map2(g, x => Math.round(x * 0.35))], ["bright", map2(g, x => Math.round(150 + x * 0.4))], ["low contrast", map2(g, x => Math.round(105 + x * 0.18))], ["high contrast", map2(g, x => clip(Math.round((x - 40) * 1.38)))]];
  const imgs = shuffle(v), hs = shuffle(v), opts = ["1", "2", "3", "4"];
  return { stem: "Match pictures A to D to histograms 1 to 4.", show: hs.map((h, n) => ({ cap: "Histogram " + (n + 1), svg: histSvg(h[1]) })), input: { k: "match", left: imgs.map((im, n) => ({ t: "ABCD"[n], px: im[1] })), opts, ans: imgs.map(im => hs.findIndex(h => h[0] === im[0])) }, steps: imgs.map((im, n) => `Picture ${"ABCD"[n]} is the ${im[0]} one.`) };
});
G(4, "facts", "Contrast methods, facts", "Stretch is one-to-one (bijective): every level keeps its own new level. Alpha-trimmed stretch, equalisation and CLAHE can send several old levels to the same new one (surjective). CLAHE limits how much noise gets amplified.", "Stretch fails when a single outlier pixel sits at 0 or 255. That is what alpha trimming fixes.", fact([
  ["What kind of mapping between input and output grey levels does a plain histogram stretch give?", "Bijective, one old level to one new level", "Surjective, several old levels can share a new level", "Random", "Injective only, with unused input levels"],
  ["What kind of mapping between input and output grey levels does histogram equalisation give?", "Surjective, several old levels can share a new level", "Bijective, one old level to one new level", "The identity mapping", "A mapping that always increases the number of levels"],
  ["What kind of mapping does an alpha-trimmed histogram stretch give?", "Surjective, because the trimmed extremes pile up at 0 and 255", "Bijective, one old level to one new level", "The identity mapping", "A mapping that reverses the grey levels"],
  ["What is the advantage of CLAHE over ordinary adaptive histogram equalisation?", "It reduces the amplification of noise", "It is faster", "It boosts contrast to a greater degree", "It uses less computational power"],
  ["When is a plain histogram stretch ineffective?", "When a few outlier pixels already sit at the extremes", "When the image is dark", "When the image has more than 100 grey levels", "When the image is square"],
  ["If an image is made darker, which way do the bars of its count histogram slide?", "To the left", "To the right", "Upwards", "They do not move"],
  ["If an image is made brighter, which way do the bars of its count histogram slide?", "To the right", "To the left", "Downwards", "They do not move"],
  ["Is the following statement correct?\n\"For any image, the first bar of the cumulative histogram is the same height as the first bar of the count histogram.\"", "Yes, because nothing has been added to it yet", "No, the cumulative bar is always taller", "No, the cumulative bar is always shorter", "Only for binary images"],
]));

/* ================= Week 5 ================= */
const blob = () => { const A = Array.from({ length: 6 }, () => Array(5).fill(0)); for (let i = 1; i <= 4; i++) for (let j = 1; j <= 3; j++) A[i][j] = Math.random() < 0.62 ? 1 : 0; A[2][2] = 1; return A; };
G(5, "set", "A set of coordinates as a binary image", "Each pair (i,j) in the set is a 1 at row i, column j. Every other pixel is 0.", "Row first. (4,1) is the bottom-left of a 4 × 4 image, not the top-right.", () => {
  const A = Array.from({ length: 4 }, () => Array(4).fill(0)), pts = [];
  while (pts.length < 6) { const i = ri(1, 4), j = ri(1, 4); if (!A[i - 1][j - 1]) { A[i - 1][j - 1] = 1; pts.push(pos(i, j)); } }
  return { stem: `Enter the 4 × 4 binary image for the set A = { ${pts.join(", ")} }.`, input: grid(A), steps: [`Put a 1 at each listed (row, column). The image has ${pts.length} ones, which is the cardinality of A.`] };
});
G(5, "setops", "Set operations on binary images", "Union: 1 where either is 1. Intersection: 1 where both are 1. Difference A/B: 1 where A is 1 and B is 0. Symmetric difference: 1 where they differ. Complement: flip every bit. Cardinality is the number of ones.", "Check with counts: |A ∪ B| = |A| + |B| − |A ∩ B|, and |A △ B| = |A ∪ B| − |A ∩ B|.", () => {
  const A = rmat(3, 3, 0, 1), B = rmat(3, 3, 0, 1), f = pick(["union", "inter", "diff", "sym", "comp"]);
  const fn = { union: (a, b) => a | b, inter: (a, b) => a & b, diff: (a, b) => a & (1 - b), sym: (a, b) => a ^ b, comp: a => 1 - a }[f];
  const o = map2(A, (v, i, j) => fn(v, B[i][j])), sym = { union: "A ∪ B", inter: "A ∩ B", diff: "A / B", sym: "A △ B", comp: "A′" }[f], card = sum(o.flat());
  return { stem: `Give the binary image produced by ${sym} and its cardinality.`, show: f === "comp" ? [{ cap: "A", m: A, kind: "bin" }] : [{ cap: "A", m: A, kind: "bin" }, { cap: "B", m: B, kind: "bin" }], input: [grid(o), fields(["Cardinality"], [card])], steps: [`|A| = ${sum(A.flat())}${f === "comp" ? "" : ` and |B| = ${sum(B.flat())}`}.`, `The result has ${card} ones.`, f === "comp" ? `Check: |A′| = 9 − |A| = ${9 - sum(A.flat())}.` : `Check: union ${sum(map2(A, (v, i, j) => v | B[i][j]).flat())} = ${sum(A.flat())} + ${sum(B.flat())} − intersection ${sum(map2(A, (v, i, j) => v & B[i][j]).flat())}.`] };
});
G(5, "confusion", "Confusion matrix accuracy", "Correct pixels are the two that agree: selected and truly object, plus not selected and truly background. Accuracy = (TP + TN) ÷ total × 100.", "Add the diagonal, not a row. Opening tries to turn false positives into true negatives. Closing tries to turn false negatives into true positives.", () => {
  const tp = ri(20, 90), fn = ri(5, 60), fp = ri(5, 60), tn = ri(20, 90), tot = tp + fn + fp + tn;
  return { stem: `A threshold selected some pixels. ${tp} were selected and truly part of the object. ${fn} were not selected but truly part of the object. ${fp} were selected but not part of the object. ${tn} were not selected and not part of the object. What percentage of pixels were correctly labelled? Give 2 d.p.`, input: num(dp2((tp + tn) / tot * 100), TOL), steps: [`Correct = ${tp} + ${tn} = ${tp + tn}.`, `Total = ${tot}.`, `${tp + tn} ÷ ${tot} × 100 = ${dp2((tp + tn) / tot * 100)}.`] };
});
const morphQ = (id, name, sym, fn, rule, trap, how) => G(5, id, name, rule, trap, () => {
  const A = blob();
  return { stem: `Show the output of morphological ${name.toLowerCase()} applied to image A with the N4 structuring element S, with its origin at the centre.`, show: [{ cap: "A", m: A, kind: "bin" }, { cap: "S", m: [["", 1, ""], [1, 1, 1], ["", 1, ""]], kind: "k" }], formula: sym, input: grid(fn(A)), steps: how(A) };
});
morphQ("dilate", "Dilation", "A ⊕ S", S.dilate, "Every 1 stamps a plus shape: itself and its four neighbours. Copy A, then add the up, down, left and right neighbour of every 1.", "Diagonal neighbours are not in N4. Dilation never removes a pixel.", A => [`A has ${sum(A.flat())} ones. The output has ${sum(S.dilate(A).flat())}.`, "Each 1 in A turns on the pixels above, below, left and right of it."]);
morphQ("erode", "Erosion", "A ⊖ S", S.erode, "A 1 survives only if it and all four of its N4 neighbours are 1. Look for the centres of full plus shapes.", "Anything outside the image counts as 0, so a 1 on the border never survives. Erosion never adds a pixel.", A => [`A has ${sum(A.flat())} ones. The output has ${sum(S.erode(A).flat())}.`, "A pixel stays 1 only when up, down, left and right are all 1 as well."]);
morphQ("close", "Closing", "A • S = (A ⊕ S) ⊖ S", S.close, "Dilate first, then erode the result. Closing fills small holes and gaps.", "Do the two steps in order on paper. The output always contains A.", A => [`After dilation: ${mt(S.dilate(A))}.`, `Eroding that gives the answer. Pixels on the image border are lost in the erosion because outside counts as 0.`]);
morphQ("open", "Opening", "A ○ S = (A ⊖ S) ⊕ S", S.open, "Erode first, then dilate the result. Opening removes specks and thin parts that cannot hold a full plus shape.", "If the erosion leaves nothing, the answer is all zeros. The output never has a pixel that A did not have.", A => [`After erosion: ${mt(S.erode(A))}.`, "Dilating that stamps a plus shape on each surviving 1."]);
morphQ("gradient", "Gradient", "(A ⊕ S) − (A ⊖ S)", S.gradient, "Dilation minus erosion. The result is 1 where dilation is 1 and erosion is 0, which traces the boundary inside and out.", "The interior that survives erosion is removed, so a solid shape becomes hollow.", A => [`Dilation: ${mt(S.dilate(A))}.`, `Erosion: ${mt(S.erode(A))}.`, "Subtract entry by entry."]);
G(5, "hitmiss", "Hit-and-miss corner detection", "Slide each pattern over the image. A pixel scores 1 only if every 1 in the pattern sits on a 1 and every 0 sits on a 0. Blank cells can be anything. Then take the union of the four outputs.", "Only test pixels that are 1, because every pattern has a 1 at its centre. Outside the image counts as 0.", () => {
  const A = blob(), c = S.CORNERS, sh = k => ({ cap: k, m: map2(c[k], v => v === null ? "" : v), kind: "k" });
  return { stem: "Apply the four corner-detecting hit-and-miss patterns to A and give the union of the four outputs.", show: [sh("TL"), sh("TR"), sh("BL"), sh("BR"), { cap: "A", m: A, kind: "bin" }], input: grid(S.corners(A)), steps: Object.keys(c).map(k => `${k} matches at ${mt(S.hitmiss(A, c[k]))}.`) };
});
G(5, "facts", "Morphology, facts", "Opening = erode then dilate, and it removes specks. Closing = dilate then erode, and it fills holes. Dilation grows shapes and erosion shrinks them.", "Opening and closing are named after what they do to gaps, not after the order of the letters.", fact([
  ["What does morphological opening try to do to a thresholded mask?", "Turn false positives into true negatives", "Turn false negatives into true positives", "Turn true positives into false negatives", "Turn true negatives into false positives"],
  ["What does morphological closing try to do to a thresholded mask?", "Turn false negatives into true positives", "Turn false positives into true negatives", "Turn true positives into false negatives", "Turn true negatives into false positives"],
  ["Which pair of steps makes up morphological closing?", "Dilation, then erosion", "Erosion, then dilation", "Dilation, then dilation", "Erosion, then complement"],
  ["Which pair of steps makes up morphological opening?", "Erosion, then dilation", "Dilation, then erosion", "Erosion, then erosion", "Dilation, then complement"],
  ["In a universe of 3 × 3 pixels, what are the smallest and largest possible cardinalities of a set?", "0 and 9", "1 and 9", "0 and 3", "1 and 8"],
]));

/* ================= Week 6 ================= */
const OPS = [["flip left-right", "flipLR", "L′(i, N+1−j) = L(i,j)"], ["flip up-down", "flipUD", "L′(M+1−i, j) = L(i,j)"], ["rotate 180°", "rot180", "L′(M+1−i, N+1−j) = L(i,j)"], ["transpose", "transpose", "L′(j, i) = L(i,j)"], ["rotate +90°", "rotP90", "L′(j, M+1−i) = L(i,j)"], ["rotate −90°", "rotM90", "L′(N+1−j, i) = L(i,j)"], ["anti-diagonal transpose", "antiT", "L′(N+1−j, M+1−i) = L(i,j)"]];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
G(6, "apply", "Flip, rotate or transpose a matrix", "Follow the top row. Flip left-right reverses each row. Flip up-down reverses the row order. +90° is clockwise, so the top row becomes the right column. −90° is anticlockwise, so the top row becomes the left column. Transpose turns rows into columns. Anti-diagonal transpose mirrors across the other diagonal.", "+90° is clockwise in this module. Transpose keeps the main diagonal fixed. Anti-diagonal transpose keeps the other diagonal fixed.", () => {
  const L = [[1, 2, 3], [4, 5, 6], [7, 8, 9]], o = pick(OPS), base = ri(0, 1) ? L : rmat(3, 3, 1, 99);
  const out = S[o[1]](base);
  return { stem: `Apply ${o[0]} to the matrix below.`, show: [{ cap: "L", m: base, kind: "plain" }], formula: o[2], input: grid(out), steps: [`The top row ${base[0].join(" ")} ends up as ${{ flipLR: "the top row, reversed", flipUD: "the bottom row", rot180: "the bottom row, reversed", transpose: "the left column, read downwards", rotP90: "the right column, read downwards", rotM90: "the left column, read upwards", antiT: "the right column, read upwards" }[o[1]]}.`, `Result: ${mt(out)}.`] };
});
G(6, "invol", "Involutory operations", "An operation is involutory if doing it twice gives back the original. Both flips, both transposes and the 180° rotation are. The two 90° rotations are not, because two of them make 180°.", "Five of the seven are involutory. Tick all five.", () => {
  const o = shuffle(OPS);
  return { stem: "Which of these operations are involutory?", input: { k: "multi", opts: o.map(x => x[0]), ans: o.map(x => !x[1].startsWith("rotP") && !x[1].startsWith("rotM")) }, steps: ["Apply each one twice to [1 2; 3 4] and see whether you get [1 2; 3 4] back.", "Rotating by 90° twice gives a 180° rotation, so those two fail."] };
});
G(6, "combo", "Two operations as one", "Track the matrix [1 2; 3 4] through both steps, then see which single operation gives the same result.", "Order matters. Rotate then flip is a different result from flip then rotate.", () => {
  const T = [[1, 2, 3], [4, 5, 6], [7, 8, 9]], five = OPS.filter(o => o[1] !== "rot180");
  for (;;) {
    const a = pick(five), b = pick(five), r = S[b[1]](S[a[1]](T)), hit = OPS.find(o => same(S[o[1]](T), r));
    if (!hit || a === b) continue;
    const wrong = shuffle(OPS.filter(o => o !== hit)).slice(0, 3).map(o => o[0]);
    return { stem: `Which single operation gives the same result as ${a[0]} followed by ${b[0]}?`, input: mc(hit[0], wrong), steps: [`Start with ${mt(T)}.`, `After ${a[0]}: ${mt(S[a[1]](T))}.`, `After ${b[0]}: ${mt(r)}.`, `That is what ${hit[0]} gives on its own.`] };
  }
});
G(6, "formula", "Direct formulas for rotation", "Test the formula on the top-left pixel (1,1) and the top-right pixel (1,N). See where each lands. M+1−i sends a row to the opposite end. N+1−j sends a column to the opposite end. Swapped i and j means rows became columns.", "Flip left-right changes the column only: L′(i, N+1−j). If i and j are not swapped, it is a flip or the 180° rotation.", () => {
  const o = pick(OPS), wrong = shuffle(OPS.filter(x => x !== o)).slice(0, 3).map(x => x[2]);
  return { stem: `Which direct formula performs ${o[0]}?`, input: mc(o[2], wrong), steps: [`Pixel (1,1) goes to ${{ flipLR: "(1,N), the top-right", flipUD: "(M,1), the bottom-left", rot180: "(M,N), the bottom-right", transpose: "(1,1), so it stays", rotP90: "(1,M), the top-right", rotM90: "(N,1), the bottom-left", antiT: "(N,M), the bottom-right" }[o[1]]}.`, `Put i = 1 and j = 1 into ${o[2]} to confirm.`] };
});
G(6, "pictures", "Recognise the rotation", "Find one feature and follow it. Here the stem of the F starts on the left with its arms pointing right. A mirrored F with no turn is a flip. A turned F that is not mirrored is a rotation. A turned and mirrored F is a transpose.", "Transpose and rotate +90° both lay the F on its side. Only the transpose also mirrors it.", () => {
  const p = shuffle(OPS).slice(0, 4), opts = OPS.map(o => o[0]);
  return { stem: "Match each picture to the operation applied to the original.", show: [{ cap: "Original", px: GLYPH }], input: { k: "match", left: p.map((o, n) => ({ t: "ABCD"[n], px: S[o[1]](GLYPH) })), opts, ans: p.map(o => opts.indexOf(o[0])) }, steps: p.map((o, n) => `${"ABCD"[n]} is ${o[0]}.`) };
});
G(6, "down", "Downsampling", "Split the image into 2 × 2 blocks. Decimation keeps one pixel from each block. Region averaging replaces each block by the mean of its four pixels, rounded.", "A decimated pixel always existed in the original. An averaged pixel may be a new value.", () => {
  const L = rmat(4, 4, 0, 255), blk = (a, b) => [L[2 * a][2 * b], L[2 * a][2 * b + 1], L[2 * a + 1][2 * b], L[2 * a + 1][2 * b + 1]];
  if (ri(0, 1)) return { stem: "Downsample this 4 × 4 image to 2 × 2 by region averaging. Round to whole numbers, with .5 rounding upwards.", show: [{ m: L, kind: "grey" }], input: grid([0, 1].map(a => [0, 1].map(b => rnd(sum(blk(a, b)) / 4)))), steps: [0, 1].flatMap(a => [0, 1].map(b => `Block ${pos(a + 1, b + 1)}: (${blk(a, b).join(" + ")}) ÷ 4 = ${sum(blk(a, b)) / 4}.`)) };
  return { stem: "Downsample this 4 × 4 image to 2 × 2 by decimation.", show: [{ m: L, kind: "grey" }], input: grid([0, 1].map(a => [0, 1].map(b => blk(a, b)[0])), { any: [0, 1].map(a => [0, 1].map(b => blk(a, b))) }), steps: ["Any one pixel from each 2 × 2 block is accepted here. Taking the top-left of each block is the usual choice.", "Keep the same position in every block so the kept pixels are evenly spread."] };
});
G(6, "up", "Upsampling by nearest neighbour", "Each pixel becomes a 2 × 2 block of itself. Write every value twice along the row, then write the whole row twice.", "No new values appear. The output only contains the original numbers.", () => {
  const L = rmat(2, 2, 0, 255), o = [0, 0, 1, 1].map(a => [0, 0, 1, 1].map(b => L[a][b]));
  return { stem: "Upsample this 2 × 2 image to 4 × 4 by nearest neighbour replication.", show: [{ m: L, kind: "grey" }], input: grid(o), steps: [`Row 1 becomes ${o[0].join(" ")}, written twice.`, `Row 2 becomes ${o[2].join(" ")}, written twice.`] };
});
G(6, "bilinear", "Bilinear interpolation", "Each corner gets a weight, and the four weights add up to 1. Top-left (M−i)(N−j), top-right (M−i)j, bottom-left i(N−j), bottom-right ij, all over MN. Multiply each corner by its weight and add.", "A corner's weight uses the distance to the opposite side, so the nearest corner gets the largest weight. The answer must lie between the smallest and largest corner.", () => {
  const c = rmat(2, 2, 20, 250), M = pick([4, 8]), i = ri(1, M - 1), j = ri(1, M - 1), w = [(M - i) * (M - j), (M - i) * j, i * (M - j), i * j], v = S.bilinear(c, M, M, i, j);
  return { stem: `The 2 × 2 region below is rescaled to fill ${M} × ${M} pixels using bilinear interpolation. What is the value at position ${pos(i, j)}? Round to a whole number, with .5 rounding upwards.`, show: [{ m: c, kind: "grey" }], formula: "L(i,j) = [ L(1,1)(M−i)(N−j) + L(1,N)(M−i)j + L(M,1)i(N−j) + L(M,N)ij ] ÷ MN", input: num(rnd(v)), steps: [`Weights over ${M * M}: top-left ${w[0]}, top-right ${w[1]}, bottom-left ${w[2]}, bottom-right ${w[3]}. They add up to ${sum(w)}.`, `(${c[0][0]} × ${w[0]} + ${c[0][1]} × ${w[1]} + ${c[1][0]} × ${w[2]} + ${c[1][1]} × ${w[3]}) ÷ ${M * M} = ${v.toFixed(3)}.`, `Rounded, that is ${rnd(v)}.`] };
});

/* ================= Week 7 ================= */
const win = (L, i, j) => [-1, 0, 1].flatMap(a => [-1, 0, 1].map(b => L[i - 1 + a][j - 1 + b]));
G(7, "rank", "Rank filters on a 3 × 3 window", "Box the nine pixels around the centre and sort them. Min is the first. Max is the last. Median is the fifth. Midpoint is (min + max) ÷ 2. Range is max − min.", "The window is centred on the coordinate given, so take rows i−1 to i+1 and columns j−1 to j+1. The fourth row or column of the matrix is often not in the window.", () => {
  const L = rmat(4, 4, 0, 255), i = ri(2, 3), j = ri(2, 3), w = win(L, i, j).sort((a, b) => a - b), f = pick(["min", "max", "median", "midpoint", "range"]);
  const ans = { min: w[0], max: w[8], median: w[4], midpoint: rnd((w[0] + w[8]) / 2), range: w[8] - w[0] }[f];
  return { stem: `Calculate the output of a 3 × 3 ${f} filter centred at ${pos(i, j)}.${f === "midpoint" ? " Round .5 upwards." : ""}`, show: [{ m: L, kind: "grey", mark: [i, j] }], input: num(ans), steps: [`The window covers rows ${i - 1} to ${i + 1} and columns ${j - 1} to ${j + 1}.`, `Sorted: ${w.join(", ")}.`, { min: `The smallest is ${ans}.`, max: `The largest is ${ans}.`, median: `The fifth of nine is ${ans}.`, midpoint: `(${w[0]} + ${w[8]}) ÷ 2 = ${(w[0] + w[8]) / 2}, which gives ${ans}.`, range: `${w[8]} − ${w[0]} = ${ans}.` }[f]] };
});
G(7, "majority", "Majority filter", "Count the ones in the 3 × 3 window. Five or more ones gives 1. Four or fewer gives 0.", "Nine pixels cannot tie, so there is always a majority.", () => {
  const L = rmat(4, 4, 0, 1), i = ri(2, 3), j = ri(2, 3), n = sum(win(L, i, j));
  return { stem: `Calculate the output of a 3 × 3 majority filter centred at ${pos(i, j)} on this binary image.`, show: [{ m: L, kind: "bin", mark: [i, j] }], input: num(n >= 5 ? 1 : 0), steps: [`The window holds ${n} ones and ${9 - n} zeros.`, `The majority value is ${n >= 5 ? 1 : 0}.`] };
});
G(7, "noise", "Pick the filter for the noise", "White specks are salt, and the min filter removes them. Black specks are pepper, and the max filter removes them. Both together need the median. Fine grain all over is Gaussian noise, where the midpoint filter is the simplest choice.", "It runs opposite to what you might guess. Bright specks need the min filter, because min throws away the brightest value.", () => {
  const g = scene(44), n = (f) => map2(g, v => f(v));
  const v = shuffle([["Midpoint", n(x => clip(Math.round(x + (Math.random() + Math.random() + Math.random() - 1.5) * 50)))], ["Min filter", n(x => Math.random() < 0.07 ? 255 : x)], ["Max filter", n(x => Math.random() < 0.07 ? 0 : x)], ["Median filter", n(x => { const r = Math.random(); return r < 0.04 ? 255 : r < 0.08 ? 0 : x; })]]);
  const opts = ["Min filter", "Max filter", "Median filter", "Midpoint"];
  return { stem: "For each noisy picture, choose the simplest non-linear filter that would reduce the noise.", show: [{ cap: "Original", px: g }], input: { k: "match", left: v.map((x, k) => ({ t: "ABCD"[k], px: x[1] })), opts, ans: v.map(x => opts.indexOf(x[0])) }, steps: [] };
});
G(7, "border", "Handling the image border", "A window that hangs over the edge needs a rule. The valid choices are: only filter where the window fits (smaller output), pad with zeros, repeat the edge rows and columns, mirror them, wrap around to the opposite side, or shrink the window to what is inside.", "All six are accepted methods. The wrong options are the ones that change the picture itself.", () => {
  const good = ["Apply the window only where it fully fits, making the output smaller", "Pad with zeros around the border", "Duplicate the rows and columns at the border", "Mirror the rows and columns around the outside", "Copy pixels from the opposite side of the image", "Truncate the window so it uses only values inside the image"], bad = ["Rotate the image by 90° before filtering", "Replace border pixels with the image's median grey level and leave them unfiltered", "Double the window size at the border"];
  const o = shuffle([...shuffle(good).slice(0, ri(3, 4)), ...shuffle(bad).slice(0, ri(1, 2))]);
  return { stem: "Which of these are accepted ways to deal with the image border in a sliding window operation?", input: { k: "multi", opts: o, ans: o.map(x => good.includes(x)) }, steps: [] };
});
G(7, "facts", "Non-linear filters, facts", "Min, max and median are rank filters: they sort the window and pick by position. Min acts like erosion and max like dilation. The range filter lights up edges. The majority filter is for binary images.", "A linear filter is a weighted sum of the window. Sorting is what makes these non-linear.", fact([
  ["Non-linear filters are most often used to remove which class of noise?", "Spike, also called impulse", "Gaussian", "Uniform", "Periodic"],
  ["The min, max and median filters are together known as what kind of filter?", "Rank", "Linear", "Radon", "Frequency"],
  ["What does the non-linear range filter highlight in an image?", "Discontinuities", "Uniform areas", "Bright colours", "Saturated colours"],
  ["The majority filter is normally applied to which type of image?", "Binary", "Greyscale", "RGB colour", "Indexed colour"],
  ["Which is the most accurate description of an adaptive filter?", "It takes local measurements at each window position, such as min, max or range", "It takes global measurements of the whole image, such as min and max", "Its output is a linear combination of the pixels at each window position", "It uses the image's normalised count histogram"],
  ["The min filter behaves like which morphological operator?", "Erosion", "Dilation", "Opening", "Closing"],
  ["The max filter behaves like which morphological operator?", "Dilation", "Erosion", "Opening", "Closing"],
  ["In an 8-bit greyscale image, salt noise pixels tend towards which value?", "255", "0", "128", "127"],
  ["In an 8-bit greyscale image, pepper noise pixels tend towards which value?", "0", "255", "128", "1"],
]));

/* ================= Week 8 ================= */
const kshow = { mean3: map2(S.K.mean3, () => "1/9"), gauss: [["1/16", "1/8", "1/16"], ["1/8", "1/4", "1/8"], ["1/16", "1/8", "1/16"]] };
G(8, "mean", "Mean filter at a position", "A mean kernel is just the average of the window. Add the pixels under the kernel and divide by how many there are.", "A 5 × 5 kernel covers rows i−2 to i+2 and columns j−2 to j+2, so 25 pixels. Leave out the row and column that fall outside.", () => {
  const n = pick([3, 5]), L = n === 5 ? rmat(6, 6, 0, 255) : rmat(4, 4, 0, 255), lo = n === 5 ? 3 : 2, i = ri(lo, lo + 1), j = ri(lo, lo + 1), h = (n - 1) / 2;
  const k = Array.from({ length: n }, () => Array(n).fill(1)), s = S.corrAt(L, k, i, j);
  return { stem: `Calculate the output of the ${n} × ${n} mean kernel centred at ${pos(i, j)}. Round to a whole number, with .5 rounding upwards.`, show: [{ m: L, kind: "grey", mark: [i, j], half: h }], input: num(rnd(s / (n * n))), steps: [`The window covers rows ${i - h} to ${i + h} and columns ${j - h} to ${j + h}.`, `Those ${n * n} pixels add up to ${s}.`, `${s} ÷ ${n * n} = ${(s / (n * n)).toFixed(3)}, which rounds to ${rnd(s / (n * n))}.`] };
});
G(8, "cell", "The value in a mean kernel cell", "Every cell is 1 ÷ (number of cells). For an n × n kernel that is 1 ÷ n².", "It is n squared, not n. A 7 × 7 kernel has 49 cells.", () => {
  const n = pick([3, 5, 7, 9, 11]), v = Math.round(10000 / (n * n)) / 10000;
  return { stem: `What decimal value sits in each cell of a mean filter kernel of size ${n} × ${n}? Give 4 d.p.`, input: num(v, 0.00011), steps: [`1 ÷ ${n * n} = ${v}.`] };
});
G(8, "maxout", "Largest possible output of a kernel", "Put 255 under every positive coefficient and 0 under every negative one. So the largest output is 255 × the sum of the positive coefficients.", "Do not answer 255 just because the image is 8-bit. Sharpen can reach 1,275 and the 8-neighbour Laplacian 2,040. Mean and Gaussian do stop at 255, because their coefficients add up to 1.", () => {
  const f = pick(["mean3", "gauss", "sharpen", "emboss", "lap4", "lap8"]), k = S.K[f], p = sum(k.flat().filter(v => v > 0));
  const name = { mean3: "mean", gauss: "Gaussian", sharpen: "sharpen", emboss: "emboss", lap4: "Laplacian", lap8: "Laplacian" }[f];
  return { stem: `What is the maximum possible output at any window position of this ${name} kernel on an 8-bit greyscale image? Give the full value, not limited to 0..255.`, show: [{ cap: "k", m: kshow[f] || k, kind: "k" }], input: num(Math.round(255 * p)), steps: [`The positive coefficients add up to ${dp2(p)}.`, `255 × ${dp2(p)} = ${Math.round(255 * p)}.`, `The smallest possible output is 255 × the sum of the negative coefficients, which is ${Math.round(255 * sum(k.flat().filter(v => v < 0)))}.`] };
});
G(8, "apply", "Apply a 3 × 3 kernel at a position", "Lay the kernel over the window, multiply each pair, and add. Skip every zero coefficient. For sharpen: 5 × centre minus the four neighbours. For Gaussian: (4 × centre + 2 × the four edge neighbours + the four corners) ÷ 16.", "Sharpen can give a negative or very large number. If the question says to enter the full value, do not force it into 0..255.", () => {
  const f = pick(["gauss", "sharpen"]), L = rmat(4, 4, 0, 255), i = ri(2, 3), j = ri(2, 3), v = S.convAt(L, S.K[f], i, j), w = win(L, i, j);
  if (f === "sharpen") return { stem: `Calculate the output of the 3 × 3 sharpen kernel centred at ${pos(i, j)}. Enter the full value, not limited to 0..255.`, show: [{ m: L, kind: "grey", mark: [i, j] }, { cap: "k", m: S.K.sharpen, kind: "k" }], input: num(v), steps: [`5 × ${w[4]} = ${5 * w[4]}.`, `The four neighbours are ${w[1]}, ${w[3]}, ${w[5]} and ${w[7]}, which add up to ${w[1] + w[3] + w[5] + w[7]}.`, `${5 * w[4]} − ${w[1] + w[3] + w[5] + w[7]} = ${v}.`] };
  const e = w[1] + w[3] + w[5] + w[7], c = w[0] + w[2] + w[6] + w[8];
  return { stem: `Calculate the output of the 3 × 3 Gaussian kernel centred at ${pos(i, j)}. Round to a whole number, with .5 rounding upwards.`, show: [{ m: L, kind: "grey", mark: [i, j] }, { cap: "k", m: kshow.gauss, kind: "k" }], input: num(rnd(v)), steps: [`Centre ${w[4]} × 4 = ${4 * w[4]}.`, `Edge neighbours add up to ${e}, × 2 = ${2 * e}.`, `Corners add up to ${c}.`, `(${4 * w[4]} + ${2 * e} + ${c}) ÷ 16 = ${v.toFixed(3)}, which rounds to ${rnd(v)}.`] };
});
G(8, "emboss", "Emboss, where the kernel flip matters", "Convolution turns the kernel through 180° before use. For this emboss kernel that means the answer is bottom-right neighbour minus top-left neighbour.", "Using the kernel as printed gives the same size of answer with the wrong sign. Symmetric kernels such as mean, Gaussian, sharpen and Laplacian look the same after the turn, so there the flip changes nothing.", () => {
  const L = rmat(4, 4, 0, 255), i = ri(2, 3), j = ri(2, 3), w = win(L, i, j), v = S.convAt(L, S.K.emboss, i, j);
  return { stem: `Calculate the output of the 3 × 3 emboss kernel centred at ${pos(i, j)}, using convolution. Enter the full value.`, show: [{ m: L, kind: "grey", mark: [i, j] }, { cap: "k", m: S.K.emboss, kind: "k" }], input: num(v), steps: [`Turned through 180°, the kernel has −1 at the top-left and +1 at the bottom-right.`, `Bottom-right neighbour ${w[8]} − top-left neighbour ${w[0]} = ${v}.`, `Without the turn you would get ${-v}.`] };
});
G(8, "usm", "Unsharp mask", "usm = L + (L − blurred). At the centre that is 2 × centre − mean of the window.", "Do not limit the answer to 0..255 when the question asks for the raw value.", () => {
  const L = rmat(3, 3, 0, 255), m = S.mean(L), v = S.usm(L);
  return { stem: "Calculate the unsharp mask output at the centre of this image, using a 3 × 3 mean kernel for the blur. Round to a whole number, with .5 rounding upwards, and give the raw value.", show: [{ m: L, kind: "grey" }], formula: "usm(L) = L + (L − L∗k)", input: num(rnd(v)), steps: [`The nine pixels add up to ${sum(L.flat())}, so the blurred centre is ${m.toFixed(3)}.`, `2 × ${L[1][1]} − ${m.toFixed(3)} = ${v.toFixed(3)}.`, `Rounded, that is ${rnd(v)}.`] };
});
G(8, "plots", "Recognise the kernel from its surface plot", "Mean is flat, with every bar the same height. Gaussian is a hill, tallest in the middle. Sharpen is one tall spike with four bars going below the floor around it. Emboss has one bar up in a corner and one bar down in the opposite corner.", "Sharpen and Gaussian both peak in the middle. Only sharpen has bars below the floor.", () => {
  const v = shuffle([["Mean", S.K.mean3], ["Gaussian", S.K.gauss], ["Sharpen", S.K.sharpen], ["Emboss", S.K.emboss]]), opts = ["Mean", "Gaussian", "Sharpen", "Emboss"];
  return { stem: "Match each surface plot to its filter. A white top is a positive coefficient, a black top is a negative one that hangs below the floor, and a grey top is zero.", input: { k: "match", left: v.map((x, n) => ({ t: "ABCD"[n], svg: surfSvg(x[1]) })), opts, ans: v.map(x => opts.indexOf(x[0])) }, steps: [] };
});
G(8, "facts", "Linear filters, facts", "Linear filtering is convolution: a weighted sum of the window. Blur kernels add up to 1, which keeps brightness the same. Kernels have odd sides so there is one clear centre pixel.", "Gaussian blurs less harshly than mean and keeps edges more intact. It is not faster and it does not blur more.", fact([
  ["Linear filtering is also known as what?", "Convolution", "Composition", "Conflation", "Confounding"],
  ["Why do 2D filter kernels usually have an odd number of rows and columns?", "So that there is a clearly defined centre", "To stop the kernel overrunning the image boundary", "So that the kernel can sum to 1", "To minimise computation"],
  ["How does applying a 2D Gaussian filter change the look of an image?", "It becomes blurrier", "It becomes sharper", "It becomes darker", "Its contrast increases"],
  ["What is the advantage of the Gaussian filter over the mean filter?", "It leaves edges more intact", "It is faster to perform", "It produces more blur", "It works in more dimensions"],
  ["The coefficients of a mean or Gaussian kernel add up to what number?", "1", "0", "9", "255"],
  ["How does convolution differ from cross correlation?", "Convolution flips the kernel horizontally and vertically first", "Convolution uses a larger kernel", "Cross correlation only works on binary images", "Cross correlation flips the image first"],
]));

/* ================= Week 9 ================= */
G(9, "laplace", "Laplacian at a position", "4-neighbour version: 4 × centre minus up, down, left and right. 8-neighbour version: 8 × centre minus all eight neighbours, which is 9 × centre minus the sum of the whole window.", "The answer is often negative. Enter it as it comes. The Laplacian is symmetric, so the kernel flip changes nothing.", () => {
  const f = pick(["lap4", "lap8"]), L = rmat(4, 4, 0, 255), i = ri(2, 3), j = ri(2, 3), w = win(L, i, j), v = S.convAt(L, S.K[f], i, j);
  return { stem: `Calculate the output of the 3 × 3 Laplacian kernel centred at ${pos(i, j)}. The answer may be negative.`, show: [{ m: L, kind: "grey", mark: [i, j] }, { cap: "k", m: S.K[f], kind: "k" }], input: num(v), steps: f === "lap4" ? [`4 × ${w[4]} = ${4 * w[4]}.`, `Up, left, right and down add up to ${w[1] + w[3] + w[5] + w[7]}.`, `${4 * w[4]} − ${w[1] + w[3] + w[5] + w[7]} = ${v}.`] : [`The whole window adds up to ${sum(w)}.`, `9 × ${w[4]} − ${sum(w)} = ${v}.`] };
});
G(9, "kirsch", "Kirsch compass", "Every Kirsch kernel has three 5s side by side on the outer ring and five −3s. So each output is 8 × (those three neighbours) − 3 × (all eight neighbours). Find the three neighbours in a row around the ring with the largest total and use that.", "The centre pixel has coefficient 0, so leave it out. The three must be next to each other going round the ring, and the ring wraps past the corner.", () => {
  const L = rmat(3, 3, 0, 255), ring = S.RING.map(([a, b]) => L[a][b]), tot = sum(ring), tri = ring.map((_, z) => ring[z] + ring[(z + 1) % 8] + ring[(z + 2) % 8]), best = Math.max(...tri), z = tri.indexOf(best);
  return { stem: "Calculate the combined output of the Kirsch compass kernel bank for this image. The combined output is the largest of the eight kernel outputs.", show: [{ m: L, kind: "grey" }, { cap: "k(1)", m: S.kirschBank()[0], kind: "k" }, { cap: "k(2)", m: S.kirschBank()[1], kind: "k" }], input: num(S.kirsch(L)), steps: [`Going clockwise from the top-left, the ring is ${ring.join(", ")}. It adds up to ${tot}.`, `The best three in a row are ${ring[z]}, ${ring[(z + 1) % 8]} and ${ring[(z + 2) % 8]}, which add up to ${best}.`, `8 × ${best} − 3 × ${tot} = ${8 * best - 3 * tot}.`] };
});
G(9, "roberts", "Roberts cross", "On a 2 × 2 patch, Gx is top-left minus bottom-right, and Gy is top-right minus bottom-left. Then combine as the question says: larger absolute value, sum of absolute values, or √(Gx² + Gy²).", "Read which combining rule is asked for. Signs disappear in all three, so the kernel flip does not change the answer.", () => {
  const L = rmat(2, 2, 0, 255), gx = L[0][0] - L[1][1], gy = L[0][1] - L[1][0], f = pick(["max", "sum", "pyth"]);
  const ans = { max: Math.max(Math.abs(gx), Math.abs(gy)), sum: Math.abs(gx) + Math.abs(gy), pyth: rnd(Math.hypot(gx, gy)) }[f];
  return { stem: `Calculate the edge gradient when the Roberts cross pair is applied, using ${{ max: "max(|Gx|, |Gy|)", sum: "|Gx| + |Gy|", pyth: "√(Gx² + Gy²), rounded to a whole number with .5 rounding upwards" }[f]}.`, show: [{ m: L, kind: "grey" }, { cap: "kx", m: S.K.robX, kind: "k" }, { cap: "ky", m: S.K.robY, kind: "k" }], input: num(ans), steps: [`Gx = ${L[0][0]} − ${L[1][1]} = ${gx}.`, `Gy = ${L[0][1]} − ${L[1][0]} = ${gy}.`, `Combined: ${ans}.`] };
});
G(9, "gradient", "Prewitt and Sobel gradient", "Gx is the left column minus the right column. Gy is the top row minus the bottom row. Sobel counts the middle entry of each twice. Prewitt counts all three once. Magnitude is √(Gx² + Gy²). Direction is arctan(Gy ÷ Gx) in degrees.", "Set the calculator to degrees. The kernel flip reverses the sign of both Gx and Gy, so the magnitude and the angle come out the same either way.", () => {
  for (;;) {
    const op = pick(["Prewitt", "Sobel"]), L = rmat(3, 3, 0, 255), m = op === "Sobel" ? 2 : 1, f = pick(["mag", "angle"]);
    const gx = (L[0][0] + m * L[1][0] + L[2][0]) - (L[0][2] + m * L[1][2] + L[2][2]), gy = (L[0][0] + m * L[0][1] + L[0][2]) - (L[2][0] + m * L[2][1] + L[2][2]);
    if (gx === 0) continue;
    const kx = S.K[op.toLowerCase() + "X"], ky = S.K[op.toLowerCase() + "Y"];
    const steps = [`Gx = left column − right column = ${L[0][0] + m * L[1][0] + L[2][0]} − ${L[0][2] + m * L[1][2] + L[2][2]} = ${gx}.`, `Gy = top row − bottom row = ${L[0][0] + m * L[0][1] + L[0][2]} − ${L[2][0] + m * L[2][1] + L[2][2]} = ${gy}.`];
    if (f === "mag") return { stem: `Calculate the edge gradient when the 3 × 3 ${op} pair is applied at the centre, using √(Gx² + Gy²). Round to a whole number, with .5 rounding upwards.`, show: [{ m: L, kind: "grey" }, { cap: "kx", m: kx, kind: "k" }, { cap: "ky", m: ky, kind: "k" }], input: num(rnd(Math.hypot(gx, gy))), steps: [...steps, `√(${gx * gx} + ${gy * gy}) = ${Math.hypot(gx, gy).toFixed(3)}, which rounds to ${rnd(Math.hypot(gx, gy))}.`] };
    const a = dp2(Math.atan(gy / gx) * 180 / Math.PI);
    return { stem: `Calculate the gradient direction when the 3 × 3 ${op} pair is applied at the centre, using θ = arctan(Gy ÷ Gx). Give degrees to 2 d.p.`, show: [{ m: L, kind: "grey" }, { cap: "kx", m: kx, kind: "k" }, { cap: "ky", m: ky, kind: "k" }], input: num(a, TOL), steps: [...steps, `arctan(${gy} ÷ ${gx}) = arctan(${(gy / gx).toFixed(4)}) = ${a}°.`] };
  }
});
G(9, "impulse", "Convolution and cross correlation on a single 1", "When the image is one 1 on a field of zeros, convolution copies the kernel into the output and cross correlation copies the kernel turned through 180°.", "It feels backwards. Convolution flips the kernel, and sliding it past a single point flips it again, so the kernel comes out the right way round.", () => {
  const L = Array.from({ length: 5 }, () => Array(5).fill(0)); L[2][2] = 1; const k = rmat(3, 3, 1, 9);
  return { stem: "Perform cross correlation and convolution of this image with the kernel, using the valid approach at the boundary, so each output is 3 × 3.", show: [{ cap: "L", m: L, kind: "plain" }, { cap: "k", m: k, kind: "k" }], input: [{ ...grid(S.validCorr(L, k)), cap: "Cross correlation" }, { ...grid(S.validConv(L, k)), cap: "Convolution" }], steps: [`Cross correlation gives ${mt(S.validCorr(L, k))}, the kernel turned through 180°.`, `Convolution gives ${mt(S.validConv(L, k))}, the kernel itself.`] };
});
G(9, "convcorr", "Convolution and cross correlation, full working", "Valid means the kernel must fit entirely, so a 4 × 4 image and a 3 × 3 kernel give a 2 × 2 output. Cross correlation uses the kernel as printed. Convolution first turns it through 180°: reverse the order of all nine numbers.", "Write the turned kernel down before you start. The two outputs differ unless the kernel is symmetric.", () => {
  const L = rmat(4, 4, 0, 4), k = rmat(3, 3, 0, 3), fk = S.flip180(k);
  return { stem: "Perform cross correlation and convolution of this image with the kernel, using the valid approach at the boundary, so each output is 2 × 2.", show: [{ cap: "L", m: L, kind: "plain" }, { cap: "k", m: k, kind: "k" }], input: [{ ...grid(S.validCorr(L, k)), cap: "Cross correlation" }, { ...grid(S.validConv(L, k)), cap: "Convolution" }], steps: [`Cross correlation, kernel as printed: ${mt(S.validCorr(L, k))}.`, `Kernel turned through 180°: ${mt(fk)}.`, `Convolution, using the turned kernel: ${mt(S.validConv(L, k))}.`] };
});
G(9, "mse", "Template matching with mean square error", "Subtract the template from the patch entry by entry, square each difference, add them up, and divide by the number of entries, which is w².", "Square before adding, so negatives cannot cancel. A perfect match gives 0, and a lower score means a better match.", () => {
  const L = rmat(3, 3, 0, 255), t = rmat(3, 3, 0, 255), d = L.flat().map((v, n) => (v - t.flat()[n]) ** 2);
  return { stem: "Calculate the mean square error between image patch L and template t. Give 2 d.p.", show: [{ cap: "L", m: L, kind: "grey" }, { cap: "t", m: t, kind: "grey" }], input: num(dp2(S.mse(L, t)), TOL), steps: [`Squared differences: ${d.join(", ")}.`, `They add up to ${sum(d)}.`, `${sum(d)} ÷ 9 = ${dp2(S.mse(L, t))}.`] };
});
G(9, "plots", "Recognise the edge kernel from its surface plot", "Roberts is the only 2 × 2. Laplacian has one tall centre with negative bars around it. Sobel and Prewitt both have a positive row, a zero row and a negative row, and Sobel's middle bars are twice as tall.", "Sobel and Prewitt look alike. Check whether the bars in each row are level (Prewitt) or peaked in the middle (Sobel).", () => {
  const v = shuffle([["Roberts cross", S.K.robX], ["Laplacian", S.K.lap4], ["Sobel", S.K.sobelY], ["Prewitt", S.K.prewittY]]), opts = ["Roberts cross", "Laplacian", "Sobel", "Prewitt"];
  return { stem: "Match each surface plot to its edge detection filter. A white top is a positive coefficient, a black top is a negative one that hangs below the floor, and a grey top is zero.", input: { k: "match", left: v.map((x, n) => ({ t: "ABCD"[n], svg: surfSvg(x[1]) })), opts, ans: v.map(x => opts.indexOf(x[0])) }, steps: [] };
});
G(9, "facts", "Edge detection, facts", "Edge kernels add up to 0, so a flat area gives no output. Blur with a Gaussian before a Laplacian to calm the noise. √(Gx² + Gy²) is the accurate magnitude, and the other two are quick estimates. Canny is the standard method.", "The morphological match for an edge detector is the gradient, not opening or closing.", fact([
  ["Which morphological operator has an effect most like convolution with an edge detection kernel?", "Outer gradient", "Closing", "Opening", "Erosion"],
  ["The coefficients in a linear edge detection kernel typically add up to what number?", "0", "1", "9", "255"],
  ["Which linear filter is sometimes applied before a Laplacian filter to reduce noise?", "Gaussian", "Sobel", "Prewitt", "Emboss"],
  ["Which is the most accurate way to calculate edge gradient magnitude from Gx and Gy?", "Pythagorean, √(Gx² + Gy²)", "Absolute sum, |Gx| + |Gy|", "Absolute max, max(|Gx|, |Gy|)", "Plain sum, Gx + Gy"],
  ["What is the current de facto approach for effective edge detection?", "Canny", "Sobel", "Kirsch compass", "Roberts cross"],
  ["What is the largest possible output of the 8-neighbour Laplacian, with 8 at the centre, on an 8-bit image?", "2,040", "255", "1,020", "2,295"],
  ["For which of these kernels does the 180° flip in convolution change the output value?", "Emboss", "Mean", "Gaussian", "Laplacian"],
]));

/* ================= Week 10 ================= */
const bits = v => v.toString(2).padStart(8, "0");
G(10, "binary", "Binary and decimal", "The column values are 128, 64, 32, 16, 8, 4, 2, 1. To read binary, add the columns that hold a 1. To write binary, subtract the largest column that fits and repeat.", "The right-hand bit is worth 1, not 2. Eight ones is 255.", () => {
  const v = ri(1, 255);
  return ri(0, 1) ? { stem: `Convert the 8-bit binary number ${bits(v)} to decimal.`, input: num(v), steps: [`Columns with a 1: ${[128, 64, 32, 16, 8, 4, 2, 1].filter((c, n) => bits(v)[n] === "1").join(" + ")} = ${v}.`] }
    : { stem: `Write the pixel value ${v} as an 8-bit binary number.`, input: { k: "num", ans: bits(v), tol: 0, pad: 8 }, steps: [`${v} = ${[128, 64, 32, 16, 8, 4, 2, 1].filter((c, n) => bits(v)[n] === "1").join(" + ")}.`, `So the bits are ${bits(v)}.`] };
});
G(10, "planes", "Extract a bit-plane", "The least significant bit is 1 for an odd pixel and 0 for an even pixel. The most significant bit is 1 for a pixel of 128 or more.", "Zero counts as even. The MSB plane is the same as thresholding at 128.", () => {
  const L = rmat(3, 3, 0, 255), f = pick(["LSB", "MSB"]);
  return { stem: `Enter the ${f === "LSB" ? "least" : "most"} significant bit-plane of this 8-bit image.`, show: [{ m: L, kind: "grey" }], input: grid(map2(L, v => f === "LSB" ? v % 2 : (v >= 128 ? 1 : 0))), steps: [f === "LSB" ? "Odd pixels give 1. Even pixels give 0." : "Pixels of 128 or more give 1. The rest give 0."] };
});
G(10, "embed", "Hide a message in the least significant bits", "Compare each pixel with its message bit. If the pixel is already odd for a 1, or even for a 0, leave it. If the bit is 1 and the pixel is even, add 1. If the bit is 0 and the pixel is odd, subtract 1.", "No pixel ever moves by more than 1. An even pixel can only go up and an odd pixel can only go down.", () => {
  const L = rmat(3, 3, 0, 255), B = rmat(3, 3, 0, 1), o = map2(L, (v, i, j) => v - v % 2 + B[i][j]);
  return { stem: "Replace the least significant bit of each pixel in L with the matching bit of the message. Enter the new image.", show: [{ cap: "L", m: L, kind: "grey" }, { cap: "Message bits", m: B, kind: "bin" }], input: grid(o), steps: [`The existing LSBs are ${mt(map2(L, v => v % 2))}.`, `${o.flat().filter((v, n) => v !== L.flat()[n]).length} pixels need to change, each by exactly 1.`] };
});
G(10, "ascii", "Read a hidden ASCII message", "Subtract the offset from each pixel to get the ASCII code. Capital letters start at A = 65, so code − 64 is the letter's place in the alphabet. Lower case starts at a = 97. A space is 32.", "Take the offset off before looking up the letter. The sender added it, so the reader subtracts it.", () => {
  const word = pick(["PIXEL", "IMAGE", "KERNEL", "EDGE", "NOISE", "MASK", "SOBEL", "GAMMA", "FILTER", "BLUR"]), off = pick([0, 3, 5, 10, 20]);
  const px = [...word].map(c => c.charCodeAt(0) + off);
  return { stem: `These pixel values hide a word in ASCII, with an offset of ${off} added to every code. A is 65. What is the word?`, show: [{ m: [px], kind: "plain" }], input: { k: "text", ans: word }, steps: [`Subtract ${off}: ${px.map(v => v - off).join(", ")}.`, `Subtract 64 for the place in the alphabet: ${px.map(v => v - off - 64).join(", ")}.`, `The word is ${word}.`] };
});
G(10, "facts", "Watermarking and steganography, facts", "The hidden message is the payload and the image that hides it is the carrier. A robust watermark survives editing. A fragile one breaks, which is how tampering is detected. LSB hiding works because a change of 1 cannot be seen.", "One 8-bit greyscale image needs 8 carrier bit-planes. Three RGB carriers give 9, one more than needed.", fact([
  ["A watermark that survives cropping, rotation, filtering and lossy compression is described as what?", "Robust", "Fragile", "Visible", "Tiled"],
  ["What is a fragile watermark useful for?", "Detecting that an image has been tampered with", "Proving ownership after heavy editing", "Compressing the image", "Removing noise"],
  ["In steganography, what is the hidden message called?", "The payload", "The carrier", "The cover", "The key"],
  ["In steganography, what is the data that hides the message called?", "The carrier", "The payload", "The cipher", "The offset"],
  ["Which bit of each pixel is normally changed to hide a message?", "The least significant bit", "The most significant bit", "The fourth bit", "Every bit"],
  ["What does the most significant bit-plane of a greyscale image look like?", "A binarised version of the image", "Random noise", "A blurred version of the image", "The image with inverted grey levels"],
  ["What does the least significant bit-plane of a camera image usually look like?", "Noise", "A binarised version of the image", "A blank white image", "The image edges"],
  ["After LSB embedding, by how much can a pixel value change at most?", "1", "2", "8", "128"],
  ["Why should a well-known image not be used as a carrier?", "Subtracting a clean copy reveals the changed pixels", "Well-known images are too large", "Well-known images have no least significant bits", "Well-known images cannot be saved without compression"],
  ["How can a visible watermark that was added with image arithmetic be removed?", "Subtract the watermark image, provided no pixels were clipped", "Apply a median filter", "Take the most significant bit-plane", "Rotate the image by 180°"],
  ["How many greyscale carrier images are needed to hide one 8-bit greyscale image in their least significant bits?", "8", "1", "3", "24"],
  ["How many RGB carrier images are needed to hide one 8-bit greyscale image in their least significant bits?", "3, with one bit-plane spare", "1", "8", "24"],
  ["How many greyscale carrier images are needed to hide one RGB image in their least significant bits?", "24", "8", "3", "16"],
  ["Adding a fixed offset to every ASCII code before hiding it is a form of which cipher?", "Caesar cipher", "Vigenère cipher", "One-time pad", "RSA"],
]));

/* ================= Week 11 ================= */
G(11, "dc", "The DC value of a spectrum", "The DC value at the centre of the shifted spectrum stands for the arithmetic mean of the image. Add the pixels and divide by the count.", "It is the mean brightness, not the largest value and not the sum.", () => {
  const L = rmat(3, 3, 0, 255);
  return { stem: "What mean value does the DC component of this image's spectrum represent? Give 2 d.p.", show: [{ m: L, kind: "grey" }], input: num(dp2(S.mean(L)), TOL), steps: [`Sum = ${sum(L.flat())}. Divide by 9 to get ${dp2(S.mean(L))}.`] };
});
G(11, "magnitude", "Magnitude of a complex number", "|a + bi| = √(a² + b²). Square the real part, square the imaginary part, add, and take the square root.", "The i is not squared into a minus sign here. The magnitude is never negative, and it throws the phase away.", () => {
  const a = ri(-40, 40), b = ri(-40, 40) || 7;
  return { stem: `One value of a Fourier transform is ${a} ${b < 0 ? "−" : "+"} ${Math.abs(b)}i. What is its magnitude? Give 2 d.p.`, input: num(dp2(Math.hypot(a, b)), TOL), steps: [`√(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b} = ${dp2(Math.hypot(a, b))}.`] };
});
G(11, "samples", "Samples in a sine wave", "Number of samples = sample rate × duration. Number of full cycles = frequency × duration.", "Frequency does not change how many samples there are.", () => {
  const rate = pick([8000, 22050, 44100, 48000]), d = pick([0.5, 1, 2, 3]), f = ri(2, 20);
  return ri(0, 1) ? { stem: `A ${f} Hz sine wave lasts ${d} s and is generated at a sample rate of ${big(rate)}. How many amplitude values does it contain?`, input: num(rate * d), steps: [`${big(rate)} × ${d} = ${big(rate * d)}.`, `The ${f} Hz frequency is not needed.`] }
    : { stem: `A ${f} Hz sine wave lasts ${d} s and is generated at a sample rate of ${big(rate)}. How many full cycles does it complete?`, input: num(f * d), steps: [`${f} cycles each second for ${d} s gives ${f * d}.`] };
});
G(11, "spectra", "Match stripes to spectra", "Each spectrum has a centre dot and one pair of dots. The pair sits along the direction in which brightness changes, so vertical stripes give a horizontal pair. More stripes push the pair further from the centre.", "The pair is at right angles to the stripes, not along them.", () => {
  const v = shuffle([[3, 0], [7, 0], [4, 90], [5, 45]]), sp = shuffle(v), opts = ["1", "2", "3", "4"];
  return { stem: "Match striped pictures A to D to magnitude spectra 1 to 4.", show: sp.map((s, n) => ({ cap: "Spectrum " + (n + 1), svg: spectrumSvg(s[0], s[1]) })), input: { k: "match", left: v.map((g, n) => ({ t: "ABCD"[n], px: grating(g[0], g[1]) })), opts, ans: v.map(g => sp.indexOf(g)) }, steps: ["Vertical stripes change brightness as you move left to right, so their dots lie on a horizontal line.", "The picture with more stripes has its dots further out."] };
});
G(11, "masks", "Recognise the frequency filter mask", "White passes and black blocks. Low frequencies are at the centre. A white disc in the middle is low-pass. A black disc in the middle is high-pass. A white ring is band-pass. A black ring is band-reject.", "Name the filter after what the white area keeps.", () => {
  const v = shuffle([["Low-pass", "low"], ["High-pass", "high"], ["Band-pass", "bandpass"], ["Band-reject", "bandreject"]]), opts = ["Low-pass", "High-pass", "Band-pass", "Band-reject"];
  return { stem: "Match each ideal filter mask to its name. The mask is multiplied with the shifted spectrum.", input: { k: "match", left: v.map((x, n) => ({ t: "ABCD"[n], svg: maskSvg(x[1]) })), opts, ans: v.map(x => opts.indexOf(x[0])) }, steps: [] };
});
G(11, "facts", "Spatial frequency, facts", "Any image can be built by adding 2D sine waves. The Fourier transform finds them. In the shifted spectrum the centre is the mean, distance from the centre is frequency in cycles per image, and the angle of the dots follows the angle of the pattern.", "Periodic noise shows up as a few bright dots in the spectrum. Blank those dots out and transform back. Sliding window filters cannot do this.", fact([
  ["What is the number of cycles a sine wave completes per unit of time called?", "Frequency", "Phase", "Peak amplitude", "Sample rate"],
  ["What is the point in its cycle at which a sine wave begins called?", "Phase", "Frequency", "Peak amplitude", "Rest state"],
  ["What is the largest displacement of a sine wave from its rest state called?", "Peak amplitude", "Phase", "Frequency", "Cycle"],
  ["Adding sine waves of different frequency, amplitude and phase to build a signal is called what?", "Superposition", "Decomposition", "Decimation", "Convolution"],
  ["Which algorithm is normally used to carry out a Discrete Fourier Transform?", "The Fast Fourier Transform", "The Canny algorithm", "Histogram equalisation", "The Kirsch compass"],
  ["What does the DC value at the centre of a shifted magnitude spectrum represent?", "The arithmetic mean of the image", "The highest frequency in the image", "The phase of the image", "The number of pixels"],
  ["In an image spectrum, frequency is measured in what unit?", "Cycles per image", "Hertz", "Pixels per second", "Bits per pixel"],
  ["Where are the low frequency components in a shifted magnitude spectrum?", "Nearest the centre", "At the four corners", "Along the top edge", "Spread evenly"],
  ["A picture of vertical stripes gives bright dots where in its spectrum?", "Either side of the centre, on a horizontal line", "Above and below the centre, on a vertical line", "In the four corners", "Only at the centre"],
  ["If a striped pattern is rotated, what happens to its magnitude spectrum?", "It rotates by the same angle", "It does not change", "It rotates the opposite way", "Its dots move closer to the centre"],
  ["Why is a logarithm applied to a magnitude spectrum before it is displayed?", "So that weak high frequency components become visible", "To remove the phase", "To move the DC value to the centre", "To speed up the transform"],
  ["What does the shift operation do to a raw magnitude spectrum?", "It moves the DC value to the centre", "It removes the phase", "It applies a logarithm", "It converts it back to the spatial domain"],
  ["What is a frequency filter built from a hard-edged binary mask called?", "An ideal or brick wall filter", "A Butterworth filter", "A Gaussian filter", "A Gabor filter"],
  ["Why is a Gaussian or Butterworth mask preferred to a binary mask?", "It tapers gradually, which causes less distortion", "It is faster to compute", "It removes the DC value", "It keeps the phase"],
  ["What is the most effective way to remove periodic noise from an image?", "Remove its peaks in the spatial frequency domain", "Apply a median filter", "Apply a Gaussian blur", "Use histogram equalisation"],
  ["What information does the magnitude spectrum discard?", "Phase", "Frequency", "Orientation", "Amplitude"],
  ["What shape of mask makes a filter that is tuned to orientation?", "A wedge from the centre", "A disc at the centre", "A ring around the centre", "A square in one corner"],
]));

if (typeof module !== "undefined") module.exports = { S, GENS, rnd };
