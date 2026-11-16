// Checks the solvers against answers Canvas marked right in the weekly quizzes,
// then runs every generator many times to make sure each question is well formed.
// Usage: node test.js
const { S, GENS, rnd } = require("./src/gens.js");
let fails = 0, n = 0;
const eq = (name, got, want) => { n++; const g = JSON.stringify(got), w = JSON.stringify(want); if (g !== w) { fails++; console.log("FAIL", name, "got", g, "want", w); } };
const d2 = x => Math.round(x * 100) / 100;

// Quiz 01
eq("binary bytes", S.bytesBinary(323, 429), 17321);
eq("indexed bytes", S.bytesIndexed(504, 312, 248), 157992);
eq("min bits", S.minBits(20825), 15);
// Quiz 02
eq("city block", S.city([127, 24], [273, 133]), 255);
eq("chessboard", S.chess([44, 148], [196, 96]), 152);
eq("euclid", d2(S.euclid([105, 141], [119, 85])), 57.72);
eq("arith mean", d2(S.mean([[166, 96, 73], [60, 183, 37], [180, 69, 14]])), 97.56);
eq("harmonic", d2(S.harmonic([[121, 219, 12], [115, 162, 21], [76, 106, 255]])), 48.61);
eq("geometric", rnd(S.geometric([[213, 12, 126], [45, 243, 198], [168, 194, 242]])), 121);
eq("geometric 2", rnd(S.geometric([[144, 225, 202], [59, 221, 73], [166, 200, 46]])), 128);
eq("norm range", d2(S.range([[223, 161, 88, 27], [16, 80, 154, 117], [2, 77, 214, 211], [36, 81, 243, 211]]) / 255), 0.95);
eq("michelson", d2(S.michelson([[76, 174, 62, 128], [32, 101, 96, 161], [224, 32, 17, 92], [61, 181, 203, 242]])), 0.87);
eq("rms", d2(S.rms([[158, 72, 227], [40, 78, 102], [61, 136, 127]])), 54.55);
// Canvas shows the student's own entry as the right answer when it falls inside the question's margin.
// 47.49 was accepted here, and the exact value is 48.14. The same goes for 25.32 against 25.33 below.
eq("rms 2", d2(S.rms([[60, 105, 103], [177, 34, 93], [162, 141, 177]])), 48.14);
// Quiz 03
eq("lightness", S.lightness([32, 176, 202]), 117);
eq("average", S.average([227, 117, 111]), 152);
const L3 = [[0, 5, 5, 7, 3], [0, 2, 1, 1, 1], [4, 4, 2, 5, 5], [1, 6, 6, 2, 5], [3, 6, 6, 0, 1]];
eq("hist", S.hist(L3, 8), [3, 5, 3, 2, 2, 5, 4, 1]);
eq("cumul", S.cumul(S.hist(L3, 8)), [3, 8, 11, 13, 15, 20, 24, 25]);
// Quiz 04
const L4 = [[134, 60, 92], [14, 140, 15], [92, 120, 10]];
eq("stretch", [10, 14, 15, 60, 92, 134, 140].map(v => S.stretch(v, 10, 140)), [0, 8, 10, 98, 161, 243, 255]);
eq("percentile", S.percentile([[134, 60, 92, 86], [14, 140, 150, 88], [92, 120, 100, 101], [216, 99, 95, 67]], 0.9), 150);
eq("equalise", S.levels(L4).map(v => S.equalise(L4)[v]), [0, 32, 64, 96, 159, 191, 223, 255]);
// Quiz 05
eq("dilate", S.dilate([[0, 0, 0, 0, 0], [0, 0, 0, 1, 0], [0, 1, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]]), [[0, 0, 0, 1, 0], [0, 1, 1, 1, 1], [1, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]]);
eq("erode", S.erode([[0, 0, 0, 1, 0], [0, 0, 1, 1, 1], [1, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]]), [[0, 0, 0, 0, 0], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]);
eq("close", S.close([[0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 1, 0, 1, 0], [0, 1, 0, 1, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]]), [[0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]]);
eq("open", S.open([[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 0, 0]]), [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]);
eq("gradient", S.gradient([[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]]), [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [1, 1, 0, 1, 1], [1, 1, 0, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]]);
eq("corners", S.corners([[0, 0, 0, 0, 0], [0, 1, 1, 0, 0], [0, 1, 1, 0, 0], [0, 1, 0, 1, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]]), [[0, 0, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 0, 0]]);
// Quiz 06
const T = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
eq("flipLR", S.flipLR(T), [[3, 2, 1], [6, 5, 4], [9, 8, 7]]);
eq("flipUD", S.flipUD(T), [[7, 8, 9], [4, 5, 6], [1, 2, 3]]);
eq("rot180", S.rot180(T), [[9, 8, 7], [6, 5, 4], [3, 2, 1]]);
eq("rot+90", S.rotP90(T), [[7, 4, 1], [8, 5, 2], [9, 6, 3]]);
eq("rot-90", S.rotM90(T), [[3, 6, 9], [2, 5, 8], [1, 4, 7]]);
eq("transpose", S.transpose(T), [[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
eq("antiT", S.antiT(T), [[9, 6, 3], [8, 5, 2], [7, 4, 1]]);
eq("bilinear", rnd(S.bilinear([[215, 225], [148, 234]], 8, 8, 6, 4)), 198);
// Quiz 08
const L8 = [[219, 203, 238, 190], [225, 241, 65, 150], [232, 175, 18, 157], [88, 251, 52, 61]];
eq("sharpen", S.convAt(L8, S.K.sharpen, 2, 3), -322);
eq("emboss", S.convAt([[53, 95, 174, 197], [44, 110, 156, 162], [64, 42, 34, 241], [18, 64, 247, 140]], S.K.emboss, 2, 3), 146);
eq("gauss", rnd(S.convAt([[219, 120, 67, 83], [198, 105, 205, 219], [167, 18, 20, 201], [248, 205, 35, 142]], S.K.gauss, 2, 3)), 129);
const five = Array.from({ length: 5 }, () => Array(5).fill(1));
eq("mean 5x5", rnd(S.corrAt([[62, 70, 135, 148, 214, 166], [192, 93, 118, 148, 246, 225], [158, 11, 144, 85, 249, 176], [198, 18, 107, 88, 146, 134], [121, 190, 47, 124, 1, 172], [45, 227, 236, 100, 185, 21]], five, 4, 3) / 25), 131);
eq("usm", rnd(S.usm([[149, 142, 13], [138, 249, 66], [69, 34, 242]])), 376);
eq("max mean", Math.round(S.maxOut(S.K.mean3)), 255);
eq("max emboss", S.maxOut(S.K.emboss), 255);
// Quiz 09
eq("laplacian", S.convAt([[61, 162, 19, 84], [45, 36, 33, 195], [60, 93, 242, 112], [73, 104, 12, 19]], S.K.lap4, 2, 2), -189);
eq("max lap8", S.maxOut(S.K.lap8), 2040);
eq("kirsch", S.kirsch([[104, 58, 28], [93, 181, 37], [233, 75, 145]]), 1305);
const P = [[249, 55, 171], [79, 237, 54], [109, 117, 191]];
eq("prewitt", rnd(Math.hypot(S.corrAt(P, S.K.prewittX, 2, 2), S.corrAt(P, S.K.prewittY, 2, 2))), 62);
const Sb = [[191, 5, 224], [91, 151, 251], [126, 140, 240]];
eq("sobel angle", d2(Math.atan(S.corrAt(Sb, S.K.sobelY, 2, 2) / S.corrAt(Sb, S.K.sobelX, 2, 2)) * 180 / Math.PI), 25.33);
eq("sobel angle flipped", d2(Math.atan(S.convAt(Sb, S.K.sobelY, 2, 2) / S.convAt(Sb, S.K.sobelX, 2, 2)) * 180 / Math.PI), 25.33);
eq("mse", d2(S.mse([[204, 210, 120], [207, 16, 188], [183, 168, 206]], [[163, 234, 249], [200, 166, 141], [230, 78, 230]])), 6060.11);
const imp = Array.from({ length: 5 }, () => Array(5).fill(0)); imp[2][2] = 1;
eq("impulse conv = kernel", S.validConv(imp, T), T);
eq("impulse corr = flipped kernel", S.validCorr(imp, T), S.flip180(T));

console.log(n - fails, "of", n, "solver checks match the Canvas answers");

// Every generator, many times.
let made = 0;
const bad = (g, why) => { fails++; console.log("BAD", g.id, why); };
const checkInput = (g, inp) => {
  if (inp.k === "num") { if (typeof inp.ans === "number" ? !Number.isFinite(inp.ans) : !/^\d+$/.test(inp.ans)) bad(g, "num answer " + inp.ans); }
  else if (inp.k === "grid") { if (!inp.ans.length || inp.ans.some(r => r.length !== inp.ans[0].length || r.some(v => !Number.isFinite(v)))) bad(g, "grid"); }
  else if (inp.k === "fields") { if (inp.labels.length !== inp.ans.length || inp.ans.some(v => !Number.isFinite(v))) bad(g, "fields"); }
  else if (inp.k === "mc") { if (inp.opts.length !== 4 || inp.ans < 0 || new Set(inp.opts).size !== 4) bad(g, "mc"); }
  else if (inp.k === "multi") { if (inp.opts.length !== inp.ans.length || !inp.ans.some(Boolean)) bad(g, "multi"); }
  else if (inp.k === "match") { if (inp.left.length !== inp.ans.length || inp.ans.some(a => a < 0 || a >= inp.opts.length)) bad(g, "match"); }
  else if (inp.k === "text") { if (!inp.ans) bad(g, "text"); }
  else bad(g, "unknown input " + inp.k);
};
for (const g of GENS) for (let k = 0; k < 300; k++) {
  let q; try { q = g.make(); } catch (e) { bad(g, e.message); break; }
  made++;
  if (!q.stem || !q.input || !Array.isArray(q.steps)) { bad(g, "shape"); break; }
  [].concat(q.input).forEach(i => checkInput(g, i));
  const text = JSON.stringify([q.stem, q.steps]);
  if (/NaN|undefined|Infinity/.test(text)) { bad(g, "NaN or undefined in text"); break; }
}
const ids = GENS.map(g => g.id);
if (new Set(ids).size !== ids.length) { fails++; console.log("duplicate generator id"); }
console.log(GENS.length, "question types,", made, "questions generated");
for (let w = 1; w <= 11; w++) console.log("week", w, GENS.filter(g => g.w === w).length, "types");
if (fails) { console.log(fails, "failure(s)"); process.exit(1); }
console.log("all good");
