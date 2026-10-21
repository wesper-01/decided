# Third-party notices

Decided is MIT-licensed (see `LICENSE`). It includes or loads the following.

## Lucide icons

The icon shapes inlined in `decided.html` (the `ICONS` map) and drawn into `app/icons/` come from Lucide 0.460.0, https://lucide.dev.

```
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## Fonts

Bricolage Grotesque and Figtree are licensed under the SIL Open Font License 1.1. They are not included in this repository; the app loads them from Google Fonts at run time (and the web app's offline cache keeps a copy on the device).

## Price data

Nothing below is included in this repository. The app fetches it only when you tap **Check prices online** in Groceries.

- **Open Prices** by Open Food Facts, https://prices.openfoodfacts.org. Prices shared by the public from receipts and shelf tags, under the Open Database License (ODbL) 1.0. Decided reads recent prices for its foods in your country and keeps one median per food on your device.
- **Exchange rates** from ExchangeRate-API's open access endpoint, https://www.exchangerate-api.com. Free with attribution, which the app shows under the price settings.
