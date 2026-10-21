# Decided: design direction

The owner's direction for how Decided looks and sounds, collected from their own requests while the app was built. Antislop (or any other filter) is applied on top of this file, never instead of it.

## Product and audience

Decided is for people who want to change their body but get stuck deciding how. The app's job is to remove decisions: three questions, then the calories, meals and groceries are decided. Every screen should make the next action obvious and ask for as little as possible.

## Direction from the owner

- **Liquid glass, as an accent.** The owner asked for a liquid-glass interface. On 22 Oct 2026 they chose to keep real frosted glass on the surfaces that float above the page (the tab bar, the Next up card, toasts), and solid surfaces everywhere else.
- **A live, premium background.** The owner asked for a moving background, then for "a premium pattern or palette that just makes the app polished" in place of bright colours. The result is a slow emerald mist with fine film grain. On 22 Oct 2026 they chose to keep the slow drift and drop the glow that followed the pointer.
- **Open-source icons.** The owner asked for open-source icons; the app uses Lucide (ISC).
- **Name, voice and mark.** "Decided", with the line "Stop deciding. Start changing." The mark is a check on an emerald disc: the check means "decided".

## Dials

Reading this as: a daily-use nutrition app for people stuck in decision fatigue, in a calm glass-over-emerald-mist style, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

- **ENERGY 2:** calm screens with one confident moment each (the Next up card on Today, the big numbers).
- **RHYTHM 2:** consistent panels, broken by the one focal card per screen.
- **MOTION 2:** the slow background drift, the calorie rings filling once, the tab thumb sliding. Nothing loops on content. Everything stops with reduced motion.

## Decisions and their reasons

- **Emerald accent (#0B7F5C light, #34D399 dark):** green reads as "go" and as food without being a health-app cliché blue; it is the only accent.
- **Emerald to sea-glass gradient:** only on the primary button and the brand mark, so the one action that moves you forward is unmistakable.
- **Protein, carbs and fat colours:** data encoding only. Each macro keeps one colour everywhere it appears; nothing else uses those colours.
- **Grocery aisle colours (`cat-1` to `cat-6`):** data encoding for the cost-by-aisle breakdown only.
- **Icon tiles are neutral** unless they show a state (warning, done) or a data category.
- **Bricolage Grotesque for headings and numbers:** its slightly condensed, inky weight makes big numbers feel decided and personal rather than clinical.
- **Figtree for everything else:** round and very legible at small sizes on a phone.
- **Labels in sentence case,** no wide-tracked capitals: the app talks like a person.
- **Radii:** 28px panels, 22px cards, 12px controls; the pill shape is kept for the primary button, the tab bar and small status tags, where the shape says "one thing".
- **Shadow marks elevation:** only the floating glass surfaces and the primary button cast a real shadow. Panels sit on the page.
- **Grain:** removes banding in the soft gradients and gives the backdrop a paper-like texture. It is the one texture in the app.
- **Glow:** only under the primary button.
- **Check mark as the motif:** used for the mark, for "Done, I ate it" and for every "Decide" action.

## Voice

Short, plain and kind. Say what happens next ("Decide this day", "Done, I ate it", "Not this one"). No hype words, no exclamation marks, no em dashes. Numbers are always real: computed from the user's data or labelled as an example.
