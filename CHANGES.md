# Vannam — revision notes

Run: `npm install && npm run dev`  (build: `npm run build`)

- **Zipper navbar** (`components/ZipNav`): pull / tap / Enter the tag to unzip the menu; Esc or "zip me shut" closes.
- **Search**: Enter now runs a full search (`/search?q=`), ↑/↓ + Enter opens a suggestion, `/` or ⌘K opens it. Logic in `lib/search.ts`.
- **3D carousel** (`components/Carousel3D`): drag / swipe / trackpad / arrow keys, loops forever.
- **Petals + fly-to-bag** on every Add (`components/FlowerFX`); cards grow on hover and the rest dim.
- **Press & hold on touch** shows a big blurred-backdrop preview (`components/PressPreview`).
- **Product page**: suggestions section ("You might also love"), tilt gallery, consistent photo frames.
- **Photo frames** (`components/Photo`): every photo uses one 4:5 frame; studio shots sit on a tinted mat.
- Margins: everything lives inside `--gutter` (index.css). Normal cursor restored.
- Removed leftover Vite template files (`main.ts`, `counter.ts`, `style.css`) that broke `tsc`.
- Hover fix: card/tilt hover is now tracked on a stable outer wrapper (the tilted element used to slip out from under the cursor, so the photo swap flickered and switched off).
- **Typography pass (text only):** fonts are now bundled locally via `@fontsource` (Bagel Fat One for titles, Fredoka for names/body, Caveat Brush for handwritten captions) — run `npm install` once. All text colour / shadow styling lives in `src/typography.css` (loaded last); delete that file and the font imports in `main.tsx` to revert. No backgrounds, motion or animations were touched.
