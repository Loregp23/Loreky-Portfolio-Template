# Loreky — Portfolio

Hi! I'm Loreky, an illustrator and creative. This is my personal star-themed portfolio—designed to showcase my artwork and creative projects with playful, animated visuals and a clean, responsive layout.

✨ **Live Site:**
[https://loregp23.github.io/Loreky-Portfolio-Template/](https://loregp23.github.io/Loreky-Portfolio-Template/)

## Tech Stack

- HTML5, CSS3 (custom properties, clamp, animations)
- Vanilla JavaScript (optional, for interactivity)
- No frameworks required
- [manifest.json](manifest.json) for PWA support

## Local Development Setup

1. Clone or download this repository.
2. Open the folder in your code editor.
3. Start a local server (recommended for favicon and asset loading):

Using Python (if installed):

```bash
python -m http.server 8000
# Then open http://localhost:8000/
```

Or use VS Code Live Server extension, or any static server. 4. Open `index.html` in your browser.

## Credits & Acknowledgments

- Design, illustration, and code: Loreky ([Instagram](https://www.instagram.com/loreky_/))
- Inspired by modern portfolio and CSS animation techniques
- [favicon.io](https://favicon.io/) for favicon generation
- [ImageKit.io](https://imagekit.io/) for image hosting

---

📸 Follow me on Instagram: [@loreky\_](https://www.instagram.com/loreky_/)

---

## What makes it special?

- **Star-powered design:** Morphing hero star, layered starfield, and twinkling background sparks—all animated with pure CSS.
- **Responsive & modern:** Built with CSS variables, `clamp()`, and flexible layouts for any device.
- **Custom 404 page:** Unique error page with animated stars and glowing effects.

## How to view

Open `index.html` in your browser to see my main portfolio. You can preview the custom 404 page at `/404.html`.

To deploy your own site, upload to GitHub Pages or any static host. For custom 404 support, set your host to use `404.html` for not-found pages.

## Key files

- `index.html` — main portfolio landing page
- `404.html` — custom 404 page with star animation
- `assets/css/layout.css` — core layout and star animations
- `assets/css/404.css` — 404-specific styles (starfield layers, sparks, reduced-motion rules)
- `assets/js/main.js` — optional site JS

## Customization tips (for developers)

- **Colors & timing:** Edit CSS variables in `assets/css/404.css` and `layout.css` to change star color, twinkle speed, and glow strength.
- **Density & size:** Adjust `background-size` for star layers or the number/position of `.spark` elements for more/less stars.
- **Accessibility:** Animations respect `prefers-reduced-motion` for users who prefer less motion.

## Performance & accessibility

- Uses repeated SVG backgrounds for efficient starfields.
- High-contrast button colors for readability.
- Limit heavy filters (drop-shadows) or spark counts for low-powered devices.

## Contributing

Pull requests are welcome if you want to suggest improvements or new visuals. Please include a short description and screenshots.

## License

See `LICENSE` in the repository root.

---

Want a different star density or color palette? Open an issue or contact me—I'm happy to help you tune the CSS for your style!

## Highlights

- Responsive layout using modern CSS (`clamp()`, CSS variables).
- Reusable animations: `starCool` (hero star) and `titleGlow` (heading).
- Dedicated `404.html` with layered starfield and randomized glowing sparks (`assets/css/404.css`).
- CSS-first: core visuals implemented with CSS; JS is optional.

## Files to know

- `index.html` — main landing page.
- `404.html` — custom 404 page with star animation.
- `assets/css/` — styles:
  - `layout.css` — core layout and animations (`@keyframes starCool`, `@keyframes titleGlow`).
  - `404.css` — 404-specific styles (starfield layers, sparks, reduced-motion rules).
- `assets/js/main.js` — optional site JS.

## Customization

- Colors & timing: tweak CSS variables in `assets/css/404.css` and `layout.css` to change star color, twinkle speed, and glow strength.
- Density & size: adjust `background-size` for `::before`/`::after` layers or the number/position of `.spark` elements to change density.
- Accessibility: animations respect `prefers-reduced-motion`.

## Performance & accessibility

- Uses repeated SVG backgrounds to avoid large DOMs for dense starfields.
- Limit heavy filters (drop-shadows) on low-powered devices or reduce spark counts.
- High-contrast button colors on the 404 page for readability.

## Extending & deployment

- Configure your static host to serve `404.html` as a 404 response (Netlify, GitHub Pages, etc.).
- Add a small JS toggle in `assets/js/main.js` if you want persistent state (e.g., toggle animations or inverted CTA state).

## Contributing

PRs welcome. Please include a short description and screenshots when changing visuals.

## License

See `LICENSE` in the repository root.

Need presets (sparse/medium/dense) or a different color palette? Tell me which preset and I'll patch `assets/css/404.css` with tuned variables and a short guide.
