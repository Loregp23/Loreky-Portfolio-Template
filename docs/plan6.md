# Plan 6 — 404 Background + Animation

## Prompt / Question to the AI

"Design and implement a layered starfield and subtle animated glows for `404.html`. Questions: preferred star color(s), density (sparse / medium / dense), size range, twinkle speed, whether glows should be interactive (hover/click), and whether reduced-motion must be strictly disabled. Provide a CSS-first solution (no JS unless requested) that is performant and accessible."

---

## AI's Complete Plan Response

1. Gather preferences

   - Ask user: star color(s), density, size, twinkle speed, interactive behavior, reduced-motion policy.

2. Design (high-level)

   - Two background layers:
     - Fine-grain repeated tiny stars (static grid with low opacity).
     - Larger repeated stars with gentle opacity animation to simulate twinkle.
   - Foreground sparks:
     - A modest number (12–30) of absolutely positioned `.spark` elements that pulse with staggered delays so a subset glows at any given moment.
   - Central hero star:
     - Reuse existing `starCool` animation for the big star above the heading.
   - Title:
     - Reuse existing `titleGlow` animation for `ERROR 404`.

3. Implementation steps (CSS-first)

   - Add CSS variables for colors, densities, sizes, and animation speeds to make tuning easy.
   - Implement `::before` and `::after` pseudo-elements on `.error-page` for the two repeated-star layers (use compact inline SVG data-URIs or small PNG/SVG assets).
   - Add a `.sparkles` container with several `.spark` spans in the DOM; position them using `nth-child()` and set staggered `animation-delay` + variable durations.
   - Keyframes to add:
     - `starsTwinkle` — cycles opacity for the larger background layer.
     - `sparkGlow` — pulse + opacity for foreground sparks.
     - Reuse `starCool` for hero and `titleGlow` for heading.
   - Accessibility: add `@media (prefers-reduced-motion: reduce)` to disable non-essential animations.
   - Performant choices: prefer `background-repeat` (repeated small SVG) for dense stars, limit expensive filters (use subtle drop-shadows), and keep DOM light.
   - Responsive: reduce star sizes and spark counts on small screens.
   - Optional JS: add an opt-in toggle to pause animations or increase density.

4. Test & iterate

   - Preview at desktop and mobile breakpoints.
   - Test with `prefers-reduced-motion` enabled.
   - Tune opacity, size, and timing values until the effect feels balanced.

5. Deliverables

   - `404.html` (may include `.sparkles` container).
   - `assets/css/404.css` updated with variables, layers, animations, and reduced-motion rules.
   - Short notes describing which variables to tweak for different looks.

6. Acceptance criteria
   - Black background with two layered starfields present.
   - Central looping hero star above `ERROR 404`.
   - Some background stars pulse/glow randomly.
   - Reduced-motion preference disables non-essential animations.
   - No perceptible performance hit on typical devices.

---

## Brief notes on what was implemented from the plan

- Base layout and hero star

  - `404.html` contains a centered hero star (SVG) above the `ERROR 404` heading; the star reuses the site's `starCool` animation.

- Layered starfields

  - `assets/css/404.css` contains two pseudo-element layers (`.error-page::before` and `::after`) using compact inline SVG data-URIs as repeating backgrounds. Small-layer repeats (dense, small tiles) and large-layer repeats (larger tiles) create depth.

- Random glowing stars

  - A `.sparkles` container with 24 `.spark` elements was added to `404.html`. Each spark uses the star SVG as its background and runs a staggered `sparkGlow` animation so different sparks glow at different times.

- Animations & accessibility

  - `@keyframes starsTwinkle` and `@keyframes sparkGlow` (pulse) were added.
  - `@media (prefers-reduced-motion: reduce)` disables non-essential animations.

- CTA and title
  - The CTA was restyled as a white button with black text; hover shows an outer glow and active (click) inverts colors. `titleGlow` is reused for the heading.

---

## Next steps / Tuning options (what you can ask me to change quickly)

- Star color palette: single color (white) or gradient/duo-tone (e.g., warm `#ffd166` + cool `#9be7ff`).
- Density: `sparse` / `medium` / `dense` — I will adjust `background-size` and opacity accordingly.
- Spark quantity: fewer (8–12) or more (30+) sparks.
- Glow strength & speed: increase/decrease `box-shadow` and animation durations.
- Persist click inversion: make CTA toggle to 'inverted' state until toggled again (requires small JS).

---

File created: `docs/plan6.md` — let me know which tuning choices you want and I'll apply them to `assets/css/404.css` (or produce a short diff first).
