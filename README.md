# Stylist Beauty Mall — Platform Demo

An interactive presentation for **Stylist Beauty Mall** (Yangon). It shows how the proposed platform works:
the salon team acts in **Stylist Studio** (left) and the result appears for the customer (right) — on the
public website, in the VIP members area, or in their Viber chat — live, step by step.

Nothing is pre-recorded: every chapter is a working mock-up. Edits made in the Studio really change the
website and the VIP area, so you can go off-script and answer "what if…?" questions on the spot.

## Present it

**Easiest (offline, no install):** open `presentation/Stylist-demo.html` in Chrome, press **F** for full screen.
It is a single self-contained file — no internet or server needed on presentation day.

**From source:**

```bash
npm install
npm run dev          # http://localhost:5173
npm run build:single # rebuild presentation file → dist-single/index.html
```

The stage is designed at 1920×1080 and scales to any laptop or projector.

### Controls

| Key | Action |
| --- | --- |
| → / Space / PageDown | Next step (plays it) — works with presentation clickers |
| ← / PageUp | Previous step |
| R or Enter | Replay the current step |
| 0 – 8 | Jump to a chapter |
| D | Switch the customer view between phone and desktop |
| S / A / W | Side by side / Studio only / customer only |
| N | Presenter notes (talking points for each step) |
| P | Auto-advance through the whole demo |
| F | Full screen |
| Esc | Stop the current animation |

Every step can be opened directly by URL, e.g. `#/4/2` = chapter 4, step 2.
Jumping anywhere rebuilds the earlier steps of that chapter instantly.

**Free mode:** you can click and type anywhere at any time — in the Studio, on the website and in the
VIP area. Gallery → *Upload photos* opens your real files. Moving to another step resets the demo data.

## Chapters

0. **Why** — title, today (5.6K TikTok followers, no website), the three-part proposal, agenda
1. **Your website** — headline & hero photo, announcement bar, scalp analysis page, prices & a new service, news
2. **Online booking** — a customer books on the phone (service → stylist → free time), staff confirm and send a ready-made Viber message, a stylist's day off blocks online booking
3. **VIP invitation** — staff create the VIP, send the invitation link on Viber, the VIP sets her own password
4. **VIP app & notifications** — she adds the VIP club to her home screen, it opens full screen like an app, she allows notifications; the salon sends one to the lock screen and a tap opens the news
5. **Wallet top-up** — cash at the counter (bonus added automatically), transfer + screenshot from the phone, staff approve — each arrives as a notification
6. **Book & cash back** — VIP books with priority, checkout from the wallet, cash back when she crosses 300,000 Ks, rewards progress
7. **Your rules** — members-only news, change a top-up bonus, the numbers at a glance
8. **Summary** — benefits (click to replay a chapter) and next steps

The scope behind the demo (three parts, loyalty rules, phases) is in the project scope document.

## Make it yours

- **Photos:** `src/photos/<name>.jpg` — AI-generated stand-ins (Gemini 2.5 Flash Image via OpenRouter). Replace any file with the salon's own photo under the same name; the list is in `src/store/photos.ts`.
- **Logo:** `src/brand/*.png` — cut out of the supplied logo artwork (gold and brown versions).
- **Content:** services, prices, stylists, signature pages, news, rewards rules — `src/store/seed.ts`.
- **Story:** steps, captions and presenter notes — `src/demo/chapters.ts`.

Stylist names, prices, phone numbers, payment accounts, the address and all dashboard figures are
**sample values** for the demo — to be replaced with the salon's own.

## How it is built

React + TypeScript + Vite, Tailwind CSS, Zustand (one shared store — the Studio edits a draft,
*Publish* copies it to what customers see), Framer Motion for animation.

- `src/site/` — public website `stylistbeautymall.com` (responsive: phone frame and desktop browser frame)
- `src/vip/` — VIP members area `vip.stylistbeautymall.com` (mobile-first, installable web app)
- `src/admin/` — Stylist Studio `staff.stylistbeautymall.com`
- `src/store/ops.ts` — salon rules: free time slots, wallet ledger, top-up bonus, checkout and cash back
- `src/device/` — iPhone (Safari, Add to Home Screen, home screen, lock screen, notifications, Viber chat, photo picker) and desktop browser frames
- `src/demo/` — step scripts and the runner that drives the presenter cursor
- `src/stage/` — presentation chrome, slides, keyboard controls
