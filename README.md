# Image Processing test practice

Live: https://ibdotboss.github.io/ip-quiz/

Practice for the MOD002643 Image Processing in-class test at ARU. The weekly quizzes change their numbers on every attempt, so every question here is generated with new numbers too. Each one shows its working, a quick method, and the mistake to avoid.

- 78 question types across weeks 1 to 11
- The picture questions for weeks 1, 4, 6, 7, 8 and 9 use the tutor's own quiz pictures, stored in `docs/img`
- A cheatsheet for each week, and one page of rules that apply to every week
- A mixed paper with two questions from each week
- Scores stay in your browser. Nothing is sent anywhere.

Weeks 10 and 11 were built from the readings, because those two quizzes were still locked.

## Build

    python build.py

`build.py` runs `node test.js` first and writes nothing if a check fails. The tests compare the solvers with answers the Canvas quizzes accepted, then generate every question type 300 times.

- `src/gens.js` holds the solvers and the question generators
- `template.html` holds the page
- `docs/index.html` is the built file that GitHub Pages serves

Created by [Ibrahim Uthman](https://www.ibrahimuthman.me/).
