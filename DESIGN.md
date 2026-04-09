# Design System Specification: Neo-Editorial Excellence

## 1. Overview & Creative North Star: "The Digital Monolith"
This design system is built on the philosophy of **The Digital Monolith**. It rejects the cluttered, "busy" nature of traditional web layouts in favor of an avant-garde, neo-editorial experience. The goal is to make every scroll feel like turning the pages of a high-end, limited-run fashion or architecture journal.

By leveraging **intentional asymmetry**, we break the predictable "F-pattern" of web browsing. We treat the screen as a canvas where negative space is as much a functional element as the content itself. Dramatic scale shifts between oversized serif typography and hyper-refined sans-serif labels create a tension that feels both premium and authoritative.

---

## 2. Colors & Surface Logic
The palette is rooted in a high-contrast foundation of `surface` (#0e0e0e) and `on-surface` (#ffffff), punctuated by high-energy, acidic accents.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. Structural boundaries must be defined through:
1.  **Background Color Shifts:** Use `surface-container-low` (#131313) against `surface` (#0e0e0e) to define distinct content zones.
2.  **Tonal Transitions:** Sections should bleed into one another or be separated by significant vertical whitespace (160px+).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create nested depth:
*   **Base:** `surface` (#0e0e0e)
*   **Secondary Layer:** `surface-container-low` (#131313)
*   **Elevated Card/Component:** `surface-container-highest` (#262626)

### The "Glass & Gradient" Rule
To achieve the Neo-Editorial aesthetic, floating elements (navigation bars, modal overlays) must utilize **Glassmorphism**. Use a semi-transparent `surface-variant` (#262626 at 60% opacity) combined with a `backdrop-filter: blur(20px)`. 

For Primary CTAs, move beyond flat fills. Use a subtle linear gradient from `primary` (#e9ffba) to `primary-container` (#bafd00) at a 135-degree angle to provide a "lit from within" professional polish.

---

## 3. Typography
The typographic system relies on the friction between the historic elegance of the serif and the clinical precision of the sans-serif.

*   **Display & Headlines (Newsreader):** These are the "hero" elements. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for main titles. Headlines should feel "heavy" and occupy significant visual real estate.
*   **Body (Manrope):** All long-form content must use `body-lg` (1rem). Ensure a generous line-height (1.6) to facilitate readability against the obsidian background.
*   **Utility & Labels (Inter):** Use `label-md` (0.75rem) in all-caps with increased letter-spacing (+0.1em) for categories, tags, and metadata. This conveys a "technical" or "curated" feel.

---

## 4. Elevation & Depth
In this system, depth is a whisper, not a shout.

*   **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface-container-highest` card on top of a `surface` background. The subtle shift from #0e0e0e to #262626 is enough to signal a change in hierarchy.
*   **Ambient Shadows:** For floating menus, use an extra-diffused shadow: `box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5)`. The shadow must never look "dirty" or grey; it should feel like an ambient occlusion of the background obsidian.
*   **The "Ghost Border":** If a container requires a boundary (e.g., in a dense data grid), use a 0.5px border using the `outline-variant` (#494847) at **20% opacity**. It should be felt more than seen.
*   **Glassmorphism Depth:** When using glass layers, apply a 0.5px top-border of `on-surface` (#ffffff) at 10% opacity to simulate the "catch-light" on the edge of a pane of glass.

---

## 5. Components

### Buttons
*   **Primary:** Fill with the `primary` to `primary-container` gradient. Typography: `label-md` (Inter), All-caps, Bold. 0px border-radius.
*   **Secondary:** Ghost style. 0.5px border of `primary` (#e9ffba). Hover state: 10% opacity `primary` fill.
*   **Tertiary:** No border or fill. `label-md` with a 1px underline that expands on hover.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines to separate list items. Use 32px of vertical padding and `surface-container-low` backgrounds on hover to indicate interactivity.
*   **Imagery:** All cards must feature high-quality imagery. Images should use `object-fit: cover` and, on hover, subtly scale up (1.05x) within their container for a "living" feel.

### Input Fields
*   **Styling:** Bottom-border only (0.5px `outline`). No background fill. 
*   **States:** On focus, the bottom border transforms into a `secondary` (#c97cff) 1px line. Helper text uses `label-sm` in `on-surface-variant`.

### Featured Content "Hero"
A bespoke component for this system. A full-bleed image with an overlapping `surface-container-highest` box containing the `display-md` headline. The overlap creates the signature "Neo-Editorial" depth.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace the Void:** Use massive margins (120px, 160px, 200px) to separate core sections.
*   **Asymmetric Grids:** Offset text columns from image columns to create a dynamic, editorial rhythm.
*   **High Contrast:** Ensure your `primary` lime and `secondary` purple accents are used sparingly to guide the eye to the most important actions.

### Don't:
*   **No Rounded Corners:** The `roundedness scale` is strictly 0px. Curves break the "Monolith" aesthetic.
*   **No Standard Shadows:** Never use a default `0 2px 4px` shadow. It looks cheap and "template-like."
*   **No Crowding:** If a section feels "full," remove 20% of the content. This system lives and breathes through white space (or in this case, "black space").
*   **No 1px Borders:** Always opt for a tonal shift or a 0.5px ghost border over a standard 1px line.