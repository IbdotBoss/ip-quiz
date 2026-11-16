# Design: Image Processing test practice

## Brief

- **Subject.** A 1.5 hour in-class test for MOD002643 Image Processing at ARU, worth 50%. The tutor says it draws quiz questions from each week. The quizzes are mostly calculations on small matrices, with new numbers on every attempt.
- **Audience.** Stage, revising on a phone and a laptop.
- **The one job.** Make the method for each question type fast and checked, by doing it again with new numbers.
- **Material.** Nine captured quiz attempts, 22 lecture and reading PDFs. Quizzes 10 and 11 were locked.
- **Absent.** No logo or photos. The tutor's quiz pictures are not reused. Pictures are drawn by the page.

## Concept

The page is made of pixels. A greyscale matrix is drawn with each cell shaded by its own value, so 12 looks dark and 240 looks light. Progress uses the same idea: one square per question type, shaded from black for no answers right to white for every answer right.

## Tokens

    --paper #fff   --ink #17171c   --ink-2 #4a4a55   --hair #d9d9df   --tint #f1f1f4
    --right #18794e   --wrong #b3261e   --focus #2f5fd0

Colour is used for right, wrong and focus only. Everything else is a grey level, because the subject is 8-bit greyscale.

## Type

Atkinson Hyperlegible Next, embedded. Matrix numbers are bold at 1.17rem with tabular figures so they count as large text on mid greys.

## Not done

- No comps were shown to Stage before the build. The look reuses the layout rules of the AI quiz with a new concept.
- White stays pure white, because a pixel of 255 is white.
- Hallmark's stamp is left out. Its linter ran on 16 Nov 2026.

## Stack

One static HTML file built by `build.py`, with the generators and the font inlined. It works offline.
