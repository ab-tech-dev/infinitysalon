# Infinity Hair and Beauty Salon — landing page

A single-page site for **Infinity Hair and Beauty Salon**, 40/42 Powis Street, Woolwich,
London SE18 6QS.

A photographic hero, a gradient statement band, a ready-made and custom wig gallery,
then the salon's service chapters — hair, nails, spa, boutique, makeup, gele, facials
and lashes — over a shop, a full price list and a booking section.

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

```text
src/page.html    the template (one file: markup, CSS, JS)
src/hero3d.kage.bak  the retired Three.js hero — see "Earlier hero attempts" below
data.json        the scraped business record
build.js         injects the data, writes index.html + robots.txt + sitemap.xml
public/          robots.txt and sitemap.xml, generated — vite copies them to dist/
assets/video/    one active chapter clip and retired footage (hero, spa and boutique are stills)
assets/img/      logo, favicon, og image
assets/img/sections/  the section photographs
assets/img/real-salon/  polished scenes generated from the client's location references
assets/img/wigs/  the four gallery style representations
assets/styles/   the three hairstyle portraits in the hair chapter
tools/           static server with a frame-capture route, used in development
```

## The hero

One generated editorial photograph of the styling floor,
`assets/img/real-salon/salon-hero.webp`, under a two-axis scrim that keeps the overlay
copy legible against both the dark left of the frame and the lit interior on the right.
It is not a retouched client snapshot: it uses the real premises as visual reference,
carrying forward the honey-oak slats, display arches, grey floor, mirrors and active
salon atmosphere in a cleaner composition.

It carries the page's **primary action**. The site has one job — get an enquiry into
WhatsApp — and for a while the only way to do that above the fold was a 60px `Book` in
the masthead. There are now two buttons on the first screen: *Book on WhatsApp* and a
ghost *See all services*, with the deposit and the walk-in policy stated under them, so
nobody has to scroll to find out what booking commits them to. On a phone the two are
matched in width; different lengths stacked read as a main action and an afterthought.

**It is served as WebP, not PNG.** The 1659×948 production image is 188 KB; the larger
generation master remains outside the repository. Keep the left side visually quiet
if the photograph is replaced, because that is where the page's primary copy sits.

The mobile crop is `object-position: 66%`, holding the stylist and client in view while
preserving enough dark area for the headline. The selector is `.stage .hero-photo`
because a lone `.hero-photo` loses to the `.stage img` rule in the small-screen block.

## The wig gallery

Four deliberately different silhouettes make the range understandable at a glance:
body wave, blunt bob, kinky curl and knotless boho braids. The first two are framed as
ready-made styles and the latter two as custom conversations; every action opens
WhatsApp with the exact look already named. The note below the gallery makes clear that
the pictures represent styles and finish, while live ready-made stock changes.

The images are generated representations rather than copied Pinterest or Unsplash
photographs. Their salon backgrounds use the client's own premises as the reference:
honey-oak slat walls, warm mirrors, a grey floor, navy seating and the wig-maker's
bench. Replace these with approved photographs of completed client work as the real
portfolio grows.

## The footage

| Chapter | Clip | Length | Source |
| --- | --- | --- | --- |
| Nails | macro manicure | 5.0s | stock |

All slowed with `minterpolate`, which synthesises the in-between frames. Simply lowering
`playbackRate` in the browser holds each existing frame for longer and judders; this
stays smooth at 24fps.

**The hero, hair, spa, and boutique chapters do not carry clips.** The hero was a 10s
animation of the mark morphing into a styled mannequin head; the client asked for a
cleaner representation and it is now a still photograph of the styling floor (see *The
hero* above). The hair chapter holds the hairstyle swapper instead. The spa chapter uses
a seated shoulder-treatment portrait, and the boutique uses an editorial in-salon retail
portrait. Retired files stay in `assets/video/`, and the page does not reference them.

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

**On the images:** the three portraits share one face and one background so that only
the hair changes across the wipe — anything else and the swap reads as three different
people rather than three looks. Keep that constraint if you replace them, and use client
photography you have permission to publish.

## The gradient band

"Any hairstyle you want — we have it all", between the hero and the hair chapter. The
blush in the gradient is lifted straight off the headshot backdrop in the section below
it, so the band hands over to the portraits instead of cutting against them.

## The quoted-on-enquiry chapters

Six of the nine service lines carry no published price: nails, spa, makeup, gele,
facials, and lashes and threading. Each of their chapters ends on a sentence saying so
and a button that opens WhatsApp already naming the service.

**Those six sentences are six different sentences.** They used to be one sentence
repeated verbatim under six different headings, and boilerplate is what people skip —
by the third repeat a reader has learned nothing about how the salon actually prices
anything. Each one now says what the price actually depends on for that service:
length and art for nails, the fabric and shape for gele, style and area for lashes.
They live in the `gaps` map in `fill()`, keyed by the chapter button's `data-wa`.

**And the ledes above them state rather than defer.** Every one of these six used to
end on some version of *discuss / speak with our team / ask us about the available
options* — six sections in a row where the page declined to say anything and passed
the reader to WhatsApp. The button was already doing that job. The copy now says what
the service actually is and what to bring ("Bring your fabric and your outfit, and we
will tie a shape that sits with both"), and the button asks the question.

Keep new copy inside what the record can stand behind. A first draft of the spa lede
said "twenty minutes between appointments"; the published policy gives 20 minutes as
the shortest appointment *of any kind*, not as a massage the salon sells, so it went
back to "a short session". Prose on this page is as much a claim as a price is.

When a real price list arrives for any of them, its chapter stops needing a sentence
at all — see "Worth doing next".

## The shop

Six products from the scraped record, each with a Buy that opens WhatsApp with the item
already named, so the salon reads one message and knows what to set aside. No basket, no
card capture — this is a shop of six lines run off a phone.

## Finding your place

Nineteen sections is more than a scroll position can tell you anything about, so three
small things carry the reader's location.

- **Anchors land clear of the masthead.** The header is fixed, so without an offset
  every nav link, every service-index card and every deep link scrolled its target's
  heading underneath the bar — the link worked and the answer was invisible. `--hdr` is
  measured from the header itself on load and on resize, and the reading sections
  reserve it with `scroll-margin-top`. The full-bleed chapters do not: their copy is
  vertically centred and was never behind the bar, and giving a snap target a scroll
  margin moves the snap too.
- **The nav says which section you are in.** `aria-current="true"` follows whichever
  section holds the line a third of the way down the viewport — not the top edge, where
  a tall section would go on claiming the nav long after you had left it.
- **A hairline of progress** under the masthead, hidden at the top of the page.

Careers left the primary nav for the footer in the same pass. It is a link for people
who want to work at the salon, not for people deciding where to get their hair done;
the shop took the slot.

## The service index

The salon runs nine service lines. Scrolling introduces them one chapter at a time,
which is the right way to meet them and the wrong way to find one — so `#services`,
straight after the About section, is the directory: every line, what it costs or that
it is quoted, and a jump to it. Price signal first, because the thing anyone comparing
nine services wants to know is which of them carry a published number.

It is generated from `serviceIndex` in `data.json`. Adding a service line means adding
an entry there; nothing in the markup is per-service.

## The finder

Fifty-eight services behind nine tabs is a filing cabinet: fine if you know which
drawer, useless if you only know the word "knotless". The field above the price list
searches every category at once and each hit books itself, with the service and price
already written into the WhatsApp message.

Three things it does that a plain `indexOf` filter does not:

- **The quoted lines are in the index too.** Searching "nails" at a salon that does
  nails must not come back empty just because nails carry no published number. Those
  rows read `On enquiry` and their Book link asks for a price.
- **Aliases widen, they never replace.** People type "kids", the list says
  "Children's"; "colour" is filed as "Dye" and "Tinted"; "mens" is "for Men". Each
  alias adds matches, so nothing that used to match stops matching.
- **Specific beats broad.** A category can be wider than the word that found it —
  "Box Braids & Knotless" answers to "knotless" for every line in it, knotless or not.
  Nothing is dropped, but the services carrying the word in their own name sort first.

## Linking to one price category

`#prices-locs` opens the price list on locs; every category id in `data.json` works.
Choosing a tab rewrites the hash with `replaceState`, so the back button is not filled
with tab presses, and arriving on a category link clears any search left in the field.

It means the salon can answer "how much are locs?" with a link that lands on the
answer rather than a link to a page that contains it.

## Booking from the price list

Every row in the search results could always be booked from where it stood. The same
service reached through a tab could not — you read a price in one place and went
looking for a button somewhere else. Each row in a category panel now carries the same
`Book` link, with the service and its price already written into the message.

It is grey at rest and gold on approach, rather than hidden until hover: revealing it
on hover kept the rows tidy, made the action undiscoverable to anyone reading with a
thumb, and still reserved its width — so the price sat off the edge of the rule for no
visible reason.

`#panels` also holds the height of the tallest category, measured after render and
again once the serif has loaded. The categories run from three services to eleven, and
without it choosing a tab dropped the rest of the page out from under the reader.

## The FAQ

`details`/`summary`, not a scripted accordion: it opens without JavaScript, it is
keyboard-operable for free, and find-in-page can reach the answers.

The eight questions live in `data.json` under `faqs`, and their answers carry
`{address}`, `{hours}`, `{whatsapp}` and `{email}` tokens that `build.js` expands — so
those four facts still have exactly one home. Every answer is drawn from the salon's
own record: the deposit, the notice period, the cancellation window and the appointment
range are the four `policies`, verbatim in prose.

## Structured data

A salon that sells nine different things is invisible to search if the page only says
so in prose. `build.js` emits two JSON-LD blocks from `data.json`:

- a **HairSalon / BeautySalon** with the address, daily 9–9 hours, phone, email, TikTok
  and an `OfferCatalog` — one catalogue per price category, 58 priced offers, plus the
  six quoted-on-enquiry lines as offers without a price;
- a **FAQPage** carrying the same eight questions the page shows.

Prices are parsed in three shapes: `£100` becomes a fixed `price`, `£30 – £40` a
`PriceSpecification` with a min and a max, and `+£30` — a supplement to another line —
gets no price at all rather than a misleading one.

`site.url` in `data.json` drives the canonical link, the absolute social image and the
generated `robots.txt` and `sitemap.xml`. **Change it to the salon's own domain when it
has one**; everything downstream follows.

## Motion and parallax

GSAP and ScrollTrigger are vendored in `vendor/`, so the motion layer works on a
static host without relying on a third-party CDN. It adds a sequenced hero entrance,
subtle depth to the hero and chapter photography, staggered service copy, drawn rules,
and pointer-only magnetic buttons. The chapter videos still play at their natural rate;
none of them are scrubbed against scroll position.

`prefers-reduced-motion` bypasses the GSAP layer and uses the existing static reveal
fallback. Parallax distances are intentionally restrained and smaller on narrow screens.

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
- **Three golds, because one cannot do three jobs.** `--gold` (`#a8874a`) is the brand
  colour and measures 3.07:1 against the ivory — fine for a rule or a mark, under AA
  for a word, and every kicker, tag, price, section number and small link on the page
  was set in it. Small text on a light ground now uses `--gold-ink` (`#8a6a2f`, 4.5:1);
  the dark chapters, where `--gold-ink` goes muddy, take `--gold-lift`. The same swap
  fixed the gold button, which was white text at 3.4:1.
- **The logo mark is never recoloured, on purpose.** It is navy and gold on
  transparent, and over a dark chapter the navy goes quiet. It was briefly carried as
  an ivory silhouette on those, which read better and was rejected: the salon wants one
  mark, unaltered, on every background. The wordmark beside it and the nav still
  invert, so the lockup as a whole stays legible. Treat this as a brand constraint,
  not a bug to fix — the accessible-name text (`.vh` "Infinity Hair and Beauty Salon —
  home") is what carries the link for anyone who cannot make the mark out.
- The finder announces its result count through a `role="status"` live region, so a
  screen-reader hears "12 services match" rather than silently changed content.
- The FAQ is native `details`/`summary` — it opens with the keyboard and without JS.
- The service index cards are one link each, so the whole tile is the same target
  under a thumb as under a cursor.

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
/ 58 services**, 6 product categories, 4 service pillars, 4 booking policies, 9 service
lines for the index, and 8 FAQs. Scraped from the previous site and verified against its
deployed bundle; the index and the FAQ answers add no facts the record did not already
carry.

**Nails and spa carry no published prices** — all 58 are hair services. Both chapters
say so plainly and send the enquiry to WhatsApp rather than inventing a number.

## Worth doing next

1. **Real client photography and footage** to replace the placeholder material over
   time. Stand-in imagery is fine for a launch, not a permanent answer — real clients
   in the real room will always convert better.
2. **A second hair clip.** Hero and hair were both cut from the same two-second
   usable window of the original salon footage; the hair chapter would benefit from
   its own shot.
3. **A pedicure clip** to pair with the manicure one, if that side of the business
   is worth its own chapter.
4. **Prices for nails, spa, makeup, gele, facials, lashes and threading.** Six of the
   nine service lines are quoted on enquiry. Numbers for any of them drop straight into
   `pricing.categories` and appear in the price list, the finder and the structured data
   at once.
