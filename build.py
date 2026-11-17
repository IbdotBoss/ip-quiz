"""Build index.html and docs/index.html from template.html, src/gens.js, src/cards and the fonts.

Runs test.js first and writes nothing if it fails.
Usage: python build.py
"""
import base64, glob, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
test = subprocess.run(["node", "test.js"], cwd=HERE, capture_output=True, text=True)
print(test.stdout.strip().splitlines()[-1] if test.stdout.strip() else test.stderr)
if test.returncode:
    print(test.stdout)
    sys.exit("tests failed; nothing written")

tpl = open(os.path.join(HERE, "template.html"), encoding="utf8").read()
assert all(k in tpl for k in ("/*FONT*/", "/*MONO*/", "/*GENS*/", "/*IMG*/", "/*CARDS*/"))
b64 = lambda name: base64.b64encode(open(os.path.join(HERE, "fonts", name), "rb").read()).decode()
gens = open(os.path.join(HERE, "src", "gens.js"), encoding="utf8").read().replace("</", "<\\/")

# One file of cards per quiz, written from the captured Canvas attempts.
cards = {}
for path in sorted(glob.glob(os.path.join(HERE, "src", "cards", "quiz*.json"))):
    d = json.load(open(path, encoding="utf8"))
    cards[d["quiz"]] = d
gen_ids = set(subprocess.run(["node", "-e", "console.log(require('./src/gens.js').GENS.map(g => g.id).join(' '))"], cwd=HERE, capture_output=True, text=True).stdout.split())
for d in cards.values():
    for c in d["cards"]:
        if c.get("gen") and c["gen"] not in gen_ids:
            sys.exit("quiz %s question %s points at a generator that does not exist: %s" % (d["quiz"], c["n"], c["gen"]))
cards_js = json.dumps(cards, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

out = (tpl.replace("/*FONT*/", b64("AtkinsonHyperlegibleNext.woff2")).replace("/*MONO*/", b64("AtkinsonHyperlegibleMono.woff2"))
          .replace("/*GENS*/", gens).replace("/*CARDS*/", cards_js))

# docs/index.html is what GitHub Pages serves. index.html is the same file for opening locally.
# The quiz pictures live in docs/img, so the two copies point at them from different places.
for path, img in ((os.path.join(HERE, "docs", "index.html"), "img/"), (os.path.join(HERE, "index.html"), "docs/img/")):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf8").write(out.replace("/*IMG*/", img))
print("wrote", len(out) // 1024, "KB,", sum(len(d["cards"]) for d in cards.values()), "cards from", len(cards), "quizzes")
