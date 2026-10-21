# Decided web app

Stop deciding. Start changing. This folder is Decided as an installable web app, built from `../decided.html` by `npm run build`. Added to your home screen, it opens full screen with its own icon, works without a connection, and keeps your data on the phone. No Mac, no App Store, no fee.

## 1. Put it online (once, free)

The iPhone installs web apps from an HTTPS address, so this folder needs a host. Any static host works; two easy ones:

- **Netlify:** sign in at app.netlify.com with a free account, add a new site, choose to deploy manually, and drag this whole `app` folder onto the page. You get an address like `https://your-name.netlify.app`.
- **GitHub Pages:** push the repository to GitHub, then in Settings → Pages set the source to "GitHub Actions". The included workflow tests, builds and publishes this folder on every push to `main`. The address is `https://your-name.github.io/your-repo/`.

## 2. Install it on the iPhone

1. Open the address in Safari.
2. Tap Share, then **Add to Home Screen**, then **Add**.
3. Open it from the new icon. After the first launch it works offline.

## 3. Bring over your data (optional)

The claude.ai version and the phone keep separate data. To move it:

1. In the claude.ai version, open Setup → Your data → **Copy backup**.
2. Send that text to your phone, for example in Notes or a message to yourself.
3. In the iPhone app, open Setup → Your data → **Restore a backup**, paste, and confirm.

Install first, then restore: anything you enter in Safari before adding the app to the home screen stays in Safari.

## Good to know

- Ask Claude and the city price estimates only work inside claude.ai, so the iPhone app hides them. Everything else is the same.
- Your data lives only on this phone, and removing the icon deletes it. Copy a backup now and then.
- To update the app: change `decided.html`, run `npm run build` from the folder above this one, and upload this folder again (GitHub Pages does this for you on push). The phone picks up the new version the next time the app opens (occasionally the launch after).
