# Preview harness

Builds a single self-contained HTML page showing the real app screens inside a
phone frame — for sharing a redesign step with someone who cannot run the app.

It captures the *rendered* DOM and stylesheets from a running build, so it is
never a hand-maintained mock that can drift from the code.

```bash
npm run build && npx next start -p 3601      # in one shell
OUT=/tmp/preview node scripts/preview/capture.mjs   # then these two
OUT=/tmp/preview node scripts/preview/build.mjs     # → /tmp/preview/preview.html
```

Two things it has to do, both non-obvious:

- **Fonts.** `next/font` self-hosts under `/_next/static/media`, which nothing
  outside the app can fetch. Those `@font-face` rules are dropped and the same
  three families come from Google Fonts instead.
- **Links.** Each screen renders in an iframe (so `position: fixed` resolves
  against the frame rather than the page). Clicks are intercepted from the
  parent on the capture phase — an uncaught `href` navigates the frame to a URL
  that does not exist in the capture and leaves a blank phone.

Edit `SCREENS` in `capture.mjs` as steps land, moving each from `pending` to
`done`.
