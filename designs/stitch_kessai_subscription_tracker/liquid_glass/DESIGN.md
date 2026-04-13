# Design System Document: The Liquid Glass Ethos

## 1. Overview & Creative North Star: "The Obsidian Vessel"
The North Star for this design system is **"The Obsidian Vessel."** We are crafting a macOS experience that feels less like software and more like a high-end physical object—a precision-milled obsidian block encased in polished glass. 

By leaning into extreme high-contrast (Pure White `#FFFFFF` on Deep Black `#131313`) and eliminating mid-tone greys, we move away from "utility" and toward "luxury." The goal is to break the rigid, boxy nature of standard apps through **Liquid Geometry** (full radius corners) and **Tonal Depth**. The interface should feel calm, silent, and expensive, prioritizing breathing room over information density.

---

## 2. Colors & Surface Logic
We are abandoning the "grey-scale" safety net. This system operates on light and shadow, not lines.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined solely through background shifts. 
- **Surface Nesting:** Use `surface_container_lowest` (#0E0E0E) for the deepest background layers. 
- **Elevation via Tones:** Place a `surface_container` (#1F1F1F) element on top of a `surface` (#131313) background to create a "lifted" feel without a stroke.

### The Glass & Gradient Rule
To achieve the "Liquid" feel, all floating panels (Modals, Popovers, Hover States) must utilize **Glassmorphism**.
- **Formula:** Use `surface_container_highest` (#353535) at 40-60% opacity with a `backdrop-filter: blur(20px)`.
- **CTAs:** Use a subtle linear gradient on `primary` (#FFFFFF) buttons, transitioning from `#FFFFFF` to `primary_container` (#D4D4D4) to give the white "body" and prevent it from looking flat.

---

## 3. Typography: The Editorial Voice
We utilize **Inter** not as a system font, but as a brand serif-alternative, focusing on tracking and weight to convey authority.

*   **Display (Large/Medium):** Set with -0.02em tracking. These are your "Hero" moments. Use these sparingly to create an editorial feel, like a high-end magazine header.
*   **Headline & Title:** Use `primary` (#FFFFFF) for maximum contrast. Ensure generous line-height (1.4+) to maintain the "Calm" aesthetic.
*   **Body & Labels:** For secondary information, use `on_surface_variant` (#C6C6C6). By dimming the secondary text rather than using a grey background, we maintain the "Liquid Glass" clarity while guiding the eye to the `primary` content.

---

## 4. Elevation & Depth
In this system, depth is a physical property.

### The Layering Principle
Think of the UI as layers of dark glass. 
- **Base:** `surface_container_lowest` (#0E0E0E).
- **Navigation/Sidebar:** `surface` (#131313).
- **Active Workspace:** `surface_container` (#1F1F1F).
- **Floating Assets:** `surface_container_highest` (#353535) with blur.

### Ambient Shadows
Standard "Drop Shadows" are forbidden. If a floating element requires a shadow, use a **Diffuse Glow**:
- **Color:** `on_surface` (#E2E2E2) at 4% opacity.
- **Blur:** 40px to 80px. 
- **Spread:** -10px.
This creates a soft "aura" rather than a hard shadow, mimicking how light interacts with high-end optics.

### The Ghost Border Fallback
If contrast testing fails for accessibility, use a **Ghost Border**: `outline_variant` (#474747) at 15% opacity. It should be barely perceptible—a hint of a reflection on a glass edge.

---

## 5. Components: Liquid Geometry
All interactive components must adhere to `ROUND_FULL` (9999px) or `xl` (3rem) to maintain the "Liquid" metaphor.

*   **Buttons:**
    *   *Primary:* Pure white background, `on_primary` (#1A1C1C) text. High-gloss finish.
    *   *Secondary:* Ghost style. No background, `outline` (#919191) border at 20% opacity.
*   **Input Fields:**
    *   Never use a box. Use a `surface_container_high` (#2A2A2A) pill with `on_surface` (#E2E2E2) text. The focus state is a subtle "glow" (increase opacity of the background tone).
*   **Cards & Lists:**
    *   *Constraint:* No dividers. Separate list items using `12px` of vertical white space or a slight tonal shift on hover using `surface_container_highest` (#353535).
*   **Checkboxes/Radios:**
    *   When active, these should glow. Use `primary` (#FFFFFF) with a small ambient outer glow of the same color.
*   **Glass Modals:**
    *   Must use `xl` (3rem) corner radius. They should feel like a dropped pebble in water—smooth, organic, and integrated.

---

## 6. Do’s and Don'ts

### Do:
*   **Embrace Negative Space:** If a screen feels "busy," add 24px of padding to everything. Space is a luxury.
*   **Use Asymmetry:** Place high-contrast `display-lg` type off-center to break the "template" feel.
*   **Layer with Intent:** Ensure every nested container is either one step darker or one step lighter than its parent.

### Don’t:
*   **Don't use Grey hex codes:** Stick strictly to the provided tokens. Adding random `#888888` greys will muddy the "Obsidian" look.
*   **Don't use hard corners:** Even a 4px radius is too sharp. Stick to `md` (1.5rem) as the absolute minimum.
*   **Don't use 100% Opaque Borders:** This shatters the "Liquid" illusion. Borders should look like light catching an edge, not a pencil line.
*   **Don't over-populate:** If a feature isn't essential, hide it in a glass popover. A premium experience is a quiet one.