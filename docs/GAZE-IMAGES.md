# Generating the 9 gaze images

The portrait follows the cursor by swapping between nine pre-rendered variants
— one neutral plus eight compass directions — which is exactly what the reference
site does. `GazePortrait` already knows how to use them: drop these files into
`public/gaze/` and set `gazeBase="/gaze"` on the component. No code changes
needed.

You need one image per direction:

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

---

## Read this before you start: consistency is the hard part

Nine separate generations will **not** stay consistent. Same prompt, different
hair texture. Same jacket, different shade. Same background, different blur. Put
them side by side and the portrait visibly jumps on every cursor move, which
looks worse than not having the effect at all.

The fix, in order of preference:

1. **Generate one image, then inpaint the eyes nine times.** Identical photo
   every time, because only the eye region is regenerated. This is the only
   approach that reliably works.
2. **Use a seed lock + image reference** (Midjourney `--cref`, Seedream, or
   Flux with a reference image). Helps, but still drifts.
3. **Nine independent generations.** Will not work. Do not bother.

---

## Step 1 — the base portrait

Generate this once, at **1:1**, and get it right before going any further.

```
Photorealistic portrait photograph of a young Filipino man in his early
twenties, with short dark hair and a soft fringe, clean-shaven, looking
directly at the camera with a calm neutral expression.

He wears a tan-brown suede jacket with buttoned chest pockets over a plain
white crew-neck t-shirt.

Photographed outdoors on a pedestrian street in soft golden-hour light. The
background is a blurred urban plaza with bare-branched trees and low
buildings, rendered as smooth bokeh.

Framing: square 1:1 crop of the head and upper torso. The eyes sit about 38%
of the way down from the top of the frame and horizontally centred. Sharp
focus on the face, 85mm portrait lens, natural skin texture.

No text, no watermark, no accessories.
```

**Check before continuing:**

- [ ] Square, not portrait or landscape
- [ ] Eyes roughly a third of the way down — if they sit higher, ask for
      "a wider crop showing more of the torso"
- [ ] Face centred horizontally
- [ ] Plain, calm expression — a smile makes the eye edits look wrong
- [ ] Hair does not cover the eyebrows (you cannot inpaint eyes you cannot see)

---

## Step 2 — the eight directions

**Perspective matters.** "Look right" is ambiguous: your right, or the viewer's?
The cursor moves in *the viewer's* frame, so the eyes must track in *the
viewer's* frame too. The prompts below say `the viewer's` explicitly — keep that
word or you will get them mirrored.

Keep everything else identical. Only the sentence between `---` changes.

**`right.webp`**
```
...looking slightly to the viewer's right, eyes turned about 15 degrees, head
position unchanged, everything else identical.
```

**`down-right.webp`**
```
...looking diagonally down and to the viewer's right, eyes turned and lowered
about 15 degrees, head position unchanged, everything else identical.
```

**`down.webp`**
```
...looking straight down, eyes lowered about 20 degrees, head position
unchanged, everything else identical.
```

**`down-left.webp`**
```
...looking diagonally down and to the viewer's left, eyes turned and lowered
about 15 degrees, head position unchanged, everything else identical.
```

**`left.webp`**
```
...looking slightly to the viewer's left, eyes turned about 15 degrees, head
position unchanged, everything else identical.
```

**`up-left.webp`**
```
```
...looking diagonally up and to the viewer's left, eyes turned and raised about
15 degrees, head position unchanged, everything else identical.
```

**`up.webp`**
```
...looking straight up, eyes raised about 20 degrees, head position unchanged,
everything else identical.
```

**`up-right.webp`**
```
...looking diagonally up and to the viewer's right, eyes turned and raised about
15 degrees, head position unchanged, everything else identical.
```

---

## Step 3 — how to inpaint

Whatever tool you use, mask **only the eye region**: both eyes plus about 20%
of the forehead and the bridge of the nose. Do not mask the eyebrows — if the
generator redraws them, the eyebrows will jump on every direction change.

Then:

1. Paste the same base image into the inpainting tool nine times
2. Mask the same region each time
3. Describe the eye direction for that pass
4. Export each as `.webp` (or `.png` — see below)

A useful trick if the generator will not hold a specific direction: describe it
in terms of **what the eyes are looking at** rather than where they point.

| Direction | Alternative phrasing |
|---|---|
| `right` | eyes looking at something off to the side |
| `down` | eyes lowered, as if reading something below |
| `up-left` | eyes raised, looking up at something on that side |

---

## Step 4 — file names and formats

The component requests `${gazeBase}/${direction}.webp`. Either:

- export as WebP, or
- export as PNG and rename to `.webp` — browsers sniff the real content type
  and render it fine, but `.webp` is a lie in the extension. Prefer real WebP.

Recommended: **512 × 512**, quality 80. Nine of those is well under 200 KB
total. Square is required — the component measures width and assumes height
matches.

---

## Step 5 — turn it on

```tsx
<GazePortrait alt={name} src="/portrait.jpg" gazeBase="/gaze" faceY={0.38} />
```

- `gazeBase="/gaze"` enables the src-swap path
- `faceY` is where the face sits vertically. **0.45** is the reference's value
  for its own headshot. Measure yours — if the eyes land a third of the way
  down, `0.38` is about right.

Delete the `faceY` prop and it falls back to 0.45.

---

## If you would rather not do this

The CSS fallback already ships and works with any single image. The portrait
shifts and turns slightly toward the cursor. It is subtler than a real gaze, and
it is a declared deviation from the reference — but it needs nothing from you.

Dropping these nine files in is the upgrade, and it is entirely optional.