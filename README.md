# decided.

**Stop deciding. Start changing.**

Decided is a free, open-source nutrition app for people who want to change their body (lose fat, build muscle, or recomp) but get stuck deciding how. Answer three questions and it decides the rest: daily calorie and macro targets, every meal picked and portioned to hit them, the shopping list and what it costs, and the one thing to do next.

It is a single HTML file with no build tools, no dependencies, no backend and no account. Your data stays on your device.

## What it does

- **Quick start:** goal, body, diet. The first week is decided the moment you finish; everything else has a sensible default you can change in Setup.
- **Next up:** the one meal to eat now, with "Done, I ate it" and "Not this one".
- **Meal plans** from 43 recipes, portioned to your targets. A box-constrained least-squares fit scales each recipe's protein, carb and fat ingredients so the day lands within a few percent. Swap any meal from the best-fitting alternatives, favourite recipes so they turn up more often, or hide ones you never want.
- **Training days and batch cooking:** more food on training days and less on rest days with the same weekly average, and lunches and dinners cooked once for two or three days.
- **Groceries** for 7 or 30 days: amounts to buy, cost by aisle and by day, a budget the planner can fit, and prices for 40 countries, adjustable by city, area and your own prices.
- **Progress:** weight trend, your real maintenance calories worked out from your own logs, streaks, and a five-week calendar.
- **Daily tools:** water, one-tap re-adding of recent foods, undo, and backup and restore as plain text.
- **Liquid-glass interface** in light and dark that works offline and installs to a phone's home screen.

## Use it

- **On your computer:** open `app/index.html` in a browser.
- **On your phone:** host the `app` folder on any HTTPS address and add it to your home screen. With GitHub, set Settings → Pages → Source to "GitHub Actions" and the included workflow publishes it on every push to `main`. Step-by-step instructions are in [app/README.md](app/README.md).
- **On claude.ai:** `decided.html` also runs as a Claude artifact. There it syncs to your Claude account and uses Claude for "What should I eat next?", custom meals and city price estimates. Everywhere else those features are hidden and everything is stored on the device.

## Develop

You need Node 18 or newer. There is nothing to install.

| Command | What it does |
| --- | --- |
| `npm test` | Checks the planner (macro accuracy, batch cooking, calorie cycling, budgets, streaks) and that every screen renders. |
| `npm run build` | Rebuilds `app/` from `decided.html`. |
| `npm run dev` | Serves `app/` at http://localhost:4819. Open `/__icons` there to redraw the app icons. |

| Path | What it is |
| --- | --- |
| `decided.html` | The whole app in one file: styles, food and recipe data, planner, views and the live background. Edit this. |
| `build.js` | Wraps `decided.html` into the installable web app: manifest, offline cache, home-screen settings. |
| `app/` | The built web app and its icons. Rebuild it after changing `decided.html`. |
| `tests/check.js` | The checks `npm test` runs, with no test framework needed. |
| `tools/dev-server.js` | The local server and icon drawer. |

The visual language (tokens, components, voice) is documented in the Decided design system. Read `CONTRIBUTING.md` before opening a pull request.

## A note on nutrition

Targets come from the Mifflin-St Jeor equation, your activity and your goal, then correct themselves from your logged intake and weight. Food values and prices are typical averages. Decided is not medical advice; if you have a medical condition, are pregnant, or have a history of disordered eating, talk to a professional before changing how you eat.

## Licence

MIT, see `LICENSE`. Icons are from Lucide (ISC); fonts are Bricolage Grotesque and Figtree (SIL OFL 1.1), loaded from Google Fonts. See `THIRD_PARTY_NOTICES.md`.
