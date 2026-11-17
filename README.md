# Image Processing cheatsheet

Live: https://ibdotboss.github.io/ip-quiz/

A cheatsheet for the MOD002643 Image Processing in-class test at ARU. The test draws on the weekly Canvas quizzes, so there is one card for every quiz question.

- 135 cards for quizzes 1 to 9, in quiz order. Each has the question as the tutor words it, the method, a quick check, the trap and a worked example.
- The picture questions show the tutor's own quiz pictures, stored in `docs/img`.
- **Rules** explains the symbols and wording in the questions. **Look-up** has the colours, the quiz pictures named by what they show, and every kernel.
- "Try with new numbers" on a card opens the same question type with fresh numbers and checks the answer.
- Quizzes 10 and 11 were still locked, so those two pages are built from the readings.
- Set like the Canvas questions: same text face, kernels in brackets, formulas as maths. Dark and light modes. Every quiz page prints.

## Build

    python build.py

`build.py` runs `test.js`, then writes `docs/index.html` (served by GitHub Pages) and `index.html` from:

- `template.html`: the page
- `src/cards/quizNN.json`: one file of cards per quiz
- `src/gens.js`: solvers and the question generators behind "Try with new numbers"
- `fonts/`: Lato, KaTeX Main and KaTeX Math (OFL)

See `design.md` for the design decisions.
