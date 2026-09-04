# Infinity Hair and Beauty Salon — landing page

A single-page site for **Infinity Hair and Beauty Salon**, 40/42 Powis Street, Woolwich,
London SE18 6QS.

A logo-animation hero, a gradient statement band, then four chapters — hair, nails, spa,
boutique — over a shop, a full price list and a booking section.

**No scroll-scrubbed video anywhere.** Each chapter holds a short clip that plays on
entry and pauses on exit. Scrubbing a compressed video against scroll position is what
makes those sites look blurry and stutter: the browser is asked to seek to arbitrary
frames faster than it can decode them, so it shows whatever keyframe it has. Playing a
short loop at its natural rate never does that.

---

## Running it

```bash
node tools/shotserver.js
```

Then <http://127.0.0.1:4180/>.

`index.html` is fully self-contained — the business data is inlined at build time — so
it also works opened straight from the filesystem, and it will drop onto any static
host (Vercel, Netlify, GitHub Pages) with no configuration.

## Building

Edit `src/page.html` or `data.json`, then:

```bash
node build.js
```

That injects `data.json` into the page and writes `index.html`. `data.json` stays the
single source of truth — change a price there and rebuild; nothing is hard-coded in
the markup.

```
src/page.html    the template (one file: markup, CSS, JS)
src/hero3d.kage.bak  the retired Three.js hero — see "Earlier hero attempts" below
data.json        the scraped business record
build.js         injects the data, writes index.html
assets/video/    the hero clip plus four chapter clips, and their poster frames
assets/img/      logo, favicon, og image
assets/concept/  hero concept stills from an earlier attempt, full resolution
assets/raw/      untrimmed Kling generations from earlier attempts
tools/           static server with a frame-capture route, used in development
```

## The hero

The salon's own logo animation: the mark morphs into a styled mannequin head as a
sunlit salon interior resolves around it, then loops. It is the most recent file the
user downloaded — dropped in whole, re-encoded for the web, nothing trimmed.

It behaves exactly like every other chapter clip — entry-triggered by the same
`IntersectionObserver` pair in `video()`, never scroll-scrubbed — so it gets no special
case in the JS. The only hero-specific work is the scrim: this clip runs from a
near-white logo intro into a bright, warm interior, so it is never dark on its own the
way the earlier night footage was. `.scrim` carries much more opacity through the whole
gradient, not just at the foot of the frame, so the overlay copy stays legible against
both the white open and the light interior it settles into.

## The footage

| Chapter | Clip | Length | Source |
|---|---|---|---|
| Hero | logo morphs into a styled mannequin head | 10.0s | your download |
| Nails | macro manicure | 5.0s | Kling — generated |
| Spa | candlelit treatment room | 4.3s | your footage |
| Boutique | push-in on the boutique wall | 4.3s | your footage |

All slowed with `minterpolate`, which synthesises the in-between frames. Simply lowering
`playbackRate` in the browser holds each existing frame for longer and judders; this
stays smooth at 24fps.

The hair chapter no longer carries a clip — it holds the hairstyle swapper instead.
The previous hair and hero clips are kept at `assets/video/hair.mp4` and
`hero-salon.mp4`.

## The hairstyle swapper

Three headshots of the same model, three hairstyles, one flat backdrop.

A light crosses the portrait and changes the hair as it passes. Each look takes **four
seconds** to come through. Reach the far side and that look is kept; break the hover
before then and the light retreats, taking the new hair back with it.

The wipe is driven by one progress value advanced or rewound each frame, not by a CSS
transition — it has to be reversible from wherever it happens to be when the pointer
leaves, and a keyframe cannot be asked to run backwards from an arbitrary point. The
glow rides the mask edge rather than running on its own timer, so the light is always
exactly where the image is changing.

Touch taps to run the wipe through. Focus runs it, blur rewinds it, Enter commits.

**On the images:** these are generated, not photographed. A set of the same real person
shot with three hairstyles on a matched background does not exist as licensable stock,
and using a real person's likeness to advertise a salon without their consent is not
something to do. One base headshot was generated, then the other two edited from it with
`kling-image-o1` — the model spec'd for feature consistency — so only the hair changes.
Replace them with real client photography when you have it.

## The gradient band

"Any hairstyle you want — we have it all", between the hero and the hair chapter. The
blush in the gradient is lifted straight off the headshot backdrop in the section below
it, so the band hands over to the portraits instead of cutting against them.

## The shop

Six products from the scraped record, each with a Buy that opens WhatsApp with the item
already named, so the salon reads one message and knows what to set aside. No basket, no
card capture — this is a shop of six lines run off a phone.

## How the video is handled

Two `IntersectionObserver`s per clip:

- a **loader** at `rootMargin: 120%` sets `src` just before the chapter arrives, so it
  is decoded on entry rather than stalling;
- a **player** at `threshold: 0.35` calls `play()` on entry and `pause()` on exit.

Clips also pause on `visibilitychange` so a backgrounded tab is not decoding five
videos, and the one that is on screen resumes when you come back — an
`IntersectionObserver` does not re-fire for something that never stopped
intersecting, so without that the chapter you were looking at would stay frozen on
a still. Nothing is fetched for a chapter the visitor never reaches.

## Accessibility

- The price list is a real `tablist`: roving `tabindex`, arrow keys, `Home`/`End`,
  wrap-around, and exactly one panel visible. Verified by keyboard.
- `prefers-reduced-motion`: reveals resolve instantly, the grain is removed, snap and
  smooth scrolling are off, and the clips stop autoplaying — they gain native controls
  so the visitor can start them if they want.
- Above-the-fold text is shown immediately rather than waiting on an observer, so the
  headline is never sitting at `opacity: 0` in a throttled tab.
- Every chapter clip is decorative and `aria-hidden`; the meaning is carried by the
  heading and copy beside it, not by the footage, so nothing is lost without it.
- Focus is visible throughout, contrast holds on both the ivory and the dark chapters.

## Snap behaviour

`scroll-snap-type: y proximity` on desktop, with each full-height chapter a snap target.
Proximity rather than mandatory on purpose: the price list and booking sections are
taller than the viewport, and mandatory snapping strands a reader halfway down them.

Snap is off below 900px, where the chapters stack into media-over-copy and are taller
than the screen.

To make it firmer, change one line in `src/page.html`:

```css
html{scroll-snap-type:y mandatory}
```

## The data

`data.json` — WhatsApp booking link, phone, email, address, hours, **9 price categories
/ 58 services**, 6 product categories, 4 service pillars, 4 booking policies. Scraped
from the previous site and verified against its deployed bundle.

**Nails and spa carry no published prices** — all 58 are hair services. Both chapters
say so plainly and send the enquiry to WhatsApp rather than inventing a number.

## Worth doing next

1. **Real client photography and footage** to replace the generated material over
   time. Generated video is a good stand-in for a launch, not a permanent answer —
   real clients in the real room will always convert better.
2. **A second hair clip.** Hero and hair were both cut from the same two-second
   usable window of the original salon footage; the hair chapter would benefit from
   its own shot.
3. **A pedicure clip** to pair with the manicure one, if that side of the business
   is worth its own chapter.

## Regenerating the hero

The Kling MCP server is connected. The hero was made in two steps:

- `text_to_image` with `gemini-3-pro-image`, 16:9 at 2k — the model spec'd for
  complex text rendering, which this composition depends on. Splitting the lockup
  into a large **INFINITY** over a spaced second line is what keeps the spelling
  intact; five words on one line is where these models start garbling letterforms.
- `image_to_video` with `kling-video-v3_0_turbo`, 5s at 1080p, seeded with that
  image and a prompt describing motion only.

Full-resolution concept stills (2752×1536) and both raw generations are kept in
`assets/concept/` and `assets/raw/`.
