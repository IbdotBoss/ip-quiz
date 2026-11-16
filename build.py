"""Build index.html and docs/index.html from template.html, src/gens.js and the font.

Runs test.js first and writes nothing if it fails.
Usage: python build.py
"""
import base64, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
test = subprocess.run(["node", "test.js"], cwd=HERE, capture_output=True, text=True)
print(test.stdout.strip().splitlines()[-1] if test.stdout.strip() else test.stderr)
if test.returncode:
    print(test.stdout)
    sys.exit("tests failed; nothing written")

tpl = open(os.path.join(HERE, "template.html"), encoding="utf8").read()
assert "/*FONT*/" in tpl and "/*GENS*/" in tpl and "/*IMG*/" in tpl
font = open(os.path.join(HERE, "fonts", "AtkinsonHyperlegibleNext.woff2"), "rb").read()
gens = open(os.path.join(HERE, "src", "gens.js"), encoding="utf8").read().replace("</", "<\\/")
out = tpl.replace("/*FONT*/", base64.b64encode(font).decode()).replace("/*GENS*/", gens)

# docs/index.html is what GitHub Pages serves. index.html is the same file for opening locally.
# The quiz pictures live in docs/img, so the two copies point at them from different places.
for path, img in ((os.path.join(HERE, "docs", "index.html"), "img/"), (os.path.join(HERE, "index.html"), "docs/img/")):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf8").write(out.replace("/*IMG*/", img))
print("wrote", len(out) // 1024, "KB")
