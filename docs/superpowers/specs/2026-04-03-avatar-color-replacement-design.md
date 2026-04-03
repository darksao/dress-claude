# Avatar Color Replacement — Design Spec
Date: 2026-04-03

## Problem

The current avatar uses a PNG image with transparent SVG overlays to indicate clothing zones. The overlays do not change the actual image colors — they just tint on top. The user wants to click on a clothing piece and see its color change directly on the avatar, with the 3D shading preserved.

## Goal

Replace the SVG overlay approach with canvas-based pixel recoloration. When the user selects a color for a zone, the pixels of that zone in the PNG are recolored to match — keeping luminosity (3D shading) but replacing hue and saturation.

## Architecture

Only `src/components/avatar/AvatarSvg.tsx` is modified. No changes to `page.tsx`, `ColorPicker`, or any types.

### Elements

- **`<canvas>`** replaces `<Image>` as the display element
- **`originalPixels`** — `Uint8ClampedArray` of the raw PNG pixel data, stored on load
- **`zoneMask`** — `Uint8Array` mapping each pixel index to a zone id (0=none, 1=hair, 2=top, 3=bottom, 4=shoes), computed once on image load
- **SVG overlay** — kept at `opacity: 0`, invisible but clickable, for zone selection

### Data flow

```
Image load
  → draw to offscreen canvas
  → read originalPixels
  → compute zoneMask (HSL classification per pixel)

state change (new color for a zone)
  → iterate all pixels
  → for pixels matching changed zone: keep L, apply new H+S
  → write to visible canvas
```

## Zone Classification (HSL ranges)

| Zone | H (°) | S (%) | L (%) |
|------|--------|--------|--------|
| hair | 20–40 | 30–65 | 28–52 |
| top (jacket) | 195–225 | 15–45 | 35–58 |
| bottom (pants) | 25–45 | 30–60 | 55–78 |
| shoes | 15–35 | 20–55 | 18–36 |

**Exclusions (never recolored):**
- Alpha < 100 (transparent)
- Skin: H 15–35°, S > 25%, L > 65%
- Background: L > 92%

These ranges target the specific colors of the Nano Banana 3D avatar PNG. If a zone doesn't recolor correctly, only the HSL range constants need adjustment.

## Recoloration Algorithm

For each pixel belonging to a zone:

```
originalRGB → HSL
newColorRGB → HSL → extract H_new, S_new
output HSL = (H_new, S_new, L_original)
output → RGB → canvas
```

This preserves the luminosity variation (shadows, highlights) that creates the 3D effect, while applying exactly the chosen hue and saturation.

## Interaction

The SVG overlay paths (ellipses and polygon paths) remain unchanged in shape and position, but rendered with `opacity: 0`. They are still clickable. Zone selection, ColorPicker, and save logic are unchanged.

## Performance

- `originalPixels` and `zoneMask` computed once at mount (~1–2ms for 1024×1024)
- Each recolor pass: ~1M pixels, estimated < 50ms on modern hardware
- No debounce needed — color selection is a discrete user action

## Files

- **Modify:** `src/components/avatar/AvatarSvg.tsx`

## Out of scope

- Multiple avatars or genders
- Animated transitions
- Undo/redo
- Shirt (undershirt) zone — too similar in color range to skin/background, deferred
