# Design: Image Processing cheatsheet

## Brief

- **Subject.** A 1.5 hour in-class test for MOD002643 Image Processing at ARU, worth 50%, on 7 Dec 2026. The tutor says it draws questions from the weekly Canvas quizzes. Most are calculations on small matrices with new numbers on every attempt. Some are picture recognition.
- **Audience.** Stage, revising on a phone and a laptop.
- **The one job.** For any quiz question, show the method fast: what to do, how to check it, what goes wrong.
- **Material.** His own attempts at quizzes 1 to 9 (135 questions as text), the tutor's 21 quiz pictures, 22 lecture and reading PDFs, and 78 tested question generators from the first build.
- **Absent.** Quizzes 10 and 11 (locked on Canvas). No logo.

## History

The first build (16 Nov 2026) was a practice quiz with scores. Stage rejected it: the module already has a quiz, and he wanted a cheatsheet. He also rejected drawn pictures in favour of the tutor's real ones. This design replaces it. The generators stay, but only behind a "Try with new numbers" link on each card.

## Concept

The page is the quiz, annotated. Each card puts what you see in the test on the left and what you do about it on the right.

Signature: the question strip. Fifteen numbered squares per quiz, the same on the home page and stuck to the top of each quiz page.

## Directions compared

Two comps, in `comps/`, shown to Stage on 17 Nov 2026: a black "Slide" ground and a squared-paper "Crib sheet". He then sent two screenshots of real Canvas questions and asked for that look: the Canvas fonts, kernels in brackets, formulas set as maths, with dark and light as modes. That is the built design. Both comps are superseded.

## Look: a Canvas question, annotated

- The left side of a card is set like the Canvas question it came from: a dark number box and the question type, the image matrix as a ruled table, kernels as bracketed matrices with `k =`, fractions stacked, and the formula line in a maths face.
- The right side is the cheatsheet. The answer sits in a green bar with a tick, the way Canvas shows an accepted answer.

## Tokens

```css
:root { --r: 4px; --t-s: .9375rem; --t-m: 1rem; --t-l: 1.25rem; --t-xl: 1.75rem; }
[data-theme="light"] { --paper:#fff;    --panel:#fff;    --ink:#2d3b45; --ink-2:#556572; --hair:#c7cdd1; --tint:#f5f5f5; --mark:#ffe680; --mark-ink:#2d3b45; --right:#0b874b; --wrong:#c5221f; --focus:#0770a3; --nb:#2d3b45; --nb-ink:#fff; }
[data-theme="dark"]  { --paper:#12171b; --panel:#1b2228; --ink:#f2f4f5; --ink-2:#a9b3b9; --hair:#3b464e; --tint:#222a31; --mark:#f5d76e; --mark-ink:#12171b; --right:#57cc94; --wrong:#ff928c; --focus:#74bde8; --nb:#f2f4f5; --nb-ink:#12171b; }
```

Light uses Canvas's own ink (#2d3b45), rule (#c7cdd1) and green (#0b874b). Dark is the same page with the lights off. The mode follows the device until the "Dark mode" or "Light mode" button is used, then it is remembered. Spacing is on a 4px base. One radius, 4px.

## Colour

Yellow means one thing: look here. It marks the trap. Green marks the answer, as on Canvas. Red appears only when a practice answer is wrong.

## Type

- Lato for text, the face Canvas uses. Regular and bold, OFL, embedded.
- KaTeX Main and KaTeX Math Italic for maths, the Computer Modern faces that MathJax draws on Canvas. OFL, embedded. Single-letter symbols are italic, numbers upright.
- `mathHTML` and `inl` in `template.html` find the maths in plain card text, so the card JSON stays plain Unicode.

## Assets

- The tutor's own quiz pictures, captured from Canvas on 16 Nov 2026, in `docs/img`. Full-size copies are in the module folder under `Test Prep/quiz-images`.
- Week 11 filter masks are crops of the Lecture 11 slide.

## Motion

None. Jumps between questions are instant.

## Refused

- Scores, streaks and progress squares. This is a reference sheet.
- Hiding the answer behind a tap. A cheatsheet shows it.
- Screenshots of whole Canvas questions. They show one set of numbers, cannot be searched and are hard to read on a phone.

## Overrides

- Hallmark's stamp is left out.

## Stack

One static HTML file built by `build.py` from `template.html`, `src/gens.js` and `src/cards/quizNN.json`, with fonts inlined. Pictures are separate files in `docs/img`. Hash routes (`#/q/8/3`) so the back button and links to a single question work.

## Sharing (17 Nov 2026)

The sheet is shared with the class, so nothing refers to one person's attempt. Traps describe the mistake in general. Answers Canvas never confirmed are listed privately, outside the repo. Every page ends with links to the previous and next quiz, all quizzes, Rules, Look-up and the top. Look-up (`#/ref`) names each quiz picture by what it shows, without the A to D letters the quiz uses.

## Modes (18 Nov 2026)

The two modes are the two original comps, with the Canvas type and matrices kept. Dark mode is Slide (black ground). Light mode is Crib sheet (squared paper, navy ink). The Canvas grey palette used on 17 Nov is gone. The answer stays in a green bar.
