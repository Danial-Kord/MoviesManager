# Design System — Dark IMDb-Inspired Catalog

Implemented tokens live in [`src/app/globals.css`](src/app/globals.css) and [`tailwind.config.ts`](tailwind.config.ts).

## References

- **[IMDb-Reborn](https://github.com/MrRobotjs/IMDb-Reborn)** (MIT, archived): userstyle palette — primary **`#f5c518`**, hover **`#be9500`**, layered dark surfaces **`#191919`** … **`#4C4C4C`**. Used here as **historical color reference only**; this app does not ship that stylesheet.
- **[imdb.com](https://www.imdb.com/)**: Yellow-on-dark identity, dense metadata (ratings, runtime, cast rows), poster-forward layouts.
- **[Netflix](https://www.netflix.com/ca/)** (atmosphere only): Near-black canvas (**`#141414`**-style), cinematic hero with gradient scrim — **not** Netflix red as product accent (we use **IMDb gold**).

## 1. Theme

- **Dark-first only** (`color-scheme: dark`). No light theme in scope.
- **Cinematic catalog**: Photography (posters) leads; UI stays quiet (neutral greys + one gold accent).

## 2. Color Tokens

| Token | Hex / value | Role |
|-------|----------------|------|
| Canvas | `#141414` | Page background (Netflix-like deep black) |
| Surface | `#191919` | Alternate base / strips |
| Elevated | `#1f1f1f` | Cards, inputs on canvas |
| Panel | `#262626` | Nested panels, secondary controls |
| Rail | `#333333` | Stronger chips / pagination wells |
| Border | `#404040` | Hairlines, input borders |
| Text | `#f5f5f1` | Primary body and titles |
| Muted | `#b3b3b3` | Secondary labels, descriptions |
| Subtle | `#a3a3a3` | De-emphasized meta |
| Dim | `#808080` | Placeholders, disabled feel |
| Gold | `#f5c518` | Primary CTA, brand accent, ratings emphasis |
| Gold hover | `#be9500` | Hover / pressed gold |
| Focus | `#5799ef` | Focus rings (link-adjacent blue, readable on dark) |
| Error | `#f87171` | Error text on dark |
| Footer | `#0d0d0d` | Footer bar |
| Hover wash | `rgba(255,255,255,0.08)` | Ghost buttons / list hovers |

## 3. Typography

- **Stack**: System UI — `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, sans-serif (`font-imdb` in Tailwind).
- **Hierarchy**: Section titles **~1.75rem**, bold, slight negative tracking (−1.2px). Body **14–16px**. UI chrome **12px** (buttons, hints).
- **Principles**: High contrast on dark; metadata stays smaller and muted (`Muted` / `Subtle`).

## 4. Radius & elevation

- **Buttons / inputs**: **4px** — crisp, catalog-adjacent (see tight controls in IMDb-Reborn).
- **Cards / posters**: **8px** — readable rounding without “pill app” feel.
- **Depth**: Prefer **subtle borders** (`Border`) over heavy shadows; optional soft shadow only on floating overlays.

## 5. Components

### Buttons

- **Primary (gold)**: Background `Gold`, text **`#000000`**, hover `Gold hover`.
- **Secondary**: Background `Panel` or `Rail`, text `Text`, border optional `Border`.
- **Ghost / outline**: Transparent / dark fill; border `Border`; hover `Hover wash`.

### Inputs

- Fill `Elevated` or `Panel`, border `Border`, text `Text`, placeholder `Dim`. Focus: ring `Focus`.

### Cards & grids

- Poster grid: masonry or columns; **aspect ratio 2:3**; card surface `Elevated`, ring/border `Border`; hover **gold ring** or lift via border brightening.

### Hero (Netflix-like framing)

- Full-width backdrop image with **bottom-heavy gradient** (`from Canvas via black/70 to transparent`) so headline stays readable in `Text`.

### Navigation

- Sticky bar: `Surface` or `Elevated` with blur; bottom border `Border`; search field matches inputs.

## 6. Responsive notes

- Stack filters on narrow screens; grid columns **1 → 2 → 3+** with breakpoints as needed.
- Keep tap targets **≥44px** for pagination / icon buttons.

## 7. Agent quick reference

- Background: **Canvas** `#141414`; cards: **Elevated** `#1f1f1f`.
- Accent: **Gold** `#f5c518` (never duplicate with a second brand hue).
- Primary buttons: **black text on gold**.
- Links / focus: **Focus blue** `#5799ef` optional for inline links.
