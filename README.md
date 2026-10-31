# Tarot

A tarot reader with two decks, four spreads and card-by-card reveal.

## Running it

```bash
npm install
npm run dev
```

## How the decks work

Everything a deck needs lives in one folder under `public/decks/<id>/`:

| File | What it is |
| --- | --- |
| `cards.csv` | `number,name,upright,reversed,description` — one row per card |
| `deck.json` | Display name, description, card aspect ratio, optional theme colours |
| `0.webp` … `78.webp` | Card art. **The filename is the card number.** |

Two rules the code depends on:

- **`number` is the identity of a card, never `name`.** The two decks give the
  same card different names (the Empress is "The Matron of Thorns" in the Gothic
  deck), so names are only ever displayed.
- **Row `78` is the card back.** It is used for face-down cards and is never
  dealt. Row `0` is a real card (The Fool), so the draw tests the number rather
  than its truthiness.

The CSV is quoted CSV and starts with a UTF-8 BOM, so it is parsed properly —
splitting on commas would corrupt any meaning that contains one.

### Adding another deck

1. Make a folder `public/decks/yourtarot/` with the files above.
2. Add `"yourtarot"` to `public/decks/index.json`.

Nothing else to change — the deck appears in the switcher automatically.

## Spreads

Spreads are data, in [`src/lib/spreads.js`](src/lib/spreads.js). Each position is
a name, a short meaning and its grid coordinate, so adding a spread means adding
one object to the `SPREADS` array.

| Spread | Cards |
| --- | --- |
| One card | 1 |
| Three cards | 3 |
| Celtic Cross | 10 |
| Choose your own | 1–78 |

Cards are drawn without replacement (the 78 faces are shuffled once and sliced),
and each one is randomly upright or reversed.

## Switching decks

`deck.json` carries the theme colours and card aspect ratio, so choosing a deck
restyles the page and swaps the art in place. Doing that mid-reading re-skins the
same cards rather than re-drawing them — you keep your reading.

## Layout

```
src/
  App.jsx              screen state: setup vs reading
  lib/csv.js           BOM-aware, quote-aware CSV parser
  lib/decks.js         loads decks, keys cards by number
  lib/spreads.js       spread definitions, shuffle, draw
  components/Card.jsx  one flipping card
  components/Spread.jsx  places positions on the grid
  components/Details.jsx meanings for revealed cards
```
