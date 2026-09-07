# Updating Infinity Salon

## Latest styles

The Latest styles button links to the salon's TikTok profile. Publish videos on that account to keep the linked feed current; the website does not automatically import TikTok posts.

To publish photos directly on the website:

1. Place your photo in `assets/latest/`, using a simple filename such as `knotless-september.jpg`. Use photographs you have permission to publish, including the client's permission where they are identifiable.
2. In `data.json`, add an entry to `latestStyles`. Newest entries go first:

```json
"latestStyles": [
  {
    "title": "Knotless braids",
    "img": "assets/latest/knotless-september.jpg",
    "alt": "Waist-length knotless braids with a centre parting",
    "caption": "A fresh protective style. Ask us about lengths and availability."
  }
]
```

3. Run `npm run build`, preview the result, and deploy the updated `dist` folder through your existing hosting workflow.

There is no login or upload dashboard. Website gallery updates require these file changes and a redeployment. With no photos added, the section displays the TikTok link without empty photo cards.

## Job enquiries

The Careers button opens the applicant's email app with a draft addressed to the existing salon email in `data.json` under `contact.email`. Applicants attach their CV and send the email themselves. The address is also visible for applicants without a configured email app. Applications are received in that mailbox; they are not stored on the website.

The section invites enquiries and does not advertise specific vacancies. Update its copy in `src/page.html` when confirmed roles are available.

## Services and captions

Update service descriptions in `data.json` under `pillars`, and section captions in `src/page.html`. Existing hair prices are retained. Makeup, gele, facials, lashes and threading are quoted on enquiry until prices are supplied.

Each of the six services without a published price ends its section with a short line explaining what the price depends on — the length and art for nails, the fabric and shape for gele, and so on. Those lines are in `src/page.html`, in the `gaps` list inside the `fill()` function, one per service. They are deliberately all different: the same sentence under six headings reads as small print, and people skip small print.

## The service index

The card grid under "One salon. Nine ways in." is built from `serviceIndex` in `data.json`. Each entry needs a `name`, the `href` of the section it jumps to, a short `body`, and a `tag` — the small gold line above the name:

```json
{
  "id": "nails",
  "name": "Nails",
  "href": "#nails",
  "tag": "Quoted on enquiry",
  "body": "Manicures, pedicures, gel colour and nail art."
}
```

A `tag` containing the words "on enquiry" does two extra things: the service is added to the price search so a visitor searching "nails" finds it, and it goes into the structured data as a service offered without a published price. Give a service a real price tag instead (`"From £40"`) and it drops out of both.

`href` can also point at one price category — `"#prices-kids-teens"` opens the price list on that tab. Any category `id` in `pricing.categories` works.

## Prices and the search

The search field above the price list covers every category at once, so a price added anywhere in `pricing.categories` becomes findable with no further work. Three price shapes are understood: `"£100"`, `"£30 – £40"`, and `"+£30"` for a supplement to another line (pair that one with a `note`).

When prices arrive for nails, spa, makeup, gele, facials, lashes or threading, add a new block to `pricing.categories` in the same shape as the hair ones. The price list, the search and the structured data all pick it up on the next build; then change that service's `tag` in `serviceIndex` from "Quoted on enquiry" to the new starting price.

## The FAQ

The eight questions under "Before you book" live in `data.json` under `faqs`, in the order shown. Answers may use four tokens, which the build replaces with the real values so they are never written down twice:

`{address}` · `{hours}` · `{whatsapp}` · `{email}`

```json
{
  "q": "Do you take card payments?",
  "a": "Message us on {whatsapp} and we will confirm before your visit."
}
```

Keep answers to things the salon can stand behind — they are published as structured data as well as on the page, so a search engine may show them as the salon's own answer.

## The website address

`site.url` in `data.json` is the site's own address. It drives the canonical link, the social preview image and the generated `robots.txt` and `sitemap.xml`. It is currently the Vercel address; when the salon has its own domain, change it there and rebuild — nothing else needs editing.

## The hero photograph

The hero is served in three files, all from one picture:

- `assets/img/salon-hero-v2.webp` — what almost every visitor gets (65 KB)
- `assets/img/salon-hero-v2.jpg` — the fallback (134 KB)
- `assets/img/salon-hero-v2.png` — the full-quality master, not served

To change the photograph, replace all three, keeping the names and a wide landscape crop. If you only have the new picture in one format, ask your developer to re-encode it: a full-size PNG served on its own is roughly thirteen times the weight and it is the first thing the page has to load.

The crop shifts on a phone, where only about a third of the frame's width fits. If your new picture has its subject somewhere other than the right-hand side, the `object-position` value in `src/page.html` needs moving with it.

After any change, run `npm run build`. Edit the source template rather than the generated `index.html`.
