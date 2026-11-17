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

Signature: the question strip. Fifteen numbered squares per quiz, the same on the home page and stuck to the top of each quiz page. A yellow square is a question he lost marks on in his own attempt.

## Directions compared

Two comps, in `comps/`. Both shown to Stage on 17 Nov 2026.

- **A, Slide.** The black ground of the tutor's slides. Every quiz picture is white on black, so the pictures sit in the page without a frame. One yellow, used as a highlighter.
- **B, Crib sheet.** Squared paper (the pixel grid), navy ink, the same yellow highlighter. Better in daylight and on paper.

Built: A as the default, B as the "Light paper" switch, because they share one layout and differ only in tokens. Print always uses a white ground.

## Tokens

```css
:root { --r: 2px; --t-s: .9375rem; --t-m: 1.0625rem; --t-l: 1.25rem; --t-xl: 1.75rem; }
[data-theme="dark"]  { --paper:#000;    --panel:#111113; --ink:#f2f2f0; --ink-2:#b0b0ab; --hair:#3d3d41; --tint:#1a1a1d; --mark:#ffd84a; --mark-ink:#000;    --right:#7be0a4; --wrong:#ff9d94; --focus:#8ab4ff; }
[data-theme="light"] { --paper:#fbfbf7; --panel:#fff;    --ink:#14213d; --ink-2:#4d5670; --hair:#b3c0d8; --tint:#edf1f7; --mark:#ffe45c; --mark-ink:#14213d; --right:#0c6b3d; --wrong:#b3261e; --focus:#2f5fd0; }
```

Spacing is on a 4px base. One radius, 2px.

## Colour

Yellow means one thing: look here. It marks the trap, the final answer, and the questions he lost marks on. Green and red appear only when an answer is checked. Everything else is ink on ground.

## Type

- Atkinson Hyperlegible Next for reading. Atkinson Hyperlegible Mono for every number, matrix and line of working, so digits line up in columns. Both OFL, both embedded.
- Four sizes. The question text is the largest thing on a card, because finding the question is the first task.

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
- Pure black ground. It is the tutor's own, and the pictures need it.

## Stack

One static HTML file built by `build.py` from `template.html`, `src/gens.js` and `src/cards/quizNN.json`, with fonts inlined. Pictures are separate files in `docs/img`. Hash routes (`#/q/8/3`) so the back button and links to a single question work.
