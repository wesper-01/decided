# Contributing to Decided

Thanks for helping. Decided exists to take decisions off people's plates, so every change should remove a choice, not add one.

## Ground rules

- **One file, no dependencies.** The app is `decided.html`. Don't add a framework, a bundler or npm packages; plain JavaScript and CSS keep it easy to read, fork and run anywhere.
- **Decide, don't ask.** A new setting needs a sensible default and must not appear in the quick start. Copy states what happens ("Today's meals are decided.") and buttons name the action ("Decide this week", "Done, I ate it").
- **Use the tokens.** Colours, radii, spacing and motion come from the CSS custom properties at the top of the stylesheet. Don't add new colours; if you need a new meaning, reuse a token or propose one. [DESIGN.md](DESIGN.md) gives the reason for each visual choice; read it before changing how the app looks.
- **Keep it accessible.** Text reaches 4.5:1 contrast in both themes, icons and controls 3:1, colour is never the only cue, and everything works with a keyboard and with reduced motion.
- **Keep data on the device.** No analytics, no trackers, no network calls beyond Google Fonts.

## Making a change

1. Edit `decided.html`.
2. Run `npm test` and fix anything it reports.
3. Run `npm run build` so `app/` matches, then check your change with `npm run dev` at phone width (375px) and in both light and dark themes.
4. If the change shows in the README screenshots, run `npm run images` (needs Chrome or Edge) to redraw them.
5. Open a pull request saying what changed and why, with a screenshot for anything visual.

Adding a recipe or a food? Recipes are `R(...)` lines and foods are `F(...)` lines near the top of the script; the comments there explain the format. Give foods per-100 g values from a reliable source, and add a shop price in `BUY` so the grocery list can cost it.
