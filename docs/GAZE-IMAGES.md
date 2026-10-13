# The nine gaze images — prompts

Everything you need to generate `public/gaze/*.webp`. Read the warning first;
it is the difference between this working and it looking broken.

---

## ⚠️ Read this first: generate ONE, then inpaint eight

**Do not run all nine prompts as nine separate generations.** They will not match.
Same prompt, nine times, gives nine different hair textures, nine different
jacket shades and nine different backgrounds. The portrait then visibly jumps
every time the cursor moves — worse than having no effect at all.

The only reliable method:

1. Generate the **base portrait** (Prompt 1) once. Iterate on it until you like it.
2. Upload that one image to an editor that can **inpaint** — Adobe Firefly,
   Leonardo, Ideogram canvas, Photopea + AI fill, or the inpainting mode of
   whatever generator you use.
3. Paint a mask over **both eyes only**. Not the eyebrows — if the tool redraws
   them they will flicker between directions.
4. Run the matching prompt from 2–9, **once per direction**, on that same image.
5. Export each as `center.webp`, `right.webp`, … at 512×512.

If your tool has a **seed lock or an image-reference feature**, use it as well —
it helps, though on its own it still drifts.

---

## Prompt 1 — the base portrait

Use this first. Get it right before going further.

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression, looking directly at the camera.

He wears a tan-brown suede jacket with buttoned flap chest pockets over a plain
white crew-neck t-shirt.

Photographed outdoors on a pedestrian street in soft golden-hour light. The
background is a blurred urban plaza with bare-branched trees and low buildings,
rendered as smooth bokeh. No people, no text, no signage.

Framing: square 1:1 crop. Head and upper torso. The eyes sit about 46% of the way
down from the top of the frame and horizontally centred. Both eyebrows fully
visible and not covered by hair. Sharp focus on the face, 85mm portrait lens,
natural skin texture, no makeup.

No text, no watermark, no jewellery, no glasses.
```

**Check before continuing:**

- [ ] Square, not portrait or landscape
- [ ] Eyes roughly 46% down — if they sit higher, ask for "a wider crop showing more of the torso"
- [ ] Face centred horizontally
- [ ] Eyebrows fully clear of the hair (you cannot inpaint eyes you cannot see)
- [ ] Calm expression — a smile makes the eye edits look wrong
- [ ] Blurred background, so no distracting detail competes with the face

---

## Prompts 2–9 — the eight directions

**"the viewer's" is load-bearing.** The cursor moves in the viewer's frame, so
the eyes must track in the viewer's frame. Drop that word and the eyes go the
wrong way. Each of these is the full prompt — paste it as-is into the inpainting
tool, with the eye region masked.

### → `right.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look slightly to the viewer's right, pupils shifted about 15 degrees to
the viewer's right, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

### → `down-right.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look diagonally down and to the viewer's right, pupils shifted right and
lowered about 15 degrees, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

### → `down.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look straight down, pupils lowered about 20 degrees as if reading
something below the frame, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

### → `down-left.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look diagonally down and to the viewer's left, pupils shifted left and
lowered about 15 degrees, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

### → `left.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look slightly to the viewer's left, pupils shifted about 15 degrees to
the viewer's left, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

### → `up-left.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look diagonally up and to the viewer's left, pupils shifted left and
raised about 15 degrees, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

### → `up.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look straight up, pupils raised about 20 degrees as if watching
something above the frame, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

### → `up-right.webp`

```
Photorealistic head-and-shoulders portrait photograph of a young Filipino man in
his early twenties. Short dark hair with a soft fringe swept across the
forehead, clean-shaven, calm neutral expression. He wears a tan-brown suede
jacket with buttoned flap chest pockets over a plain white crew-neck t-shirt.
Photographed outdoors on a pedestrian street in soft golden-hour light, blurred
urban plaza with bare-branched trees in the background. Square 1:1 crop, head
and upper torso, eyes about 46% down the frame.

His eyes look diagonally up and to the viewer's right, pupils shifted right and
raised about 15 degrees, head and body completely still, expression unchanged,
lighting unchanged, everything else identical to the original photograph.
```

---

## If the generator refuses a specific direction

Describe **what he is looking at** rather than where the eyes point. It works
more often:

| Direction | Try instead |
|---|---|
| `right` | `eyes looking at something off to the side` |
| `left` | `glancing to the side` |
| `down` | `eyes lowered, as if reading something below` |
| `up` | `eyes raised, looking at the ceiling` |
| diagonals | `looking up and away to the side` |

---

## File names

```
public/gaze/center.webp
public/gaze/right.webp
public/gaze/down-right.webp
public/gaze/down.webp
public/gaze/down-left.webp
public/gaze/left.webp
public/gaze/up-left.webp
public/gaze/up.webp
public/gaze/up-right.webp
```

**512 × 512** is plenty — the portrait renders at 288px. Nine of those is about
200 KB. Square is required; the component measures width and assumes height
matches.

---

## Turning it on

```tsx
<GazePortrait alt={name} src="/portrait.webp" faceY={0.46} gazeBase="/gaze" />
```

`faceY={0.46}` is already set — it was measured off your crop, not guessed.
Just add `gazeBase="/gaze"` and drop the files in. No other change.

**If the files are missing or any one fails to load, the component falls back to
the CSS nudge on its own** — it will not show a broken image.

---

## Verify it yourself

```powershell
node scripts/prove-gaze-swap.mjs
```

writes nine clearly-labelled placeholder images to `public/gaze/` so you can
confirm the swap fires in a browser without generating anything. Then:

```powershell
node scripts/prove-gaze-swap.mjs --clean
```

to remove them. **Do not leave them in place** — they are red test markers, not
portraits.

---

## If you would rather not do this

The CSS fallback ships already and needs nothing from you. It is subtler than a
real gaze, and it is a declared deviation from the reference — but it works with
the single photo you already have. Dropping these nine in is the upgrade, and it
is entirely optional.